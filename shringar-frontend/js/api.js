/**
 * Shringar — Shared API Client
 * Included on every page via <script src="js/api.js"></script>
 *
 * NOTE ON STORAGE: this is a real multi-page site meant to run locally
 * against the Java backend (not a live Claude.ai artifact preview), so we
 * persist the JWT in localStorage to survive navigation between pages —
 * a normal in-memory JS variable would be wiped on every page load.
 */

const Shringar = (() => {

  // ── Change this if your backend runs elsewhere ──
  const API_BASE = 'http://localhost:8080/api';

  const TOKEN_KEY = 'shringar_token';
  const USER_KEY = 'shringar_user';

  // ───────────────────────── Token / session helpers ─────────────────────────

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(authResponse) {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: authResponse.userId,
      firstName: authResponse.firstName,
      lastName: authResponse.lastName,
      email: authResponse.email,
      phone: authResponse.phone,
      role: authResponse.role
    }));
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function logout() {
    clearSession();
    window.location.href = 'login.html';
  }

  /** Call at the top of cart/booking/order pages — bounces to login if no token */
  function requireAuth() {
    if (!isLoggedIn()) {
      sessionStorage.setItem('shringar_redirect_after_login', window.location.pathname.split('/').pop());
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  // ───────────────────────── Core request wrapper ─────────────────────────

  /**
   * @param {string} path        e.g. '/designs' or '/cart/items'
   * @param {object} opts        { method, body, auth }
   * @returns {Promise<any>}     the `data` field of the backend's ApiResponse
   * @throws {Error}             with the backend's `message` on failure
   */
  async function request(path, opts = {}) {
    const { method = 'GET', body = null, auth = true } = opts;

    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (networkErr) {
      throw new Error('Could not reach the server. Is the backend running on localhost:8080?');
    }

    let json;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (response.status === 401) {
      // token expired / invalid — force re-login
      clearSession();
      throw new Error('Your session has expired. Please log in again.');
    }

    if (!response.ok || !json || json.success === false) {
      const msg = (json && json.message) ? json.message : `Request failed (${response.status})`;
      throw new Error(msg);
    }

    return json.data;
  }

  const get    = (path, auth = true) => request(path, { method: 'GET', auth });
  const post   = (path, body, auth = true) => request(path, { method: 'POST', body, auth });
  const patch  = (path, body, auth = true) => request(path, { method: 'PATCH', body, auth });
  const del    = (path, auth = true) => request(path, { method: 'DELETE', auth });

  // ───────────────────────── Domain-specific calls ─────────────────────────

  const Auth = {
    signup: (data) => post('/auth/signup', data, false),
    login: (identifier, password) => post('/auth/login', { identifier, password }, false),
    me: () => get('/users/me'),
  };

  const Designs = {
    all: (sortBy = null) => get(`/designs${sortBy ? '?sortBy=' + sortBy : ''}`, false),
    featured: () => get('/designs/featured', false),
    byCategory: (category) => get(`/designs/category/${encodeURIComponent(category)}`, false),
    byId: (id) => get(`/designs/${id}`, false),
    suggestForSkinTone: (skinTone, limit = 4) =>
      get(`/designs/suggest?skinTone=${encodeURIComponent(skinTone)}&limit=${limit}`, false),
    /** Fire-and-forget — feeds the admin "Most Clicked Designs" dashboard. Never blocks the click itself. */
    trackClick: (id) => {
      post(`/designs/${id}/click`, {}, false).catch(() => { /* non-critical — silently ignore */ });
    },
  };

  const Cart = {
    get: () => get('/cart'),
    addItem: (designId, quantity = 1, coverageNote = null) =>
      post('/cart/items', { designId, quantity, coverageNote }),
    removeItem: (cartItemId) => del(`/cart/items/${cartItemId}`),
    applyCoupon: (code) => post('/cart/coupon', { code }),
    removeCoupon: () => del('/cart/coupon'),
    clear: () => del('/cart'),
  };

  const Cities = {
    all: () => get('/cities', false),
    active: () => get('/cities/active', false),
    byName: (name) => get(`/cities/${encodeURIComponent(name)}`, false),
  };

  const Artists = {
    byCity: (city) => get(`/artists?city=${encodeURIComponent(city)}`, false),
    search: (city, area) =>
      get(`/artists/search?city=${encodeURIComponent(city)}&area=${encodeURIComponent(area)}`, false),
    byId: (id) => get(`/artists/${id}`, false),
  };

  const Bookings = {
    create: (data) => post('/bookings', data),
    mine: () => get('/bookings'),
    myBookings: () => get('/bookings'),
    byId: (id) => get(`/bookings/${id}`),
    byReference: (ref) => get(`/bookings/reference/${encodeURIComponent(ref)}`),
    cancel: (id, reason) => patch(`/bookings/${id}/cancel`, { reason }),
    reschedule: (id, newDate, reason) => patch(`/bookings/${id}/reschedule`, { newDate, reason }),
    confirmFulfillment: (id, rating, feedback) => patch(`/bookings/${id}/confirm-fulfillment`, { rating, feedback }),
  };

  const Public = {
    coupons: () => get('/public/coupons', false),
    testimonials: () => get('/public/testimonials', false),
    timeSlots: () => get('/public/time-slots', false),
  };

  const Payments = {
    createAdvanceOrder: (bookingId) => post(`/payments/advance-order/${bookingId}`, {}),
    verify: (payload) => post('/payments/verify', payload),
  };

  const Settings = {
    /** Public — returns { instagramUrl, youtubeChannelUrl, youtubeIntroVideoUrl, whatsappNumber, contactPhone, contactEmail } */
    get: () => get('/settings', false),
  };

  // ───────────────────────── Shared UI helpers ─────────────────────────

  /** Swaps the 👤 nav icon to show user initials linking to profile.html when logged in */
  function paintAuthNav() {
    const user = getUser();
    document.querySelectorAll('[data-auth-icon]').forEach(el => {
      if (user) {
        const initials = ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || '👤';
        el.textContent = initials;
        el.title = `${user.firstName} — view profile`;
        el.style.background = 'rgba(201,162,39,0.25)';
        el.style.fontWeight = '700';
        el.style.fontSize = '12px';
        el.style.cursor = 'pointer';
        // Click → go to profile page (not logout popup)
        el.href = 'profile.html';
        el.onclick = null;
      } else {
        el.textContent = '👤';
        el.href = 'login.html';
        el.title = 'Sign in';
        el.style.background = '';
        el.onclick = null;
      }
    });

    // Also update mobile menu auth link
    const mobileLink = document.getElementById('mobile-auth-link');
    if (mobileLink && user) {
      mobileLink.innerHTML = `<span style="font-size:18px;">👤</span> ${user.firstName}`;
      mobileLink.href = 'profile.html';
      mobileLink.onclick = null;
    }
  }

  function resolveUploadUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiHost = API_BASE.replace(/\/api$/, '');
    return apiHost + path;
  }

  /** Lightweight toast — used instead of alert() for non-blocking feedback */
  function toast(message, type = 'info') {
    let el = document.getElementById('shringar-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'shringar-toast';
      el.style.cssText = `
        position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);
        background:#493313;color:#fdf6ec;padding:13px 24px;border-radius:30px;
        font-family:'Jost',sans-serif;font-size:13px;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.25);
        opacity:0;transition:all 0.3s;max-width:90%;text-align:center;border:1px solid rgba(201,162,39,0.4);`;
      document.body.appendChild(el);
    }
    el.style.background = type === 'error' ? '#7a2c1a' : '#493313';
    el.textContent = message;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  }

  function formatINR(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  /**
   * Converts any common YouTube URL format (watch?v=, youtu.be/, /embed/)
   * into an embeddable iframe src. Returns null if the URL can't be parsed.
   */
  function youtubeEmbedUrl(url) {
    if (!url) return null;
    try {
      const u = new URL(url);
      let videoId = null;
      if (u.hostname.includes('youtu.be')) {
        videoId = u.pathname.slice(1);
      } else if (u.searchParams.get('v')) {
        videoId = u.searchParams.get('v');
      } else if (u.pathname.includes('/embed/')) {
        return url; // already an embed URL
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  }

  /** Renders a responsive 16:9 YouTube embed and injects it into the given container element */
  function renderYoutubeEmbed(container, url, title = 'Video') {
    const embedUrl = youtubeEmbedUrl(url);
    if (!embedUrl || !container) return;
    container.innerHTML = `
      <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;background:#000;">
        <iframe src="${embedUrl}" title="${title}"
          style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen loading="lazy"></iframe>
      </div>`;
  }

  /** Paints Instagram/YouTube/WhatsApp links into any element carrying the matching data-attr, site-wide */
  async function paintSocialLinks() {
    try {
      const settings = await Settings.get();
      document.querySelectorAll('[data-social="instagram"]').forEach(el => {
        if (settings.instagramUrl) { el.href = settings.instagramUrl; el.target = '_blank'; el.rel = 'noopener'; }
      });
      document.querySelectorAll('[data-social="youtube"]').forEach(el => {
        if (settings.youtubeChannelUrl) { el.href = settings.youtubeChannelUrl; el.target = '_blank'; el.rel = 'noopener'; }
      });
      document.querySelectorAll('[data-social="whatsapp"]').forEach(el => {
        if (settings.whatsappNumber) { el.href = `https://wa.me/${settings.whatsappNumber}`; el.target = '_blank'; el.rel = 'noopener'; }
      });
      document.querySelectorAll('[data-social="facebook"]').forEach(el => {
        if (settings.facebookUrl) { el.href = settings.facebookUrl; el.target = '_blank'; el.rel = 'noopener'; }
      });
      document.querySelectorAll('[data-contact="phone"]').forEach(el => {
        if (settings.contactPhone) {
          el.textContent = settings.contactPhone;
          if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('tel:')) {
            el.setAttribute('href', 'tel:' + settings.contactPhone.replace(/[^\d+]/g, ''));
          }
        }
      });
      document.querySelectorAll('[data-contact="email"]').forEach(el => {
        if (settings.contactEmail) {
          el.textContent = settings.contactEmail;
          if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('mailto:')) {
            el.setAttribute('href', 'mailto:' + settings.contactEmail);
          }
        }
      });
      // Buttons that sit next to a data-contact display but aren't the text node themselves
      document.querySelectorAll('#call-now-btn').forEach(el => {
        if (settings.contactPhone) el.setAttribute('href', 'tel:' + settings.contactPhone.replace(/[^\d+]/g, ''));
      });
      document.querySelectorAll('#email-btn').forEach(el => {
        if (settings.contactEmail) el.setAttribute('href', 'mailto:' + settings.contactEmail);
      });
      // Homepage intro video, if a container is present
      const introVideoEl = document.getElementById('brand-intro-video');
      if (introVideoEl && settings.youtubeIntroVideoUrl) {
        renderYoutubeEmbed(introVideoEl, settings.youtubeIntroVideoUrl, 'Shringar — How It Works');
      }
    } catch {
      // non-critical — footer links just stay as static placeholders if this fails
    }
  }

  return {
    API_BASE, getToken, setSession, getUser, clearSession, isLoggedIn, logout, requireAuth,
    Auth, Designs, Cart, Cities, Artists, Bookings, Payments, Settings, Public,
    paintAuthNav, toast, formatINR, youtubeEmbedUrl, renderYoutubeEmbed, paintSocialLinks,
    resolveUploadUrl
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Shringar.paintAuthNav();
  Shringar.paintSocialLinks();
});

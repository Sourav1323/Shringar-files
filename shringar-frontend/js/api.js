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
    phoneLogin: (phone, code, firstName) => post('/auth/phone-login', { phone, code, firstName }, false),
    me: () => get('/users/me'),
    checkExists: (data) => post('/auth/check-exists', data, false),
    sendOtp: (identifier, channel, forSignup = false) => post('/auth/send-otp', { identifier, channel, forSignup: String(forSignup) }, false),
    verifyOtp: (identifier, channel, code) => post('/auth/verify-otp', { identifier, channel, code }, false),
    confirmFirebasePhone: (phone) => post('/auth/confirm-firebase-phone', { phone }, false),
    sendPhoneOtpToEmail: (phone, email, forSignup = false) => post('/auth/send-phone-otp-to-email', { phone, email, forSignup: String(forSignup) }, false),
    forgotPassword: (identifier) => post('/auth/forgot-password', { identifier }, false),
    resetPassword: (identifier, code, newPassword) => post('/auth/reset-password', { identifier, code, newPassword }, false),
  };

  const Favorites = {
    KEY: 'shringar_favorites_v2',
    getAll: () => {
      try {
        const raw = JSON.parse(localStorage.getItem(Favorites.KEY) || localStorage.getItem('shringar_favorites') || '[]');
        return raw.map(item => typeof item === 'object' && item !== null ? item : { id: Number(item) });
      } catch {
        return [];
      }
    },
    has: (id) => {
      const targetId = Number(id);
      return Favorites.getAll().some(item => Number(item.id) === targetId);
    },
    toggle: (itemOrId) => {
      let item = typeof itemOrId === 'object' && itemOrId !== null ? { ...itemOrId } : { id: Number(itemOrId) };
      item.id = Number(item.id);
      let list = Favorites.getAll();
      const idx = list.findIndex(i => Number(i.id) === item.id);
      let added = false;
      if (idx > -1) {
        list.splice(idx, 1);
        added = false;
        toast('🤍 Removed from saved favorites', 'info');
      } else {
        list.push(item);
        added = true;
        toast('❤️ Saved to your favorites!', 'success');
      }
      localStorage.setItem(Favorites.KEY, JSON.stringify(list));
      Favorites.updateBadges();
      Favorites.renderModalContent();

      // Trigger smooth pulse transition on heart buttons
      try {
        document.querySelectorAll(`[data-fav-id="${item.id}"], .fav-btn[data-id="${item.id}"]`).forEach(btn => {
          btn.classList.add('heart-pop');
          setTimeout(() => btn.classList.remove('heart-pop'), 450);
        });
      } catch (e) {}

      return added;
    },
    remove: (id) => {
      const targetId = Number(id);
      let list = Favorites.getAll().filter(i => Number(i.id) !== targetId);
      localStorage.setItem(Favorites.KEY, JSON.stringify(list));
      Favorites.updateBadges();
      Favorites.renderModalContent();
      toast('🤍 Removed from saved favorites', 'info');
    },
    clear: () => {
      localStorage.removeItem(Favorites.KEY);
      localStorage.removeItem('shringar_favorites');
      Favorites.updateBadges();
      Favorites.renderModalContent();
      toast('Favorites list cleared', 'info');
    },
    count: () => Favorites.getAll().length,
    updateBadges: () => {
      const c = Favorites.count();
      document.querySelectorAll('.fav-badge').forEach(b => {
        b.textContent = c;
        b.style.display = c > 0 ? 'inline-flex' : 'none';
      });
      document.querySelectorAll('.fav-count').forEach(b => {
        b.textContent = c;
      });
      document.querySelectorAll('[data-fav-id]').forEach(btn => {
        const dId = Number(btn.getAttribute('data-fav-id'));
        const isFav = Favorites.has(dId);
        btn.classList.toggle('favorited', isFav);
        const icon = btn.querySelector('.fav-icon') || btn;
        if (icon && icon.classList.contains('fav-icon')) {
          icon.textContent = isFav ? '❤️' : '🤍';
        } else if (icon === btn && !btn.querySelector('*')) {
          btn.textContent = isFav ? '❤️' : '🤍';
        }
      });
    },
    openModal: () => {
      let modal = document.getElementById('shringar-fav-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'shringar-fav-modal';
        modal.className = 'fav-modal-overlay';
        modal.innerHTML = `
          <div class="fav-modal-drawer" role="dialog" aria-modal="true" aria-label="Saved Designs">
            <div class="fav-modal-header">
              <div class="fav-modal-title">
                <span>🤍</span> Saved Designs
                <span class="fav-count-pill" id="fav-modal-count">0</span>
              </div>
              <button class="fav-modal-close" onclick="Shringar.Favorites.closeModal()" aria-label="Close">✕</button>
            </div>
            <div class="fav-modal-body" id="fav-modal-list"></div>
            <div class="fav-modal-footer" id="fav-modal-footer">
              <button class="fav-btn-clear" onclick="Shringar.Favorites.clear()">Clear All</button>
              <a href="index.html#designs-section" class="fav-btn-browse" onclick="Shringar.Favorites.closeModal()">Explore More</a>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
          if (e.target === modal) Favorites.closeModal();
        });
      }
      Favorites.renderModalContent();
      requestAnimationFrame(() => modal.classList.add('open'));
      document.body.style.overflow = 'hidden';
    },
    closeModal: () => {
      const modal = document.getElementById('shringar-fav-modal');
      if (modal) {
        modal.classList.remove('open');
      }
      document.body.style.overflow = '';
    },
    renderModalContent: () => {
      const listEl = document.getElementById('fav-modal-list');
      const countEl = document.getElementById('fav-modal-count');
      const footerEl = document.getElementById('fav-modal-footer');
      if (!listEl) return;
      const items = Favorites.getAll();
      if (countEl) countEl.textContent = items.length;
      if (footerEl) footerEl.style.display = items.length > 0 ? 'flex' : 'none';

      if (items.length === 0) {
        listEl.innerHTML = `
          <div class="fav-empty-state">
            <div class="fav-empty-icon">🤍</div>
            <h3>Your Favorites List is Empty</h3>
            <p>Save your favorite mehendi designs by tapping the heart icon on any design card.</p>
            <a href="index.html#designs-section" class="btn-gold" style="display:inline-block;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:600;font-size:13px;margin-top:10px;color:var(--td,#2a1a08);background:var(--gold,#c9a227);" onclick="Shringar.Favorites.closeModal()">Browse Designs</a>
          </div>
        `;
        return;
      }

      listEl.innerHTML = items.map(item => {
        const title = item.name || `Design #${item.id}`;
        const price = item.price || '';
        const imgHtml = item.img 
          ? `<img src="${item.img}" alt="${title}" class="fav-item-thumb" onerror="this.outerHTML='<span class=\\'fav-item-emoji\\'>${item.emoji || '🤲'}</span>'"/>`
          : `<span class="fav-item-emoji">${item.emoji || '🤲'}</span>`;

        return `
          <div class="fav-item" id="fav-item-${item.id}">
            <div class="fav-item-media">${imgHtml}</div>
            <div class="fav-item-info">
              <a href="design-detail.html?id=${item.id}" class="fav-item-title" onclick="Shringar.Favorites.closeModal()">${title}</a>
              ${price ? `<div class="fav-item-price">${price}</div>` : ''}
              <div class="fav-item-actions">
                <a href="design-detail.html?id=${item.id}" class="fav-link-view" onclick="Shringar.Favorites.closeModal()">View Details</a>
                <button class="fav-link-cart" onclick="Shringar.Cart.addItem(${item.id}, 1).then(() => { Shringar.toast('✅ Added to cart', 'success'); }).catch(e => Shringar.toast(e.message, 'error'))">+ Add to Cart</button>
              </div>
            </div>
            <button class="fav-item-del" onclick="Shringar.Favorites.remove(${item.id})" title="Remove from favorites" aria-label="Remove">✕</button>
          </div>
        `;
      }).join('');
    }
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
    submitUpiPayment: (id, transactionRef) => patch(`/bookings/${id}/submit-upi-payment`, { transactionRef }),
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

  const Support = {
    createConcern: (data) => post('/support/concerns', data, false),
    myConcerns: (email) => get(email ? `/support/concerns/my?email=${encodeURIComponent(email)}` : '/support/concerns/my', false),
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
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    if (path.startsWith('images/') || path.startsWith('./images/')) return path;
    const apiHost = API_BASE.replace(/\/api$/, '');
    return apiHost + (path.startsWith('/') ? path : '/' + path);
  }

  /** Lightweight toast — supports types: 'success', 'error', 'info' */
  function toast(message, type = 'info') {
    let el = document.getElementById('shringar-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'shringar-toast';
      el.style.cssText = `
        position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);
        background:#493313;color:#fdf6ec;padding:13px 24px;border-radius:30px;
        font-family:'Jost',sans-serif;font-size:13.5px;font-weight:500;z-index:99999;box-shadow:0 8px 28px rgba(0,0,0,0.3);
        opacity:0;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);max-width:90%;text-align:center;border:1px solid rgba(201,162,39,0.4);
        pointer-events:none;`;
      document.body.appendChild(el);
    }
    if (type === 'success') {
      el.style.background = '#0f6e56';
      el.style.borderColor = '#38a169';
    } else if (type === 'error') {
      el.style.background = '#7a2c1a';
      el.style.borderColor = '#e53e3e';
    } else {
      el.style.background = '#493313';
      el.style.borderColor = 'rgba(201,162,39,0.5)';
    }
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
          if (el.tagName === 'A') {
            el.setAttribute('href', 'tel:' + settings.contactPhone.replace(/[^\d+]/g, ''));
          }
        }
      });
      document.querySelectorAll('[data-contact="email"]').forEach(el => {
        if (settings.contactEmail) {
          el.textContent = settings.contactEmail;
          if (el.tagName === 'A') {
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

  // ───────────────────────── Smooth Transitions & Motion System ─────────────────────────
  const Transitions = {
    init: () => {
      // 1. Reading / Scroll Progress Bar
      if (!document.getElementById('shringar-scroll-progress') && document.body) {
        const bar = document.createElement('div');
        bar.id = 'shringar-scroll-progress';
        document.body.prepend(bar);

        let ticking = false;
        window.addEventListener('scroll', () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              const max = document.documentElement.scrollHeight - window.innerHeight;
              if (max > 120) {
                const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
                bar.style.width = pct + '%';
                if (window.scrollY > 40) bar.classList.add('active');
                else bar.classList.remove('active');
              }
              ticking = false;
            });
            ticking = true;
          }
        }, { passive: true });
      }

      // 2. IntersectionObserver for Smooth Scroll Reveal
      Transitions.observeReveals();

      // 3. Smooth page link transitions (progressive enhancement for browsers without native View Transitions)
      if (!('startViewTransition' in document) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && document.body) {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1)';
        document.addEventListener('click', (e) => {
          const a = e.target.closest('a');
          if (!a) return;
          const href = a.getAttribute('href');
          // Only transition internal same-origin pages, ignore hashes, scripts, tel/mail, target blank
          if (href && !href.startsWith('#') && !href.startsWith('javascript') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !a.target && !e.ctrlKey && !e.metaKey) {
            try {
              const url = new URL(a.href, window.location.href);
              if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
                e.preventDefault();
                document.body.style.opacity = '0';
                setTimeout(() => {
                  window.location.href = a.href;
                }, 180);
              }
            } catch (err) {}
          }
        });
      }
    },

    observeReveals: (container = document) => {
      if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const targets = container.querySelectorAll(`
          .design-card:not(.is-revealed), .artist-card:not(.is-revealed), .category-card:not(.is-revealed),
          .testi-card:not(.is-revealed), .review-card:not(.is-revealed), .perk:not(.is-revealed),
          .step-card:not(.is-revealed), .how-step:not(.is-revealed), .stat:not(.is-revealed),
          .faq-item:not(.is-revealed), .location-card:not(.is-revealed), .order-card:not(.is-revealed),
          .reveal-on-scroll:not(.is-revealed)
        `);

        // Index within each section to stagger children
        const parents = new Map();
        targets.forEach(el => {
          const parent = el.parentElement;
          if (parent) {
            const count = parents.get(parent) || 0;
            el.style.setProperty('--reveal-delay', Math.min(count, 8));
            parents.set(parent, count + 1);
          }
        });

        const revealObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          });
        }, {
          root: null,
          rootMargin: '0px 0px -30px 0px',
          threshold: 0.06
        });

        targets.forEach(el => revealObserver.observe(el));
      } else {
        container.querySelectorAll(`
          .design-card, .artist-card, .category-card, .testi-card,
          .review-card, .perk, .step-card, .how-step, .stat, .faq-item,
          .location-card, .order-card, .reveal-on-scroll
        `).forEach(el => el.classList.add('is-revealed'));
      }
    }
  };

  const Ai = {
    /**
     * Calls Gemini AI vision endpoint to analyze a hand photo for skin tone,
     * undertone, hand shape, and personalized mehendi recommendations.
     * @param {string} imageBase64 - Hand photo as data URL or base64 string
     * @param {string} [manualTone] - Optional manual skin tone fallback
     * @param {string} [apiKey] - Optional custom Gemini API key
     */
    async analyzeHand(imageBase64, manualTone = null, apiKey = null) {
      const payload = {
        image: imageBase64 || null,
        manualTone: manualTone || null,
        apiKey: apiKey || localStorage.getItem('shringar_gemini_key') || null
      };
      return await request('/ai/analyze-hand', {
        method: 'POST',
        body: payload,
        auth: false
      });
    }
  };

  return {
    API_BASE, getToken, setSession, getUser, clearSession, isLoggedIn, logout, requireAuth,
    Auth, Designs, Cart, Cities, Artists, Bookings, Payments, Settings, Public, Favorites, Support,
    Ai, Transitions,
    paintAuthNav, toast, formatINR, youtubeEmbedUrl, renderYoutubeEmbed, paintSocialLinks,
    resolveUploadUrl
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Shringar.paintAuthNav();
  Shringar.paintSocialLinks();
  Shringar.Favorites.updateBadges();
  Shringar.Transitions.init();
});

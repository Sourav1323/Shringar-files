/**
 * Shringar Admin — Shared API Client
 * Included on every admin portal page via <script src="js/admin-api.js"></script>
 *
 * Deliberately uses a DIFFERENT localStorage key than the customer-facing site's
 * js/api.js, so the two stay completely isolated even if both happen to run on
 * the same browser/origin — an admin session must never leak into or share state
 * with a regular customer session, and vice versa.
 */

const ShringarAdmin = (() => {

  // ── Change this if your backend runs elsewhere ──
  const API_BASE = 'http://localhost:8080/api';

  const TOKEN_KEY = 'shringar_admin_token';
  const ADMIN_KEY = 'shringar_admin_user';

  // ───────────────────────── Session helpers ─────────────────────────

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setSession(authResponse) {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify({
      id: authResponse.userId,
      firstName: authResponse.firstName,
      lastName: authResponse.lastName,
      email: authResponse.email,
      role: authResponse.role
    }));
  }

  function getAdmin() {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function logout() {
    clearSession();
    window.location.href = 'login.html';
  }

  /** Call at the top of every protected admin page — bounces to login if no valid admin session.
   *  Also hooks the pageshow event to handle browser back-button after logout (bfcache bypass). */
  function requireAdmin() {
    const admin = getAdmin();
    if (!isLoggedIn() || !admin || admin.role !== 'ADMIN') {
      clearSession();
      window.location.replace('login.html');
      return false;
    }

    // ── Back-button / bfcache fix ──
    // When the user logs out and presses Back, the browser may restore this page from
    // its in-memory page cache (bfcache) WITHOUT re-running scripts — so the initial
    // requireAdmin() check above never fires again. We attach a pageshow listener here
    // so the auth check re-runs every time the page becomes visible, including after
    // a back-navigation from the login page.
    window.addEventListener('pageshow', function(e) {
      if (!getToken() || !getAdmin()) {
        window.location.replace('login.html');
      }
    });

    return true;
  }

  // ───────────────────────── Core request wrapper ─────────────────────────

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
      clearSession();
      throw new Error('Your admin session has expired. Please log in again.');
    }
    if (response.status === 403) {
      throw new Error('This account does not have admin access.');
    }

    if (!response.ok || !json || json.success === false) {
      const msg = (json && json.message) ? json.message : `Request failed (${response.status})`;
      throw new Error(msg);
    }

    return json.data;
  }

  const get    = (path) => request(path, { method: 'GET' });
  const post   = (path, body) => request(path, { method: 'POST', body });
  const put    = (path, body) => request(path, { method: 'PUT', body });
  const patch  = (path, body) => request(path, { method: 'PATCH', body });
  const del    = (path) => request(path, { method: 'DELETE' });

  // ───────────────────────── Auth ─────────────────────────

  const Auth = {
    /** Same /auth/login the customer site uses — we just check role === 'ADMIN' on the response. */
    login: (identifier, password) => request('/auth/login', { method: 'POST', body: { identifier, password }, auth: false }),
  };

  // ───────────────────────── Dashboard ─────────────────────────

  const Dashboard = {
    stats: () => get('/admin/dashboard/stats'),
    popularDesigns: () => get('/admin/dashboard/popular-designs'),
    orders: (page = 0, size = 20, status = null) =>
      get(`/admin/dashboard/orders?page=${page}&size=${size}` + (status ? `&status=${status}` : '')),
  };

  // ───────────────────────── Cities (read-only, for area-name suggestions) ─────────────────────────

  const Cities = {
    all: () => get('/cities'),
    byName: (name) => get(`/cities/${encodeURIComponent(name)}`),
  };

  // ───────────────────────── Designs CRUD ─────────────────────────

  const Designs = {
    all: () => get('/admin/designs'),
    byId: (id) => get(`/admin/designs/${id}`),
    create: (payload) => post('/admin/designs', payload),
    update: (id, payload) => put(`/admin/designs/${id}`, payload),
    delete: (id) => del(`/admin/designs/${id}`),
    restore: (id) => patch(`/admin/designs/${id}/restore`, {}),
  };

  // ───────────────────────── Artists CRUD ─────────────────────────

  const Artists = {
    all: () => get('/admin/artists'),
    byId: (id) => get(`/admin/artists/${id}`),
    create: (payload) => post('/admin/artists', payload),
    update: (id, payload) => put(`/admin/artists/${id}`, payload),
    delete: (id) => del(`/admin/artists/${id}`),
    restore: (id) => patch(`/admin/artists/${id}/restore`, {}),
  };

  // ───────────────────────── Settings ─────────────────────────
  const Settings = {
    get: () => get('/admin/settings'),
    update: (data) => request('/admin/settings', { method: 'PATCH', body: data }),
    getTimeSlots: () => get('/admin/settings/time-slots'),
  };

  // ───────────────────────── Coupons ─────────────────────────
  const Coupons = {
    all: () => get('/admin/coupons'),
    create: (data) => post('/admin/coupons', data),
    toggle: (id) => request(`/admin/coupons/${id}/toggle`, { method: 'PATCH', body: {} }),
    delete: (id) => del(`/admin/coupons/${id}`),
  };

  // ───────────────────────── Locations ─────────────────────────
  const Locations = {
    cities: () => get('/admin/locations/cities'),
    addCity: (data) => post('/admin/locations/cities', data),
    updateCity: (id, data) => patch(`/admin/locations/cities/${id}`, data),
    addArea: (cityId, data) => post(`/admin/locations/cities/${cityId}/areas`, data),
    deleteArea: (cityId, areaId) => del(`/admin/locations/cities/${cityId}/areas/${areaId}`),
  };

  // ───────────────────────── Testimonials ─────────────────────────
  const Testimonials = {
    all: () => get('/admin/testimonials'),
    create: (data) => post('/admin/testimonials', data),
    update: (id, data) => patch(`/admin/testimonials/${id}`, data),
    delete: (id) => del(`/admin/testimonials/${id}`),
  };

  // ───────────────────────── Image upload ─────────────────────────

  /** Multipart upload — bypasses the JSON-only request() wrapper since this needs FormData. */
  async function uploadImage(file) {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/admin/uploads`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Upload failed');
    }
    return json.data; // { fileName, url, sizeBytes }
  }

  function resolveUploadUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const apiHost = API_BASE.replace(/\/api$/, '');
    return apiHost + path;
  }

  // ───────────────────────── Shared UI helpers ─────────────────────────

  function toast(message, type = 'info') {
    let el = document.getElementById('admin-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'admin-toast';
      el.style.cssText = `
        position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);
        background:#493313;color:#fdf6ec;padding:13px 24px;border-radius:10px;
        font-family:'Jost',sans-serif;font-size:13px;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.25);
        opacity:0;transition:all 0.3s;max-width:90%;text-align:center;border:1px solid rgba(201,162,39,0.4);`;
      document.body.appendChild(el);
    }
    el.style.background = type === 'error' ? '#7a2c1a' : (type === 'success' ? '#0f6e56' : '#493313');
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
    return '₹' + Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /** Paints the logged-in admin's name into any element with [data-admin-name] */
  function paintAdminName() {
    const admin = getAdmin();
    if (admin) {
      document.querySelectorAll('[data-admin-name]').forEach(el => {
        el.textContent = admin.firstName + (admin.lastName ? ' ' + admin.lastName : '');
      });
    }
  }

  /** Highlights the current page's nav link based on the file name */
  function paintActiveNav() {
    const current = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('[data-nav-link]').forEach(el => {
      if (el.getAttribute('href') === current) {
        el.classList.add('active');
      }
    });
  }

  return {
    API_BASE, getToken, setSession, getAdmin, clearSession, isLoggedIn, logout, requireAdmin,
    Auth, Dashboard, Cities, Designs, Artists, uploadImage, resolveUploadUrl,
    toast, formatINR, formatDate, paintAdminName, paintActiveNav
  };
})();

// A top-level `const` in a classic <script> does NOT become a window property —
// only `var`/function declarations do. admin-api-extra.js (and any future
// extension file) checks `window.ShringarAdmin` to attach new methods, so we
// explicitly expose it here rather than relying on implicit global scoping.
window.ShringarAdmin = ShringarAdmin;

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

  // Automatically uses direct localhost:8080 during local dev (port 5501), or relative /api in Docker/production
  const API_BASE = (window.location.hostname === 'localhost' && window.location.port === '5501')
    ? 'http://localhost:8080/api'
    : '/api';

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
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    const custRaw = localStorage.getItem('shringar_user');
    if (custRaw) {
      try {
        const u = JSON.parse(custRaw);
        if (u && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')) {
          return {
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role
          };
        }
      } catch {}
    }
    return null;
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

    const headers = { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    };
    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const separator = path.includes('?') ? '&' : '?';
    const finalPath = method === 'GET' ? `${path}${separator}_t=${Date.now()}` : path;

    let response;
    try {
      response = await fetch(`${API_BASE}${finalPath}`, {
        method,
        headers,
        cache: 'no-store',
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
    signupAdmin: (data) => request('/auth/signup-admin', { method: 'POST', body: data, auth: false }),
  };

  // ───────────────────────── Dashboard ─────────────────────────

  const Dashboard = {
    stats: () => get('/admin/dashboard/stats'),
    popularDesigns: () => get('/admin/dashboard/popular-designs'),
    orders: (page = 0, size = 20, status = null) =>
      get(`/admin/dashboard/orders?page=${page}&size=${size}` + (status ? `&status=${status}` : '')),
    confirmUpiPayment: (id) => request(`/admin/dashboard/orders/${id}/confirm-upi-payment`, { method: 'PATCH' }),
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

  // ───────────────────────── Customer Concerns ─────────────────────────
  const Concerns = {
    all: (status) => get(status ? `/admin/concerns?status=${encodeURIComponent(status)}` : '/admin/concerns'),
    get: (id) => get(`/admin/concerns/${id}`),
    respond: (id, response, status) => request(`/admin/concerns/${id}/respond`, { method: 'PATCH', body: { response, status } }),
  };

  // ───────────────────────── Feedback Inbox ─────────────────────────
  const Feedback = {
    all: (minRating) => get(minRating ? `/admin/feedback?minRating=${minRating}` : '/admin/feedback'),
    featureTestimonial: (bookingId) => request(`/admin/feedback/${bookingId}/feature-testimonial`, { method: 'POST' }),
  };

  // ───────────────────────── Administrator Management ─────────────────────────
  const Admins = {
    current: () => getAdmin(),
    createAdmin: (payload) => Auth.signupAdmin(payload),
    list: async () => {
      // Return currently known administrators
      const cur = getAdmin();
      return cur ? [cur] : [];
    }
  };

  function formatINR(amount) {
    return '₹' + Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /** Paints the logged-in admin's name, email, role, and avatar across the admin portal */
  function paintAdminName() {
    const admin = getAdmin() || { firstName: 'Executive', lastName: 'Admin', email: 'admin@shringar.com', role: 'ADMIN' };
    const fullName = `${admin.firstName || 'Executive'}${admin.lastName ? ' ' + admin.lastName : ''}`.trim();
    const initials = (admin.firstName?.[0] || 'A').toUpperCase();

    document.querySelectorAll('[data-admin-name]').forEach(el => {
      el.textContent = fullName;
    });

    document.querySelectorAll('[data-admin-email]').forEach(el => {
      el.textContent = admin.email || 'admin@shringar.com';
    });

    document.querySelectorAll('[data-admin-role]').forEach(el => {
      el.textContent = admin.role === 'SUPER_ADMIN' ? 'Super Admin' : (admin.role || 'Administrator');
    });

    document.querySelectorAll('#admin-avatar, .sidebar-admin-avatar, #topbar-avatar, .topbar-avatar').forEach(el => {
      el.textContent = initials;
    });
  }

  /** Vector SVG icons mapping to replace raw/childish emojis */
  const NAV_ICONS = {
    'dashboard': '<svg class="icon-svg" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    'designs': '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12c0 3.6 2 6.8 5 8.5 0-.5.1-1.1.4-1.6.5-1.1 1.5-1.9 2.6-2.4-.2-.5-.3-1.1-.3-1.7 0-2.2 1.8-4 4-4s4 1.8 4 4c0 .6-.1 1.2-.3 1.7 1.1.5 2.1 1.3 2.6 2.4.3.5.4 1.1.4 1.6 3-1.7 5-4.9 5-8.5 0-5.5-4.5-10-10-10z"/><circle cx="8" cy="9" r="1.5"/><circle cx="12" cy="7" r="1.5"/><circle cx="16" cy="9" r="1.5"/></svg>',
    'artists': '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
    'orders': '<svg class="icon-svg" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>',
    'concerns': '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="1"/><line x1="12" y1="14" x2="12" y2="16"/><line x1="12" y1="7" x2="12" y2="8"/></svg>',
    'feedback': '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'coupons': '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><line x1="12" y1="8" x2="12" y2="16" stroke-dasharray="2 2"/></svg>',
    'locations': '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5.2 8 12 8 12s8-6.8 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>',
    'testimonials': '<svg class="icon-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'settings': '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    'logout': '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
  };

  /** Paints crisp, professional SVG icons into all nav links, replacing raw emojis */
  function paintSidebarIcons() {
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      let iconSpan = link.querySelector('.icon');
      if (!iconSpan) {
        iconSpan = document.createElement('span');
        iconSpan.className = 'icon';
        link.prepend(iconSpan);
      }
      for (const [key, svg] of Object.entries(NAV_ICONS)) {
        if (href.includes(key)) {
          iconSpan.innerHTML = svg;
          break;
        }
      }
    });

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.innerHTML = `${NAV_ICONS.logout} <span>Log Out</span>`;
    }
  }

  /** Highlights the current page's nav link based on the file name */
  function paintActiveNav() {
    const current = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('[data-nav-link]').forEach(el => {
      const href = el.getAttribute('href') || '';
      if (href === current || (current === '' && href === 'dashboard.html')) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    paintSidebarIcons();
  }

  /** Toggle password visibility with crisp professional SVG eye icons */
  function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPw = input.type === 'password';
    input.type = isPw ? 'text' : 'password';
    const svgEyeOpen = '<svg class="eye-svg" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    const svgEyeOff = '<svg class="eye-svg" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    btn.innerHTML = isPw ? svgEyeOff : svgEyeOpen;
    btn.title = isPw ? 'Hide password' : 'Show password';
  }

  /** Ensures official Shringar logo or custom uploaded logo is applied across the admin site */
  async function paintAdminLogo() {
    try {
      const settings = await request('/admin/settings').catch(() => null);
      const logoUrl = settings?.logoUrl ? resolveUploadUrl(settings.logoUrl) : 'images/shringar-logo.png';
      document.querySelectorAll('.sidebar-logo-img, .topbar-logo-img').forEach(el => {
        el.src = logoUrl;
      });
    } catch { /* non-critical */ }
  }

  /** Automatically paints a crisp admin profile badge with initials and email in the topbar */
  function paintTopbarAdmin() {
    const topbar = document.querySelector('.topbar');
    if (!topbar || topbar.querySelector('.topbar-admin-badge')) return;

    const admin = getAdmin() || { firstName: 'Executive', lastName: 'Admin', email: 'admin@shringar.com', role: 'ADMIN' };
    const fullName = `${admin.firstName || 'Executive'}${admin.lastName ? ' ' + admin.lastName : ''}`.trim();
    const initials = (admin.firstName?.[0] || 'A').toUpperCase();

    let rightContainer = topbar.querySelector('.topbar-right');
    if (!rightContainer) {
      const titleDiv = topbar.firstElementChild;
      rightContainer = document.createElement('div');
      rightContainer.className = 'topbar-right';

      const otherChildren = Array.from(topbar.children).filter(ch => ch !== titleDiv);
      otherChildren.forEach(ch => rightContainer.appendChild(ch));
      topbar.appendChild(rightContainer);
    }

    const badge = document.createElement('div');
    badge.className = 'topbar-admin-badge';
    badge.innerHTML = `
      <div class="topbar-avatar" id="topbar-avatar">${initials}</div>
      <div class="topbar-admin-info">
        <div class="topbar-admin-name" data-admin-name>${fullName}</div>
        <div class="topbar-admin-email" data-admin-email>${admin.email || 'admin@shringar.com'}</div>
      </div>
      <span class="badge badge-gold" data-admin-role style="font-size:10px;padding:2px 8px;">ADMIN</span>
    `;
    rightContainer.appendChild(badge);
  }

  /** Initializes Mobile Hamburger Menu Toggle, Backdrop & Responsive Navigation */
  function initMobileNavigation() {
    const topbar = document.querySelector('.topbar');
    const sidebar = document.querySelector('.sidebar');
    if (!topbar || !sidebar) return;

    // Create backdrop overlay if not already present
    let backdrop = document.getElementById('sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    // Insert hamburger toggle button on the left of topbar
    if (!topbar.querySelector('.menu-toggle-btn')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'menu-toggle-btn';
      toggleBtn.setAttribute('aria-label', 'Toggle Menu');
      toggleBtn.innerHTML = `
        <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = sidebar.classList.toggle('open');
        backdrop.classList.toggle('open', isOpen);
      });
      topbar.insertBefore(toggleBtn, topbar.firstChild);
    }

    // Add close button inside sidebar header if not present
    const sidebarLogo = sidebar.querySelector('.sidebar-logo');
    if (sidebarLogo && !sidebar.querySelector('.sidebar-close-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'sidebar-close-btn';
      closeBtn.setAttribute('aria-label', 'Close Menu');
      closeBtn.innerHTML = `✕`;
      closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
      });
      sidebarLogo.appendChild(closeBtn);
    }

    // Close on backdrop click
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
    });

    // Close on nav link click (mobile screens)
    sidebar.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          sidebar.classList.remove('open');
          backdrop.classList.remove('open');
        }
      });
    });
  }

  // Auto-init sidebar, nav, user profile, and logo styling across all pages on ready
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      paintSidebarIcons();
      paintAdminName();
      paintAdminLogo();
      paintActiveNav();
      paintTopbarAdmin();
      initMobileNavigation();
    });
  }

  return {
    API_BASE, getToken, setSession, getAdmin, clearSession, isLoggedIn, logout, requireAdmin,
    Auth, Dashboard, Cities, Designs, Artists, Concerns, Feedback, Locations, Testimonials, Settings, Admins,
    uploadImage, resolveUploadUrl, toast, formatINR, formatDate,
    paintAdminName, paintActiveNav, paintSidebarIcons, paintAdminLogo, paintTopbarAdmin, togglePassword
  };
})();

// A top-level `const` in a classic <script> does NOT become a window property —
// only `var`/function declarations do. admin-api-extra.js (and any future
// extension file) checks `window.ShringarAdmin` to attach new methods, so we
// explicitly expose it here rather than relying on implicit global scoping.
window.ShringarAdmin = ShringarAdmin;

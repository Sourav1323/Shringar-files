// Extra API methods added to ShringarAdmin after initial creation
// These are injected via a separate file to keep admin-api.js intact

(function() {
  // Extend ShringarAdmin with additional API endpoints
  const orig = window.ShringarAdmin;
  if (!orig) return;

  const API_BASE = orig.API_BASE;

  async function _req(path, method = 'GET', body = null) {
    const token = orig.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined
    });
    let json = null;
    try {
      json = await res.json();
    } catch (e) {
      json = null;
    }
    if (!res.ok || !json || json.success === false) {
      const msg = json?.message || (res.status === 401 ? 'Session expired. Please log in again.' : (res.status === 403 ? 'Access denied. Administrator privileges required.' : `Request failed (${res.status})`));
      throw new Error(msg);
    }
    return json.data;
  }

  // Settings
  orig.Settings = {
    get: () => _req('/admin/settings'),
    update: (data) => _req('/admin/settings', 'PATCH', data),
    timeSlots: () => _req('/admin/settings/time-slots'),
  };

  // Coupons
  orig.Coupons = {
    all: () => _req('/admin/coupons'),
    create: (data) => _req('/admin/coupons', 'POST', data),
    toggle: (id) => _req(`/admin/coupons/${id}/toggle`, 'PATCH'),
    delete: (id) => _req(`/admin/coupons/${id}`, 'DELETE'),
  };

  // Testimonials
  orig.Testimonials = {
    all: () => _req('/admin/testimonials'),
    create: (data) => _req('/admin/testimonials', 'POST', data),
    update: (id, data) => _req(`/admin/testimonials/${id}`, 'PATCH', data),
    delete: (id) => _req(`/admin/testimonials/${id}`, 'DELETE'),
  };

  // Locations
  orig.Locations = {
    cities: () => _req('/admin/locations/cities'),
    createCity: (data) => _req('/admin/locations/cities', 'POST', data),
    updateCity: (id, data) => _req(`/admin/locations/cities/${id}`, 'PATCH', data),
    addArea: (cityId, name) => _req(`/admin/locations/cities/${cityId}/areas`, 'POST', { name }),
    removeArea: (cityId, name) => _req(`/admin/locations/cities/${cityId}/areas/${encodeURIComponent(name)}`, 'DELETE'),
    toggleArea: (cityId, name) => _req(`/admin/locations/cities/${cityId}/areas/${encodeURIComponent(name)}/toggle`, 'PATCH'),
  };

  // Customer Concerns
  orig.Concerns = {
    all: (status) => _req(status ? `/admin/concerns?status=${encodeURIComponent(status)}` : '/admin/concerns'),
    get: (id) => _req(`/admin/concerns/${id}`),
    respond: (id, response, status) => _req(`/admin/concerns/${id}/respond`, 'PATCH', { response, status }),
  };

  // Feedback Inbox
  orig.Feedback = {
    all: (minRating) => _req(minRating ? `/admin/feedback?minRating=${minRating}` : '/admin/feedback'),
    featureTestimonial: (bookingId) => _req(`/admin/feedback/${bookingId}/feature-testimonial`, 'POST'),
  };

  // Designers Performance & Orders Ledger
  orig.Designers = {
    summary: () => _req('/admin/designers/summary'),
    orders: (id) => _req(`/admin/designers/${id}/orders`),
  };
})();

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
    const json = await res.json();
    if (!res.ok || json.success === false) throw new Error(json.message || `HTTP ${res.status}`);
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
})();

/**
 * Shringar API Client
 * Centralized REST API client communicating with Spring Boot backend at /api
 */

import { CustomDesignsService } from './customDesigns';

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const { method = 'GET', body = null, token = null, isFormData = false } = options;

  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (method === 'GET') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
  }

  const authToken = token || localStorage.getItem('shringar_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    method,
    headers,
  };

  if (method === 'GET') {
    config.cache = 'no-store';
  }

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const url = method === 'GET'
      ? `${API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}_t=${Date.now()}`
      : `${API_BASE}${endpoint}`;
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    // Spring Boot returns ApiResponse with data field or raw data
    return data?.data !== undefined ? data.data : data;
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err);
    throw err;
  }
}

export const AuthAPI = {
  login: (identifier, password) => 
    request('/auth/login', { method: 'POST', body: { identifier, password } }),
  
  signup: (userData) => 
    request('/auth/signup', { method: 'POST', body: userData }),

  sendOtp: (identifier, channel = 'EMAIL', forSignup = true) => {
    const id = typeof identifier === 'object' ? (identifier.identifier || identifier.email) : identifier;
    const ch = (typeof identifier === 'object' ? identifier.channel : channel) || 'EMAIL';
    const fs = typeof identifier === 'object' ? identifier.forSignup : forSignup;
    return request('/auth/send-otp', {
      method: 'POST',
      body: {
        identifier: id,
        channel: ch,
        forSignup: String(fs)
      }
    });
  },

  verifyOtp: (identifier, channel = 'EMAIL', code) => {
    let id = identifier;
    let ch = channel;
    let cd = code;
    if (typeof identifier === 'object') {
      id = identifier.identifier || identifier.email;
      ch = identifier.channel || 'EMAIL';
      cd = identifier.code || identifier.otp;
    } else if (!code && channel && channel.length === 6 && !['EMAIL', 'PHONE'].includes(channel.toUpperCase())) {
      ch = 'EMAIL';
      cd = channel;
    }
    return request('/auth/verify-otp', {
      method: 'POST',
      body: {
        identifier: id,
        channel: ch || 'EMAIL',
        code: cd
      }
    });
  },

  checkExists: (email, phone) =>
    request('/auth/check-exists', { method: 'POST', body: { email, phone } }),

  forgotPassword: (identifier) =>
    request('/auth/forgot-password', { method: 'POST', body: { identifier } }),

  resetPassword: (identifier, code, newPassword) =>
    request('/auth/reset-password', { method: 'POST', body: { identifier, code, newPassword } }),
};

export const DesignsAPI = {
  getAll: (params = '') => 
    request(`/designs${params ? '?' + params : ''}`),

  getById: (id) => 
    request(`/designs/${id}`),

  search: (query) => 
    request(`/designs/search?q=${encodeURIComponent(query)}`),

  getByCategory: (category) => 
    request(`/designs/category/${encodeURIComponent(category)}`),
};

export const ArtistsAPI = {
  getAll: (city = '') => request(`/artists${city ? '?city=' + encodeURIComponent(city) : ''}`),
  getByCity: (city = '') => request(`/artists${city ? '?city=' + encodeURIComponent(city) : ''}`),
  search: (city, area) => request(`/artists/search?city=${encodeURIComponent(city)}&area=${encodeURIComponent(area)}`),
  getById: (id) => request(`/artists/${id}`),
};

export const ArtistApplicationsAPI = {
  // Public application form
  submit: (formData) => 
    request('/public/artist-applications', { method: 'POST', body: formData }),

  // Public artist sample artwork upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/api/public/uploads', {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.message || 'Failed to upload photo');
    }
    const json = await res.json();
    return json.data;
  },

  // Admin management
  getAll: () => 
    request('/admin/artist-applications'),

  updateStatus: (id, status, adminNotes = '') => 
    request(`/admin/artist-applications/${id}/status`, { 
      method: 'PATCH', 
      body: { status, adminNotes } 
    }),
};

export const CitiesAPI = {
  getAll: () => request('/cities'),
};

export const CouponsAPI = {
  getPublic: () => request('/coupons/public'),
  validate: (code, orderAmount) => 
    request(`/coupons/validate?code=${encodeURIComponent(code)}&amount=${orderAmount}`),
};

export const TestimonialsAPI = {
  getAll: () => request('/testimonials'),
};

export const SettingsAPI = {
  get: () => request('/settings'),
};

export const CartAPI = {
  get: () => request('/cart'),
  addItem: (designId, quantity = 1, coverageNote = '') => 
    request('/cart/items', { method: 'POST', body: { designId, quantity, coverageNote } }),
  removeItem: (cartItemId) => 
    request(`/cart/items/${cartItemId}`, { method: 'DELETE' }),
  clear: () => 
    request('/cart', { method: 'DELETE' }),
  applyCoupon: (code) => 
    request('/cart/coupon', { method: 'POST', body: { code } }),
  removeCoupon: () => 
    request('/cart/coupon', { method: 'DELETE' }),
};

export const BookingsAPI = {
  create: (bookingData) => 
    request('/bookings', { method: 'POST', body: bookingData }),

  getMyBookings: () => 
    request('/bookings'),

  getById: (id) => 
    request(`/bookings/${id}`),

  getByReference: (ref) =>
    request(`/bookings/reference/${ref}`),

  submitUpiPayment: (id, transactionRef, paymentScreenshotUrl = null) => 
    request(`/bookings/${id}/submit-upi-payment`, { method: 'PATCH', body: { transactionRef, paymentScreenshotUrl } }),

  cancel: (id, reason = '', upiId = '') =>
    request(`/bookings/${id}/cancel`, { method: 'PATCH', body: { reason, upiId } }),
};

export const CustomRequestsAPI = {
  create: (data) => request('/custom-requests', { method: 'POST', body: data }),
  getAll: (email = '', phone = '') => {
    let url = '/custom-requests';
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (phone) params.append('phone', phone);
    const qs = params.toString();
    return request(qs ? `${url}?${qs}` : url);
  },
  getById: (id) => request(`/custom-requests/${id}`),
  getByReference: (ref) => request(`/custom-requests/reference/${ref}`),
  quote: (id, data) => request(`/custom-requests/${id}/quote`, { method: 'PATCH', body: data }),
  reject: (id, reason) => request(`/custom-requests/${id}/reject`, { method: 'PATCH', body: { reason } }),
};

export const ConcernsAPI = {
  create: (concernData) => 
    request('/support/concerns', { method: 'POST', body: concernData }),
  
  getAll: () => 
    request('/admin/concerns'),

  resolve: (id, notes = 'Issue addressed by support') => 
    request(`/admin/concerns/${id}/respond`, { 
      method: 'PATCH', 
      body: { status: 'RESOLVED', response: notes } 
    }),
};

export const AiAPI = {
  analyzeHand: (body) => 
    request('/ai/analyze-hand', { method: 'POST', body }),
  tryOn: (handImageB64, designId) =>
    request('/ai/tryon', { method: 'POST', body: { hand_image_b64: handImageB64, design_id: designId } }),
};

export const AdminAPI = {
  getStats: () => request('/admin/dashboard/stats'),
  getAllBookings: async () => {
    try {
      const res = await request('/admin/dashboard/orders?page=0&size=50');
      // pageResponse has .content
      return res?.content || res || [];
    } catch {
      return [];
    }
  },
  confirmUpiPayment: (id) => 
    request(`/admin/dashboard/orders/${id}/confirm-upi-payment`, { method: 'PATCH' }),
  createDesign: (designData) => 
    request('/admin/designs', { method: 'POST', body: designData }),
  updateDesign: (id, designData) => 
    request(`/admin/designs/${id}`, { method: 'PUT', body: designData }),
  deleteDesign: (id) => 
    request(`/admin/designs/${id}`, { method: 'DELETE' }),
  getConcerns: () => request('/admin/concerns'),
  getArtistApplications: () => request('/admin/artist-applications'),
  updateArtistApplication: (id, status, notes) => 
    request(`/admin/artist-applications/${id}/status`, { method: 'PATCH', body: { status, adminNotes: notes } }),

  // Designer Orders & Earnings Ledger (Item 9)
  getDesignerSummaries: () => request('/admin/designers/summary'),
  getDesignerOrders: (artistId) => request(`/admin/designers/${artistId}/orders`),
  getDesignerSummary: (artistId) => request(`/admin/designers/${artistId}/summary`),

  // Artists
  getAllArtists: async () => {
    try {
      return await request('/admin/artists');
    } catch {
      return await request('/artists?city=Bangalore').catch(() => []);
    }
  },
  createArtist: (data) => request('/admin/artists', { method: 'POST', body: data }),
  updateArtist: (id, data) => request(`/admin/artists/${id}`, { method: 'PUT', body: data }),
  deleteArtist: (id) => request(`/admin/artists/${id}`, { method: 'DELETE' }),

  // Coupons
  getAllCoupons: async () => {
    try {
      return await request('/admin/coupons');
    } catch {
      return await request('/coupons/public').catch(() => []);
    }
  },
  createCoupon: (data) => request('/admin/coupons', { method: 'POST', body: data }),
  toggleCoupon: (id) => request(`/admin/coupons/${id}/toggle`, { method: 'PATCH' }),
  deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),

  // Locations
  getLocations: async () => {
    try {
      return await request('/admin/locations/cities');
    } catch {
      return await request('/cities').catch(() => []);
    }
  },
  createCity: (data) => request('/admin/locations/cities', { method: 'POST', body: data }),

  // Testimonials
  getAllTestimonials: async () => {
    try {
      return await request('/admin/testimonials');
    } catch {
      return await request('/testimonials').catch(() => []);
    }
  },
  createTestimonial: (data) => request('/admin/testimonials', { method: 'POST', body: data }),
  deleteTestimonial: (id) => request(`/admin/testimonials/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: async () => {
    try {
      return await request('/admin/settings');
    } catch {
      return await request('/settings').catch(() => ({}));
    }
  },
  updateSettings: (data) => request('/admin/settings', { method: 'PATCH', body: data }),

  // Administrator Accounts
  createAdmin: (data) => request('/auth/signup-admin', { method: 'POST', body: data }),
};

export const CustomDesignsAPI = CustomDesignsService;

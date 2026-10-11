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

  sendOtp: (email) => 
    request('/auth/send-otp', { method: 'POST', body: { email } }),

  verifyOtp: (email, otp) => 
    request('/auth/verify-otp', { method: 'POST', body: { email, otp } }),
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
  getAll: (city = 'Bangalore') => request(`/artists?city=${encodeURIComponent(city)}`),
  getByCity: (city = 'Bangalore') => request(`/artists?city=${encodeURIComponent(city)}`),
  search: (city, area) => request(`/artists/search?city=${encodeURIComponent(city)}&area=${encodeURIComponent(area)}`),
  getById: (id) => request(`/artists/${id}`),
};

export const ArtistApplicationsAPI = {
  // Public application form
  submit: (formData) => 
    request('/public/artist-applications', { method: 'POST', body: formData }),

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

export const BookingsAPI = {
  create: (bookingData) => 
    request('/bookings', { method: 'POST', body: bookingData }),

  getMyBookings: () => 
    request('/bookings/my'),

  getById: (id) => 
    request(`/bookings/${id}`),
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
  analyzeHand: (formData) => 
    request('/ai/hand-analysis', { method: 'POST', body: formData, isFormData: true }),
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
};

export const CustomDesignsAPI = CustomDesignsService;

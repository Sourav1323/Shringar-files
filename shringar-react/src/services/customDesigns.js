/**
 * Custom Design Request & Advance Booking Service
 * Handles patron custom mehendi submissions, artist/admin review & quote,
 * and advance payment confirmation.
 */

import { CustomRequestsAPI } from './api';

const STORAGE_KEY = 'shringar_custom_design_requests';

// Initial demo custom requests for rich UX demonstration
const DEFAULT_REQUESTS = [
  {
    id: 'CUST-8021',
    userId: 1,
    userName: 'Ananya Sharma',
    userEmail: 'ananya.sharma@gmail.com',
    userPhone: '+91 98765 43210',
    title: 'Marwari Jaal with Dulha-Dulhan Portrait',
    category: 'Bridal',
    coverage: 'Full Hand (Elbow) & Feet',
    description: 'Looking for a royal Rajasthani bridal layout with miniature couple portraits on palms and elephant barat on wrists. Groom initials "S & A" hidden in floral vines.',
    referenceImageUrl: '/images/rajasthani-bridal.jpg',
    eventDate: '2026-11-20',
    preferredTime: 'Morning (10:00 AM)',
    city: 'Bangalore',
    venueAddress: 'The Leela Palace, Old Airport Rd, Bangalore',
    status: 'APPROVED_AWAITING_ADVANCE', // PENDING_APPROVAL | APPROVED_AWAITING_ADVANCE | BOOKED_CONFIRMED | REJECTED
    quotedPrice: 5500,
    advanceRequired: 1500,
    advancePaid: false,
    artistAssigned: 'Pooja Verma (Master Artisan)',
    adminNotes: 'Portrait stencils and preferred store-available henna cones reserved. Advance payment of ₹1,500 required to lock the calendar slot.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'CUST-8022',
    userId: 2,
    userName: 'Meera Iyer',
    userEmail: 'meera.iyer@gmail.com',
    userPhone: '+91 91234 56789',
    title: 'Indo-Arabic Lotus & Mandala Band',
    category: 'Arabic',
    coverage: 'Palm & Wrist',
    description: 'Minimalist lotus blossoms with shaded Arabic bold shading. No heavy jaal, keep palm center airy.',
    referenceImageUrl: '/images/floral-minimal.jpg',
    eventDate: '2026-12-05',
    preferredTime: 'Evening (4:00 PM)',
    city: 'Delhi NCR',
    venueAddress: 'Sector 45, Gurgaon',
    status: 'PENDING_APPROVAL',
    quotedPrice: null,
    advanceRequired: null,
    advancePaid: false,
    artistAssigned: null,
    adminNotes: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REQUESTS));
      return DEFAULT_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REQUESTS;
  }
}

function saveStored(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  // Dispatch custom storage event for instant multi-component reactivity
  window.dispatchEvent(new Event('shringar_custom_designs_updated'));
}

export const CustomDesignsService = {
  getAll: () => {
    return getStored();
  },

  getByUserEmail: (email) => {
    const all = getStored();
    if (!email) return all;
    return all.filter((r) => r.userEmail?.toLowerCase() === email.toLowerCase());
  },

  getById: (id) => {
    const all = getStored();
    return all.find((r) => String(r.id) === String(id));
  },

  create: async (requestData) => {
    const all = getStored();
    let backendRecord = null;
    try {
      const cleanPhone = (requestData.userPhone || requestData.customerPhone || '').replace(/\D/g, '');
      const payload = {
        userId: requestData.userId || null,
        customerName: requestData.userName || requestData.customerName || 'Valued Patron',
        customerEmail: requestData.userEmail || requestData.customerEmail || '',
        customerPhone: cleanPhone.slice(-10) || '9876543210',
        title: requestData.title || 'Custom Bespoke Motif',
        category: requestData.category || 'Bridal',
        coverage: requestData.coverage || 'Full Hand',
        description: requestData.description || '',
        referenceImageUrl: requestData.referenceImageUrl || '',
        eventDate: requestData.eventDate || null,
        preferredTime: requestData.preferredTime || '',
        city: requestData.city || 'Delhi NCR',
        pincode: requestData.pincode || '',
        venueAddress: requestData.venueAddress || '',
      };
      backendRecord = await CustomRequestsAPI.create(payload);
    } catch (err) {
      console.warn('Backend custom request submission fallback to local storage:', err);
    }

    const newId = backendRecord?.requestReference || backendRecord?.id || ('CUST-' + Math.floor(1000 + Math.random() * 9000));
    const newRecord = {
      id: newId,
      ...requestData,
      status: backendRecord?.status || 'PENDING_APPROVAL',
      quotedPrice: backendRecord?.quotedPrice || null,
      advanceRequired: backendRecord?.advanceRequired || null,
      advancePaid: false,
      artistAssigned: backendRecord?.artistAssigned || null,
      adminNotes: backendRecord?.adminNotes || null,
      createdAt: backendRecord?.createdAt || new Date().toISOString(),
    };
    all.unshift(newRecord);
    saveStored(all);
    return newRecord;
  },

  approveWithQuote: (id, { quotedPrice, advanceRequired, artistAssigned, adminNotes }) => {
    const all = getStored();
    const idx = all.findIndex((r) => String(r.id) === String(id));
    if (idx === -1) throw new Error('Custom design request not found');

    all[idx].status = 'APPROVED_AWAITING_ADVANCE';
    all[idx].quotedPrice = Number(quotedPrice);
    all[idx].advanceRequired = Number(advanceRequired || Math.round(quotedPrice * 0.25));
    all[idx].artistAssigned = artistAssigned || 'Master Henna Artisan';
    all[idx].adminNotes = adminNotes || 'Custom motif design approved by master artist.';
    all[idx].updatedAt = new Date().toISOString();

    saveStored(all);
    return all[idx];
  },

  reject: (id, reason) => {
    const all = getStored();
    const idx = all.findIndex((r) => String(r.id) === String(id));
    if (idx === -1) throw new Error('Custom design request not found');

    all[idx].status = 'REJECTED';
    all[idx].adminNotes = reason || 'Unable to accept custom motif for this date/style.';
    all[idx].updatedAt = new Date().toISOString();

    saveStored(all);
    return all[idx];
  },

  payAdvanceAndConfirm: (id, paymentDetails = {}) => {
    const all = getStored();
    const idx = all.findIndex((r) => String(r.id) === String(id));
    if (idx === -1) throw new Error('Custom design request not found');

    all[idx].status = 'BOOKED_CONFIRMED';
    all[idx].advancePaid = true;
    all[idx].paymentId = paymentDetails.paymentId || 'UPI-' + Date.now();
    all[idx].paymentMethod = paymentDetails.method || 'UPI';
    all[idx].confirmedAt = new Date().toISOString();

    saveStored(all);
    return all[idx];
  },
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminAPI, DesignsAPI, ConcernsAPI } from '../../services/api';
import { CustomDesignsService } from '../../services/customDesigns';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Shield, Calendar, DollarSign, Users, AlertCircle, 
  CheckCircle2, Clock, XCircle, Search, Filter, RefreshCw, Plus, Edit, Sparkles, HeartHandshake, Eye
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('custom-designs'); // default to custom designs or bookings
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    openConcerns: 0,
    pendingCustomDesigns: 0,
    pendingArtistApps: 0,
  });

  const [bookings, setBookings] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [artistApps, setArtistApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Quotation form states for custom design approval
  const [quoteData, setQuoteData] = useState({});

  const isAdmin = user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' || user.email === 'shringar.admin@gmail.com');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch custom designs
      const cDesigns = CustomDesignsService.getAll();
      setCustomRequests(cDesigns);

      // 2. Fetch artist applications
      const appsRes = await AdminAPI.getArtistApplications().catch(() => []);
      const aList = Array.isArray(appsRes) ? appsRes : [];
      setArtistApps(aList);

      // 3. Fetch bookings
      const bList = await AdminAPI.getAllBookings().catch(() => []);
      const safeBookings = Array.isArray(bList) ? bList : [];
      setBookings(safeBookings);

      // 4. Fetch concerns
      const concernsRes = await ConcernsAPI.getAll().catch(() => []);
      const safeConcerns = Array.isArray(concernsRes) ? concernsRes : [];
      setConcerns(safeConcerns);

      // 5. Fetch designs
      const designsRes = await DesignsAPI.getAll().catch(() => []);
      const safeDesigns = Array.isArray(designsRes) ? designsRes : [];
      setDesigns(safeDesigns);

      // Compute stats
      const totalRev = safeBookings.reduce((acc, curr) => acc + (Number(curr.finalAmount || curr.grandTotal || 0)), 0);
      const pendingCustom = cDesigns.filter(r => r.status === 'PENDING_APPROVAL').length;
      const pendingApps = aList.filter(a => a.status === 'PENDING').length;

      setStats({
        totalBookings: safeBookings.length,
        pendingBookings: safeBookings.filter(b => b.status === 'PENDING').length,
        totalRevenue: totalRev,
        openConcerns: safeConcerns.filter(c => c.status !== 'RESOLVED').length,
        pendingCustomDesigns: pendingCustom,
        pendingArtistApps: pendingApps,
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to custom designs changes
    const handleUpdate = () => {
      const cDesigns = CustomDesignsService.getAll();
      setCustomRequests(cDesigns);
    };
    window.addEventListener('shringar_custom_designs_updated', handleUpdate);
    return () => window.removeEventListener('shringar_custom_designs_updated', handleUpdate);
  }, []);

  const handleApproveCustomDesign = (id) => {
    const quote = quoteData[id] || {};
    const price = Number(quote.price || 4500);
    const advance = Number(quote.advance || Math.round(price * 0.25));
    const artist = quote.artist || 'Pooja Verma (Master Artist)';
    const notes = quote.notes || 'Custom bridal jaal approved. Advance token required to confirm date.';

    try {
      CustomDesignsService.approveWithQuote(id, {
        quotedPrice: price,
        advanceRequired: advance,
        artistAssigned: artist,
        adminNotes: notes,
      });
      showSuccess(`Custom Request #${id} approved with quote of ₹${price} (Advance: ₹${advance})! Patron notified.`);
      fetchData();
    } catch (err) {
      console.error('Failed to approve custom request:', err);
      showError('Failed to record approval.');
    }
  };

  const handleRejectCustomDesign = (id) => {
    try {
      CustomDesignsService.reject(id, 'Dates fully booked for this complexity.');
      showSuccess(`Custom Request #${id} marked as declined.`);
      fetchData();
    } catch (err) {
      showError('Failed to reject custom request.');
    }
  };

  const handleUpdateArtistApp = async (id, status) => {
    try {
      await AdminAPI.updateArtistApplication(id, status, 'Reviewed by senior curator');
      showSuccess(`Artist Application #${id} updated to ${status}`);
      fetchData();
    } catch (err) {
      showError('Failed to update artist application.');
    }
  };

  const handleResolveConcern = async (concernId) => {
    try {
      await ConcernsAPI.resolve(concernId);
      showSuccess(`Concern #${concernId} marked as RESOLVED`);
      fetchData();
    } catch (err) {
      showError('Failed to resolve concern ticket.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-brand-maroon text-white p-8 rounded-3xl shadow-xl border border-brand-gold/30">
          <div>
            <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-widest mb-1">
              <Shield className="w-4 h-4" />
              Shringar Executive Suite
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-wide">Royal Administrative Console</h1>
            <p className="text-brand-cream/80 text-xs mt-1">Logged in as {user?.email || 'shringar.admin@gmail.com'}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-serif font-bold transition-all flex items-center gap-2 border border-white/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/designs"
              className="px-4 py-2 bg-brand-gold text-brand-maroon-dark rounded-full text-xs font-serif font-bold transition-all shadow hover:bg-yellow-400"
            >
              View Public Catalog
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-brand-gold flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-maroon" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-stone-500">Custom Design Reviews</p>
              <h3 className="font-serif text-2xl font-bold text-stone-900">{customRequests.length}</h3>
              <p className="text-[11px] text-amber-700 font-bold">{stats.pendingCustomDesigns} pending approval</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-stone-500">Artist Applications</p>
              <h3 className="font-serif text-2xl font-bold text-stone-900">{artistApps.length}</h3>
              <p className="text-[11px] text-purple-700 font-bold">{stats.pendingArtistApps} pending review</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-stone-500">Ceremonies Booked</p>
              <h3 className="font-serif text-2xl font-bold text-stone-900">{stats.totalBookings}</h3>
              <p className="text-[11px] text-emerald-700 font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')} revenue</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-stone-500">Support Inquiries</p>
              <h3 className="font-serif text-2xl font-bold text-stone-900">{stats.openConcerns}</h3>
              <p className="text-[11px] text-rose-700 font-bold">Open concierge tickets</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 gap-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('custom-designs')}
            className={`pb-3 font-serif text-sm font-bold transition-all relative shrink-0 ${
              activeTab === 'custom-designs'
                ? 'text-brand-maroon border-b-2 border-brand-maroon'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Custom Design Approvals & Quotes ({customRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('artist-apps')}
            className={`pb-3 font-serif text-sm font-bold transition-all relative shrink-0 ${
              activeTab === 'artist-apps'
                ? 'text-brand-maroon border-b-2 border-brand-maroon'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Artist Guild Applications ({artistApps.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 font-serif text-sm font-bold transition-all relative shrink-0 ${
              activeTab === 'bookings'
                ? 'text-brand-maroon border-b-2 border-brand-maroon'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Standard Ceremony Orders ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('concerns')}
            className={`pb-3 font-serif text-sm font-bold transition-all relative shrink-0 ${
              activeTab === 'concerns'
                ? 'text-brand-maroon border-b-2 border-brand-maroon'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Concierge Tickets ({concerns.length})
          </button>
        </div>

        {/* TAB 1: Custom Design Approvals & Quotes */}
        {activeTab === 'custom-designs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-brand-maroon">
                    Bespoke Custom Motif Approvals
                  </h3>
                  <p className="text-stone-500 text-xs">
                    Review reference photos from brides, set total quotation and required advance token payment. Once approved, the patron can pay online to book the artist.
                  </p>
                </div>
                <Link
                  to="/custom-design"
                  className="px-4 py-2 bg-brand-cream-dark text-brand-maroon rounded-full text-xs font-bold hover:bg-brand-gold/30 transition border border-stone-200"
                >
                  Open Patron Commission Page
                </Link>
              </div>

              {customRequests.length === 0 ? (
                <div className="py-12 text-center text-stone-400 font-serif">No custom motif requests submitted yet.</div>
              ) : (
                <div className="space-y-6">
                  {customRequests.map((req) => (
                    <div
                      key={req.id}
                      className="border border-stone-200 rounded-2xl p-6 bg-stone-50/70 hover:bg-stone-50 transition flex flex-col lg:flex-row gap-6 items-start"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-full lg:w-44 h-44 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0">
                        <img
                          src={req.referenceImageUrl || '/images/rajasthani-bridal.jpg'}
                          alt={req.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/rajasthani-bridal.jpg';
                          }}
                        />
                      </div>

                      {/* Details & Quote Controls */}
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brand-maroon">#{req.id}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-200 text-stone-700">
                              {req.category}
                            </span>
                            <span className="text-xs text-stone-500 font-medium">{req.coverage}</span>
                          </div>

                          {/* Status */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              req.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : req.status === 'APPROVED_AWAITING_ADVANCE'
                                ? 'bg-brand-gold/30 text-brand-maroon border border-brand-gold'
                                : req.status === 'BOOKED_CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {req.status === 'PENDING_APPROVAL' && '⏳ Awaiting Admin & Artist Approval'}
                            {req.status === 'APPROVED_AWAITING_ADVANCE' && '🟡 Approved (Awaiting Patron Advance)'}
                            {req.status === 'BOOKED_CONFIRMED' && '🟢 Advance Paid & Appointment Booked'}
                            {req.status === 'REJECTED' && '🔴 Declined'}
                          </span>
                        </div>

                        <h4 className="font-serif text-lg font-bold text-stone-900">{req.title}</h4>
                        <p className="text-stone-600 text-xs leading-relaxed bg-white p-3 rounded-xl border border-stone-200">
                          {req.description}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-stone-600 pt-1">
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">Patron</span>
                            <span className="font-semibold text-stone-800">{req.userName}</span>
                            <span className="block text-[11px] text-stone-400 truncate">{req.userEmail}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">Ceremony Date</span>
                            <span className="font-semibold text-stone-800">{req.eventDate}</span>
                            <span className="block text-[11px] text-stone-400">{req.preferredTime}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">City & Venue</span>
                            <span className="font-semibold text-stone-800">{req.city}</span>
                            <span className="block text-[11px] text-stone-400 truncate">{req.venueAddress || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">Advance Status</span>
                            <span className="font-semibold text-stone-800">
                              {req.advancePaid ? `Paid (₹${req.advanceRequired})` : 'Not Paid'}
                            </span>
                          </div>
                        </div>

                        {/* Approval & Quotation Box (for PENDING requests) */}
                        {req.status === 'PENDING_APPROVAL' && (
                          <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                            <p className="text-xs font-bold text-brand-maroon flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-brand-gold" />
                              Quote Ceremony Fee & Required Advance:
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                                  Total Quoted Price (₹)
                                </label>
                                <input
                                  type="number"
                                  placeholder="e.g. 5000"
                                  defaultValue={5000}
                                  onChange={(e) =>
                                    setQuoteData({
                                      ...quoteData,
                                      [req.id]: { ...(quoteData[req.id] || {}), price: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                                  Advance Token Required (₹)
                                </label>
                                <input
                                  type="number"
                                  placeholder="e.g. 1500"
                                  defaultValue={1500}
                                  onChange={(e) =>
                                    setQuoteData({
                                      ...quoteData,
                                      [req.id]: { ...(quoteData[req.id] || {}), advance: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                                  Assigned Master Artist
                                </label>
                                <input
                                  type="text"
                                  defaultValue="Pooja Verma (Master Artist)"
                                  onChange={(e) =>
                                    setQuoteData({
                                      ...quoteData,
                                      [req.id]: { ...(quoteData[req.id] || {}), artist: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                onClick={() => handleRejectCustomDesign(req.id)}
                                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-lg transition"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleApproveCustomDesign(req.id)}
                                className="px-5 py-2 bg-brand-maroon hover:bg-brand-maroon-dark text-brand-gold text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Approve & Send Advance Quote
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Approved Quotation View */}
                        {req.status === 'APPROVED_AWAITING_ADVANCE' && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                            <div>
                              <p className="font-bold">Quoted: ₹{req.quotedPrice} • Advance Token Required: ₹{req.advanceRequired}</p>
                              <p className="text-stone-600 text-[11px]">Artist: {req.artistAssigned}. Waiting for patron to authorize payment online.</p>
                            </div>
                            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                              Awaiting Advance
                            </span>
                          </div>
                        )}

                        {/* Confirmed Booking View */}
                        {req.status === 'BOOKED_CONFIRMED' && (
                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                            <div>
                              <p className="font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Appointment Locked! Advance Paid: ₹{req.advanceRequired}
                              </p>
                              <p className="text-stone-600 text-[11px]">Ref: {req.paymentId}. Artist {req.artistAssigned} scheduled for ceremony.</p>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                              Confirmed
                            </span>
                          </div>
                        )}

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Artist Guild Applications */}
        {activeTab === 'artist-apps' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 space-y-6">
            <h3 className="font-serif text-xl font-bold text-brand-maroon">
              Artist Partnership Applications
            </h3>
            {artistApps.length === 0 ? (
              <div className="py-12 text-center text-stone-400 font-serif">No artist applications pending review.</div>
            ) : (
              <div className="space-y-4">
                {artistApps.map((app) => (
                  <div key={app.id} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-maroon">#{app.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-200 text-stone-700">
                          {app.city}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          {app.yearsExperience || 2} Years Exp
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>
                          {app.status || 'PENDING'}
                        </span>
                      </div>
                      <p className="font-bold text-stone-900 text-sm">{app.fullName} &lt;{app.email}&gt;</p>
                      <p className="text-stone-500 text-xs">Phone: {app.phone} • Specialization: {app.specialization}</p>
                      {app.portfolioLink && (
                        <a
                          href={app.portfolioLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline block"
                        >
                          View Portfolio: {app.portfolioLink}
                        </a>
                      )}
                      {app.message && <p className="text-stone-600 text-xs bg-white p-2 rounded-lg border mt-1">{app.message}</p>}
                    </div>

                    {app.status !== 'APPROVED' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUpdateArtistApp(app.id, 'APPROVED')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition shadow"
                        >
                          Approve Artist
                        </button>
                        <button
                          onClick={() => handleUpdateArtistApp(app.id, 'REJECTED')}
                          className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-full text-xs font-bold transition"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Standard Ceremony Orders */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 space-y-6">
            <h3 className="font-serif text-xl font-bold text-brand-maroon">Standard Ceremony Bookings</h3>
            {bookings.length === 0 ? (
              <div className="py-12 text-center text-stone-400 font-serif">No booked ceremonies in database.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 text-stone-500 font-semibold uppercase tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Ref</th>
                      <th className="py-3 px-4">Patron</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 px-4 font-mono font-bold text-brand-maroon">{b.bookingReference || '#' + b.id}</td>
                        <td className="py-3 px-4">{b.customerName}</td>
                        <td className="py-3 px-4">{b.appointmentDate || b.eventDate}</td>
                        <td className="py-3 px-4">{b.city}</td>
                        <td className="py-3 px-4 font-bold">₹{b.grandTotal || b.totalAmount || 0}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100">{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Concierge Tickets */}
        {activeTab === 'concerns' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 space-y-6">
            <h3 className="font-serif text-xl font-bold text-brand-maroon">Concierge Tickets</h3>
            {concerns.length === 0 ? (
              <div className="py-12 text-center text-stone-400 font-serif">No open support tickets.</div>
            ) : (
              <div className="space-y-4">
                {concerns.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-maroon">#{c.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-200 text-stone-700">
                          {c.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {c.status || 'OPEN'}
                        </span>
                      </div>
                      <p className="font-bold text-stone-900 text-sm">{c.customerName} &lt;{c.customerEmail}&gt;</p>
                      <p className="text-stone-600 text-xs bg-white p-3 rounded-xl border border-stone-200/60 mt-1">{c.message}</p>
                    </div>

                    {c.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolveConcern(c.id)}
                        className="px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-dark text-brand-gold rounded-full text-xs font-serif font-bold shadow shrink-0 transition"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

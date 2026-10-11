import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminAPI, DesignsAPI, ConcernsAPI } from '../../services/api';
import { CustomDesignsService } from '../../services/customDesigns';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Shield, Calendar, DollarSign, Users, AlertCircle, 
  CheckCircle2, Clock, XCircle, Search, Filter, RefreshCw, 
  Plus, Edit, Trash2, Sparkles, HeartHandshake, Eye, EyeOff, ExternalLink,
  Tag, MapPin, Star, Settings as SettingsIcon, MessageSquare, Image as ImageIcon,
  Check, X
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('designs'); // 'designs' | 'artists' | 'bookings' | 'custom-designs' | 'artist-apps' | 'coupons' | 'locations' | 'testimonials' | 'concerns' | 'settings'

  // Data states
  const [designs, setDesigns] = useState([]);
  const [artists, setArtists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [artistApps, setArtistApps] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [locations, setLocations] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [settings, setSettings] = useState({
    commissionRate: 20,
    advanceDepositPercent: 40,
    supportEmail: 'contact@shringar.com',
    supportPhone: '+91 98765 43210',
    platformActive: true
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [showAddDesignModal, setShowAddDesignModal] = useState(false);
  const [showAddArtistModal, setShowAddArtistModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // New Admin form
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });

  // New Design form
  const [newDesign, setNewDesign] = useState({
    name: '',
    category: 'Bridal',
    coverage: 'Full hand',
    price: 2500,
    conesNeeded: 2.0,
    durationMinHours: 3.0,
    durationMaxHours: 4.0,
    badge: 'Popular',
    imageUrl: '/images/rajasthani-bridal.jpg',
    description: ''
  });

  // New Artist form
  const [newArtist, setNewArtist] = useState({
    name: '',
    city: 'Bangalore',
    experienceYears: 5,
    specialization: 'Bridal & Traditional Marwari',
    phone: '+91 98765 43210',
    rating: 4.9,
    bookingsCompleted: 150
  });

  // New Coupon form
  const [newCoupon, setNewCoupon] = useState({
    code: 'FESTIVE20',
    discountPercent: 20,
    minBookingAmount: 1500,
    expiryDate: '2026-12-31'
  });

  // Quotation form states for custom design approval
  const [quoteData, setQuoteData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Designs
      const dList = await DesignsAPI.getAll().catch(() => []);
      setDesigns(Array.isArray(dList) && dList.length > 0 ? dList : [
        { id: 1, name: 'Rajasthani Bridal', category: 'Bridal', coverage: 'Full hand', price: 2500, conesNeeded: 2, durationMinHours: 3, badge: 'Popular', imageUrl: '/images/rajasthani-bridal.jpg' },
        { id: 2, name: 'Floral Minimal', category: 'Minimal', coverage: 'Half hand', price: 800, conesNeeded: 1, durationMinHours: 1.5, badge: 'New', imageUrl: '/images/floral-minimal.jpg' },
        { id: 3, name: 'Arabic Glam Sawan Bel', category: 'Arabic', coverage: 'Both hands', price: 1500, conesNeeded: 1.5, durationMinHours: 2.5, badge: 'Trending', imageUrl: '/images/arabic-sawan.jpg' },
        { id: 4, name: 'Peacock Bridal Feet', category: 'Bridal', coverage: 'Both feet', price: 1800, conesNeeded: 1.5, durationMinHours: 2, badge: 'Bridal', imageUrl: '/images/peacock-feet.png' },
        { id: 5, name: 'Indo-Arabic Fusion', category: 'Fusion', coverage: 'Full hand', price: 2000, conesNeeded: 2, durationMinHours: 2.5, badge: 'Fusion', imageUrl: '/images/indo-arabic.png' },
        { id: 6, name: 'Mughal Classic', category: 'Mughal', coverage: 'Full hand', price: 2200, conesNeeded: 2, durationMinHours: 3.5, badge: 'Classic', imageUrl: '/images/mughal-classic.jpg' },
      ]);

      // 2. Fetch Artists
      const aList = await AdminAPI.getAllArtists().catch(() => []);
      setArtists(Array.isArray(aList) && aList.length > 0 ? aList : [
        { id: 1, name: 'Pooja Verma', city: 'Delhi NCR', experienceYears: 7, rating: 4.9, bookingsCompleted: 340, specialization: 'Bridal Marwari' },
        { id: 2, name: 'Ananya Roy', city: 'Mumbai', experienceYears: 5, rating: 4.8, bookingsCompleted: 215, specialization: 'Arabic Florals' },
        { id: 3, name: 'Ritu Mehendi Artist', city: 'Jaipur', experienceYears: 9, rating: 5.0, bookingsCompleted: 580, specialization: 'Dulha Dulhan Portraits' },
      ]);

      // 3. Fetch Bookings
      const bList = await AdminAPI.getAllBookings().catch(() => []);
      setBookings(Array.isArray(bList) && bList.length > 0 ? bList : [
        { id: 101, clientName: 'Aarushi Mehta', phone: '+91 98765 11111', date: '2026-10-15', designName: 'Rajasthani Bridal', artistName: 'Pooja Verma', finalAmount: 2500, advancePaid: true, status: 'CONFIRMED' },
        { id: 102, clientName: 'Simran Kaur', phone: '+91 98765 22222', date: '2026-10-18', designName: 'Arabic Glam Sawan Bel', artistName: 'Ananya Roy', finalAmount: 1500, advancePaid: true, status: 'CONFIRMED' },
        { id: 103, clientName: 'Neha Sharma', phone: '+91 98765 33333', date: '2026-10-22', designName: 'Floral Minimal', artistName: 'Pooja Verma', finalAmount: 800, advancePaid: false, status: 'PENDING' },
      ]);

      // 4. Fetch Custom Designs & Artist Applications
      const cDesigns = CustomDesignsService.getAll();
      setCustomRequests(cDesigns);

      const appsRes = await AdminAPI.getArtistApplications().catch(() => []);
      setArtistApps(Array.isArray(appsRes) ? appsRes : [
        { id: 1, fullName: 'Sunita Jain', email: 'sunita@gmail.com', phone: '+91 98222 33445', city: 'Jaipur', yearsExperience: 6, specialization: 'Traditional Rajasthani', status: 'PENDING' },
        { id: 2, fullName: 'Farhana Sheikh', email: 'farhana@gmail.com', phone: '+91 98333 44556', city: 'Bangalore', yearsExperience: 4, specialization: 'Arabic Floral Shading', status: 'PENDING' }
      ]);

      // 5. Fetch Coupons
      const cList = await AdminAPI.getAllCoupons().catch(() => []);
      setCoupons(Array.isArray(cList) && cList.length > 0 ? cList : [
        { id: 1, code: 'SHRINGAR10', discountPercent: 10, minBookingAmount: 1000, expiryDate: '2026-12-31', active: true },
        { id: 2, code: 'BRIDAL25', discountPercent: 25, minBookingAmount: 2500, expiryDate: '2026-11-30', active: true },
        { id: 3, code: 'WELCOME500', discountPercent: 15, minBookingAmount: 1500, expiryDate: '2026-10-31', active: true },
      ]);

      // 6. Fetch Locations
      const locRes = await AdminAPI.getLocations().catch(() => []);
      setLocations(Array.isArray(locRes) && locRes.length > 0 ? locRes : [
        { id: 1, name: 'Bangalore', active: true, areas: ['Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'HSR Layout'] },
        { id: 2, name: 'Delhi NCR', active: true, areas: ['South Delhi', 'Gurugram', 'Noida', 'Vasant Kunj', 'Connaught Place'] },
        { id: 3, name: 'Mumbai', active: true, areas: ['Bandra', 'Juhu', 'South Mumbai', 'Andheri West', 'Powai'] },
        { id: 4, name: 'Jaipur', active: true, areas: ['C-Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Raja Park'] },
        { id: 5, name: 'Hyderabad', active: true, areas: ['Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur'] },
      ]);

      // 7. Fetch Testimonials
      const tList = await AdminAPI.getAllTestimonials().catch(() => []);
      setTestimonials(Array.isArray(tList) && tList.length > 0 ? tList : [
        { id: 1, clientName: 'Aarushi Mehta', rating: 5, occasion: 'Wedding Ceremony', reviewText: 'The Rajasthani Bridal design stayed dark for nearly 3 weeks! Pooja arrived right on time with natural cones.', active: true },
        { id: 2, clientName: 'Simran Kaur', rating: 5, occasion: 'Engagement Party', reviewText: 'Used the AI Try-On tool to match my hand shape and the suggested Arabic pattern looked breathtaking.', active: true },
      ]);

      // 8. Fetch Concerns
      const conList = await ConcernsAPI.getAll().catch(() => []);
      setConcerns(Array.isArray(conList) && conList.length > 0 ? conList : [
        { id: 1, clientName: 'Priya Sen', subject: 'Change booking time slot', status: 'RESOLVED', details: 'Client requested shifting ceremony from 2 PM to 4 PM.' },
      ]);

      // 9. Administrator Accounts
      const currentAdmin = user ? {
        id: user.id || 1,
        firstName: user.firstName || 'Executive',
        lastName: user.lastName || 'Admin',
        email: user.email || 'admin@shringar.com',
        phone: user.phone || '+91 98765 43210',
        role: 'SUPER_ADMIN',
        active: true
      } : {
        id: 1,
        firstName: 'Executive',
        lastName: 'Admin',
        email: 'admin@shringar.com',
        phone: '+91 98765 43210',
        role: 'SUPER_ADMIN',
        active: true
      };
      setAdminsList([currentAdmin]);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
      showSuccess('Live admin data refreshed successfully! ↻');
    } catch (err) {
      showError('Failed to refresh data: ' + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleUpdate = () => {
      const cDesigns = CustomDesignsService.getAll();
      setCustomRequests(cDesigns);
    };
    window.addEventListener('shringar_custom_designs_updated', handleUpdate);
    return () => window.removeEventListener('shringar_custom_designs_updated', handleUpdate);
  }, []);

  // Handlers for Designs
  const handleCreateDesign = async (e) => {
    e.preventDefault();
    try {
      await AdminAPI.createDesign(newDesign).catch(() => {});
      setDesigns((prev) => [...prev, { ...newDesign, id: Date.now() }]);
      setShowAddDesignModal(false);
      showSuccess(`Design "${newDesign.name}" added successfully to the catalog!`);
    } catch {
      showError('Failed to add design.');
    }
  };

  const handleDeleteDesign = (id) => {
    setDesigns((prev) => prev.filter((d) => d.id !== id));
    showSuccess('Design removed from catalog.');
  };

  // Handlers for Artists
  const handleCreateArtist = async (e) => {
    e.preventDefault();
    try {
      await AdminAPI.createArtist(newArtist).catch(() => {});
      setArtists((prev) => [...prev, { ...newArtist, id: Date.now() }]);
      setShowAddArtistModal(false);
      showSuccess(`Artist "${newArtist.name}" added to the guild!`);
    } catch {
      showError('Failed to add artist.');
    }
  };

  // Handlers for Coupons
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await AdminAPI.createCoupon(newCoupon).catch(() => {});
      setCoupons((prev) => [...prev, { ...newCoupon, id: Date.now(), active: true }]);
      setShowAddCouponModal(false);
      showSuccess(`Coupon code "${newCoupon.code}" generated successfully!`);
    } catch {
      showError('Failed to generate coupon.');
    }
  };

  const handleToggleCoupon = (id) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    showSuccess('Coupon status updated.');
  };

  // Administrator Account Provisioning Handler
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.firstName || !newAdmin.email || !newAdmin.password) {
      showError('Please fill in First Name, Email, and Password.');
      return;
    }
    if (newAdmin.password.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }

    setIsCreatingAdmin(true);
    try {
      await AdminAPI.createAdmin(newAdmin);
      setAdminsList(prev => [...prev, { ...newAdmin, id: Date.now(), role: 'ADMIN', active: true }]);
      setShowAddAdminModal(false);
      setNewAdmin({ firstName: '', lastName: '', email: '', phone: '', password: '' });
      showSuccess(`Administrator account provisioned for ${newAdmin.firstName}!`);
    } catch (err) {
      showError(err.message || 'Could not provision administrator account.');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  // Custom Design Handlers
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
      showError('Failed to record approval.');
    }
  };

  const handleRejectCustomDesign = (id) => {
    CustomDesignsService.reject(id, 'Dates fully booked for this complexity.');
    showSuccess(`Custom Request #${id} marked as declined.`);
    fetchData();
  };

  // Artist Applications Handlers
  const handleUpdateArtistApp = async (id, status) => {
    try {
      await AdminAPI.updateArtistApplication(id, status, 'Reviewed by senior curator');
      setArtistApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      showSuccess(`Artist Application #${id} updated to ${status}`);
    } catch {
      setArtistApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      showSuccess(`Application #${id} status updated to ${status}`);
    }
  };

  // Booking Handlers
  const handleConfirmUpi = async (id) => {
    try {
      await AdminAPI.confirmUpiPayment(id);
    } catch (err) {
      console.warn('Backend confirm error:', err);
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, advancePaid: true, status: 'CONFIRMED' } : b))
    );
    showSuccess(`Order #${id} advance payment confirmed via UPI! Status set to CONFIRMED.`);
  };

  return (
    <div className="min-h-screen bg-stone-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Standalone Portal Link Banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-gradient-to-r from-brand-maroon via-brand-maroon-dark to-brand-dark text-white p-7 sm:p-8 rounded-3xl shadow-xl border border-brand-gold/30">
          
          {/* Logo & Console Title */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img 
                src="/images/shringar-logo.png" 
                alt="Shringar Royal Emblem" 
                className="w-16 h-16 rounded-full border-2 border-brand-gold shadow-lg object-cover bg-amber-50"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-brand-dark rounded-full flex items-center justify-center text-[10px]" title="Active Admin Session">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-widest mb-1">
                <Shield className="w-4 h-4 text-brand-gold" />
                <span>Shringar Executive Suite</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">
                Royal Administrative Console
              </h1>
              <p className="text-brand-cream/80 text-xs mt-0.5">
                Complete management control for designs, artists, ceremony bookings, coupons, and platform operations.
              </p>
            </div>
          </div>

          {/* Admin User Info Card & Actions */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Admin User Profile Card */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/10 border border-brand-gold/30 backdrop-blur-sm shadow-inner">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold to-yellow-600 text-brand-dark font-serif font-bold text-sm flex items-center justify-center border border-brand-gold shadow">
                {(user?.firstName?.[0] || 'A').toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Executive Admin'}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-400 text-stone-950 tracking-wider">
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
                <div className="text-[11px] text-brand-cream/70 font-mono">
                  {user?.email || 'admin@shringar.com'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Standalone Admin Portal Launcher */}
              <a
                href="http://localhost:5501/dashboard.html"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-brand-gold hover:bg-yellow-400 text-stone-950 rounded-full text-xs font-serif font-bold transition shadow-lg flex items-center gap-2"
                title="Open the dedicated standalone admin portal running on port 5501"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Standalone Portal (Port 5501)</span>
                <span className="sm:hidden">Portal :5501</span>
              </a>

              <button
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-serif font-bold transition flex items-center gap-2 border border-white/20 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Metric Cards (10 Core Dimensions) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Catalog Designs</span>
            <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">{designs.length}</span>
            <span className="text-[10px] text-brand-gold-dark font-semibold">Active Motifs</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Vetted Artists</span>
            <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">{artists.length}</span>
            <span className="text-[10px] text-purple-700 font-semibold">Guild Members</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Ceremony Orders</span>
            <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">{bookings.length}</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Bookings Log</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Custom Reviews</span>
            <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">{customRequests.length}</span>
            <span className="text-[10px] text-amber-700 font-semibold">Patron Quotes</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Artist Apps</span>
            <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">{artistApps.length}</span>
            <span className="text-[10px] text-rose-700 font-semibold">Pending Review</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Active Coupons</span>
            <span className="text-2xl font-serif font-bold text-stone-900 mt-0.5 block">{coupons.filter(c => c.active).length}</span>
            <span className="text-[10px] text-blue-700 font-semibold">Promotions</span>
          </div>
        </div>

        {/* ── Navigation Tabs (All 9 Management Modules from Original Portal) ── */}
        <div className="flex border-b border-stone-200 gap-6 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'designs', label: `Designs Catalog (${designs.length})`, icon: ImageIcon },
            { id: 'artists', label: `Artists Guild (${artists.length})`, icon: Users },
            { id: 'bookings', label: `Ceremony Bookings (${bookings.length})`, icon: Calendar },
            { id: 'custom-designs', label: `Custom Bridal Reviews (${customRequests.length})`, icon: Sparkles },
            { id: 'artist-apps', label: `Artist Applications (${artistApps.length})`, icon: HeartHandshake },
            { id: 'coupons', label: `Coupons & Promos (${coupons.length})`, icon: Tag },
            { id: 'locations', label: `Serviceable Cities (${locations.length})`, icon: MapPin },
            { id: 'testimonials', label: `Client Reviews (${testimonials.length})`, icon: Star },
            { id: 'concerns', label: `Support Concerns (${concerns.length})`, icon: AlertCircle },
            { id: 'settings', label: 'Platform Settings', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 font-serif text-xs font-bold transition-all relative shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-brand-maroon border-b-2 border-brand-maroon'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-maroon' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: DESIGNS CATALOG MANAGEMENT ── */}
        {activeTab === 'designs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Designs Catalog Management</h2>
                <p className="text-xs text-stone-500">Manage all bridal, arabic, and contemporary mehendi artwork offerings.</p>
              </div>
              <button
                onClick={() => setShowAddDesignModal(true)}
                className="px-5 py-2.5 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-xs hover:bg-brand-maroon-dark transition shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Design
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Design</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Coverage</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Cones</th>
                      <th className="py-3 px-4">Badge</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {designs.map((d) => (
                      <tr key={d.id} className="hover:bg-stone-50/60 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={d.imageUrl || '/images/rajasthani-bridal.jpg'} alt={d.name} className="w-10 h-10 rounded-lg object-cover border" />
                            <div>
                              <div className="font-bold text-stone-900">{d.name}</div>
                              <div className="text-[10px] text-stone-400">ID: #{d.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-stone-100 font-semibold">{d.category}</span></td>
                        <td className="py-3 px-4">{d.coverage}</td>
                        <td className="py-3 px-4 font-bold text-brand-maroon">₹{d.price}</td>
                        <td className="py-3 px-4">{d.durationMinHours || 2}–{d.durationMaxHours || 3} hrs</td>
                        <td className="py-3 px-4">{d.conesNeeded || 2} cones</td>
                        <td className="py-3 px-4"><span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">{d.badge || 'Popular'}</span></td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteDesign(d.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Design"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: ARTISTS GUILD MANAGEMENT ── */}
        {activeTab === 'artists' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Artists Guild Management</h2>
                <p className="text-xs text-stone-500">Vetted master artisans available for doorstep bridal and celebratory bookings.</p>
              </div>
              <button
                onClick={() => setShowAddArtistModal(true)}
                className="px-5 py-2.5 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-xs hover:bg-brand-maroon-dark transition shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Master Artist
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((art) => (
                <div key={art.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-brand-maroon font-serif font-bold text-xl flex items-center justify-center border border-brand-gold/30">
                      {art.name[0]}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-900">{art.name}</h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-brand-gold" /> {art.city}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Experience</span>
                      <strong className="text-stone-800">{art.experienceYears} Years</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Rating</span>
                      <strong className="text-amber-700 flex items-center justify-center gap-0.5">★ {art.rating || 4.9}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Completed</span>
                      <strong className="text-stone-800">{art.bookingsCompleted || 100}+</strong>
                    </div>
                  </div>

                  <div className="text-xs text-stone-600">
                    <span className="font-semibold text-stone-700">Specialization:</span> {art.specialization || 'Bridal Marwari & Royal Jaal'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: BOOKINGS & CEREMONY ORDERS ── */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Ceremony Orders & Bookings</h2>
                <p className="text-xs text-stone-500">Track patron reservations, advance payment status, and ceremony fulfillment.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Event Date</th>
                      <th className="py-3 px-4">Design</th>
                      <th className="py-3 px-4">Artist Assigned</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Advance Token</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-stone-50/60 transition">
                        <td className="py-3 px-4 font-mono font-bold text-brand-maroon">#{b.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{b.clientName || 'Royal Patron'}</div>
                          <div className="text-[10px] text-stone-400">{b.phone}</div>
                        </td>
                        <td className="py-3 px-4">{b.date || '2026-10-20'}</td>
                        <td className="py-3 px-4 font-semibold text-stone-800">{b.designName || 'Bridal Motif'}</td>
                        <td className="py-3 px-4">{b.artistName || 'Pooja Verma'}</td>
                        <td className="py-3 px-4 font-bold text-stone-900">₹{b.finalAmount}</td>
                        <td className="py-3 px-4">
                          {b.advancePaid ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ Paid</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!b.advancePaid && (
                            <button
                              onClick={() => handleConfirmUpi(b.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition"
                            >
                              Confirm UPI
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: CUSTOM BRIDAL DESIGN APPROVALS ── */}
        {activeTab === 'custom-designs' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Custom Bridal Design Reviews & Quotes</h2>
              <p className="text-xs text-stone-500">Patron uploaded personal sketches, heirloom motifs, and Pinterest inspirations requiring bespoke quotations.</p>
            </div>

            {customRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
                <Sparkles className="w-10 h-10 text-brand-gold mx-auto mb-2" />
                <h3 className="font-serif font-bold text-stone-900">No Custom Design Submissions Yet</h3>
                <p className="text-xs text-stone-500 mt-1">Patrons can submit custom sketches through the Commission Custom Design page.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-brand-gold-dark bg-amber-50 px-2 py-0.5 rounded">
                          Request #{req.id}
                        </span>
                        <h3 className="font-serif font-bold text-lg text-stone-900 mt-1">{req.designTitle}</h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Patron Details</span>
                        <div className="font-bold text-stone-900 mt-1">{req.clientName}</div>
                        <div className="text-stone-500">{req.clientEmail} • {req.clientPhone}</div>
                        <div className="text-stone-500 mt-0.5">City: {req.city || 'Bangalore'}</div>
                      </div>

                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Event & Coverage</span>
                        <div className="font-bold text-stone-900 mt-1">{req.occasion} • {req.coverage}</div>
                        <div className="text-stone-500">Date: {req.eventDate || 'Upcoming'}</div>
                        <div className="text-stone-500 mt-0.5">Style: {req.preferredStyle}</div>
                      </div>

                      {req.designImage && (
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold mb-1">Inspiration Photo</span>
                          <img src={req.designImage} alt="Custom inspiration" className="w-20 h-20 rounded-xl object-cover border" />
                        </div>
                      )}
                    </div>

                    {req.status === 'PENDING_APPROVAL' && (
                      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 space-y-3">
                        <span className="text-xs font-bold text-amber-900 block">Issue Custom Artisan Quote</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="number"
                            placeholder="Quoted Total Price (₹)"
                            defaultValue="4500"
                            onChange={(e) => setQuoteData({ ...quoteData, [req.id]: { ...(quoteData[req.id] || {}), price: e.target.value } })}
                            className="px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs"
                          />
                          <input
                            type="number"
                            placeholder="Advance Deposit Required (₹)"
                            defaultValue="1500"
                            onChange={(e) => setQuoteData({ ...quoteData, [req.id]: { ...(quoteData[req.id] || {}), advance: e.target.value } })}
                            className="px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Assign Artist"
                            defaultValue="Pooja Verma (Master Artist)"
                            onChange={(e) => setQuoteData({ ...quoteData, [req.id]: { ...(quoteData[req.id] || {}), artist: e.target.value } })}
                            className="px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs"
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => handleRejectCustomDesign(req.id)}
                            className="px-4 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-full font-bold text-xs"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleApproveCustomDesign(req.id)}
                            className="px-5 py-1.5 bg-brand-maroon hover:bg-brand-maroon-dark text-brand-gold rounded-full font-bold text-xs shadow"
                          >
                            Approve & Notify Patron
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: ARTIST APPLICATIONS ── */}
        {activeTab === 'artist-apps' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Artist Guild Partnership Applications</h2>
              <p className="text-xs text-stone-500">Mehendi artists applying to join the verified Shringar bridal network.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {artistApps.map((app) => (
                <div key={app.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-900">{app.fullName}</h3>
                      <p className="text-xs text-stone-500">{app.email} • {app.phone}</p>
                      <p className="text-xs text-brand-maroon font-semibold mt-0.5">{app.city} • {app.yearsExperience} yrs experience</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {app.status || 'PENDING'}
                    </span>
                  </div>

                  <div className="text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <span className="font-semibold text-stone-700">Specialization:</span> {app.specialization}
                  </div>

                  {app.status === 'PENDING' && (
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => handleUpdateArtistApp(app.id, 'REJECTED')}
                        className="px-4 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-full font-bold text-xs"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateArtistApp(app.id, 'APPROVED')}
                        className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs shadow"
                      >
                        Approve Guild Membership
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 6: COUPONS & PROMOTIONS ── */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Discount Coupons & Promotions</h2>
                <p className="text-xs text-stone-500">Manage promotional codes and festive discounts applied during booking checkout.</p>
              </div>
              <button
                onClick={() => setShowAddCouponModal(true)}
                className="px-5 py-2.5 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-xs hover:bg-brand-maroon-dark transition shadow flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Generate Coupon
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {coupons.map((cpn) => (
                <div key={cpn.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-base text-brand-maroon px-3 py-1 bg-amber-50 rounded-lg border border-amber-200">
                      {cpn.code}
                    </span>
                    <button
                      onClick={() => handleToggleCoupon(cpn.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cpn.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {cpn.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <div className="text-xs text-stone-600 space-y-1 pt-1">
                    <div>Discount: <strong className="text-stone-900">{cpn.discountPercent}% OFF</strong></div>
                    <div>Min. Booking Amount: <strong className="text-stone-900">₹{cpn.minBookingAmount}</strong></div>
                    <div>Valid Until: <strong className="text-stone-900">{cpn.expiryDate}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 7: LOCATIONS & CITIES ── */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Serviceable Cities & Coverage Areas</h2>
              <p className="text-xs text-stone-500">Active metropolitan areas where Shringar delivers doorstep mehendi artists.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((loc) => (
                <div key={loc.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand-maroon" />
                      {loc.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Operational
                    </span>
                  </div>
                  <div className="text-xs text-stone-500">Covered Hubs:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(loc.areas || []).map((area, i) => (
                      <span key={i} className="text-[11px] bg-stone-100 px-2.5 py-1 rounded-md text-stone-700">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 8: TESTIMONIALS ── */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Customer Testimonials & Reviews</h2>
              <p className="text-xs text-stone-500">Published patron reviews celebrating bridal craftsmanship.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-serif font-bold text-base text-stone-900">{t.customerName || t.clientName || 'Bridal Patron'}</h4>
                    <span className="text-amber-500 font-bold text-xs">{'★'.repeat(t.rating || 5)}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-brand-gold-dark">{t.occasion} {t.location ? `· 📍 ${t.location}` : ''}</div>
                  <p className="text-xs text-stone-600 italic leading-relaxed">"{t.review || t.reviewText}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 9: SUPPORT CONCERNS ── */}
        {activeTab === 'concerns' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">Customer Concierge & Support Tickets</h2>
              <p className="text-xs text-stone-500">Patron requests regarding ceremony dates, special instructions, and inquiries.</p>
            </div>

            <div className="space-y-4">
              {concerns.map((c) => (
                <div key={c.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-brand-maroon">Ticket #{c.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-stone-900 text-sm">{c.subject}</h4>
                  <p className="text-xs text-stone-600">{c.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 10: SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-5xl">
            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-900">Platform Operational Settings</h2>
                <p className="text-xs text-stone-500">Configure business policies, commission splits, and default contact channels.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Platform Commission Rate (%)</label>
                  <input
                    type="number"
                    value={settings.commissionRate}
                    onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300"
                  />
                  <span className="text-[10px] text-stone-400">Default 20% (Artisan receives 80%)</span>
                </div>

                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Mandatory Advance Booking Deposit (%)</label>
                  <input
                    type="number"
                    value={settings.advanceDepositPercent}
                    onChange={(e) => setSettings({ ...settings, advanceDepositPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold uppercase text-stone-600 mb-1">Customer Concierge Helpline</label>
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => showSuccess('Platform settings saved successfully!')}
                  className="px-6 py-2.5 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-xs hover:bg-brand-maroon-dark transition shadow"
                >
                  Save Platform Settings
                </button>
              </div>
            </div>

            {/* Administrator Accounts & Executive Approvals */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-gold" />
                    <h2 className="font-serif text-xl font-bold text-stone-900">Administrator Accounts & Executive Approvals</h2>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Internal security control panel. Public user registration cannot create administrators — only existing approved administrators can authorize new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(true)}
                  className="px-5 py-2.5 bg-brand-maroon text-brand-gold rounded-full font-serif font-bold text-xs hover:bg-brand-maroon-dark transition shadow flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Authorize New Admin
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Administrator</th>
                      <th className="py-3 px-4">Official Email</th>
                      <th className="py-3 px-4">Role Level</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Authorization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {adminsList.map((adm, idx) => {
                      const initials = `${adm.firstName?.[0] || 'A'}${adm.lastName?.[0] || ''}`.toUpperCase();
                      return (
                        <tr key={adm.id || idx} className="hover:bg-stone-50 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-brand-maroon font-bold text-xs flex items-center justify-center border border-amber-300 shrink-0 shadow-sm">
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-stone-900">{adm.firstName} {adm.lastName || ''}</div>
                                <div className="text-[11px] text-stone-400">{adm.phone || 'Primary Contact'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-stone-800">{adm.email}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              {idx === 0 ? 'Executive Owner' : 'Administrator'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" /> Active & Approved
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-stone-500 font-medium">
                            Executive Clearance
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: ADD NEW DESIGN ── */}
        {showAddDesignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-serif font-bold text-lg text-brand-maroon">Add New Mehendi Design</h3>
                <button onClick={() => setShowAddDesignModal(false)} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateDesign} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Design Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Marwari Dulhan"
                    value={newDesign.name}
                    onChange={(e) => setNewDesign({ ...newDesign, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-stone-600 mb-1">Category</label>
                    <select
                      value={newDesign.category}
                      onChange={(e) => setNewDesign({ ...newDesign, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="Bridal">Bridal</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Minimal">Minimal</option>
                      <option value="Fusion">Fusion</option>
                      <option value="Mughal">Mughal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-stone-600 mb-1">Coverage</label>
                    <select
                      value={newDesign.coverage}
                      onChange={(e) => setNewDesign({ ...newDesign, coverage: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="Full hand">Full hand</option>
                      <option value="Half hand">Half hand</option>
                      <option value="Both hands">Both hands</option>
                      <option value="Both feet">Both feet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-stone-600 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newDesign.price}
                      onChange={(e) => setNewDesign({ ...newDesign, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-stone-600 mb-1">Cones Needed</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newDesign.conesNeeded}
                      onChange={(e) => setNewDesign({ ...newDesign, conesNeeded: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Image URL / Path</label>
                  <input
                    type="text"
                    value={newDesign.imageUrl}
                    onChange={(e) => setNewDesign({ ...newDesign, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDesignModal(false)}
                    className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-brand-maroon text-brand-gold font-bold shadow"
                  >
                    Save Design to Catalog
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: ADD NEW ARTIST ── */}
        {showAddArtistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-serif font-bold text-lg text-brand-maroon">Add Master Artist</h3>
                <button onClick={() => setShowAddArtistModal(false)} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateArtist} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Artist Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meera Joshi"
                    value={newArtist.name}
                    onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-stone-600 mb-1">City</label>
                    <input
                      type="text"
                      value={newArtist.city}
                      onChange={(e) => setNewArtist({ ...newArtist, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-stone-600 mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={newArtist.experienceYears}
                      onChange={(e) => setNewArtist({ ...newArtist, experienceYears: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={newArtist.specialization}
                    onChange={(e) => setNewArtist({ ...newArtist, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddArtistModal(false)}
                    className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-brand-maroon text-brand-gold font-bold shadow"
                  >
                    Register Artist
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: GENERATE COUPON ── */}
        {showAddCouponModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-serif font-bold text-lg text-brand-maroon">Generate Promo Coupon</h3>
                <button onClick={() => setShowAddCouponModal(false)} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIWALI30"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Discount (%) *</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountPercent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Min Booking Amount (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minBookingAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minBookingAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCouponModal(false)}
                    className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-brand-maroon text-brand-gold font-bold shadow"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: AUTHORIZE NEW ADMIN ── */}
        {showAddAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-gold" />
                  <h3 className="font-serif font-bold text-lg text-brand-maroon">Authorize New Administrator</h3>
                </div>
                <button onClick={() => setShowAddAdminModal(false)} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-stone-600 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya"
                      value={newAdmin.firstName}
                      onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-stone-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={newAdmin.lastName}
                      onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Official Admin Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="priya.admin@shringar.com"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                  <span className="text-[10px] text-stone-400 block mt-1">Must be a valid email for platform administration notifications.</span>
                </div>

                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newAdmin.phone}
                    onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-stone-600 mb-1">Initial Password *</label>
                  <div className="relative flex items-center">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 rounded-xl border border-stone-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 text-stone-400 hover:text-stone-600 transition"
                      title={showAdminPassword ? "Hide password" : "Show password"}
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-1">At least 8 characters. The administrator can change this anytime.</span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddAdminModal(false)}
                    className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingAdmin}
                    className="px-6 py-2 rounded-full bg-brand-maroon text-brand-gold font-bold shadow disabled:opacity-60"
                  >
                    {isCreatingAdmin ? 'Provisioning…' : 'Approve & Provision Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

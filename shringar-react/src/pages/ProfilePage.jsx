import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, Mail, Phone, MapPin, Shield, Calendar, 
  ShoppingBag, LogOut, Heart, Clock, CheckCircle2,
  Sparkles, Search, ArrowRight, AlertCircle, RefreshCw
} from 'lucide-react';
import { BookingsAPI } from '../services/api';

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const getAddressKey = (uid) => `shringar_saved_address_${uid || 'guest'}`;
  const getCityKey = (uid) => `shringar_saved_city_${uid || 'guest'}`;
  const getNotesKey = (uid) => `shringar_saved_notes_${uid || 'guest'}`;

  const [address, setAddress] = useState(() => {
    return localStorage.getItem(getAddressKey(user?.id)) || '';
  });
  const [city, setCity] = useState(() => {
    return localStorage.getItem(getCityKey(user?.id)) || 'Delhi NCR';
  });
  const [savedNotes, setSavedNotes] = useState(() => {
    return localStorage.getItem(getNotesKey(user?.id)) || 'Prefer store-available standard henna cone.';
  });
  const [isEditing, setIsEditing] = useState(false);

  // Live Bookings State
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Guest booking reference lookup state
  const [lookupRef, setLookupRef] = useState('');
  const [lookedUpBooking, setLookedUpBooking] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Format currency helper
  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Load account-specific profile info when user changes
  useEffect(() => {
    if (user?.id) {
      setAddress(localStorage.getItem(getAddressKey(user.id)) || '');
      setCity(localStorage.getItem(getCityKey(user.id)) || 'Delhi NCR');
      setSavedNotes(localStorage.getItem(getNotesKey(user.id)) || 'Prefer store-available standard henna cone.');
    }
  }, [user?.id]);

  // Fetch user bookings on mount or when auth state changes
  useEffect(() => {
    async function fetchBookings() {
      if (!isAuthenticated) return;
      setLoadingBookings(true);
      try {
        const data = await BookingsAPI.getMyBookings();
        if (Array.isArray(data)) {
          setBookings(data);
        }
      } catch (err) {
        console.warn('Error fetching patron bookings:', err);
      } finally {
        setLoadingBookings(false);
      }
    }
    fetchBookings();
  }, [isAuthenticated]);

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    if (!lookupRef.trim()) return;
    setLookupLoading(true);
    setLookedUpBooking(null);
    try {
      const clean = lookupRef.trim().toUpperCase();
      const res = await BookingsAPI.getByReference(clean);
      if (res) {
        setLookedUpBooking(res);
        showSuccess('Booking details located successfully!');
      } else {
        showError('Booking reference not found. Please verify the code.');
      }
    } catch (err) {
      showError('Unable to locate booking with reference ' + lookupRef.trim());
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    localStorage.setItem(getAddressKey(user?.id), address);
    localStorage.setItem(getCityKey(user?.id), city);
    localStorage.setItem(getNotesKey(user?.id), savedNotes);
    setIsEditing(false);
    showSuccess('Profile and preferences updated successfully!');
  };

  const handleLogout = () => {
    logout();
    showSuccess('You have been safely signed out. See you soon!');
    navigate('/');
  };

  // Render a single booking card
  const renderBookingCard = (b) => {
    const isConfirmed = b.status === 'CONFIRMED';
    const isCompleted = b.status === 'COMPLETED';
    const isCancelled = b.status === 'CANCELLED';

    return (
      <div
        key={b.id || b.bookingReference}
        className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 sm:p-6 space-y-4 hover:shadow-md transition"
      >
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-brand-maroon">
                Booking #SHR-{b.id || b.bookingReference}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold border border-stone-200">
                {b.bookingReference}
              </span>
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Booked on {new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isConfirmed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : isCompleted
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : isCancelled
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-amber-50 text-amber-800 border border-amber-300'
            }`}
          >
            {isConfirmed
              ? '✨ Confirmed & Verified'
              : isCompleted
              ? '✓ Ceremony Completed'
              : isCancelled
              ? '✕ Cancelled'
              : '⏳ Awaiting Royal Verification'}
          </span>
        </div>

        {/* Schedule & Venue Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-700 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#B58E34] shrink-0" />
            <div>
              <p className="text-[10px] text-stone-500 uppercase font-semibold">Appointment Date</p>
              <strong className="text-stone-800">{b.appointmentDate || 'Upcoming'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B58E34] shrink-0" />
            <div>
              <p className="text-[10px] text-stone-500 uppercase font-semibold">Preferred Slot</p>
              <strong className="text-stone-800">{b.preferredTime ? `${b.preferredTime} Slot` : (b.timeSlot || 'Scheduled')}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#B58E34] shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-stone-500 uppercase font-semibold">Venue City & PIN</p>
              <strong className="text-stone-800 truncate block">
                {b.city || 'Delhi NCR'} {b.pincode ? `(${b.pincode})` : ''}
              </strong>
            </div>
          </div>
        </div>

        {/* Venue Address */}
        {b.fullAddress && (
          <div className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200/50">
            <span className="font-semibold text-stone-700">Full Venue Address: </span>
            {b.fullAddress} {b.pincode ? `— PIN: ${b.pincode}` : ''}
          </div>
        )}

        {/* Selected Designs List */}
        {b.items && b.items.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] uppercase tracking-wider font-bold text-stone-500">Reserved Designs</p>
            <div className="space-y-1">
              {b.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-none">
                  <span className="text-stone-800 flex items-center gap-1.5">
                    <span>{item.emojiIcon || '🤲'}</span>
                    <strong className="font-serif">{item.designName}</strong>
                    <span className="text-stone-500 text-[11px]">× {item.quantity || 1}</span>
                  </span>
                  <span className="font-bold text-[#4A2511]">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing & Advance Summary Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-stone-200/70 text-xs gap-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <div>
              <span className="text-stone-500 text-[11px]">Grand Total: </span>
              <strong className="text-brand-maroon font-bold text-sm block sm:inline">
                {formatPrice(b.grandTotal ?? b.totalAmount)}
              </strong>
            </div>

            {b.advanceAmount && (
              <div className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                Advance Paid: <strong>{formatPrice(b.advanceAmount)}</strong>
              </div>
            )}

            {b.balanceAmount && (
              <div className="text-[11px] text-stone-500">
                Balance at ceremony: <strong className="text-stone-700">{formatPrice(b.balanceAmount)}</strong>
              </div>
            )}

            {b.upiTransactionRef && (
              <div className="text-[11px] text-stone-600 font-mono bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                UTR: <strong>{b.upiTransactionRef}</strong>
              </div>
            )}
          </div>

          <Link
            to="/help"
            className="text-[#B58E34] hover:underline font-semibold text-xs flex items-center gap-1 shrink-0"
          >
            <span>Need Help / Reschedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  };

  // If user is not authenticated: Show Sign In + Instant Guest Booking Lookup
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8 bg-stone-50/70">
        <div className="max-w-xl mx-auto space-y-8">
          
          {/* Sign In Required Card */}
          <div className="text-center p-8 bg-white rounded-3xl shadow-md border border-[#E6DFD3] space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#4A2511]/10 text-[#4A2511] flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl text-[#4A2511] font-bold">
              Patron Profile & Booking Center
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Sign in to manage your appointments, view royal mehendi bookings, track advance payments, and update venue preferences.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3 bg-[#4A2511] text-[#FDFBF7] rounded-full font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#34180A] shadow transition"
              >
                Sign In to Your Account
              </Link>
              <Link
                to="/designs"
                className="w-full sm:w-auto px-6 py-3 border border-[#B58E34] text-[#4A2511] rounded-full font-serif font-semibold text-xs uppercase tracking-wider hover:bg-[#F3EFE6] transition"
              >
                Browse Designs
              </Link>
            </div>
          </div>

          {/* Quick Booking Lookup by Reference (for Guests & Instant Check) */}
          <div className="p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-[#E6DFD3] space-y-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-[#B58E34]" />
              <div>
                <h3 className="font-serif font-bold text-base text-[#4A2511]">
                  Lookup Booking by Reference
                </h3>
                <p className="text-stone-500 text-xs">
                  Already placed an order? Enter your Booking Reference (e.g. SHR-2026-...) to view live status.
                </p>
              </div>
            </div>

            <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={lookupRef}
                onChange={(e) => setLookupRef(e.target.value)}
                placeholder="Enter Booking Reference (e.g. SHR-...)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-xs uppercase tracking-wider font-mono focus:outline-none focus:border-[#B58E34]"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-6 py-2.5 bg-[#B58E34] hover:bg-[#967428] text-white font-bold text-xs rounded-xl transition shadow disabled:opacity-50"
              >
                {lookupLoading ? 'Checking…' : 'Track Order'}
              </button>
            </form>

            {lookedUpBooking && (
              <div className="pt-4 border-t border-stone-200">
                {renderBookingCard(lookedUpBooking)}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-maroon via-brand-maroon-dark to-brand-maroon text-brand-gold-light rounded-3xl shadow-xl p-6 sm:p-8 border border-brand-gold/30">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-gold/20 border-2 border-brand-gold flex items-center justify-center text-2xl sm:text-3xl font-serif font-bold text-brand-gold shadow-lg shrink-0">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : (user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'S')}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/20 rounded-full text-[11px] font-semibold uppercase tracking-wider text-brand-gold mb-2 border border-brand-gold/30">
                  <Shield className="w-3.5 h-3.5" />
                  {user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN' ? 'Royal Administrator' : 'Royal Patron'}
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  {user?.fullName || user?.firstName || 'Esteemed Patron'}
                </h1>
                <p className="text-brand-gold-light/80 text-xs sm:text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4 text-brand-gold" />
                  <a href={`mailto:${user?.email}`} className="hover:underline">{user?.email}</a>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') && (
                <Link
                  to="/admin/dashboard"
                  className="px-5 py-2.5 bg-brand-gold text-brand-maroon-dark font-serif font-bold text-xs sm:text-sm rounded-full hover:bg-yellow-400 transition-colors shadow-md flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Console
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-serif text-xs sm:text-sm rounded-full border border-white/20 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* ── Active Bookings & Appointments Section (Item 3 Fix) ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A2511] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#B58E34]" />
                <span>My Appointments & Bookings</span>
              </h2>
              <p className="text-stone-500 text-xs mt-0.5">
                Track your appointment status, verified advance payment, booking reference, and scheduled artists.
              </p>
            </div>

            <button
              onClick={async () => {
                setLoadingBookings(true);
                try {
                  const data = await BookingsAPI.getMyBookings();
                  if (Array.isArray(data)) setBookings(data);
                } finally {
                  setLoadingBookings(false);
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#B58E34] hover:underline font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingBookings ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {loadingBookings ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
              Retrieving your appointment portfolio…
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(renderBookingCard)}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-[#B58E34] border border-[#B58E34]/30 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#4A2511]">No Scheduled Appointments Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                You do not have any active mehendi bookings on file. Explore our handcrafted bridal and festive motifs to schedule your appointment.
              </p>
              <Link
                to="/designs"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4A2511] text-[#FDFBF7] font-bold text-xs uppercase tracking-wider shadow hover:bg-[#34180A] transition"
              >
                <span>Browse Designs Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Action Navigation Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/booking"
            className="p-4 bg-white rounded-2xl shadow-xs border border-stone-200 hover:border-[#B58E34] hover:shadow-md transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4A2511]/10 text-[#4A2511] flex items-center justify-center group-hover:bg-[#4A2511] group-hover:text-white transition">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">Book Now</p>
              <h3 className="font-serif text-sm font-bold text-[#4A2511]">New Appointment</h3>
            </div>
          </Link>

          <Link
            to="/custom-design"
            className="p-4 bg-white rounded-2xl shadow-xs border border-amber-200 hover:border-[#B58E34] hover:shadow-md transition-all flex items-center gap-3.5 group bg-amber-50/20"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#4A2511] flex items-center justify-center group-hover:bg-[#4A2511] group-hover:text-white transition">
              <Sparkles className="w-5 h-5 text-[#B58E34]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-amber-800">Commissions</p>
              <h3 className="font-serif text-sm font-bold text-[#4A2511]">Custom Design</h3>
            </div>
          </Link>

          <Link
            to="/cart"
            className="p-4 bg-white rounded-2xl shadow-xs border border-stone-200 hover:border-[#B58E34] hover:shadow-md transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4A2511]/10 text-[#4A2511] flex items-center justify-center group-hover:bg-[#4A2511] group-hover:text-white transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">Cart Portfolio</p>
              <h3 className="font-serif text-sm font-bold text-[#4A2511]">View Cart</h3>
            </div>
          </Link>

          <Link
            to="/become-artist"
            className="p-4 bg-white rounded-2xl shadow-xs border border-stone-200 hover:border-[#B58E34] hover:shadow-md transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4A2511]/10 text-[#4A2511] flex items-center justify-center group-hover:bg-[#4A2511] group-hover:text-white transition">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-500">Guild</p>
              <h3 className="font-serif text-sm font-bold text-[#4A2511]">Become Artist</h3>
            </div>
          </Link>
        </div>

        {/* Saved Venue & Preferences */}
        <div className="bg-white rounded-3xl shadow-xs border border-stone-200 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A2511]">Venue & Delivery Preferences</h2>
              <p className="text-stone-500 text-xs mt-0.5">Default venue address for home artist appointments</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-serif font-bold text-[#B58E34] hover:underline underline-offset-4"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Preferences'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveAddress} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                  Full Street Address / Venue
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B58E34]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B58E34]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
                  Bridal & Henna Preferences (Notes)
                </label>
                <textarea
                  rows="3"
                  value={savedNotes}
                  onChange={(e) => setSavedNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B58E34]"
                  placeholder="Store brand preference, skin sensitivity, etc."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4A2511] text-[#FDFBF7] rounded-full font-serif font-bold text-xs hover:bg-[#34180A] shadow transition-all"
                >
                  Save Address & Notes
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-2 text-[#4A2511] font-serif font-bold mb-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-[#B58E34]" />
                  Primary Venue
                </div>
                <p className="text-stone-700 text-xs leading-relaxed">{address || 'No venue address saved yet.'}</p>
                <p className="text-stone-500 text-[11px] mt-1 font-semibold">{city}</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-2 text-[#4A2511] font-serif font-bold mb-1.5 text-sm">
                  <Heart className="w-4 h-4 text-[#B58E34]" />
                  Artist Special Requests
                </div>
                <p className="text-stone-700 text-xs leading-relaxed">
                  {savedNotes || 'No special requests specified.'}
                </p>
                <p className="text-stone-400 text-[11px] mt-1 italic">Applied to future appointments</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

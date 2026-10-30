import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, Mail, Phone, MapPin, Shield, Calendar, 
  ShoppingBag, LogOut, Heart, Clock, CheckCircle2,
  Sparkles, Search, ArrowRight, AlertCircle, RefreshCw, X, Lock
} from 'lucide-react';
import { BookingsAPI, ArtistsAPI } from '../services/api';

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

  // Artist Profile & Availability State (Task 9)
  const [artistProfile, setArtistProfile] = useState(null);
  const [loadingArtist, setLoadingArtist] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  // Live Bookings State
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Cancellation & Refund Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelUpiId, setCancelUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [cancelling, setCancelling] = useState(false);

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

  // Fetch user bookings
  const fetchBookings = async () => {
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
  };

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated]);

  // Fetch linked Artist Profile if user is an artist (Task 9)
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingArtist(true);
    ArtistsAPI.getMyProfile()
      .then((res) => {
        if (res && res.id) setArtistProfile(res);
      })
      .catch(() => {
        setArtistProfile(null);
      })
      .finally(() => setLoadingArtist(false));
  }, [isAuthenticated]);

  const handleToggleArtistAvailability = async (targetState) => {
    if (!artistProfile) return;
    setTogglingAvailability(true);
    try {
      const updated = await ArtistsAPI.toggleMyAvailability(targetState);
      setArtistProfile(updated);
      showSuccess(
        targetState
          ? 'You are now marked Available! 15-day commitment locked for booking dispatch.'
          : 'You are now marked Not Available.'
      );
    } catch (err) {
      showError(err.message || 'Could not update availability.');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancelModalBooking) return;
    setUpiError('');

    // If advance was paid or booking is eligible for refund, require valid UPI ID
    const advancePaid = Number(cancelModalBooking.advanceAmount || 0) > 0 || cancelModalBooking.isAdvancePaid;
    if (advancePaid) {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!cancelUpiId.trim() || !upiRegex.test(cancelUpiId.trim())) {
        setUpiError('Please enter a valid UPI ID (e.g. 9876543210@upi or yourname@okhdfcbank) to receive your refund.');
        return;
      }
    }

    setCancelling(true);
    try {
      await BookingsAPI.cancel(cancelModalBooking.id, cancelReason, cancelUpiId.trim());
      showSuccess(
        cancelModalBooking.canCancelFree
          ? 'Booking cancelled! 100% full advance refund has been initiated to your UPI ID.'
          : 'Booking cancelled. Refund request sent to admin with your UPI ID for review.'
      );
      setCancelModalBooking(null);
      setCancelReason('');
      setCancelUpiId('');
      setUpiError('');
      fetchBookings();
      if (lookedUpBooking && lookedUpBooking.id === cancelModalBooking.id) {
        handleLookupBooking(lookedUpBooking.bookingReference);
      }
    } catch (err) {
      showError(err.message || 'Could not cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

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

        {/* Dedicated Refund Process & Status Card for Cancelled Bookings */}
        {isCancelled && (
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">💳</span>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#4A2511]">Refund Process & Settlement Status</h4>
                  <p className="text-[11px] text-stone-600">
                    Cancelled by {b.cancelledBy === 'ADMIN' ? 'Shringar Administration' : 'You (Customer)'}
                    {b.cancelledAt && ` on ${new Date(b.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {b.refundStatus === 'REFUNDED' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Refund Completed ({formatPrice(b.refundAmount || b.advanceAmount)})</span>
                  </span>
                ) : b.refundStatus === 'INITIATED' ? (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>Refund Initiated ({formatPrice(b.refundAmount || b.advanceAmount)})</span>
                  </span>
                ) : b.refundStatus === 'REQUESTED' ? (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Refund Under Review ({formatPrice(b.refundAmount || b.advanceAmount)})</span>
                  </span>
                ) : b.refundStatus === 'REJECTED' ? (
                  <span className="px-3 py-1 rounded-full bg-stone-200 text-stone-700 font-bold text-xs">
                    ✕ Refund Declined
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs">
                    No Advance Charged
                  </span>
                )}
              </div>
            </div>

            {/* Refund Process Progress Steps */}
            {(b.refundStatus === 'INITIATED' || b.refundStatus === 'REFUNDED' || b.refundStatus === 'REQUESTED') && (
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs pt-1">
                <div className="p-2 rounded-lg bg-white border border-emerald-200 text-emerald-800 font-semibold">
                  ✓ Cancellation Confirmed
                </div>
                <div className={`p-2 rounded-lg border font-semibold ${
                  b.refundStatus === 'REFUNDED' || b.refundStatus === 'INITIATED'
                    ? 'bg-white border-blue-200 text-blue-800'
                    : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}>
                  {b.refundStatus === 'REQUESTED' ? '⏳ Admin Review' : '✓ Refund Processed'}
                </div>
                <div className={`p-2 rounded-lg border font-semibold ${
                  b.refundStatus === 'REFUNDED'
                    ? 'bg-white border-emerald-200 text-emerald-800'
                    : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}>
                  {b.refundStatus === 'REFUNDED' ? '✓ Credited' : '⏳ Estimated 3-5 Days'}
                </div>
              </div>
            )}

            {/* Refund Info Notes */}
            <div className="text-xs text-stone-700 bg-white/80 p-3 rounded-lg border border-rose-200/40 space-y-1">
              {b.customerUpiId && (
                <p><span className="text-stone-500 font-medium">Refund Destination (UPI):</span> <code className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{b.customerUpiId}</code></p>
              )}
              {b.cancellationReason && (
                <p><span className="text-stone-500 font-medium">Cancellation Reason:</span> <em>"{b.cancellationReason}"</em></p>
              )}
              {b.refundId && (
                <p><span className="text-stone-500 font-medium">Refund Reference ID:</span> <code className="font-mono font-bold text-[#4A2511]">{b.refundId}</code></p>
              )}
              {b.refundNotes && (
                <p><span className="text-stone-500 font-medium">Administrative Note:</span> {b.refundNotes}</p>
              )}
              <p className="text-[11px] text-stone-500 pt-1">
                {b.cancelledBy === 'ADMIN'
                  ? '🛡️ This cancellation was initiated by Shringar. Full 100% advance refund is guaranteed and returns to your original payment mode.'
                  : b.canCancelFree
                  ? '🛡️ Cancelled within free cancellation policy. Full advance refund has been initiated to your original payment account.'
                  : 'Notice: If cancelled outside the free-window, your refund request is submitted for manual policy review by our administration.'}
              </p>
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

          <div className="flex items-center gap-3">
            {!isCancelled && !isCompleted && (
              <button
                type="button"
                onClick={() => setCancelModalBooking(b)}
                className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition cursor-pointer"
              >
                Cancel Booking
              </button>
            )}

            <Link
              to="/help"
              className="text-[#B58E34] hover:underline font-semibold text-xs flex items-center gap-1 shrink-0"
            >
              <span>Need Help / Reschedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
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
                  {user?.email ? (
                    <>
                      <Mail className="w-4 h-4 text-brand-gold" />
                      <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 text-brand-gold" />
                      <a href={`tel:${user?.phone || ''}`} className="hover:underline">{user?.phone || 'Verified Patron'}</a>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') && (
                <a
                  href="/admin-portal/index.html"
                  className="px-5 py-2.5 bg-brand-gold text-brand-maroon-dark font-serif font-bold text-xs sm:text-sm rounded-full hover:bg-yellow-400 transition-colors shadow-md flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Console
                </a>
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

        {/* ── ARTIST AVAILABILITY CARD (Task 9) ── */}
        {artistProfile && (
          <div className="rounded-3xl border-2 border-brand-gold/60 bg-gradient-to-r from-[#FDFBF7] via-amber-50/50 to-[#FDFBF7] p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6DFD3] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-gold-dark" />
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#4A2511]">
                    Henna Artist Service & Dispatch Availability
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B58E34]/20 text-[#4A2511] border border-[#B58E34]/30">
                    {artistProfile.city}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Manage your live booking availability. When set to <strong>Available</strong>, you commit to accepting bridal & event bookings in your operating city for a <strong>15-day commitment period</strong>.
                </p>
              </div>

              {/* Live Availability Badge */}
              <div className="shrink-0">
                {artistProfile.isAvailable ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>Currently Available</span>
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span>Not Available</span>
                  </span>
                )}
              </div>
            </div>

            {/* Lock info & Toggle Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="space-y-1">
                {artistProfile.isAvailabilityLocked && artistProfile.availabilityLockedUntil ? (
                  <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold bg-amber-100/70 border border-amber-300/80 px-3 py-2 rounded-xl">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      🔒 15-Day Commitment Active: Availability locked until{' '}
                      <strong>
                        {new Date(artistProfile.availabilityLockedUntil).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {artistProfile.isAvailable
                        ? 'Your profile is visible to customers in location searches.'
                        : 'Your profile is currently hidden from booking location searches.'}
                    </span>
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  disabled={togglingAvailability || (artistProfile.isAvailabilityLocked && artistProfile.isAvailable)}
                  onClick={() => handleToggleArtistAvailability(!artistProfile.isAvailable)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                    artistProfile.isAvailable
                      ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow'
                  }`}
                >
                  {togglingAvailability ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : artistProfile.isAvailable ? (
                    <>
                      <span>Mark Not Available</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Set Available (15-Day Lock)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-brand-maroon">
                Cancel Booking #{cancelModalBooking.id || cancelModalBooking.bookingReference}
              </h3>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Eligibility Note */}
            <div className={`p-3.5 rounded-xl text-xs space-y-1.5 border ${
              cancelModalBooking.canCancelFree
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {cancelModalBooking.canCancelFree ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Free Cancellation Active — 100% Advance Refund</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Free Window Expired — Refund Request Required</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed">
                {cancelModalBooking.canCancelFree
                  ? `You are within the free cancellation window! Full advance payment of ${formatPrice(cancelModalBooking.advanceAmount)} will be refunded to your original payment method.`
                  : `This cancellation is within 48 hours of the appointment. A refund request will be automatically dispatched to our administrative team for review.`}
              </p>
            </div>

            {/* UPI ID Input for Refund Deposit */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 block flex items-center justify-between">
                <span>UPI ID to Receive Refund *</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Required for Refund</span>
              </label>
              <input
                type="text"
                value={cancelUpiId}
                onChange={(e) => { setCancelUpiId(e.target.value); setUpiError(''); }}
                placeholder="e.g. 9876543210@upi or yourname@okhdfcbank"
                className={`w-full text-xs p-3 rounded-xl border ${upiError ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500' : 'border-stone-300'} focus:outline-none focus:border-[#B58E34] focus:ring-1 focus:ring-[#B58E34]`}
              />
              {upiError ? (
                <p className="text-[11px] text-rose-600 font-medium">{upiError}</p>
              ) : (
                <p className="text-[10px] text-stone-500">Your advance refund will be disbursed directly to this UPI handle.</p>
              )}
            </div>

            {/* Reason Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 block">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Change of plans, date conflict, medical reasons..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#B58E34] focus:ring-1 focus:ring-[#B58E34]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancellation}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                {cancelling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Cancellation...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, Package, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { BookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelUpiId, setCancelUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const data = await BookingsAPI.getMyBookings();
      if (Array.isArray(data)) setBookings(data);
    } catch (err) {
      console.warn('My bookings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [isAuthenticated]);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
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
      loadBookings();
    } catch (err) {
      showError(err.message || 'Could not cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-cinzel text-xl font-bold text-brand-dark">Sign In Required</h2>
        <p className="text-xs text-stone-500">Please sign in to view your past and upcoming mehendi appointments.</p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-full bg-brand-maroon text-white text-xs font-bold uppercase tracking-wider shadow"
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="border-b pb-4">
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-brand-dark">
          Your Appointments & Orders
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Track upcoming mehendi sessions and view past bookings.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone-500">Loading your bookings…</div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3">
                <div>
                  <span className="text-xs font-bold text-brand-maroon">
                    Booking #SHR-{b.id}
                  </span>
                  <div className="text-[11px] text-stone-500">
                    Booked on {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  b.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : b.status === 'COMPLETED'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : b.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {b.status === 'PENDING' ? '⏳ Awaiting UPI Verification' : (b.status || 'PENDING')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-gold-dark" />
                  <span>{b.appointmentDate || b.eventDate || 'Scheduled Date'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-gold-dark" />
                  <span>{b.preferredTime ? `${b.preferredTime} Slot` : (b.timeSlot || 'Time Slot')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-gold-dark" />
                  <span className="truncate">{b.city || 'Delhi NCR'}</span>
                </div>
              </div>

              {/* Dedicated Refund Process & Status Card for Cancelled Bookings */}
              {b.status === 'CANCELLED' && (
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
                          ✕ Refund Not Approved
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t text-xs gap-2">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-stone-500">Grand Total: </span>
                    <strong className="text-brand-maroon font-bold text-sm">
                      {formatPrice(b.grandTotal ?? b.totalAmount)}
                    </strong>
                  </div>
                  {b.advanceAmount && (
                    <div className="text-[11px] text-stone-500">
                      Advance: <span className="font-semibold text-stone-700">{formatPrice(b.advanceAmount)}</span>
                    </div>
                  )}
                  {b.upiTransactionRef && (
                    <div className="text-[11px] text-stone-500 font-mono">
                      UTR: <span className="font-semibold text-stone-700">{b.upiTransactionRef}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
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
                    className="text-brand-maroon hover:underline font-semibold"
                  >
                    Need Help / Reschedule?
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-4">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-800">No Ceremonies Booked Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Browse our royal mehendi collections and book your customized appointment in minutes.
          </p>
          <Link
            to="/designs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-maroon text-white text-xs font-bold shadow hover:bg-brand-maroon-dark transition"
          >
            <span>Explore Designs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

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
  );
}

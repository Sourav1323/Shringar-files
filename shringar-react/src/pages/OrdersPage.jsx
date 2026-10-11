import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, Package, ArrowRight } from 'lucide-react';
import { BookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
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
    }
    loadBookings();
  }, [isAuthenticated]);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
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
                <Link
                  to="/help"
                  className="text-brand-maroon hover:underline font-semibold"
                >
                  Need Help / Reschedule?
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-4">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-cinzel font-bold text-base text-brand-dark">No Appointments Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You haven't scheduled any mehendi sessions yet. Explore our royal Rajasthani & Arabic bridal designs.
          </p>
          <Link
            to="/designs"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-maroon text-white font-bold text-xs uppercase tracking-wider shadow"
          >
            <span>Browse Designs Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

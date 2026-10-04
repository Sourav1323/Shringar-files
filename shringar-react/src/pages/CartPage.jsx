import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Sparkles, Clock, Tag, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    coupon,
    applyCouponCode,
    removeCoupon,
    subtotal,
    discountAmount,
    finalTotal,
    totalCones,
    totalDurationHours,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-brand-gold-dark flex items-center justify-center mx-auto text-3xl border border-amber-200">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-cinzel text-2xl font-bold text-brand-dark">
          Your Booking Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
          Select from our handpicked Rajasthani, Arabic, or modern minimal mehendi designs to build your wedding appointment package.
        </p>
        <Link
          to="/designs"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-maroon hover:bg-brand-maroon-dark text-white font-bold text-xs uppercase tracking-wider shadow-lg transition"
        >
          <span>Explore Mehendi Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-brand-dark">
            Your Booking Package
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Review your chosen designs and henna cone requirements before scheduling.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-rose-600 transition"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Cart Items List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-brand-gold/40 transition"
            >
              <img
                src={item.imageUrl || '/images/rajasthani-bridal.jpg'}
                alt={item.name}
                className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-xl border border-stone-200"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-maroon/10 text-brand-maroon">
                    {item.category || 'Bridal'}
                  </span>
                  <span className="text-xs text-stone-400">• {item.coverage}</span>
                </div>

                <Link
                  to={`/designs/${item.id}`}
                  className="font-cinzel font-bold text-base text-brand-dark hover:text-brand-maroon truncate block"
                >
                  {item.name}
                </Link>

                <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-gold-dark" />
                    {item.durationMinHours || 2} - {item.durationMaxHours || 3} hrs
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
                    {item.conesNeeded || 2} cones
                  </span>
                </div>

                <div className="text-base font-bold text-brand-maroon pt-1">
                  {formatPrice(item.price)}
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Remove Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add More Designs Banner */}
          <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center">
            <Link
              to="/designs"
              className="text-xs font-bold text-brand-maroon hover:underline flex items-center justify-center gap-1.5"
            >
              <span>+ Add More Designs for Family & Bridesmaids</span>
            </Link>
          </div>
        </div>

        {/* Right: Summary & Checkout (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xl space-y-6">
            
            <h3 className="font-cinzel font-bold text-lg text-brand-dark pb-3 border-b border-stone-100">
              Appointment Summary
            </h3>

            {/* Cones & Duration Metric */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
                <div className="text-stone-500 font-medium">Organic Cones</div>
                <div className="text-base font-bold text-brand-maroon mt-0.5">
                  {totalCones} Cones
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
                <div className="text-stone-500 font-medium">Est. Duration</div>
                <div className="text-base font-bold text-brand-maroon mt-0.5">
                  ~{totalDurationHours} Hours
                </div>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-gold-dark" />
                <span>Promo Coupon</span>
              </label>

              {coupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs">
                  <div>
                    <span className="font-bold text-emerald-800">{coupon.code}</span>
                    <span className="text-emerald-700 ml-1">
                      (-{formatPrice(discountAmount)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter SHRINGAR20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-brand-gold"
                  />
                  <button
                    onClick={() => {
                      applyCouponCode(couponInput);
                      setCouponInput('');
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-maroon text-white text-xs font-bold hover:bg-brand-maroon-dark transition"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 pt-4 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Designs Subtotal</span>
                <span className="font-semibold text-stone-800">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Organic Henna Cones & Sealant</span>
                <span className="text-emerald-700 font-semibold">Free (Included)</span>
              </div>
              <div className="flex justify-between">
                <span>Artist Travel & Kit Sanitization</span>
                <span className="text-emerald-700 font-semibold">Free</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-stone-200 text-base font-bold text-brand-dark">
                <span>Final Payable</span>
                <span className="text-brand-maroon text-xl">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Proceed to Booking */}
            <button
              onClick={() => navigate('/booking')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-gold via-amber-400 to-brand-gold-dark text-brand-dark font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-105 transition flex items-center justify-center gap-2"
            >
              <span>Schedule Mehendi Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free reschedule up to 24 hrs before event</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

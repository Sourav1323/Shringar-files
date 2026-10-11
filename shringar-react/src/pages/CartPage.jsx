import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, ShoppingBag, ArrowRight, Sparkles, Clock, Tag, X, 
  ShieldCheck, Plus, Minus, Check, Heart, UserCheck, CheckCircle2,
  Calendar, Award, Sparkle, RefreshCw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { DesignsAPI } from '../services/api';

export default function CartPage() {
  const {
    cartItems,
    addToCart,
    updateQuantity,
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
    itemCount,
  } = useCart();

  const { openFavorites, favoriteCount } = useFavorites();
  const [couponInput, setCouponInput] = useState('');
  const [recommendedDesigns, setRecommendedDesigns] = useState([]);
  const navigate = useNavigate();

  // Load complementary bridesmaid/family designs
  useEffect(() => {
    async function loadComplementary() {
      try {
        const data = await DesignsAPI.getAll();
        if (Array.isArray(data)) {
          // Find designs not currently in cart
          const available = data.filter((d) => !cartItems.some((ci) => ci.id === d.id));
          setRecommendedDesigns(available.slice(0, 3));
        }
      } catch (err) {
        // Fallback default suggestions
        setRecommendedDesigns([
          {
            id: 2,
            name: 'Floral Minimal',
            category: 'Minimal',
            coverage: 'Half hand',
            price: 800,
            imageUrl: '/images/floral-minimal.jpg',
            conesNeeded: 1,
            durationMinHours: 1,
            durationMaxHours: 2,
          },
          {
            id: 4,
            name: 'Royal Dulha-Dulhan Bridal',
            category: 'Bridal',
            coverage: 'Full hand',
            price: 2800,
            imageUrl: '/images/peacock-feet.png',
            conesNeeded: 2.5,
            durationMinHours: 3.5,
            durationMaxHours: 4.5,
          },
        ]);
      }
    }
    loadComplementary();
  }, [cartItems]);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const advancePayable = Math.round(finalTotal * 0.2);
  const remainingPayable = Math.max(0, finalTotal - advancePayable);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-100 to-amber-50 text-brand-gold-dark flex items-center justify-center mx-auto text-4xl border-2 border-brand-gold/40 shadow-inner">
          <ShoppingBag className="w-12 h-12 text-brand-gold-dark" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif-luxury text-3xl font-bold text-brand-dark">
            Your Booking Package is Empty
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            Select from our royal Rajasthani bridal collections, elegant Arabic trails, or modern minimalist cuffs to build your celebration package.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/designs"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-brand-maroon to-brand-maroon-dark hover:brightness-110 text-white font-bold text-xs uppercase tracking-widest shadow-xl transition"
          >
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span>Explore Mehendi Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={openFavorites}
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full border-2 border-amber-300/80 hover:border-brand-maroon/60 bg-amber-50/50 hover:bg-amber-100/50 text-brand-dark font-bold text-xs uppercase tracking-widest transition shadow-sm"
          >
            <Heart className="w-4 h-4 text-brand-maroon fill-brand-maroon/20" />
            <span>View Saved Favorites ({favoriteCount})</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* ── Page Header & Quick Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-brand-dark">
              Your Booking Package
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-amber-100 text-brand-maroon font-serif font-bold text-xs border border-amber-300">
              {itemCount} {itemCount === 1 ? 'Guest / Hand' : 'Guests / Hands'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage guest quantities, review organic cone requirements, and proceed to schedule your master henna artist.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/designs"
            className="text-xs font-bold text-brand-maroon hover:text-brand-maroon-dark flex items-center gap-1.5 transition"
          >
            <span>+ Add More Designs</span>
          </Link>
          <span className="text-stone-300">|</span>
          <button
            onClick={clearCart}
            className="text-xs text-stone-400 hover:text-rose-600 transition flex items-center gap-1"
            title="Remove all items"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>
      </div>

      {/* ── Main Responsive Balanced Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List + Complimentary Perks + Quick Add (8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Cart Item Cards List */}
          <div className="space-y-4">
            {cartItems.map((item) => {
              const qty = Number(item.quantity) || 1;
              const itemPrice = Number(item.price) || 0;
              const lineTotal = itemPrice * qty;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:border-brand-gold/60 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  {/* Thumbnail */}
                  <Link to={`/designs/${item.id}`} className="shrink-0 relative group">
                    <img
                      src={item.imageUrl || '/images/rajasthani-bridal.jpg'}
                      alt={item.name}
                      className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-xl border border-stone-200 shadow-sm group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = '/images/rajasthani-bridal.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-black/10 rounded-xl group-hover:bg-transparent transition-colors" />
                  </Link>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 space-y-1.5 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-maroon/10 text-brand-maroon border border-brand-maroon/20">
                          {item.category || 'Bridal'}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          • {item.coverage || 'Full Hand'}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remove from package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link
                      to={`/designs/${item.id}`}
                      className="font-cinzel font-bold text-base sm:text-lg text-brand-dark hover:text-brand-maroon transition truncate block"
                    >
                      {item.name}
                    </Link>

                    {/* Metadata Specs */}
                    <div className="flex items-center gap-3 text-xs text-stone-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-gold-dark" />
                        {item.durationMinHours || 2}–{item.durationMaxHours || 3} hrs / hand
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
                        {(Number(item.conesNeeded) || 2) * qty} organic cones
                      </span>
                    </div>

                    {/* Quantity Selector & Item Total Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-500">
                          Guests / Hands:
                        </span>
                        <div className="inline-flex items-center rounded-xl border border-stone-300 bg-stone-50 overflow-hidden shadow-inner">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="p-1.5 sm:p-2 text-stone-600 hover:text-rose-600 hover:bg-stone-200/80 transition"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center font-serif font-bold text-xs sm:text-sm text-stone-900 select-none">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, qty + 1)}
                            className="p-1.5 sm:p-2 text-stone-600 hover:text-brand-maroon hover:bg-stone-200/80 transition"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="text-right">
                        <span className="text-[11px] text-stone-400 block">
                          {formatPrice(itemPrice)} × {qty}
                        </span>
                        <span className="font-serif font-bold text-base sm:text-lg text-brand-maroon">
                          {formatPrice(lineTotal)}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Complimentary Inclusions (Balances Page & Prevents Empty Space) ── */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50/90 via-stone-50 to-amber-100/50 border border-brand-gold/40 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-gold-dark" />
              <h3 className="font-cinzel font-bold text-sm text-brand-dark uppercase tracking-wider">
                Every Shringar Booking Includes Free
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-amber-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block font-semibold">100% Organic Sojat Henna</strong>
                  <span className="text-[11px] text-stone-500">Triple-sifted leaf powder, fresh eucalyptus & tea-tree essential oils.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-amber-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block font-semibold">Herbal Aftercare Sealant Kit</strong>
                  <span className="text-[11px] text-stone-500">Lemon-sugar glaze mist spray and protective herbal clove balm.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-amber-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block font-semibold">Zero Artist Travel Surcharges</strong>
                  <span className="text-[11px] text-stone-500">Doorstep delivery to home, wedding banquet, or hotel suite.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-amber-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 block font-semibold">Flexible Rescheduling</strong>
                  <span className="text-[11px] text-stone-500">Free ceremony date or time adjustment up to 24 hrs beforehand.</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Recommended Complementary Add-Ons ── */}
          {recommendedDesigns.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel font-bold text-sm sm:text-base text-brand-dark">
                    Frequently Added for Bridesmaids & Family
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Add coordinating patterns for engagement guests with a single click.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendedDesigns.map((rec) => (
                  <div
                    key={'rec-' + rec.id}
                    className="p-3 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-brand-gold/60 transition flex items-center justify-between gap-3"
                  >
                    <img
                      src={rec.imageUrl || '/images/rajasthani-bridal.jpg'}
                      alt={rec.name}
                      className="w-14 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                      onError={(e) => { e.target.src = '/images/rajasthani-bridal.jpg'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                        {rec.name}
                      </h4>
                      <span className="text-[10px] text-stone-500 block truncate">
                        {rec.category} • {rec.coverage}
                      </span>
                      <span className="text-xs font-bold text-brand-maroon mt-0.5 block">
                        {formatPrice(rec.price)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(rec, 1)}
                      className="px-2.5 py-1.5 rounded-lg bg-brand-maroon/10 hover:bg-brand-maroon text-brand-maroon hover:text-white font-bold text-[11px] transition shrink-0"
                      title="Add to package"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Order Summary & Checkout (Sticky 4/5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-28 self-start space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/90 shadow-xl space-y-6">
            
            <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-cinzel font-bold text-lg text-brand-dark">
                Ceremony Summary
              </h3>
              <span className="text-xs font-bold text-brand-gold-dark">
                {itemCount} {itemCount === 1 ? 'Service' : 'Services'}
              </span>
            </div>

            {/* Cones & Duration Metric Tiles */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center">
                <div className="text-stone-500 font-medium">Fresh Cones</div>
                <div className="text-base font-serif font-bold text-brand-maroon mt-0.5 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>{totalCones} Cones</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center">
                <div className="text-stone-500 font-medium">Est. Application</div>
                <div className="text-base font-serif font-bold text-brand-maroon mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>~{totalDurationHours} Hours</span>
                </div>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>Promo Code</span>
                </span>
                {!coupon && (
                  <button
                    type="button"
                    onClick={() => applyCouponCode('SHRINGAR20')}
                    className="text-[10px] font-bold text-brand-maroon hover:underline tracking-normal"
                  >
                    Try "SHRINGAR20" (20% off)
                  </button>
                )}
              </label>

              {coupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-800 tracking-wider">
                        {coupon.code}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/70 text-emerald-900">
                        Applied
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Savings of {formatPrice(discountAmount)} applied
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SHRINGAR20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                  />
                  <button
                    onClick={() => {
                      applyCouponCode(couponInput);
                      setCouponInput('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-brand-maroon text-white text-xs font-bold hover:bg-brand-maroon-dark transition shadow"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Designs Subtotal ({itemCount} {itemCount === 1 ? 'service' : 'services'})</span>
                <span className="font-semibold text-stone-800">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Discount ({coupon?.code})</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>100% Organic Henna Cones & Glaze</span>
                <span className="text-emerald-700 font-semibold">Free (Included)</span>
              </div>

              <div className="flex justify-between">
                <span>Artist Doorstep Travel & Sanitized Kit</span>
                <span className="text-emerald-700 font-semibold">Free</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-stone-200 text-base font-bold text-brand-dark">
                <span>Total Package Value</span>
                <span className="text-brand-maroon text-xl font-serif">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Wedding Payment Split (20% Advance / 80% on Ceremony Day) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2 text-xs">
              <div className="flex justify-between text-stone-700 font-medium">
                <span>Advance Required to Confirm Slot (20%):</span>
                <span className="font-bold text-brand-maroon">{formatPrice(advancePayable)}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Balance Due on Ceremony Day (80%):</span>
                <span>{formatPrice(remainingPayable)}</span>
              </div>
            </div>

            {/* Proceed to Booking Schedule Button */}
            <button
              onClick={() => navigate('/booking')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-gold via-amber-400 to-brand-gold-dark text-stone-950 font-serif font-bold text-xs uppercase tracking-widest shadow-xl hover:brightness-105 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <span>Schedule Mehendi Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Security Guarantee Seal */}
            <div className="space-y-1.5 text-center pt-1 border-t border-stone-100">
              <div className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Master Artist Guarantee & Free Rescheduling</span>
              </div>
              <p className="text-[10px] text-stone-400">
                Secure appointment booking powered by Shringar Royal Mehendi
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

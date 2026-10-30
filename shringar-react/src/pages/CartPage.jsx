import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, ShoppingBag, ArrowRight, Sparkles, Clock, Tag, X, 
  ShieldCheck, Plus, Minus, Check, Heart, UserCheck, CheckCircle2,
  Calendar, Award, Sparkle, RefreshCw, Users, Coffee, Crown,
  HeartHandshake, ChevronRight, AlertCircle, Info, Feather, MapPin
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCity } from '../context/CityContext';
import { DesignsAPI, ArtistsAPI, CouponsAPI } from '../services/api';
import { optimizeArtistAssignment, getRecommendedDesignsForMinimalArtists } from '../utils/artistOptimizer';
import { calculatePincodeDistance, calculateDistancePricing } from '../utils/pincodeDistance';

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
    packageType,
    handleSetPackageType,
    effectivePackageType,
    isBridalPackage,
    isGroupPackage,
    requiredArtists,
    bridalPackageDetails,
  } = useCart();

  const { openFavorites, favoriteCount } = useFavorites();
  const [couponInput, setCouponInput] = useState('');
  const [recommendedDesigns, setRecommendedDesigns] = useState([]);
  const [couponsModalOpen, setCouponsModalOpen] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const navigate = useNavigate();

  const handleOpenCouponsModal = async () => {
    setCouponsModalOpen(true);
    setLoadingCoupons(true);
    try {
      const data = await CouponsAPI.getPublic();
      setAvailableCoupons(Array.isArray(data) ? data : (data?.data || []));
    } catch (e) {
      console.warn('Failed to load public coupons:', e);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const { city, setCity: setGlobalCity } = useCity();

  // Checked City for designer availability upfront
  const [checkedCity, setCheckedCity] = useState(city || 'Delhi NCR');

  useEffect(() => {
    if (city && city !== checkedCity) {
      setCheckedCity(city);
    }
  }, [city]);

  const [cityCheckStatus, setCityCheckStatus] = useState({
    loading: false,
    status: 'AVAILABLE',
    availableCount: 2,
    message: '',
  });

  const handleCheckCityChange = (newCity) => {
    setCheckedCity(newCity);
    setGlobalCity(newCity);
  };

  // Always check designer availability in the selected city
  useEffect(() => {
    let active = true;
    async function checkCity() {
      if (!checkedCity) return;
      setCityCheckStatus((prev) => ({ ...prev, loading: true }));
      try {
        const data = await ArtistsAPI.getByCity(checkedCity).catch(() => []);
        let list = Array.isArray(data) ? data : [];
        if (list.length === 0) {
          const defaults = {
            'Delhi NCR': 2,
            'Mumbai': 3,
            'Jaipur': 2,
            'Bangalore': 2,
            'Pune': 2,
            'Hyderabad': 1,
            'Nashik': 1,
            'Kolkata': 0,
          };
          const count = defaults[checkedCity] ?? 1;
          if (!active) return;
          const req = requiredArtists || 1;
          if (count >= req) {
            setCityCheckStatus({ loading: false, status: 'AVAILABLE', availableCount: count });
          } else if (count > 0) {
            setCityCheckStatus({ loading: false, status: 'LIMITED', availableCount: count });
          } else {
            setCityCheckStatus({ loading: false, status: 'UNAVAILABLE', availableCount: 0 });
          }
          return;
        }

        if (!active) return;
        const req = requiredArtists || 1;
        if (list.length >= req) {
          setCityCheckStatus({ loading: false, status: 'AVAILABLE', availableCount: list.length });
        } else if (list.length > 0) {
          setCityCheckStatus({ loading: false, status: 'LIMITED', availableCount: list.length });
        } else {
          setCityCheckStatus({ loading: false, status: 'UNAVAILABLE', availableCount: 0 });
        }
      } catch {
        if (active) {
          setCityCheckStatus({ loading: false, status: 'AVAILABLE', availableCount: 2 });
        }
      }
    }
    checkCity();
    return () => { active = false; };
  }, [checkedCity, requiredArtists]);

  // Algorithmic artist minimization manifest (1 artist <= 3 designs, 2 artists for 4-6, etc.)
  const artistManifest = useMemo(
    () => optimizeArtistAssignment(cartItems, checkedCity),
    [cartItems, checkedCity]
  );

  // Load complementary bridesmaid/family designs using artist minimization algorithm
  useEffect(() => {
    async function loadComplementary() {
      try {
        const data = await DesignsAPI.getAll();
        const catalog = Array.isArray(data) ? data : [];
        const recommended = getRecommendedDesignsForMinimalArtists(cartItems, catalog, checkedCity, 3);
        setRecommendedDesigns(recommended);
      } catch (err) {
        // Fallback default suggestions passed through optimizer
        const fallbackList = [
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
            id: 3,
            name: 'Arabic Glam Sawan Bel',
            category: 'Arabic',
            coverage: 'Both hands',
            price: 1500,
            imageUrl: '/images/arabic-sawan.jpg',
            conesNeeded: 1.5,
            durationMinHours: 2.5,
            durationMaxHours: 3.5,
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
        ];
        const recommended = getRecommendedDesignsForMinimalArtists(cartItems, fallbackList, checkedCity, 3);
        setRecommendedDesigns(recommended);
      }
    }
    loadComplementary();
  }, [cartItems, checkedCity]);

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 pb-20 lg:pb-8">
      
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
            Manage guest quantities, review cone requirements, and proceed to schedule your master henna artist.
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
          
          {/* ── Ceremony Assurance & Quality Promise Banner ── */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#4A2511] via-[#3A1D0D] to-[#241711] text-amber-50 shadow-xl border border-brand-gold/40 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-amber-400/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-400/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-400/20 text-brand-gold border border-amber-400/30">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                </span>
                <div>
                  <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-amber-100 tracking-wide">
                    {isBridalPackage ? 'Royal Bridal Ceremony Package' : 'Celebration Mehendi Package'}
                  </h3>
                  <span className="text-[11px] text-amber-200/80">
                    Private Doorstep Session in {checkedCity}
                  </span>
                </div>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-serif font-bold text-xs border border-emerald-400/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Certified Specialist Guarantee</span>
              </span>
            </div>

            <p className="text-xs text-amber-200/80 leading-relaxed">
              Every design is meticulously curated for perfection. Your ceremony details and design blueprints will be dispatched directly to our certified master henna artist upon booking confirmation.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-0.5">
                <span className="text-[10px] text-amber-300/80 uppercase font-semibold block">Mehendi Cones</span>
                <strong className="text-amber-100 font-serif text-xs sm:text-sm">{totalCones} Cones Included</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-0.5">
                <span className="text-[10px] text-amber-300/80 uppercase font-semibold block">Estimated Time</span>
                <strong className="text-amber-100 font-serif text-xs sm:text-sm">~{totalDurationHours || 3} Hours</strong>
              </div>
              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-0.5">
                <span className="text-[10px] text-amber-300/80 uppercase font-semibold block">Aftercare</span>
                <strong className="text-amber-100 font-serif text-xs sm:text-sm">Herbal Clove Mist Free</strong>
              </div>
            </div>
          </div>

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
                        {item.durationMinHours != null && item.durationMaxHours != null
                          ? (Number(item.durationMinHours) === Number(item.durationMaxHours)
                              ? `${item.durationMinHours} hrs`
                              : `${item.durationMinHours}–${item.durationMaxHours} hrs`)
                          : (item.durationLabel ? item.durationLabel.replace(/\s*hrs?/i, ' hrs') : `${item.durationMinHours || 2}–${item.durationMaxHours || 3} hrs`)} / hand
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
                        {(Number(item.conesNeeded) || 2) * qty} mehendi cones
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
                        {item.originalPrice && Number(item.originalPrice) > Number(itemPrice) && (
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <span className="text-[11px] text-stone-400 line-through">
                              {formatPrice(Number(item.originalPrice) * qty)}
                            </span>
                            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                              {Math.round(((Number(item.originalPrice) - Number(itemPrice)) / Number(item.originalPrice)) * 100)}% OFF
                            </span>
                          </div>
                        )}
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
                  <strong className="text-stone-900 block font-semibold">Mehendi by Patron Preference</strong>
                  <span className="text-[11px] text-stone-500">Store-available quality henna cones sourced or applied strictly according to your preference.</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-[#E6DFD3]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#B58E34]" />
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#4A2511]">
                      Frequently Added Together
                    </h3>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Complementary motifs frequently curated together for wedding & celebration looks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendedDesigns.map((rec) => (
                  <div
                    key={'rec-' + rec.id}
                    className="p-3 rounded-2xl bg-white border border-stone-200 shadow-sm hover:border-brand-gold/60 transition flex items-center justify-between gap-3 relative group"
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

            {/* Cones, Artists & Duration Metric Tiles */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center">
                <div className="text-stone-500 font-medium text-[10px] uppercase tracking-wider">Mehendi Cones</div>
                <div className="text-sm sm:text-base font-serif font-bold text-brand-maroon mt-0.5 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>{isBridalPackage ? bridalPackageDetails.totalConesNeeded : totalCones} Cones</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-center">
                <div className="text-stone-500 font-medium text-[10px] uppercase tracking-wider">Parallel Duration</div>
                <div className="text-sm sm:text-base font-serif font-bold text-brand-maroon mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>~{bridalPackageDetails.parallelDurationHours} Hours</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-100/70 border border-amber-300 text-center">
                <div className="text-stone-500 font-medium text-[10px] uppercase tracking-wider">Ceremony Service</div>
                <div className="text-sm sm:text-base font-serif font-bold text-brand-maroon mt-0.5 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>Private Session</span>
                </div>
                <div className="text-[10px] text-stone-600 mt-0.5">
                  Doorstep Ceremony
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-100/70 border border-amber-300 text-center">
                <div className="text-stone-500 font-medium text-[10px] uppercase tracking-wider">Ceremony Breaks</div>
                <div className="text-sm sm:text-base font-serif font-bold text-brand-maroon mt-0.5 flex items-center justify-center gap-1">
                  <Coffee className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>{isBridalPackage ? '2 Bridal Breaks' : '10m per Guest'}</span>
                </div>
                <div className="text-[10px] text-stone-600 mt-0.5">
                  {isBridalPackage ? 'Chai & Posture' : 'Sanitization'}
                </div>
              </div>
            </div>

            {/* Live City Designer Availability Checker */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 border border-brand-gold/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-maroon" />
                  <span>Check Designer Availability in City</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                  Live Check
                </span>
              </div>

              <select
                value={checkedCity}
                onChange={(e) => handleCheckCityChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 bg-white focus:outline-none focus:border-brand-maroon font-medium"
              >
                <option value="Delhi NCR">Delhi NCR (Delhi, Gurgaon, Noida)</option>
                <option value="Mumbai">Mumbai & Navi Mumbai</option>
                <option value="Jaipur">Jaipur (Royal Heritage Zone)</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Nashik">Nashik</option>
                <option value="Kolkata">Kolkata (Coming Soon)</option>
              </select>

              {/* Dynamic Availability Indicator */}
              <div className="text-[11px] leading-snug">
                {cityCheckStatus.status === 'AVAILABLE' && (
                  <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{cityCheckStatus.availableCount} Master Artisans ready in {checkedCity} — Full Team Guaranteed</span>
                  </div>
                )}
                {cityCheckStatus.status === 'LIMITED' && (
                  <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>High demand in {checkedCity} ({cityCheckStatus.availableCount} active). Booking early recommended.</span>
                  </div>
                )}
                {cityCheckStatus.status === 'UNAVAILABLE' && (
                  <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>No active designers in {checkedCity}. Bookings open in Delhi, Mumbai, Jaipur, Bangalore, Pune.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-gold-dark" />
                  <span>Promo Code</span>
                </label>
                <button
                  type="button"
                  onClick={handleOpenCouponsModal}
                  className="text-xs font-bold text-brand-maroon hover:text-brand-maroon-dark hover:underline flex items-center gap-1 cursor-pointer transition"
                >
                  <Sparkles className="w-3 h-3 text-brand-gold" />
                  <span>View all coupons</span>
                </button>
              </div>

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
                <span>Mehendi Cones by Preference & Glaze</span>
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

      {/* Mobile Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 lg:hidden shadow-2xl z-30 flex items-center justify-between gap-3 px-4">
        <div>
          <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block">Total Estimated</span>
          <span className="text-base font-serif font-bold text-brand-maroon">{formatPrice(finalTotal)}</span>
        </div>
        <button
          onClick={() => navigate('/booking')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-gold to-amber-500 text-stone-950 font-serif font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition flex items-center gap-1.5 shrink-0"
        >
          <span>Schedule Booking</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── ALL AVAILABLE COUPONS MODAL ── */}
      {couponsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setCouponsModalOpen(false)}
        >
          <div
            className="bg-[#FDFBF7] text-[#2C160A] w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#B58E34]/40 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#4A2511] to-[#34180A] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#B58E34]/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#B58E34]/20 border border-[#B58E34]/40 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                    Available Special Offers & Coupons
                  </h3>
                  <p className="text-[11px] text-amber-200/80">
                    Apply instant savings to your luxury ceremony package
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCouponsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
              {loadingCoupons ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-8 h-8 border-3 border-brand-maroon border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-stone-500 font-serif">Checking active royal offers…</p>
                </div>
              ) : availableCoupons.length === 0 ? (
                <div className="text-center py-10 space-y-2 text-stone-500">
                  <Tag className="w-10 h-10 mx-auto text-stone-300" />
                  <p className="text-xs font-semibold">No public coupons active at this moment.</p>
                </div>
              ) : (
                availableCoupons.map((c) => {
                  const minOrder = Number(c.minOrderValue || 0);
                  const isEligible = subtotal >= minOrder;
                  const diff = minOrder - subtotal;
                  const isApplied = coupon?.code?.toUpperCase() === c.code?.toUpperCase();

                  return (
                    <div
                      key={c.id || c.code}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isApplied
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                          : isEligible
                          ? 'border-amber-300/80 bg-white hover:border-[#B58E34] hover:shadow-md'
                          : 'border-stone-200 bg-stone-50/70 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm tracking-wider uppercase px-2 py-0.5 rounded bg-amber-100 text-stone-900 border border-amber-300">
                              {c.code}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-800">
                              {c.type === 'PERCENT' ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}
                              {c.maxDiscount && ` (Max ₹${c.maxDiscount})`}
                            </span>
                          </div>
                          {c.description && (
                            <p className="text-xs text-stone-600 leading-snug">
                              {c.description}
                            </p>
                          )}
                          <div className="text-[11px] pt-1">
                            {minOrder > 0 ? (
                              isEligible ? (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Eligible! Order value {formatPrice(subtotal)} &ge; {formatPrice(minOrder)}</span>
                                </span>
                              ) : (
                                <span className="text-rose-600 font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>Min. order of {formatPrice(minOrder)} required (Add {formatPrice(diff)} more)</span>
                                </span>
                              )
                            ) : (
                              <span className="text-emerald-700 font-medium">No minimum order required</span>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0 pt-0.5">
                          {isApplied ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                              <Check className="w-3.5 h-3.5" />
                              <span>Applied</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={!isEligible}
                              onClick={() => {
                                applyCouponCode(c.code);
                                setCouponsModalOpen(false);
                              }}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                                isEligible
                                  ? 'bg-[#4A2511] hover:bg-[#3A1D0D] text-amber-200 active:scale-95 cursor-pointer'
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              }`}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 text-right">
              <button
                type="button"
                onClick={() => setCouponsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

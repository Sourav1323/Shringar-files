import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, Sparkles, Check, ArrowLeft, ShoppingBag, 
  ShieldCheck, Calendar, Heart, Eye, ArrowRight, Star, Layers
} from 'lucide-react';
import { DesignsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import DesignCard from '../components/designs/DesignCard';

// Comprehensive catalog database with guaranteed fallbacks for all IDs
const ALL_DESIGNS_MASTER = [
  {
    id: 1,
    name: 'Rajasthani Bridal Jaal',
    description: 'A masterpiece inspired by the royal courts of Rajasthan. Intricate peacocks, paisleys, and fine latticework covering the arms and palms.',
    category: 'Bridal',
    coverage: 'Full hand (Elbow)',
    durationMinHours: 3,
    durationMaxHours: 4,
    conesNeeded: 2,
    price: 2500,
    badge: 'Popular',
    badgeColor: '#7a2c1a',
    imageUrl: '/images/rajasthani-bridal.jpg',
  },
  {
    id: 2,
    name: 'Floral Minimalist Bloom',
    description: 'Delicate blooms and fine lines for the modern minimalist. Perfect for receptions, haldi ceremonies, and bridesmaids.',
    category: 'Minimal',
    coverage: 'Half hand',
    durationMinHours: 1,
    durationMaxHours: 2,
    conesNeeded: 1,
    price: 800,
    badge: 'New',
    badgeColor: '#2d6a4f',
    imageUrl: '/images/floral-minimal.jpg',
  },
  {
    id: 3,
    name: 'Arabic Glam Sawan Bel',
    description: 'Bold Arabic strokes with floral fills and shaded leaf trails. The most requested motif for sangeet and engagement ceremonies.',
    category: 'Arabic',
    coverage: 'Both hands',
    durationMinHours: 2,
    durationMaxHours: 3,
    conesNeeded: 1.5,
    price: 1500,
    badge: 'Trending',
    badgeColor: '#b45309',
    imageUrl: '/images/arabic-sawan.jpg',
  },
  {
    id: 4,
    name: 'Peacock Bridal Feet & Ankle',
    description: 'Majestic peacock feather patterns with fine detailing covering both feet and ankles beautifully for the grand wedding mandap.',
    category: 'Bridal',
    coverage: 'Both feet',
    durationMinHours: 2,
    durationMaxHours: 2.5,
    conesNeeded: 1.5,
    price: 1800,
    badge: 'Bridal',
    badgeColor: '#7a2c1a',
    imageUrl: '/images/peacock-feet.png',
  },
  {
    id: 5,
    name: 'Indo-Arabic Lotus Fusion',
    category: 'Fusion',
    description: 'The best of both worlds — Indian mandala center with flowing Arabic diagonal trails and lotus buds.',
    coverage: 'Full hand',
    durationMinHours: 2.5,
    durationMaxHours: 2.5,
    conesNeeded: 2,
    price: 2000,
    badge: 'Fusion',
    badgeColor: '#993517',
    imageUrl: '/images/indo-arabic.png',
  },
  {
    id: 6,
    name: 'Mughal Classic Arches',
    category: 'Mughal',
    description: 'Inspired by Mughal architecture — domed arches, geometric lattice window screens and vine scrollwork.',
    coverage: 'Full hand',
    durationMinHours: 3,
    durationMaxHours: 3.5,
    conesNeeded: 2,
    price: 2200,
    badge: 'Classic',
    badgeColor: '#5c3d1e',
    imageUrl: '/images/mughal-classic.jpg',
  },
  {
    id: 7,
    name: 'Sawan Bel Diagonal Trail',
    category: 'Arabic',
    description: 'Traditional Sawan vine flowing gracefully from index finger diagonally down the forearm with shaded leaf fillers.',
    coverage: 'Half hand',
    durationMinHours: 1.5,
    durationMaxHours: 2,
    conesNeeded: 1,
    price: 950,
    badge: 'Festive',
    badgeColor: '#2d6a4f',
    imageUrl: '/images/arabic-mehndi-sawan.jpg',
  },
  {
    id: 8,
    name: 'Marwari Grand Bridal Ensemble',
    category: 'Bridal',
    description: 'Ultra-intricate traditional Marwari full arm wedding henna with bride and groom doli portraits and auspicious kalash.',
    coverage: 'Full hand (Elbow)',
    durationMinHours: 4,
    durationMaxHours: 5,
    conesNeeded: 3,
    price: 3500,
    badge: 'Signature',
    badgeColor: '#7a2c1a',
    imageUrl: '/images/bridal-fullhand.jpg',
  }
];

export default function DesignDetailPage() {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cartItems, addToCart } = useCart();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const isInCart = cartItems.some((item) => String(item.id) === String(id));

  useEffect(() => {
    async function loadDesign() {
      setLoading(true);
      try {
        const data = await DesignsAPI.getById(id).catch(() => null);
        if (data && data.name) {
          setDesign(data);
        } else {
          // Resolve to guaranteed master item
          const fallback = ALL_DESIGNS_MASTER.find((d) => String(d.id) === String(id)) || ALL_DESIGNS_MASTER[0];
          setDesign(fallback);
        }
      } catch (err) {
        const fallback = ALL_DESIGNS_MASTER.find((d) => String(d.id) === String(id)) || ALL_DESIGNS_MASTER[0];
        setDesign(fallback);
      } finally {
        setLoading(false);
      }
    }

    loadDesign();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-maroon border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-stone-500 mt-4 font-serif">Curating Royal Mehendi Details…</p>
      </div>
    );
  }

  const currentDesign = design || ALL_DESIGNS_MASTER[0];

  // Amazon-Style: Similar Designs in Same Category
  const similarDesigns = ALL_DESIGNS_MASTER
    .filter((d) => String(d.id) !== String(currentDesign.id) && (d.category === currentDesign.category || Math.abs(d.price - currentDesign.price) < 800))
    .slice(0, 4);

  // Amazon-Style: Customers Also Explored (Complementary placements, feet, minimal, fusion)
  const customersAlsoExplored = ALL_DESIGNS_MASTER
    .filter((d) => String(d.id) !== String(currentDesign.id) && !similarDesigns.some(s => s.id === d.id))
    .slice(0, 4);

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getImageUrl = (url) => {
    if (!url) return '/images/rajasthani-bridal.jpg';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  const handleBookNow = () => {
    if (!isInCart) {
      addToCart(currentDesign);
    }
    navigate('/booking');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/designs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-brand-maroon transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Designs</span>
        </Link>
        <span className="text-xs text-stone-400">Design ID: #{currentDesign.id}</span>
      </div>

      {/* Main Design Hero Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/90 shadow-xl items-start">
        
        {/* Left: Design Image & 3D Try-On Launch (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[4/5] border border-stone-200 shadow-md group">
            <img
              src={getImageUrl(currentDesign.imageUrl)}
              alt={currentDesign.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            {currentDesign.badge && (
              <span
                className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white shadow-lg"
                style={{ backgroundColor: currentDesign.badgeColor || '#7a2c1a' }}
              >
                {currentDesign.badge}
              </span>
            )}
            <span className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
              {currentDesign.coverage}
            </span>
          </div>

          {/* Instant 3D Palm Try-On Studio */}
          <Link
            to="/ai-tryon"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-serif font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 border border-brand-gold"
          >
            <Sparkles className="w-4 h-4 text-stone-950 animate-pulse" />
            <span>Try This Design On Your Hand (3D Studio)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right: Specifications, Highlights & Actions (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold-dark">
              <span>Collection: {currentDesign.category}</span>
              <span>•</span>
              <span>Placement: {currentDesign.coverage}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              {currentDesign.name}
            </h1>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-brand-maroon">
                {formatPrice(currentDesign.price)}
              </span>
              <span className="text-xs text-stone-500">All-inclusive of organic henna cones & artist visit</span>
            </div>

            <p className="text-stone-600 text-sm leading-relaxed">
              {currentDesign.description}
            </p>

            {/* Application Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
                <Clock className="w-6 h-6 text-brand-maroon shrink-0" />
                <div>
                  <div className="text-[11px] text-stone-500 font-semibold uppercase">Application Time</div>
                  <div className="text-sm font-bold text-stone-900">
                    {currentDesign.durationMinHours || 2} - {currentDesign.durationMaxHours || 3} Hours
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-brand-maroon shrink-0" />
                <div>
                  <div className="text-[11px] text-stone-500 font-semibold uppercase">Organic Cones</div>
                  <div className="text-sm font-bold text-stone-900">
                    {currentDesign.conesNeeded || 2} Triple-Filtered Cones
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Guarantees */}
            <div className="space-y-2 pt-2 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Rajasthani Sojat organic henna — zero PPD, zero chemical dye accelerators</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Natural eucalyptus oil infusion for deep mahogany stain development</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complimentary lemon-sugar glaze application post-session</span>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                addToCart(currentDesign);
                showSuccess(`${currentDesign.name} added to cart!`);
              }}
              className={`flex-1 py-3.5 rounded-full font-serif font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border ${
                isInCart
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
              }`}
            >
              {isInCart ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Item in Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Booking Cart</span>
                </>
              )}
            </button>

            <button
              onClick={handleBookNow}
              className="flex-1 py-3.5 rounded-full bg-brand-maroon hover:bg-brand-maroon-dark text-brand-gold font-serif font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Now</span>
            </button>
          </div>

        </div>

      </div>

      {/* ── AMAZON-STYLE SECTION 1: Frequently Paired / Similar Designs You Might Love ── */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-brand-maroon flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-gold" />
              Frequently Paired & Similar Artworks
            </h2>
            <p className="text-stone-500 text-xs mt-0.5">
              Patrons who selected {currentDesign.name} also matched these motifs for ceremonies & family members
            </p>
          </div>
          <Link
            to="/designs"
            className="text-xs font-serif font-bold text-brand-maroon hover:text-brand-gold underline underline-offset-4 hidden sm:block"
          >
            Explore All 50+ Motifs →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarDesigns.map((simDesign) => (
            <DesignCard key={simDesign.id} design={simDesign} />
          ))}
        </div>
      </div>

      {/* ── AMAZON-STYLE SECTION 2: Customers Who Viewed This Also Explored ── */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-brand-maroon flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-gold" />
              Customers Who Viewed This Also Explored
            </h2>
            <p className="text-stone-500 text-xs mt-0.5">
              Complete your bridal ensemble with matching feet patterns, sangeet party vines, and minimalist cuffs
            </p>
          </div>
          <Link
            to="/custom-design"
            className="text-xs font-serif font-bold text-brand-maroon hover:text-brand-gold underline underline-offset-4 hidden sm:block"
          >
            Commission Custom Motif →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {customersAlsoExplored.map((expDesign) => (
            <DesignCard key={expDesign.id} design={expDesign} />
          ))}
        </div>
      </div>

      {/* ── Bespoke Custom Design Strip (Keeps User Continuously Engaged) ── */}
      <div className="bg-gradient-to-r from-brand-maroon via-brand-maroon-dark to-brand-maroon text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-brand-gold/30">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/20 px-3 py-1 rounded-full border border-brand-gold/30">
            Bespoke Haute Couture
          </span>
          <h3 className="font-serif text-2xl font-bold text-white">
            Have a Specific Couple Portrait or Pinterest Vision?
          </h3>
          <p className="text-brand-cream/80 text-xs max-w-xl">
            Upload your reference sketch or photo. Our Master Artisans will review it, quote total pricing, and let you lock the ceremony with a 25% advance token.
          </p>
        </div>
        <Link
          to="/custom-design"
          className="px-6 py-3 bg-brand-gold text-brand-maroon-dark font-serif font-bold text-xs rounded-full hover:bg-yellow-400 transition shadow-lg shrink-0 flex items-center gap-2"
        >
          <span>Commission Custom Design</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}

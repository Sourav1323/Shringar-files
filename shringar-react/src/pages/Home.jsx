import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ShieldCheck, Clock, Award, Star, Heart, 
  Compass, Users, Crown, CheckCircle2, Check, MapPin, ChevronDown, Calendar
} from 'lucide-react';
import { DesignsAPI, ArtistsAPI, TestimonialsAPI } from '../services/api';
import DesignCard from '../components/designs/DesignCard';
import { useCity } from '../context/CityContext';
import { isDesignAvailableInCity } from '../utils/cityUtils';

export default function Home() {
  const { city, openCityModal } = useCity();
  const [allDesigns, setAllDesigns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [artists, setArtists] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Shaadi.com Style Hero Selector Strip State
  const [heroOccasion, setHeroOccasion] = useState('Bridal');
  const [heroCoverage, setHeroCoverage] = useState('Full hand');
  const [heroDate, setHeroDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroOccasion && heroOccasion !== 'ALL') params.set('category', heroOccasion);
    if (city) params.set('city', city);
    navigate(`/designs?${params.toString()}`);
  };

  const dynamicCategories = useMemo(() => {
    const base = [
      { id: 'ALL', name: 'All Motifs', tag: 'Trending', imageUrl: '/images/rajasthani-bridal.jpg', icon: '✨' },
      { id: 'Bridal', name: 'Bridal', tag: 'Royal Heritage', imageUrl: '/images/rajasthani-bridal.jpg', icon: '👰' },
      { id: 'Arabic', name: 'Arabic', tag: 'Flowing Trails', imageUrl: '/images/arabic-sawan.jpg', icon: '🌸' },
      { id: 'Rajasthani', name: 'Rajasthani', tag: 'Marwari Royal', imageUrl: '/images/peacock-feet.png', icon: '👑' },
      { id: 'Minimal', name: 'Minimal', tag: 'Modern Grace', imageUrl: '/images/floral-minimal.jpg', icon: '🌿' },
      { id: 'Mughal', name: 'Mughal', tag: 'Imperial Arches', imageUrl: '/images/mughal-classic.jpg', icon: '🏛️' },
      { id: 'Fusion', name: 'Fusion', tag: 'Indo-Arabic', imageUrl: '/images/indo-arabic.png', icon: '🪷' },
      { id: 'Feet', name: 'Feet & Payal', tag: 'Bridal Feet', imageUrl: '/images/peacock-feet.png', icon: '👣' },
    ];

    const categoryMap = new Map();
    base.forEach(b => categoryMap.set(b.id.toLowerCase(), b));

    allDesigns.forEach(d => {
      if (d.category) {
        const key = d.category.toLowerCase();
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            id: d.category,
            name: d.category,
            tag: 'Collection',
            imageUrl: d.imageUrl || '/images/rajasthani-bridal.jpg',
            icon: '🎨',
          });
        }
      }
    });

    return Array.from(categoryMap.values());
  }, [allDesigns]);

  const normalizeDesign = (d) => {
    if (!d) return d;
    if (d.id === 4 || (d.imageUrl && d.imageUrl.includes('peacock-feet.png'))) {
      return {
        ...d,
        name: 'Royal Dulha-Dulhan Bridal',
        coverage: 'Full hand',
        category: 'Bridal',
        badge: 'Signature',
        badgeColor: '#7a2c1a',
        description: 'Handcrafted bride & groom wedding portraits on palms with auspicious kalash and peacocks.'
      };
    }
    if (d.id === 5 || (d.imageUrl && d.imageUrl.includes('indo-arabic.png'))) {
      return {
        ...d,
        name: 'Lotus Mandala Bridal Feet',
        coverage: 'Both feet',
        category: 'Bridal',
        badge: 'Bridal Feet',
        badgeColor: '#ba7517',
        description: 'Majestic blooming lotus mandala with ornate ankle payal detailing covering both feet.'
      };
    }
    if (d.id === 6 || (d.name && d.name.includes('Mughal'))) {
      return {
        ...d,
        name: 'Mughal Classic Arches',
        coverage: 'Full hand',
        category: 'Mughal',
        badge: 'Classic',
        badgeColor: '#1e3a47'
      };
    }
    return d;
  };

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [designsData, artistsData, testimonialsData] = await Promise.allSettled([
          DesignsAPI.getAll(),
          ArtistsAPI.getAll(),
          TestimonialsAPI.getAll(),
        ]);

        if (designsData.status === 'fulfilled' && Array.isArray(designsData.value) && designsData.value.length > 0) {
          const normalized = designsData.value.map(normalizeDesign);
          setAllDesigns(normalized);
        } else {
          setAllDesigns([
            {
              id: 1,
              name: 'Rajasthani Bridal',
              description: 'Intricate peacocks, paisleys, and latticework inspired by Rajasthan royal courts.',
              category: 'Bridal',
              coverage: 'Full hand',
              durationMinHours: 3,
              durationMaxHours: 4,
              conesNeeded: 2,
              price: 2500,
              badge: 'Popular',
              imageUrl: '/images/rajasthani-bridal.jpg',
            },
            {
              id: 2,
              name: 'Floral Minimal',
              description: 'Delicate blooms and fine lines for the modern minimalist.',
              category: 'Minimal',
              coverage: 'Half hand',
              durationMinHours: 1,
              durationMaxHours: 2,
              conesNeeded: 1,
              price: 800,
              badge: 'New',
              imageUrl: '/images/floral-minimal.jpg',
            },
            {
              id: 3,
              name: 'Arabic Glam',
              description: 'Bold Arabic strokes with floral shading and flowing trails.',
              category: 'Arabic',
              coverage: 'Both hands',
              durationMinHours: 2,
              durationMaxHours: 3,
              conesNeeded: 1.5,
              price: 1500,
              badge: 'Trending',
              imageUrl: '/images/arabic-sawan.jpg',
            },
            {
              id: 4,
              name: 'Royal Dulha-Dulhan Bridal',
              description: 'Handcrafted bride & groom wedding portraits on palms with auspicious kalash.',
              category: 'Bridal',
              coverage: 'Full hand',
              durationMinHours: 3.5,
              durationMaxHours: 4.5,
              conesNeeded: 2.5,
              price: 2800,
              badge: 'Signature',
              imageUrl: '/images/peacock-feet.png',
            },
            {
              id: 5,
              name: 'Lotus Mandala Bridal Feet',
              description: 'Majestic blooming lotus mandala with ornate ankle payal detailing.',
              category: 'Bridal',
              coverage: 'Both feet',
              durationMinHours: 2,
              durationMaxHours: 2.5,
              conesNeeded: 2,
              price: 2000,
              badge: 'Bridal Feet',
              imageUrl: '/images/indo-arabic.png',
            },
            {
              id: 6,
              name: 'Mughal Classic Arches',
              description: 'Domed arches, geometric lattice and vine scrollwork.',
              category: 'Mughal',
              coverage: 'Full hand',
              durationMinHours: 3,
              durationMaxHours: 3.5,
              conesNeeded: 2,
              price: 2200,
              badge: 'Classic',
              imageUrl: '/images/mughal-classic.jpg',
            },
          ]);
        }

        if (artistsData.status === 'fulfilled' && Array.isArray(artistsData.value)) {
          setArtists(artistsData.value);
        }

        if (testimonialsData.status === 'fulfilled' && Array.isArray(testimonialsData.value) && testimonialsData.value.length > 0) {
          const mapped = testimonialsData.value.map(t => ({
            id: t.id,
            clientName: t.customerName || t.clientName || 'Bridal Patron',
            customerName: t.customerName || t.clientName || 'Bridal Patron',
            rating: t.rating || 5,
            occasion: t.occasion || 'Bridal Mehendi',
            location: t.location || 'Mumbai',
            review: t.review || t.reviewText || 'The bridal mehendi was breathtaking! The artist arrived right on time with quality mehendi cones tailored to our choice.',
          }));
          setTestimonials(mapped);
        } else {
          setTestimonials([
            { id: 1, clientName: 'Priya Sharma', location: 'Bandra, Mumbai', rating: 5, occasion: 'Bridal Mehendi', review: 'Sunita didi did my bridal mehendi and it was absolutely stunning. The stain lasted over two weeks and every single wedding guest kept asking who crafted it. 10/10 royal experience!' },
            { id: 2, clientName: 'Ananya Iyer', location: 'Pune', rating: 5, occasion: 'Sangeet Festive', review: 'Booked through Shringar and was completely blown away. The artist arrived right on time with quality cones applied with such precision and care. Intricate Arabic lines!' },
          ]);
        }
      } catch (e) {
        console.warn('Home data load error:', e);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  // Filtered designs based on category selection
  const displayedDesigns = useMemo(() => {
    let list = allDesigns;
    if (selectedCategory !== 'ALL') {
      list = allDesigns.filter(d => (d.category || '').toLowerCase() === selectedCategory.toLowerCase());
      if (list.length === 0) list = allDesigns; // Fallback to all if category has no designs yet
    }
    // Shuffle location available first
    const local = list.filter(d => isDesignAvailableInCity(d, city));
    const other = list.filter(d => !isDesignAvailableInCity(d, city));
    return [...local, ...other].slice(0, 6);
  }, [allDesigns, selectedCategory, city]);

  return (
    <div className="space-y-10 sm:space-y-16 pb-16">
      
      {/* ── 1. Shaadi.com Style Hero Section (Dark Romantic Imagery, Centered Headline & Selector Bar) ── */}
      <section className="relative overflow-hidden min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 bg-stone-950" data-testid="home-hero">
        {/* Full-Bleed Dark Cinematic Wedding Imagery */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bride-mehndi-happiness.jpg"
            alt="Joyful Indian Bride Celebrating Her Sacred Mehendi & Wedding Moment"
            className="w-full h-full object-cover object-center opacity-75 sm:opacity-80 scale-100 transform duration-1000 ease-out"
            onError={(e) => { e.target.src = '/images/hero-bride-joyful-henna.jpg'; }}
          />
          {/* Multi-Stop Cinematic Warm Atmosphere Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/65 via-stone-900/35 to-stone-950/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-stone-950/40 pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto py-12 sm:py-16 space-y-4">
          {/* Overline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/40 text-amber-200 text-[11px] sm:text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-sm">
            <span>👑 Handcrafted Luxury Doorstep Mehendi</span>
            <span>•</span>
            <span className="text-white font-normal">{city}</span>
          </div>

          {/* Shaadi.com Style Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15] drop-shadow-lg">
            Choose Your Forever Design
          </h1>
          <p className="text-amber-100/90 text-xs sm:text-base lg:text-lg max-w-2xl mx-auto font-serif italic drop-shadow-md">
            Find the perfect bridal mehendi artistry crafted for your sacred celebration with verified master artisans in {city}.
          </p>

          {/* Interactive Shaadi-Style Selector Strip */}
          <form onSubmit={handleHeroSearch} className="mt-6 sm:mt-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-amber-200/50 text-stone-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
              {/* Field 1: I'm looking for a */}
              <div className="text-left">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  I'm looking for
                </label>
                <select
                  value={heroOccasion}
                  onChange={(e) => setHeroOccasion(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-[#4A2511] focus:outline-none focus:border-[#B58E34] focus:ring-1 focus:ring-[#B58E34] cursor-pointer"
                >
                  <option value="Bridal">Bridal Mehendi</option>
                  <option value="Arabic">Arabic Trails</option>
                  <option value="Rajasthani">Rajasthani Marwari</option>
                  <option value="Minimal">Minimal Modern</option>
                  <option value="Mughal">Mughal Classic</option>
                  <option value="Fusion">Indo-Arabic Fusion</option>
                  <option value="Feet">Bridal Feet & Payal</option>
                  <option value="ALL">All Motifs</option>
                </select>
              </div>

              {/* Field 2: In City */}
              <div className="text-left">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  In City
                </label>
                <button
                  type="button"
                  onClick={openCityModal}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-[#4A2511] flex items-center justify-between hover:bg-stone-100 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#B58E34] shrink-0" />
                    <span>{city}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </button>
              </div>

              {/* Field 3: Coverage */}
              <div className="text-left">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Coverage
                </label>
                <select
                  value={heroCoverage}
                  onChange={(e) => setHeroCoverage(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-[#4A2511] focus:outline-none focus:border-[#B58E34] focus:ring-1 focus:ring-[#B58E34] cursor-pointer"
                >
                  <option value="Full hand">Full Bridal Hands & Feet</option>
                  <option value="Both hands">Both Hands (Elbow Length)</option>
                  <option value="Half hand">Palms & Forearms</option>
                  <option value="Both feet">Bridal Feet & Payal</option>
                </select>
              </div>

              {/* Field 4: Ceremony Date */}
              <div className="text-left">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Ceremony Date
                </label>
                <input
                  type="date"
                  value={heroDate}
                  onChange={(e) => setHeroDate(e.target.value)}
                  className="w-full text-xs font-bold p-2 rounded-xl border border-stone-300 bg-stone-50 text-[#4A2511] focus:outline-none focus:border-[#B58E34] focus:ring-1 focus:ring-[#B58E34] cursor-pointer"
                />
              </div>

              {/* Field 5: Action Button */}
              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-serif font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Designs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </form>

          {/* Quick Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-[11px] sm:text-xs text-amber-200/80 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Doorstep Visiting Artists</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>100% Organic Quality Henna Cones</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>4.9/5 Certified Rating</span>
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. Prominent Auto-Adjusting Explore Styles Row (Fills Full Width Seamlessly) ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="bg-[#FDFBF7] rounded-3xl p-5 sm:p-8 shadow-xl border border-[#E6DFD3]">
          <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#B58E34] flex items-center gap-1.5">
                <span>Explore Styles</span>
                <span>✦</span>
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A2511] mt-0.5">
                Signature Motifs & Categories
              </h2>
            </div>
            <Link to="/designs" className="text-xs font-semibold text-[#B58E34] hover:underline flex items-center gap-1">
              <span>All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Fully Responsive, Dynamic Row: Automatically adjusts size and spans full container width */}
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 lg:flex lg:justify-between items-center w-full gap-3 sm:gap-6">
            {dynamicCategories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center gap-2 flex-1 min-w-[70px] max-w-[130px] group focus:outline-none transition-transform active:scale-95 text-center mx-auto cursor-pointer"
                >
                  <div className={`relative w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full p-1 transition-all shadow-md ${
                    isActive 
                      ? 'ring-3 ring-[#B58E34] ring-offset-2 ring-offset-[#FDFBF7] scale-105 shadow-amber-300/40' 
                      : 'border-2 border-[#E6DFD3] group-hover:border-[#B58E34] group-hover:scale-105'
                  }`}>
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => { e.target.src = '/images/rajasthani-bridal.jpg'; }}
                    />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-xs border border-amber-100">
                      {cat.icon}
                    </span>
                  </div>
                  <div>
                    <span className={`block text-xs sm:text-sm font-serif tracking-tight whitespace-nowrap transition-colors ${
                      isActive ? 'text-[#B58E34] font-bold' : 'text-[#4A2511] font-semibold'
                    }`}>
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-stone-500 hidden sm:block">{cat.tag}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED DESIGNS - VISIBLE ON FIRST SCROLL ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3 mb-4 sm:mb-6 pb-2.5 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#B58E34]">
                Curated For {city}
              </span>
              {selectedCategory !== 'ALL' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4A2511] text-amber-200">
                  {selectedCategory}
                </span>
              )}
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A2511] mt-0.5">
              {selectedCategory === 'ALL' ? 'Trending Mehendi Designs' : `${selectedCategory} Collection`}
            </h2>
          </div>

          <Link
            to={`/designs${selectedCategory !== 'ALL' ? `?category=${encodeURIComponent(selectedCategory)}` : ''}`}
            className="text-xs font-bold text-[#B58E34] hover:text-[#4A2511] flex items-center gap-1 shrink-0 pb-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Mobile Grid / 3-Column Desktop */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-xl bg-white border border-stone-200 p-3 space-y-2 animate-pulse">
                <div className="w-full aspect-[4/5] bg-stone-200 rounded-lg"></div>
                <div className="h-3.5 bg-stone-200 rounded w-2/3"></div>
                <div className="h-3 bg-stone-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {displayedDesigns.map((design) => (
              <DesignCard key={design.id} design={design} currentCity={city} />
            ))}
          </div>
        )}

        {/* Catalog Jump CTA */}
        <div className="mt-6 text-center">
          <Link
            to="/designs"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#4A2511] text-amber-100 hover:bg-[#3A1D0D] font-serif text-xs font-bold transition shadow-sm"
          >
            <span>Explore All 20+ Henna Motifs in Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E8C87A]" />
          </Link>
        </div>
      </section>

      {/* ── 3. Compact Royal Bridal Suite Spotlight ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-[#4A2511] via-[#3A1D0D] to-[#241711] text-amber-50 shadow-xl border border-[#B58E34]/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left flex-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                Signature Bridal Experience
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
                Royal Bridal & Family Package
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl leading-relaxed">
                Add 4+ designs to your cart for our <strong>Dual-Artisan Suite</strong>: 1 Dedicated Lead Master for the Bride, plus 1 Associate Artist for sisters and family in parallel with zero delays.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
              <Link
                to="/designs?category=Bridal"
                className="w-full md:w-auto px-6 py-2.5 rounded-full bg-[#B58E34] text-stone-950 font-bold text-xs uppercase tracking-wider text-center shadow-md hover:brightness-105 transition"
              >
                Explore Bridal Designs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. The Shringar Promise (4 Trust Pillars) ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="p-5 sm:p-8 rounded-2xl bg-white border border-[#E6DFD3] shadow-xs">
          <div className="text-center max-w-md mx-auto mb-6">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B58E34]">
              The Shringar Promise
            </span>
            <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#4A2511] mt-0.5">
              Why Patrons Trust Us
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-3 sm:p-4 rounded-xl bg-[#FDFBF7] border border-[#E6DFD3]/80 space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-[#B58E34] flex items-center justify-center mx-auto text-base">
                🌿
              </div>
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A2511]">Mehendi by Preference</h4>
              <p className="text-[10px] sm:text-xs text-stone-500 leading-normal">
                Store-available quality cones selected strictly by your choice.
              </p>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-[#FDFBF7] border border-[#E6DFD3]/80 space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-[#B58E34] flex items-center justify-center mx-auto text-base">
                👑
              </div>
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A2511]">Certified Masters</h4>
              <p className="text-[10px] sm:text-xs text-stone-500 leading-normal">
                Resident style specialists assigned to your chosen motif.
              </p>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-[#FDFBF7] border border-[#E6DFD3]/80 space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-[#B58E34] flex items-center justify-center mx-auto text-base">
                ⏰
              </div>
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A2511]">Scheduled Pauses</h4>
              <p className="text-[10px] sm:text-xs text-stone-500 leading-normal">
                Tea & drying pauses for relaxed, fatigue-free ceremonies.
              </p>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-[#FDFBF7] border border-[#E6DFD3]/80 space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-[#B58E34] flex items-center justify-center mx-auto text-base">
                🛡️
              </div>
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A2511]">Verified UPI Token</h4>
              <p className="text-[10px] sm:text-xs text-stone-500 leading-normal">
                Secure advance token verified directly by our admin team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Bridal Love (Testimonials) ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-[#FDFBF7] border border-[#E6DFD3] rounded-2xl p-5 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#B58E34]">
                Bridal Reviews
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#4A2511]">
                Real Stories From Brides
              </h3>
            </div>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.9 / 5.0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            {testimonials.slice(0, 2).map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-white border border-[#E6DFD3] space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-[#4A2511] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {t.occasion}
                  </span>
                </div>
                <p className="text-xs text-stone-700 italic font-serif leading-relaxed">
                  "{t.review}"
                </p>
                <div className="text-[11px] font-bold text-[#4A2511] pt-1 flex items-center justify-between">
                  <span>{t.clientName}</span>
                  <span className="text-[10px] text-stone-400 font-normal">{t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Clean Booking CTA ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-2xl bg-[#4A2511] text-amber-100 text-center space-y-3 shadow-lg border border-[#B58E34]/40">
          <Crown className="w-8 h-8 text-[#E8C87A] mx-auto" />
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-amber-100">
            Reserve Your Auspicious Date
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/80 max-w-md mx-auto leading-relaxed">
            Our certified master artists book up fast during wedding and festive seasons in <strong>{city}</strong>.
          </p>
          <div className="pt-2">
            <Link
              to="/designs"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#B58E34] text-stone-950 font-bold text-xs uppercase tracking-wider hover:brightness-105 shadow-md transition"
            >
              <span>Explore Designs & Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

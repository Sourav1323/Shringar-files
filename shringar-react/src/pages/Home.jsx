import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Clock, Award, Star, Heart, Compass } from 'lucide-react';
import { DesignsAPI, ArtistsAPI, TestimonialsAPI } from '../services/api';
import DesignCard from '../components/designs/DesignCard';
import AiTryOnModal from '../components/ai/AiTryOnModal';

export default function Home() {
  const [featuredDesigns, setFeaturedDesigns] = useState([]);
  const [artists, setArtists] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { name: 'Bridal', icon: '🤲', subtitle: 'Royal Full Hand & Marwari Jaal' },
    { name: 'Arabic', icon: '🌿', subtitle: 'Flowing Trails & Floral Shading' },
    { name: 'Minimal', icon: '🌸', subtitle: 'Delicate Vines & Cuffs' },
    { name: 'Fusion', icon: '🌺', subtitle: 'Indo-Western Geometry' },
    { name: 'Mughal', icon: '🕌', subtitle: 'Classic Arches & Domed Minarets' },
  ];

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [designsData, artistsData, testimonialsData] = await Promise.allSettled([
          DesignsAPI.getAll(),
          ArtistsAPI.getAll(),
          TestimonialsAPI.getAll(),
        ]);

        if (designsData.status === 'fulfilled' && Array.isArray(designsData.value)) {
          // On Home, only show curated top 6 designs!
          setFeaturedDesigns(designsData.value.slice(0, 6));
        } else {
          // Fallback static top designs
          setFeaturedDesigns([
            {
              id: 1,
              name: 'Rajasthani Bridal',
              description: 'A masterpiece inspired by the royal courts of Rajasthan. Intricate peacocks, paisleys, and latticework.',
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
              description: 'Delicate blooms and fine lines for the modern minimalist. Perfect for receptions and casual events.',
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
              description: 'Bold Arabic strokes with floral fills. The most requested design for engagement ceremonies.',
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
              name: 'Peacock Bridal Feet',
              description: 'Majestic peacock feather patterns with fine detailing covering both feet and ankles beautifully.',
              category: 'Bridal',
              coverage: 'Both feet',
              durationMinHours: 2,
              durationMaxHours: 2,
              conesNeeded: 1.5,
              price: 1800,
              badge: 'Bridal',
              imageUrl: '/images/peacock-feet.png',
            },
            {
              id: 5,
              name: 'Indo-Arabic Fusion',
              description: 'The best of both worlds — Indian mandala roots with Arabic flowing strokes.',
              category: 'Fusion',
              coverage: 'Full hand',
              durationMinHours: 2.5,
              durationMaxHours: 2.5,
              conesNeeded: 2,
              price: 2000,
              badge: 'Fusion',
              imageUrl: '/images/indo-arabic.png',
            },
            {
              id: 6,
              name: 'Mughal Classic',
              description: 'Inspired by Mughal architecture — domed arches, geometric lattice and vine scrollwork.',
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
        } else {
          setArtists([
            { id: 1, name: 'Pooja Verma', experienceYears: 7, rating: 4.9, bookingsCompleted: 340, city: 'Delhi NCR' },
            { id: 2, name: 'Ananya Roy', experienceYears: 5, rating: 4.8, bookingsCompleted: 215, city: 'Mumbai' },
            { id: 3, name: 'Ritu Mehendi Artist', experienceYears: 9, rating: 5.0, bookingsCompleted: 580, city: 'Jaipur' },
          ]);
        }

        if (testimonialsData.status === 'fulfilled' && Array.isArray(testimonialsData.value)) {
          setTestimonials(testimonialsData.value);
        } else {
          setTestimonials([
            { id: 1, clientName: 'Aarushi Mehta', rating: 5, occasion: 'Wedding Ceremony', reviewText: 'The Rajasthani Bridal design stayed dark for nearly 3 weeks! Pooja arrived right on time with natural cones that had the most calming eucalyptus aroma.' },
            { id: 2, clientName: 'Simran Kaur', rating: 5, occasion: 'Engagement Party', reviewText: 'Used the AI Try-On tool to match my hand shape and the suggested Arabic pattern looked so breathtaking. 10/10 recommend Shringar!' },
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

  return (
    <div className="space-y-20 pb-16">
      
      {/* ── 1. Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-maroon via-brand-maroon-dark to-brand-dark text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b-2 border-brand-gold/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-brand-gold/50 text-xs font-semibold text-brand-gold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-spin" />
              <span>Royal Couture & AI-Powered Mehendi Art</span>
            </div>

            <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-black tracking-wide leading-tight">
              Adorn Your Hands in <br />
              <span className="gold-gradient-text">Timeless Heritage</span>
            </h1>

            <p className="text-sm sm:text-base text-brand-cream/85 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              From majestic Marwari bridal peacocks to delicate modern cuffs. Book vetted master mehendi artists delivered directly to your doorstep with 100% natural organic henna.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/designs"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-brand-gold via-amber-400 to-brand-gold-dark text-brand-dark font-bold text-sm tracking-wider uppercase shadow-xl hover:brightness-110 transition flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Full Catalog</span>
              </Link>

              <button
                onClick={() => setAiModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-brand-gold/40 text-brand-gold font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Virtual AI Hand Try-On</span>
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-brand-cream/70 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-gold" /> Chemical-Free Cones
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-gold" /> On-Time Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-gold" /> 4.9★ Rated Artists
              </span>
            </div>
          </div>

          {/* Hero Banner Visual */}
          <div className="flex-1 relative max-w-md lg:max-w-none">
            <div className="relative mx-auto w-72 sm:w-80 lg:w-96 aspect-[3/4] rounded-3xl overflow-hidden border-4 border-brand-gold shadow-2xl shadow-brand-gold/20 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src="/images/mehendi-banner.jpg"
                alt="Bridal Mehendi Art"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/images/rajasthani-bridal.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-brand-gold">
                    Signature Wedding Special
                  </span>
                  <div className="text-base font-cinzel font-bold text-white">
                    Royal Rajasthani Heritage Henna
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. Category Browse Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-gold-dark">
            Curated Collections
          </span>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-brand-dark mt-1">
            Choose by Aesthetic & Tradition
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/designs?category=${encodeURIComponent(cat.name)}`)}
              className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-brand-gold hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center justify-center gap-2"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </span>
              <h3 className="font-cinzel font-bold text-sm text-brand-dark group-hover:text-brand-maroon transition">
                {cat.name}
              </h3>
              <p className="text-[11px] text-stone-500 line-clamp-1">{cat.subtitle}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── 3. Featured Designs Preview (Limited to 6 on Home) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-gold-dark">
              Featured Preview
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-brand-dark mt-1">
              Top Trending Mehendi Designs
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Showing 6 handpicked bridal & festive highlights from our catalog.
            </p>
          </div>

          {/* Prominent Separate Catalog Route Button */}
          <Link
            to="/designs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-maroon hover:bg-brand-maroon-dark text-white font-semibold text-xs tracking-wide shadow transition"
          >
            <span>Browse All Designs ({featuredDesigns.length}+)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6-Grid Design Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDesigns.map((design) => (
            <DesignCard key={design.id} design={design} />
          ))}
        </div>

        {/* Full Catalog Banner Banner CTA */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-amber-50 via-stone-50 to-amber-100/60 border-2 border-brand-gold/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md text-center md:text-left">
          <div className="space-y-1">
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-brand-maroon">
              Looking for something more specific?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
              Explore our complete library of Full Hand, Feet, Half Hand, Arabic Trails, and Minimalist engagement patterns with filter by cones, coverage, and budget.
            </p>
          </div>
          <Link
            to="/designs"
            className="px-8 py-3.5 rounded-full bg-brand-maroon hover:bg-brand-maroon-dark text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition flex-shrink-0 flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-brand-gold" />
            <span>Open Dedicated Designs Page</span>
          </Link>
        </div>
      </section>

      {/* ── 4. Virtual AI Try-On Showcase Card ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-maroon via-brand-dark to-slate-900 text-white p-8 sm:p-12 border-2 border-brand-gold/50 shadow-2xl">
          <div className="max-w-xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-brand-gold text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Royal AI Palm & Skin Analysis</span>
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-4xl font-bold gold-gradient-text">
              Not sure which design suits your hands?
            </h2>
            <p className="text-xs sm:text-sm text-brand-cream/80 leading-relaxed font-light">
              Snap a photo of your palm. Our advanced AI model analyzes your skin undertone and hand proportions to match you with flattering patterns instantly.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setAiModalOpen(true)}
                className="px-6 py-3 rounded-full bg-brand-gold text-brand-dark font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition flex items-center gap-2"
              >
                <span>Launch Virtual Camera</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/ai-tryon"
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition"
              >
                Learn How AI Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Mehendi Artists Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-gold-dark">
            Verified Professionals
          </span>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-brand-dark mt-1">
            Meet Our Master Henna Artisans
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Background-verified, certified organic cone practitioners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {artists.map((art) => (
            <div
              key={art.id}
              className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition text-center flex flex-col items-center justify-between"
            >
              <div className="w-20 h-20 rounded-full bg-brand-maroon text-brand-gold border-2 border-brand-gold font-serif-luxury text-2xl font-bold flex items-center justify-center shadow-md mb-3">
                {art.name.charAt(0)}
              </div>
              <h4 className="font-cinzel font-bold text-base text-brand-dark">{art.name}</h4>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{art.rating || 4.9}</span>
                <span className="text-stone-400 font-normal">({art.bookingsCompleted || 100}+ events)</span>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                {art.experienceYears || 5}+ Years Experience • Based in {art.city || 'Delhi NCR'}
              </p>
              <Link
                to="/booking"
                className="mt-4 px-4 py-2 rounded-xl bg-brand-cream-dark hover:bg-brand-maroon hover:text-white text-brand-dark text-xs font-semibold transition w-full"
              >
                Book with {art.name.split(' ')[0]}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Testimonials Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-brand-maroon">
              Bridal Love
            </span>
            <h2 className="font-cinzel text-2xl font-bold text-brand-dark mt-1">
              Words From Our Brides
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-brand-gold-dark uppercase tracking-wider">
                    {t.occasion}
                  </span>
                </div>
                <p className="text-xs text-stone-600 italic leading-relaxed">
                  "{t.reviewText}"
                </p>
                <div className="text-xs font-bold text-brand-dark pt-1 border-t border-stone-100">
                  — {t.clientName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Try-On Modal */}
      <AiTryOnModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />

    </div>
  );
}

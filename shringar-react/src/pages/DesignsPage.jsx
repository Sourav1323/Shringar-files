import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, Filter, X, ArrowUpDown, Compass, MapPin, CheckCircle2, ChevronDown } from 'lucide-react';
import { DesignsAPI } from '../services/api';
import DesignCard from '../components/designs/DesignCard';
import AiTryOnModal from '../components/ai/AiTryOnModal';
import { useCity } from '../context/CityContext';
import { useCart } from '../context/CartContext';
import { isDesignAvailableInCity } from '../utils/cityUtils';
import { getArtistCompatibility } from '../utils/artistOptimizer';

export default function DesignsPage() {
  const { city, openCityModal } = useCity();
  const { cartItems } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const urlSearch = searchParams.get('search') || searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [coverageFilter, setCoverageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('FEATURED');
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  const selectedCategory = searchParams.get('category') || 'ALL';

  const categories = useMemo(() => {
    const baseCategories = [
      { id: 'ALL', label: 'All Designs' },
      { id: 'Bridal', label: 'Royal Bridal' },
      { id: 'Arabic', label: 'Arabic Florals' },
      { id: 'Minimal', label: 'Minimalist' },
      { id: 'Fusion', label: 'Indo-Arabic' },
      { id: 'Mughal', label: 'Mughal Classic' },
      { id: 'Rajasthani', label: 'Rajasthani Royal' },
    ];
    const map = new Map();
    baseCategories.forEach(c => map.set(c.id.toLowerCase(), c));

    // Dynamically include any category added by admin in the database
    designs.forEach(d => {
      if (d.category) {
        const catClean = d.category.trim();
        const key = catClean.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: catClean,
            label: catClean
          });
        }
      }
    });

    return Array.from(map.values());
  }, [designs]);

  const coverages = [
    { id: 'ALL', label: 'All Coverages' },
    { id: 'Full hand', label: 'Full Hand' },
    { id: 'Half hand', label: 'Half Hand' },
    { id: 'Both hands', label: 'Both Hands' },
    { id: 'Both feet', label: 'Both Feet' },
  ];

  useEffect(() => {
    async function fetchDesigns() {
      setLoading(true);
      try {
        const data = await DesignsAPI.getAll();
        if (Array.isArray(data)) {
          setDesigns(data);
        }
      } catch (err) {
        console.warn('Designs catalog fetch error, loading fallback catalog:', err);
        // Fallback robust catalog data
        setDesigns([
          {
            id: 1,
            name: 'Rajasthani Bridal',
            description: 'A masterpiece inspired by the royal courts of Rajasthan. Intricate peacocks, paisleys, floral jaal patterns.',
            category: 'Bridal',
            coverage: 'Full hand',
            durationMinHours: 3.0,
            durationMaxHours: 4.0,
            conesNeeded: 2.0,
            price: 2500,
            badge: 'Popular',
            badgeColor: '#493313',
            imageUrl: '/images/rajasthani-bridal.jpg',
          },
          {
            id: 2,
            name: 'Floral Minimal',
            description: 'Delicate blooms and fine lines for the modern minimalist. Perfect for receptions and casual events.',
            category: 'Minimal',
            coverage: 'Half hand',
            durationMinHours: 1.0,
            durationMaxHours: 2.0,
            conesNeeded: 1.0,
            price: 800,
            badge: 'New',
            badgeColor: '#7a2c1a',
            imageUrl: '/images/floral-minimal.jpg',
          },
          {
            id: 3,
            name: 'Arabic Glam',
            description: 'Bold Arabic strokes with floral fills. The most requested design for engagement ceremonies.',
            category: 'Arabic',
            coverage: 'Both hands',
            durationMinHours: 2.0,
            durationMaxHours: 3.0,
            conesNeeded: 1.5,
            price: 1500,
            badge: 'Trending',
            badgeColor: '#c9a227',
            imageUrl: '/images/arabic-sawan.jpg',
          },
          {
            id: 4,
            name: 'Royal Dulha-Dulhan Bridal',
            description: 'Handcrafted bride & groom wedding portraits on palms with auspicious kalash and peacocks.',
            category: 'Bridal',
            coverage: 'Full hand',
            durationMinHours: 3.5,
            durationMaxHours: 4.5,
            conesNeeded: 2.5,
            price: 2800,
            badge: 'Signature',
            badgeColor: '#7a2c1a',
            imageUrl: '/images/peacock-feet.png',
          },
          {
            id: 5,
            name: 'Lotus Mandala Bridal Feet',
            description: 'Majestic blooming lotus mandala with ornate ankle payal detailing covering both feet.',
            category: 'Bridal',
            coverage: 'Both feet',
            durationMinHours: 2.0,
            durationMaxHours: 2.5,
            conesNeeded: 1.5,
            price: 1800,
            badge: 'Bridal Feet',
            badgeColor: '#ba7517',
            imageUrl: '/images/indo-arabic.png',
          },
          {
            id: 6,
            name: 'Mughal Classic Arches',
            description: 'Inspired by Mughal architecture — domed arches, geometric lattice and vine scrollwork.',
            category: 'Mughal',
            coverage: 'Full hand',
            durationMinHours: 3.0,
            durationMaxHours: 3.5,
            conesNeeded: 2.0,
            price: 2200,
            badge: 'Classic',
            badgeColor: '#5c3d1e',
            imageUrl: '/images/mughal-classic.jpg',
          },
          {
            id: 7,
            name: 'Sawan Bel Trail',
            description: 'Traditional Sawan vine flowing from index finger diagonally down the forearm with shaded leaf fillers.',
            category: 'Arabic',
            coverage: 'Half hand',
            durationMinHours: 1.5,
            durationMaxHours: 2.0,
            conesNeeded: 1.0,
            price: 950,
            badge: 'Festive',
            badgeColor: '#2d6a4f',
            imageUrl: '/images/arabic-mehndi-sawan.jpg',
          },
          {
            id: 8,
            name: 'Marwari Grand Bridal',
            description: 'Ultra-intricate traditional Marwari full arm wedding henna with bride and groom doli portraits.',
            category: 'Bridal',
            coverage: 'Full hand',
            durationMinHours: 4.0,
            durationMaxHours: 5.5,
            conesNeeded: 3.0,
            price: 3500,
            badge: 'Signature',
            badgeColor: '#7a2c1a',
            imageUrl: '/images/bridal-fullhand.jpg',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchDesigns();
  }, []);

  const handleCategorySelect = (catId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catId === 'ALL') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', catId);
    }
    setSearchParams(nextParams);
  };

  const filteredAndSortedDesigns = useMemo(() => {
    return designs
      .filter((d) => {
        // Category Filter
        if (selectedCategory !== 'ALL' && d.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        // Coverage Filter
        if (coverageFilter !== 'ALL' && d.coverage?.toLowerCase() !== coverageFilter.toLowerCase()) {
          return false;
        }
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = d.name?.toLowerCase().includes(q);
          const matchDesc = d.description?.toLowerCase().includes(q);
          const matchCat = d.category?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_LOW') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'PRICE_HIGH') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'DURATION') return (a.durationMinHours || 0) - (b.durationMinHours || 0);
        if (sortBy === 'POPULAR') return (b.clickCount || 0) - (a.clickCount || 0);
        
        // FEATURED: Algorithmically arrange designs matching the current visiting artist first to minimize artist count
        if (cartItems.length > 0) {
          const matchA = getArtistCompatibility(a, cartItems, city).isMatch ? 1 : 0;
          const matchB = getArtistCompatibility(b, cartItems, city).isMatch ? 1 : 0;
          if (matchB !== matchA) return matchB - matchA;
        }

        return 0;
      });
  }, [designs, selectedCategory, coverageFilter, searchQuery, sortBy, cartItems, city]);

  // Shuffle/rank designs: Location available designs first, followed by the rest in the SAME single list
  const sortedAndShuffledDesigns = useMemo(() => {
    const local = [];
    const rest = [];
    filteredAndSortedDesigns.forEach((d) => {
      if (isDesignAvailableInCity(d, city)) {
        local.push(d);
      } else {
        rest.push(d);
      }
    });
    return [...local, ...rest];
  }, [filteredAndSortedDesigns, city]);

  const relatedDesigns = useMemo(() => {
    if (!designs || designs.length === 0) return [];
    if (selectedCategory === 'ALL') {
      return designs.slice(0, 4);
    }
    const others = designs.filter(
      (d) => d.category?.toLowerCase() !== selectedCategory.toLowerCase()
    );
    return others.length > 0 ? others.slice(0, 4) : designs.slice(0, 4);
  }, [designs, selectedCategory]);

  const resetAllFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');
    nextParams.delete('search');
    nextParams.delete('q');
    setSearchParams(nextParams);
    setCoverageFilter('ALL');
    setSearchQuery('');
    setSortBy('FEATURED');
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || coverageFilter !== 'ALL' || searchQuery.trim() !== '';

  return (
    <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* ── Page Header & Breadcrumbs ── */}
      <div className="bg-[#FFFFFF] border border-[#E6DFD3] rounded-sm p-8 sm:p-12 shadow-sm relative overflow-hidden" data-testid="designs-header">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="shr-overline shr-gold-line text-[#B58E34]">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">/</span>
            <span>The Collection</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#4A2511] tracking-tight">
            Handcrafted Mehndi Catalogue
          </h1>

          <p className="text-sm text-[#7A6356] leading-relaxed">
            Browse our full library of bridal, festive, and contemporary henna patterns. Filter by placement, duration, and mehendi cones required.
          </p>

          {/* Connected Flow Step 2 Capsule */}
          <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-full bg-[#F3EFE6] border border-[#B58E34]/30 text-xs font-semibold text-[#4A2511] shadow-2xs mt-2">
            <span className="w-4 h-4 rounded-full bg-[#B58E34] text-white flex items-center justify-center text-[10px]">2</span>
            <span>Step 2 of 3: Choosing Motifs in <strong>{city}</strong></span>
            <button
              onClick={openCityModal}
              className="text-[#B58E34] hover:underline ml-1 text-[11px] inline-flex items-center gap-0.5"
            >
              <span>(Change City)</span>
              <ChevronDown className="w-3 h-3 text-[#B58E34]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bespoke Custom Design Callout Banner ── */}
      <div className="bg-gradient-to-r from-amber-50 via-brand-cream to-amber-50 border border-brand-gold/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-maroon/10 text-brand-maroon flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-brand-maroon" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-brand-maroon">
              Want a Bespoke Bridal Motif or Custom Couple Portrait?
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              Submit your reference sketch or photo for master artist review, get an instant quote & book your ceremony with an advance token.
            </p>
          </div>
        </div>
        <Link
          to="/custom-design"
          className="px-5 py-2.5 bg-brand-maroon text-brand-gold font-serif font-bold text-xs rounded-full hover:bg-brand-maroon-dark transition shadow-md shrink-0 flex items-center gap-1.5"
        >
          <span>Commission Custom Design</span>
          <Compass className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Category Filter Pills Bar ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-5 py-2 rounded-sm text-xs font-medium tracking-wider uppercase whitespace-nowrap transition-all shadow-sm ${
                isSelected
                  ? 'bg-[#4A2511] text-[#FDFBF7] border border-[#4A2511] shadow'
                  : 'bg-white text-[#2C160A] border border-[#E6DFD3] hover:border-[#B58E34] hover:bg-[#F3EFE6]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Secondary Controls: Search, Coverage & Sort Bar ── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by design name, peacock, mandala, floral..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          
          {/* Coverage Selector */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-brand-gold-dark hidden sm:block" />
            <select
              value={coverageFilter}
              onChange={(e) => setCoverageFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 bg-white focus:outline-none focus:border-brand-gold"
            >
              {coverages.map((cov) => (
                <option key={cov.id} value={cov.id}>
                  {cov.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <ArrowUpDown className="w-4 h-4 text-brand-gold-dark hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 bg-white focus:outline-none focus:border-brand-gold"
            >
              <option value="FEATURED">Sort: Featured</option>
              <option value="PRICE_LOW">Price: Low to High</option>
              <option value="PRICE_HIGH">Price: High to Low</option>
              <option value="DURATION">Duration: Shortest First</option>
              <option value="POPULAR">Most Popular</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs text-brand-maroon hover:underline font-semibold flex items-center gap-1 px-2 py-2"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

        </div>

      </div>

      {/* ── Results Count Bar ── */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
        <span>
          Showing <strong className="text-stone-800">{filteredAndSortedDesigns.length}</strong> {filteredAndSortedDesigns.length === 1 ? 'design' : 'designs'}
          {selectedCategory !== 'ALL' && ` in "${selectedCategory}"`}
        </span>
        {hasActiveFilters && (
          <span className="text-brand-gold-dark font-semibold">Active Filter Mode</span>
        )}
      </div>

      {/* ── Unified Designs Grid: Location available motifs shuffled first, followed by the rest ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-60 sm:h-80 rounded-2xl bg-stone-200 animate-pulse"></div>
          ))}
        </div>
      ) : sortedAndShuffledDesigns.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {sortedAndShuffledDesigns.map((design) => {
            const isLocal = isDesignAvailableInCity(design, city);
            return (
              <DesignCard 
                key={design.id} 
                design={design} 
                isLocalAvailable={isLocal} 
                currentCity={city} 
              />
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 rounded-3xl bg-white border border-stone-200 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-brand-gold-dark flex items-center justify-center mx-auto text-2xl border border-amber-200">
            🔍
          </div>
          <h3 className="font-cinzel font-bold text-lg text-brand-dark">
            No Designs Match Your Criteria
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Try resetting your search query or selecting "All Designs" to browse through our entire collection.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-6 py-2.5 rounded-full bg-brand-maroon text-white text-xs font-bold tracking-wider uppercase shadow hover:bg-brand-maroon-dark transition"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* ── Related & Trending Designs (Shown in all categories per user requirement) ── */}
      {relatedDesigns.length > 0 && (
        <div className="pt-10 border-t border-stone-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-brand-maroon flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-gold" />
                {selectedCategory === 'ALL'
                  ? 'Trending & Curated Masterpieces You Might Love'
                  : `Curated Picks & Complementary Motifs in Other Styles`}
              </h3>
              <p className="text-stone-500 text-xs mt-0.5">
                {selectedCategory === 'ALL'
                  ? 'Handpicked artisan creations celebrating Rajasthan, Arabic, and Modern aesthetics'
                  : `Complement your ${selectedCategory} selection with these trending bridal and festive styles`}
              </p>
            </div>
            {selectedCategory !== 'ALL' && (
              <button
                onClick={() => handleCategorySelect('ALL')}
                className="text-xs font-serif font-bold text-brand-maroon hover:text-brand-gold underline underline-offset-4 hidden sm:block"
              >
                Browse All Collections →
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedDesigns.map((rDesign) => (
              <DesignCard key={'rel-' + rDesign.id} design={rDesign} />
            ))}
          </div>
        </div>
      )}

      {/* AI Try-On Modal temporarily commented out
      <AiTryOnModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      */}

    </div>
  );
}

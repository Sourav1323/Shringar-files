import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, Sparkles, Check, ArrowLeft, ShoppingBag, 
  ShieldCheck, Calendar, Heart, Eye, ArrowRight, Star, Layers,
  ChevronLeft, ChevronRight, CheckCircle2, Award, Info, Maximize2
} from 'lucide-react';
import { DesignsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCity } from '../context/CityContext';
import { getRecommendedDesignsForMinimalArtists } from '../utils/artistOptimizer';
import DesignCard from '../components/designs/DesignCard';
import ImageGalleryViewer from '../components/common/ImageGalleryViewer';

// Master Catalog Database with 4 Distinct Angles for Every Single Design
const ALL_DESIGNS_MASTER = [
  {
    id: 1,
    name: 'Rajasthani Bridal Jaal',
    description: 'A regal masterpiece inspired by the royal courts of Rajasthan. Intricate peacocks, royal palanquin (doli), auspicious kalash, and fine geometric jaali latticework covering palms and arms.',
    category: 'Bridal',
    coverage: 'Full hand (Elbow)',
    durationMinHours: 3,
    durationMaxHours: 4,
    conesNeeded: 2,
    price: 2500,
    badge: 'Popular',
    badgeColor: '#7a2c1a',
    imageUrl: '/images/rajasthani-bridal.jpg',
    angles: [
      {
        id: 'front',
        title: 'Front Palm & Fingers',
        badge: 'Palm View',
        subtitle: 'Intricate peacock medallion with dense shading on inner palms and fingertips.',
        imageUrl: '/images/rajasthani-bridal.jpg',
        notes: 'Handcrafted central peacocks with traditional teardrop paisleys and shaded floral filler cones.'
      },
      {
        id: 'back',
        title: 'Back Side Hand Pattern',
        badge: 'Back View',
        subtitle: 'Elaborate bridal lace mesh and royal haathphool jewelry chain illusion.',
        imageUrl: '/images/Traditional-Rajasthani-Bridal-Henna-Mehendi-Design---Full-hand-Marwari-Mehendi-for-Indian-Wedding-2.jpg',
        notes: 'Covers the knuckles and back of hands with intricate net embroidery and auspicious floral bands.'
      },
      {
        id: 'wrist',
        title: 'Wrist & Forearm Cuff',
        badge: 'Cuff & Forearm',
        subtitle: 'Symmetrical palace archways and dome pillars extending to the mid-forearm.',
        imageUrl: '/images/Bridal-Full-Hand-Mehndi-Designs-for-Wedding-Day-2.jpg',
        notes: 'Multiple layers of bangles and lotus cuffs that elegantly transition into the forearm jaali.'
      },
      {
        id: 'full',
        title: 'Full Ceremonial Layout',
        badge: 'Full Ensemble',
        subtitle: 'Complete bilateral view of both hands paired with traditional wedding bangles.',
        imageUrl: '/images/bridal-fullhand.jpg',
        notes: 'Perfect symmetrical balance for high-definition wedding photography and ritual close-ups.'
      }
    ]
  },
  {
    id: 2,
    name: 'Floral Minimalist Bloom',
    description: 'Delicate blooms, fine leaf trails, and airy negative space crafted for the modern minimalist. Perfect for receptions, haldi ceremonies, bridesmaids, and cocktail parties.',
    category: 'Minimal',
    coverage: 'Half hand',
    durationMinHours: 1,
    durationMaxHours: 2,
    conesNeeded: 1,
    price: 800,
    badge: 'New',
    badgeColor: '#2d6a4f',
    imageUrl: '/images/floral-minimal.jpg',
    angles: [
      {
        id: 'front',
        title: 'Front Palm Bloom',
        badge: 'Palm View',
        subtitle: 'Clean circular blooming lotus mandala centered on palm with gentle dot work.',
        imageUrl: '/images/floral-minimal.jpg',
        notes: 'Minimalist focal mandala that allows natural skin tone to shine through.'
      },
      {
        id: 'back',
        title: 'Back Hand Foliage',
        badge: 'Back View',
        subtitle: 'Dainty vine wrapping the index finger with delicate knuckle accents.',
        imageUrl: '/images/artistic-design.png',
        notes: 'A contemporary single-finger ring chain that looks effortlessly elegant with rings.'
      },
      {
        id: 'wrist',
        title: 'Wrist Bracelet Accent',
        badge: 'Wrist View',
        subtitle: 'Single-tier beaded bracelet line with micro leaf charms.',
        imageUrl: '/images/simple-arabic-mehndi-designs-for-left-hand-henna-by-mahira-mohsin-leaf-arabic-mehndi-design.jpg',
        notes: 'Lightweight wrist cuff that beautifully complements wristwatches and diamond bracelets.'
      },
      {
        id: 'full',
        title: 'Complete Minimalist Look',
        badge: 'Side Profile',
        subtitle: 'Subtle side silhouette perfect for bridesmaid photo sessions.',
        imageUrl: '/images/floral-minimal.jpg',
        notes: 'Fast 1-hour application ideal for groups or busy pre-wedding event schedules.'
      }
    ]
  },
  {
    id: 3,
    name: 'Arabic Glam Sawan Bel',
    description: 'Bold Arabic strokes with deep botanical fills and shaded leaf trails. The most requested motif for sangeet parties, engagements, and festive celebrations.',
    category: 'Arabic',
    coverage: 'Both hands',
    durationMinHours: 2,
    durationMaxHours: 3,
    conesNeeded: 1.5,
    price: 1500,
    badge: 'Trending',
    badgeColor: '#b45309',
    imageUrl: '/images/arabic-sawan.jpg',
    angles: [
      {
        id: 'front',
        title: 'Front Diagonal Trail',
        badge: 'Palm Trail',
        subtitle: 'Bold shaded flower clusters flowing diagonally from pointer finger across palm.',
        imageUrl: '/images/arabic-sawan.jpg',
        notes: 'Rich contrasting dark and light shading creates dramatic depth on photographs.'
      },
      {
        id: 'back',
        title: 'Back Hand Sawan Vine',
        badge: 'Back View',
        subtitle: 'Gracefully arching vine on the back of hand with detailed leaf borders.',
        imageUrl: '/images/arabic-mehndi-sawan.jpg',
        notes: 'Extends from the middle finger down to the outer wrist in flowing curves.'
      },
      {
        id: 'wrist',
        title: 'Connecting Wrist Scroll',
        badge: 'Wrist Scroll',
        subtitle: 'Botanical flourish framing the wrist joint seamlessly.',
        imageUrl: '/images/simple-arabic.jpg',
        notes: 'Leaves and spiral scrolls that terminate neatly before the forearm.'
      },
      {
        id: 'full',
        title: 'Dual Hand Harmony',
        badge: 'Both Hands',
        subtitle: 'Mirrored Arabic flow across both hands creating an organic chevron pattern.',
        imageUrl: '/images/arabic-sawan.jpg',
        notes: 'Dramatic visual symmetry when bride joins hands in prayer or greeting.'
      }
    ]
  },
  {
    id: 4,
    name: 'Royal Dulha-Dulhan Bridal Portraits',
    description: 'Ultra-luxurious traditional wedding henna featuring handcrafted miniature portraits of the bride and groom on palms, accompanied by auspicious Kalash and wedding shehnai motifs.',
    category: 'Bridal',
    coverage: 'Full hand (Elbow)',
    durationMinHours: 3.5,
    durationMaxHours: 4.5,
    conesNeeded: 2.5,
    price: 2800,
    badge: 'Signature',
    badgeColor: '#7a2c1a',
    imageUrl: '/images/peacock-feet.png',
    angles: [
      {
        id: 'front',
        title: 'Dulha-Dulhan Palm Portraits',
        badge: 'Portrait Palm',
        subtitle: 'Custom bride and groom miniature portraits hand-drawn in center of both palms.',
        imageUrl: '/images/peacock-feet.png',
        notes: 'Iconic wedding centerpiece portraying the couple amidst floral garlands.'
      },
      {
        id: 'back',
        title: 'Back Hand Royal Lattice',
        badge: 'Back View',
        subtitle: 'Heavy Marwari diamond mesh on back of hand with ornate ring caps.',
        imageUrl: '/images/Bridal-Full-Hand-Mehndi-Designs-for-Wedding-Day-2.jpg',
        notes: 'Dense traditional jaali work that mimics jeweled gold gloves.'
      },
      {
        id: 'wrist',
        title: 'Cuff & Bangle Detailing',
        badge: 'Forearm Jaal',
        subtitle: 'Three-tiered temple arch border wrapping the forearm firmly.',
        imageUrl: '/images/rajasthani-bridal.jpg',
        notes: 'Includes carved elephant motifs and auspicious sacred Kalash pot details.'
      },
      {
        id: 'full',
        title: 'Grand Mandap Ensemble',
        badge: 'Ceremonial',
        subtitle: 'Full ceremonial view of both arms showcasing flawless density from elbow to tips.',
        imageUrl: '/images/bridal-fullhand.jpg',
        notes: 'The definitive royal look for brides desiring maximum traditional richness.'
      }
    ]
  },
  {
    id: 5,
    name: 'Lotus Mandala Bridal Feet & Ankles',
    description: 'Majestic blooming lotus mandala with ornate ankle payal detailing covering both feet and ankles beautifully for the grand wedding mandap and royal entry.',
    category: 'Bridal',
    coverage: 'Both feet',
    durationMinHours: 2,
    durationMaxHours: 2.5,
    conesNeeded: 1.5,
    price: 1800,
    badge: 'Bridal Feet',
    badgeColor: '#ba7517',
    imageUrl: '/images/indo-arabic.png',
    angles: [
      {
        id: 'front',
        title: 'Top Instep Lotus Mandala',
        badge: 'Instep Center',
        subtitle: 'Sacred blooming lotus medallion centered on the top of both feet.',
        imageUrl: '/images/indo-arabic.png',
        notes: 'Intricately shaded lotus petals surrounded by geometric sunburst ringlets.'
      },
      {
        id: 'back',
        title: 'Anklet Payal Detailing',
        badge: 'Ankle Cuff',
        subtitle: 'Ornate henna payal lace strap wrapping around the ankle bone.',
        imageUrl: '/images/indo-arabic.png',
        notes: 'Replaces or complements silver bridal anklets with delicate hanging pearl drop motifs.'
      },
      {
        id: 'wrist',
        title: 'Toe Ring & Border Motifs',
        badge: 'Toe Caps',
        subtitle: 'Fine geometric toe ring caps and scalloped sole borders.',
        imageUrl: '/images/indo-arabic.png',
        notes: 'Fine lines framing each toe with floral buds that peek out of bridal footwear.'
      },
      {
        id: 'full',
        title: 'Standing Mandap Entry',
        badge: 'Both Feet View',
        subtitle: 'Full bilateral perspective of both feet aligned side-by-side.',
        imageUrl: '/images/indo-arabic.png',
        notes: 'Stunning angle for pheras around the sacred fire and red bridal lehenga hem shots.'
      }
    ]
  },
  {
    id: 6,
    name: 'Mughal Classic Arches',
    description: 'Inspired by imperial Mughal palace architecture — domed jharokha arches, geometric lattice window screens, and cascading vine scrollwork extending along the hand.',
    category: 'Mughal',
    coverage: 'Full hand',
    durationMinHours: 3,
    durationMaxHours: 3.5,
    conesNeeded: 2,
    price: 2200,
    badge: 'Classic',
    badgeColor: '#5c3d1e',
    imageUrl: '/images/mughal-classic.jpg',
    angles: [
      {
        id: 'front',
        title: 'Front Palace Arches',
        badge: 'Palm Arches',
        subtitle: 'Domed jharokha arches with symmetrical central floral medallion.',
        imageUrl: '/images/mughal-classic.jpg',
        notes: 'Architectural precision with straight line jaali grids and minaret motifs.'
      },
      {
        id: 'back',
        title: 'Back Hand Lattice Screen',
        badge: 'Back Screen',
        subtitle: 'Intricate Mughal window filigree on reverse side of the hand.',
        imageUrl: '/images/af86415e3d8798ca4ea4afd26c012515.jpg',
        notes: 'Diamond-cut negative space pattern that resembles carved sandstone screens.'
      },
      {
        id: 'wrist',
        title: 'Wrist Mihrab Detailing',
        badge: 'Wrist Mihrab',
        subtitle: 'Pointed archway borders with micro floral jaal fill on the wrist.',
        imageUrl: '/images/6bcda4968a97c917386fd1949422fffb.jpg',
        notes: 'Dense architectural border creating a seamless connection to the forearm.'
      },
      {
        id: 'full',
        title: 'Side Contour Angle',
        badge: 'Full Perspective',
        subtitle: 'Graceful architectural contouring along the edge of hand and palm.',
        imageUrl: '/images/mughal-classic.jpg',
        notes: 'Clean geometric lines that flatter hands of all shapes and sizes.'
      }
    ]
  }
];

export default function DesignDetailPage() {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [selectedCoverageTier, setSelectedCoverageTier] = useState('standard'); // 'palm' | 'standard' | 'grand'
  const [galleryViewerOpen, setGalleryViewerOpen] = useState(false);

  const { cartItems, addToCart, updateQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showSuccess } = useToast();
  const { city } = useCity();
  const navigate = useNavigate();

  const currentDesign = design || ALL_DESIGNS_MASTER.find((d) => String(d.id) === String(id)) || ALL_DESIGNS_MASTER[0];

  const cartItem = cartItems.find((item) => String(item.id) === String(currentDesign.id));
  const quantity = cartItem?.quantity || 0;
  const isInCart = quantity > 0;

  const singleArtistPairings = useMemo(() => {
    return getRecommendedDesignsForMinimalArtists([currentDesign], ALL_DESIGNS_MASTER, city, 4);
  }, [currentDesign, city]);

  useEffect(() => {
    async function loadDesign() {
      setLoading(true);
      try {
        const data = await DesignsAPI.getById(id).catch(() => null);
        const masterItem = ALL_DESIGNS_MASTER.find((d) => String(d.id) === String(id)) || ALL_DESIGNS_MASTER[0];

        if (data && data.name) {
          // Construct real dynamic angles from the design's own uploaded images:
          let dynamicAngles = [];
          
          if (data.imageUrl) {
            dynamicAngles.push({
              id: 'front',
              title: `${data.name} - Front View`,
              badge: data.coverage || 'Primary View',
              subtitle: data.description || 'Master artisan handcrafted motif',
              notes: 'Handcrafted master motif with traditional detailing.',
              imageUrl: data.imageUrl,
            });
          }

          if (Array.isArray(data.galleryImageUrls) && data.galleryImageUrls.length > 0) {
            data.galleryImageUrls.forEach((imgUrl, idx) => {
              dynamicAngles.push({
                id: `angle-${idx + 1}`,
                title: `${data.name} - Angle ${idx + 2}`,
                badge: `Angle ${idx + 2}`,
                subtitle: 'Close-up perspective & detail view',
                notes: 'Fine artisan linework and shading details.',
                imageUrl: imgUrl,
              });
            });
          }

          // If no custom images exist, fall back to master angles if available
          if (dynamicAngles.length === 0) {
            dynamicAngles = masterItem?.angles || [
              {
                id: 'front',
                title: data.name,
                badge: data.coverage || 'Full View',
                subtitle: data.description || 'Master artisan motif',
                notes: 'Handcrafted master motif with traditional detailing.',
                imageUrl: data.imageUrl || '/images/rajasthani-bridal.jpg',
              }
            ];
          }

          setDesign({
            ...data,
            angles: dynamicAngles,
          });
        } else if (masterItem) {
          setDesign(masterItem);
        } else {
          setDesign(ALL_DESIGNS_MASTER[0]);
        }
      } catch (err) {
        const fallback = ALL_DESIGNS_MASTER.find((d) => String(d.id) === String(id)) || ALL_DESIGNS_MASTER[0];
        setDesign(fallback);
      } finally {
        setLoading(false);
      }
    }

    loadDesign();
    setActiveAngleIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-brand-maroon border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-stone-500 mt-4 font-serif">Curating Royal Mehendi Catalogue & Angles…</p>
      </div>
    );
  }

  const angles = currentDesign?.angles?.length ? currentDesign.angles : ALL_DESIGNS_MASTER[0].angles;
  const currentAngle = angles[activeAngleIndex] || angles[0] || {
    id: 'front',
    title: currentDesign?.name || 'Front View',
    badge: 'Front View',
    subtitle: 'Ceremonial perspective',
    notes: 'Handcrafted master motif with traditional detailing.',
    imageUrl: currentDesign?.imageUrl || '/images/rajasthani-bridal.jpg'
  };

  const favorited = isFavorite(currentDesign?.id);

  // Dynamic coverage options & prices with rock-solid numeric defaults
  const basePrice = Number(currentDesign?.price) || 2000;
  const cones = Number(currentDesign?.conesNeeded) || 1;
  const durMin = Number(currentDesign?.durationMinHours) || 1;
  const durMax = Number(currentDesign?.durationMaxHours) || Math.max(durMin, 1);

  // Exact custom tier prices configured by admin, or calculated smart defaults
  const palmPrice = currentDesign?.palmTierPrice != null && Number(currentDesign.palmTierPrice) > 0
    ? Number(currentDesign.palmTierPrice)
    : Math.max(600, Math.round(basePrice * 0.75));

  const grandPrice = currentDesign?.grandTierPrice != null && Number(currentDesign.grandTierPrice) > 0
    ? Number(currentDesign.grandTierPrice)
    : Math.round(basePrice + 1600);

  const coverageOptions = [
    {
      id: 'palm',
      title: 'Palm & Fingers Only',
      sub: 'Focused palm pattern with fingertip caps',
      price: palmPrice,
      cones: Math.max(1, Number((cones * 0.7).toFixed(1))),
      duration: Math.max(1, durMin - 1) === Math.max(1, durMax - 1)
        ? `${Math.max(1, durMin - 1)} hrs`
        : `${Math.max(1, durMin - 1)}–${Math.max(1, durMax - 1)} hrs`,
    },
    {
      id: 'standard',
      title: `${currentDesign?.coverage || 'Full Hand to Elbow'}`,
      sub: 'Standard bridal catalog density as shown in photos',
      price: basePrice,
      cones: cones,
      duration: durMin === durMax ? `${durMin} hrs` : `${durMin}–${durMax} hrs`,
      recommended: true,
    },
    {
      id: 'grand',
      title: 'Complete Hands & Feet Grand Ensemble',
      sub: 'Matching full hand and foot motifs for the main wedding ceremony',
      price: grandPrice,
      cones: Number((cones + 1.5).toFixed(1)),
      duration: (durMin + 2) === (durMax + 2)
        ? `${durMin + 2} hrs`
        : `${durMin + 2}–${durMax + 2} hrs`,
    },
  ];

  const selectedTierData = coverageOptions.find((o) => o.id === selectedCoverageTier) || coverageOptions[1];
  const activePrice = selectedTierData.price;

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

  const handleNextAngle = () => {
    setActiveAngleIndex((prev) => (prev + 1) % angles.length);
  };

  const handlePrevAngle = () => {
    setActiveAngleIndex((prev) => (prev - 1 + angles.length) % angles.length);
  };

  const handleAddToCart = () => {
    const itemToAdd = {
      ...currentDesign,
      price: activePrice,
      coverage: selectedTierData.title,
      conesNeeded: selectedTierData.cones,
    };
    addToCart(itemToAdd, 1);
  };

  const handleBookNow = () => {
    if (!isInCart) {
      handleAddToCart();
    }
    navigate('/booking');
  };

  // Customers Also Explored
  const customersAlsoExplored = ALL_DESIGNS_MASTER
    .filter((d) => String(d.id) !== String(currentDesign.id) && !singleArtistPairings.some(s => s.id === d.id))
    .slice(0, 4);

  return (
    <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24">
      
      {/* ── Breadcrumb Navigation ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/designs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-brand-maroon transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Designs</span>
        </Link>
        <span className="text-xs text-stone-400 font-mono">Catalog #{currentDesign.id}</span>
      </div>

      {/* ── Main Design Hero Showcase with Multi-Angle Catalogue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/90 shadow-xl items-start">
        
        {/* LEFT COLUMN (6 Cols): Multi-Angle Catalogue Gallery */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Active Angle Main Image Viewer */}
          <div 
            onClick={() => setGalleryViewerOpen(true)}
            className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[4/5] border-2 border-stone-200 shadow-lg group select-none cursor-pointer"
            title="Tap to open in Image Gallery Viewer"
          >
            
            <img
              src={getImageUrl(currentAngle.imageUrl)}
              alt={`${currentDesign.name} — ${currentAngle.title}`}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />

            {/* Current Angle View Badge (Top Left) */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white shadow-md bg-stone-900/80 backdrop-blur-sm border border-white/20">
                VIEW: {currentAngle.badge} ({activeAngleIndex + 1}/{angles.length})
              </span>
              {currentDesign.badge && (
                <span
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-md w-fit"
                  style={{ backgroundColor: currentDesign.badgeColor || '#7a2c1a' }}
                >
                  {currentDesign.badge}
                </span>
              )}
            </div>

            {/* Top Right Action Controls: Fullscreen Zoom & Favorites */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGalleryViewerOpen(true);
                }}
                className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/75 active:scale-95 text-white flex items-center justify-center transition shadow-lg backdrop-blur-sm"
                title="Open in Image Gallery Viewer"
                aria-label="Fullscreen Gallery Viewer"
              >
                <Maximize2 className="w-4 h-4 text-amber-300" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentDesign);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg backdrop-blur-sm ${
                  favorited
                    ? 'bg-white text-rose-600 scale-105'
                    : 'bg-black/40 hover:bg-black/60 text-white hover:scale-105'
                }`}
                title={favorited ? 'Saved in favorites' : 'Save to favorites'}
              >
                <Heart className={`w-5 h-5 transition ${favorited ? 'fill-rose-600 text-rose-600' : 'text-white'}`} />
              </button>
            </div>

            {/* Carousel Previous / Next Arrows */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevAngle();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition backdrop-blur-sm z-10 opacity-80 hover:opacity-100 active:scale-95"
              title="Previous Angle"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextAngle();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition backdrop-blur-sm z-10 opacity-80 hover:opacity-100 active:scale-95"
              title="Next Angle"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Bottom Caption Pill with Tap to View Hint */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/65 backdrop-blur-md text-white p-2.5 rounded-xl text-xs z-10 border border-white/10 flex items-center justify-between gap-2">
              <div className="truncate">
                <div className="font-bold text-amber-300 text-xs">{currentAngle.title}</div>
                <div className="text-[11px] text-stone-200 truncate">{currentAngle.subtitle}</div>
              </div>
              <span className="shrink-0 text-[10px] text-amber-200/90 font-medium bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                🔍 Tap to open
              </span>
            </div>

          </div>


          {/* 4 Interactive Thumbnails Strip */}
          <div className="grid grid-cols-4 gap-3 pt-1">
            {angles.map((ang, idx) => (
              <div
                key={ang.id}
                onClick={() => setActiveAngleIndex(idx)}
                className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition border-2 ${
                  activeAngleIndex === idx
                    ? 'border-brand-gold ring-2 ring-brand-gold/40 shadow-md scale-95'
                    : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                }`}
              >
                <img
                  src={getImageUrl(ang.imageUrl)}
                  alt={ang.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white font-bold text-center py-0.5 uppercase tracking-wider truncate px-1">
                  {ang.badge}
                </span>
              </div>
            ))}
          </div>

          {/* Craftsmanship Note for Active Angle */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-brand-gold/30 text-xs text-stone-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-brand-maroon">
              <Info className="w-4 h-4 text-brand-gold-dark shrink-0" />
              <span>Craftsmanship Highlight — {currentAngle.title}:</span>
            </div>
            <p className="text-[11.5px] text-stone-600 leading-relaxed pl-5">
              {currentAngle.notes}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN (6 Cols): Specifications, Dynamic Coverage & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            
            {/* Collection & Ratings */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-gold-dark">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-brand-maroon font-bold">
                  {currentDesign.category} Collection
                </span>
                <span>•</span>
                <span className="text-stone-500">{currentDesign.coverage}</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-stone-700 ml-1">5.0</span>
                <span className="text-stone-400 font-normal">(48+ Reviews)</span>
              </div>
            </div>

            {/* Design Title */}
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              {currentDesign.name}
            </h1>

            {/* Live Pricing */}
            <div className="flex items-baseline gap-3 border-b border-stone-100 pb-4">
              <span className="text-3xl sm:text-4xl font-black text-brand-maroon">
                {formatPrice(activePrice)}
              </span>
              <span className="text-xs text-stone-500">
                All-inclusive of mehendi cones as per preference, artist home visit, and sugar-lemon glaze
              </span>
            </div>

            {/* Description */}
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {currentDesign.description}
            </p>

            {/* ── INTERACTIVE COVERAGE OPTIONS (Dynamic Price Calculator) ── */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-maroon flex items-center gap-1.5">
                  <span>Choose Coverage Tier</span>
                  <span className="text-[10px] text-stone-400 lowercase font-normal">(price updates automatically)</span>
                </label>
              </div>

              <div className="space-y-2">
                {coverageOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedCoverageTier(opt.id)}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between gap-3 ${
                      selectedCoverageTier === opt.id
                        ? 'border-brand-maroon bg-brand-maroon/5 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedCoverageTier === opt.id
                          ? 'border-brand-maroon bg-brand-maroon text-white'
                          : 'border-stone-300'
                      }`}>
                        {selectedCoverageTier === opt.id && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                          <span>{opt.title}</span>
                          {opt.recommended && (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-gold text-stone-950">
                              Recommended Bridal
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{opt.sub}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-brand-maroon">{formatPrice(opt.price)}</div>
                      <div className="text-[10px] text-stone-400">{opt.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-brand-gold/30 flex items-center gap-3">
                <Clock className="w-5 h-5 text-brand-maroon shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-500 font-semibold uppercase">Application Time</div>
                  <div className="text-xs font-bold text-stone-900">
                    {selectedTierData.duration}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-brand-gold/30 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-brand-maroon shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-500 font-semibold uppercase">Mehendi Cones</div>
                  <div className="text-xs font-bold text-stone-900">
                    {selectedTierData.cones} Cones (by preference)
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Guarantees */}
            <div className="space-y-2 text-xs text-stone-600 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Store-available quality mehendi cones used strictly according to your preference</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Carefully applied for long-lasting, deep rich ceremonial stain</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complimentary lemon-sugar glaze seal applied post-ceremony</span>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {isInCart ? (
                <div className="flex-1 py-2.5 px-4 rounded-full bg-emerald-50 text-emerald-950 border border-emerald-300 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="font-serif font-bold text-xs uppercase tracking-wider text-emerald-900">
                      In Package ({formatPrice(activePrice)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-full border border-emerald-300 px-2 py-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(currentDesign.id, quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center text-emerald-900 font-bold hover:text-emerald-700 active:scale-90 text-sm select-none"
                      title="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="min-w-[18px] text-center font-bold text-xs text-emerald-950 select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(currentDesign.id, quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center text-emerald-900 font-bold hover:text-emerald-700 active:scale-90 text-sm select-none"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 rounded-full font-serif font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Booking Cart</span>
                </button>
              )}

              <button
                onClick={handleBookNow}
                className="flex-1 py-3.5 rounded-full bg-brand-maroon hover:bg-brand-maroon-dark text-brand-gold font-serif font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book This Design Now</span>
              </button>
            </div>

            {/* Save to Favorites Secondary Button */}
            <button
              onClick={() => toggleFavorite(currentDesign)}
              className="w-full py-2.5 rounded-full bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-600 text-rose-600' : 'text-stone-400'}`} />
              <span>{favorited ? 'Saved in Your Favorites' : 'Save to Favorites List'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* ── REVIEWS SECTION: Verified Bride Ratings for this Motif ── */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-brand-maroon">
              Bridal Experiences
            </span>
            <h2 className="font-cinzel text-2xl font-bold text-stone-900 mt-0.5">
              Patron Reviews for {currentDesign.name}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-brand-maroon">5.0</span>
            <div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-[11px] text-stone-500">100% Recommended by Brides</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-[11px] font-bold text-brand-maroon">Wedding Ceremony 2025</span>
            </div>
            <p className="text-xs text-stone-600 italic leading-relaxed">
              "We examined all 4 angles beforehand and the artist executed every single detail from palm to forearm identically. The natural eucalyptus fragrance was soothing, and the dark maroon stain stayed rich through my entire honeymoon!"
            </p>
            <div className="text-xs font-bold text-stone-900 border-t border-stone-100 pt-2 flex items-center justify-between">
              <span>— Sunita K., Bandra Mumbai</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Verified Booking</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-[11px] font-bold text-brand-maroon">Sangeet Night</span>
            </div>
            <p className="text-xs text-stone-600 italic leading-relaxed">
              "The back of hand lace glove pattern was the highlight of all my wedding ring photographs. The lines were so razor-sharp and symmetrical. Absolutely top tier artisan work!"
            </p>
            <div className="text-xs font-bold text-stone-900 border-t border-stone-100 pt-2 flex items-center justify-between">
              <span>— Aakanksha D., Pune</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Verified Booking</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── AMAZON-STYLE SECTION 1: Similar Designs in Same Category ── */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-cinzel text-2xl font-bold text-brand-maroon flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-gold" />
              Frequently Paired With This Look
            </h2>
            <p className="text-stone-500 text-xs mt-0.5">
              Popular matching patterns and harmonizing motifs curated for your celebration
            </p>
          </div>
          <Link
            to={`/designs?category=${currentDesign.category}`}
            className="text-xs font-serif font-bold text-brand-maroon hover:text-brand-gold underline underline-offset-4 hidden sm:block"
          >
            Explore All {currentDesign.category} →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {singleArtistPairings.map((simDesign) => (
            <DesignCard key={simDesign.id} design={simDesign} />
          ))}
        </div>
      </div>

      {/* ── AMAZON-STYLE SECTION 2: Customers Who Viewed This Also Explored ── */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="font-cinzel text-2xl font-bold text-brand-maroon flex items-center gap-2">
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

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {customersAlsoExplored.map((expDesign) => (
            <DesignCard key={expDesign.id} design={expDesign} />
          ))}
        </div>
      </div>

      {/* ── Bespoke Custom Design Banner Strip ── */}
      <div className="bg-gradient-to-r from-brand-maroon via-brand-maroon-dark to-brand-maroon text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-brand-gold/30">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold bg-brand-gold/20 px-3 py-1 rounded-full border border-brand-gold/30">
            Bespoke Haute Couture
          </span>
          <h3 className="font-cinzel text-2xl font-bold text-white">
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

      {/* ── Mobile Sticky Quick Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-lg border-t border-stone-200 sm:hidden z-30 shadow-2xl flex items-center justify-between gap-3 px-4">
        <div>
          <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block">Starts at</span>
          <span className="text-base font-serif font-bold text-brand-maroon">{formatPrice(activePrice)}</span>
        </div>
        <div className="flex items-center gap-2">
          {isInCart ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-xl px-2.5 py-1 shadow-2xs">
              <button
                type="button"
                onClick={() => updateQuantity(currentDesign.id, quantity - 1)}
                className="w-6 h-7 flex items-center justify-center text-emerald-900 font-bold active:scale-90 text-sm select-none"
                title="Decrease quantity"
              >
                −
              </button>
              <span className="font-bold text-xs text-emerald-950 px-1 select-none">{quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(currentDesign.id, quantity + 1)}
                className="w-6 h-7 flex items-center justify-center text-emerald-900 font-bold active:scale-90 text-sm select-none"
                title="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300 shadow-2xs"
              title="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4 text-stone-700" />
              <span>Add</span>
            </button>
          )}
          <button
            onClick={handleBookNow}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-maroon to-brand-maroon-dark text-brand-gold font-serif font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition flex items-center gap-1.5"
          >
            <span>Book Now</span>
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fullscreen Interactive Image Gallery Viewer */}
      <ImageGalleryViewer
        isOpen={galleryViewerOpen}
        onClose={() => setGalleryViewerOpen(false)}
        images={angles.map((ang) => ({
          imageUrl: getImageUrl(ang.imageUrl),
          title: `${currentDesign.name} — ${ang.title}`,
          category: currentDesign.category,
          badge: ang.badge,
          notes: ang.notes,
          subtitle: ang.subtitle,
          price: activePrice,
        }))}
        currentIndex={activeAngleIndex}
        onIndexChange={setActiveAngleIndex}
        onBook={() => {
          setGalleryViewerOpen(false);
          handleAddToCart();
        }}
      />

    </div>
  );
}

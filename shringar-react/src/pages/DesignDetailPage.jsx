import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, Sparkles, Check, ArrowLeft, ShoppingBag, 
  ShieldCheck, Calendar, Heart, Eye, ArrowRight, Star, Layers,
  ChevronLeft, ChevronRight, CheckCircle2, Award, Info
} from 'lucide-react';
import { DesignsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import DesignCard from '../components/designs/DesignCard';

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
  },
  {
    id: 7,
    name: 'Sawan Bel Diagonal Trail',
    description: 'Traditional Sawan vine flowing gracefully from index finger diagonally down the forearm with shaded leaf fillers and delicate knuckle caps.',
    category: 'Arabic',
    coverage: 'Half hand',
    durationMinHours: 1.5,
    durationMaxHours: 2,
    conesNeeded: 1,
    price: 950,
    badge: 'Festive',
    badgeColor: '#2d6a4f',
    imageUrl: '/images/arabic-mehndi-sawan.jpg',
    angles: [
      {
        id: 'front',
        title: 'Front Diagonal Trail',
        badge: 'Palm Flow',
        subtitle: 'Cascading leaves and floral clusters on front palm.',
        imageUrl: '/images/arabic-mehndi-sawan.jpg',
        notes: 'Free-flowing organic curve that elongates fingers visually.'
      },
      {
        id: 'back',
        title: 'Back Hand Vine',
        badge: 'Back Vine',
        subtitle: 'Continuous trailing vine running along outer edge to forearm.',
        imageUrl: '/images/simple-arabic.jpg',
        notes: 'Sleek single-line flow leaving spacious breathing room on the hand.'
      },
      {
        id: 'wrist',
        title: 'Fingertip Floral Caps',
        badge: 'Fingertips',
        subtitle: 'Shaded petal caps adorning knuckles and finger joints.',
        imageUrl: '/images/simple-arabic-mehndi-designs-for-left-hand-henna-by-mahira-mohsin-leaf-arabic-mehndi-design.jpg',
        notes: 'Micro leaf dots that highlight manicure and wedding rings.'
      },
      {
        id: 'full',
        title: 'Side Trail Flourish',
        badge: 'Side Profile',
        subtitle: 'Teardrop leaf clusters wrapping gracefully around the wrist.',
        imageUrl: '/images/arabic-sawan.jpg',
        notes: 'A quick 90-minute festive favorite for Karwa Chauth, Teej, and Eid.'
      }
    ]
  },
  {
    id: 8,
    name: 'Marwari Grand Bridal Ensemble',
    description: 'Ultra-intricate traditional Marwari full arm wedding henna extending to elbow with auspicious Kalash, peacock mandalas, and ceremonial bride-groom doli scenes.',
    category: 'Bridal',
    coverage: 'Full hand (Elbow)',
    durationMinHours: 4,
    durationMaxHours: 5,
    conesNeeded: 3,
    price: 3500,
    badge: 'Signature',
    badgeColor: '#7a2c1a',
    imageUrl: '/images/bridal-fullhand.jpg',
    angles: [
      {
        id: 'front',
        title: 'Full Hand Royal Jaal',
        badge: 'Dense Palm',
        subtitle: 'Dense Marwari heritage pattern with ceremonial wedding motifs.',
        imageUrl: '/images/bridal-fullhand.jpg',
        notes: 'Zero blank space — the ultimate statement of luxury Indian bridal tradition.'
      },
      {
        id: 'back',
        title: 'Back of Hand Elegance',
        badge: 'Back Glove',
        subtitle: 'Lace glove illusion with beaded finger accents and floral cuffs.',
        imageUrl: '/images/Traditional-Rajasthani-Bridal-Henna-Mehendi-Design---Full-hand-Marwari-Mehendi-for-Indian-Wedding-2.jpg',
        notes: 'Heavily detailed knuckles with negative-space lotus flower reveals.'
      },
      {
        id: 'wrist',
        title: 'Elbow-Length Extension',
        badge: 'Elbow Jaal',
        subtitle: 'Royal court bands extending past the elbow fold in symmetric bands.',
        imageUrl: '/images/Bridal-Full-Hand-Mehndi-Designs-for-Wedding-Day-2.jpg',
        notes: 'Intricate checks and paisley vines that seamlessly match wedding sleeve borders.'
      },
      {
        id: 'full',
        title: 'Complete Bridal Panorama',
        badge: 'Full Panorama',
        subtitle: 'Richly saturated traditional dark maroon stain look under wedding lights.',
        imageUrl: '/images/rajasthani-bridal.jpg',
        notes: 'Masterwork requiring senior guild artist specialization.'
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

  const { cartItems, addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDesign() {
      setLoading(true);
      try {
        const data = await DesignsAPI.getById(id).catch(() => null);
        const masterItem = ALL_DESIGNS_MASTER.find((d) => String(d.id) === String(id)) || ALL_DESIGNS_MASTER[0];

        if (data && data.name) {
          // Merge API data with rich catalogue angles
          setDesign({
            ...masterItem,
            ...data,
            angles: masterItem.angles,
          });
        } else {
          setDesign(masterItem);
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

  const currentDesign = design || ALL_DESIGNS_MASTER[0];
  const angles = currentDesign.angles || ALL_DESIGNS_MASTER[0].angles;
  const currentAngle = angles[activeAngleIndex] || angles[0];
  const favorited = isFavorite(currentDesign.id);
  const isInCart = cartItems.some((item) => String(item.id) === String(currentDesign.id));

  // Dynamic coverage options & prices
  const basePrice = currentDesign.price || 2000;
  const coverageOptions = [
    {
      id: 'palm',
      title: 'Palm & Fingers Only',
      sub: 'Focused palm pattern with fingertip caps',
      price: Math.max(600, Math.round(basePrice * 0.75)),
      cones: Math.max(1, Number((currentDesign.conesNeeded * 0.7).toFixed(1))),
      duration: `${Math.max(1, currentDesign.durationMinHours - 1)}–${currentDesign.durationMaxHours - 1} hrs`,
    },
    {
      id: 'standard',
      title: `${currentDesign.coverage || 'Full Hand to Elbow'}`,
      sub: 'Standard bridal catalog density as shown in photos',
      price: basePrice,
      cones: currentDesign.conesNeeded || 2,
      duration: `${currentDesign.durationMinHours || 2}–${currentDesign.durationMaxHours || 3} hrs`,
      recommended: true,
    },
    {
      id: 'grand',
      title: 'Complete Hands & Feet Grand Ensemble',
      sub: 'Matching full hand and foot motifs for the main wedding ceremony',
      price: Math.round(basePrice + 1600),
      cones: Number((currentDesign.conesNeeded + 1.5).toFixed(1)),
      duration: `${currentDesign.durationMinHours + 2}–${currentDesign.durationMaxHours + 2} hrs`,
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
    addToCart(itemToAdd);
    showSuccess(`Added "${currentDesign.name}" (${selectedTierData.title}) to your booking cart!`);
  };

  const handleBookNow = () => {
    if (!isInCart) {
      handleAddToCart();
    }
    navigate('/booking');
  };

  // Amazon-Style: Similar Designs in Same Category
  const similarDesigns = ALL_DESIGNS_MASTER
    .filter((d) => String(d.id) !== String(currentDesign.id) && (d.category === currentDesign.category || Math.abs(d.price - currentDesign.price) < 800))
    .slice(0, 4);

  // Amazon-Style: Customers Also Explored
  const customersAlsoExplored = ALL_DESIGNS_MASTER
    .filter((d) => String(d.id) !== String(currentDesign.id) && !similarDesigns.some(s => s.id === d.id))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-24">
      
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
          <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[4/5] border-2 border-stone-200 shadow-lg group select-none">
            
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

            {/* Heart Save to Favorites Toggle (Top Right) */}
            <button
              type="button"
              onClick={() => toggleFavorite(currentDesign)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg backdrop-blur-sm z-10 ${
                favorited
                  ? 'bg-white text-rose-600 scale-105'
                  : 'bg-black/40 hover:bg-black/60 text-white hover:scale-105'
              }`}
              title={favorited ? 'Saved in favorites' : 'Save to favorites'}
            >
              <Heart className={`w-5 h-5 transition ${favorited ? 'fill-rose-600 text-rose-600' : 'text-white'}`} />
            </button>

            {/* Carousel Previous / Next Arrows */}
            <button
              onClick={handlePrevAngle}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition backdrop-blur-sm z-10 opacity-80 hover:opacity-100"
              title="Previous Angle"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNextAngle}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition backdrop-blur-sm z-10 opacity-80 hover:opacity-100"
              title="Next Angle"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Bottom Caption Pill */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-xl text-xs z-10 border border-white/10">
              <div className="font-bold text-amber-300">{currentAngle.title}</div>
              <div className="text-[11px] text-stone-200 truncate">{currentAngle.subtitle}</div>
            </div>

          </div>

          {/* 4 Interactive Angle Selector Pills */}
          <div className="grid grid-cols-4 gap-2">
            {angles.map((ang, idx) => (
              <button
                key={ang.id}
                onClick={() => setActiveAngleIndex(idx)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition border flex flex-col items-center gap-0.5 ${
                  activeAngleIndex === idx
                    ? 'bg-brand-maroon text-brand-gold border-brand-maroon shadow-md'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <span className="text-sm">
                  {idx === 0 ? '🤲' : idx === 1 ? '🖐️' : idx === 2 ? '✨' : '📐'}
                </span>
                <span className="truncate w-full text-[11px]">{ang.badge}</span>
              </button>
            ))}
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
                All-inclusive of organic henna cones, artist home visit, and sugar-lemon glaze
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
                  <div className="text-[10px] text-stone-500 font-semibold uppercase">Organic Cones</div>
                  <div className="text-xs font-bold text-stone-900">
                    {selectedTierData.cones} Sojat Henna Cones
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Guarantees */}
            <div className="space-y-2 text-xs text-stone-600 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Rajasthani Sojat organic henna — 0% chemicals, 0% PPD dyes</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pure eucalyptus essential oil infusion guarantees 14+ days dark rich stain</span>
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
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-full font-serif font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border ${
                  isInCart
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300 shadow-sm'
                }`}
              >
                {isInCart ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Added in Cart ({formatPrice(activePrice)})</span>
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
                <span>Book This Design Now</span>
              </button>
            </div>

            {/* Save to Favorites Secondary Button */}
            <button
              onClick={() => toggleFavorite(currentDesign)}
              className="w-full py-2.5 rounded-full bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-600 text-rose-600' : 'text-stone-400'}`} />
              <span>{favorited ? '❤️ Saved in Your Favorites' : '🤍 Save to Favorites List'}</span>
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
              Similar Handcrafted Designs You May Love
            </h2>
            <p className="text-stone-500 text-xs mt-0.5">
              Curated based on your selection of {currentDesign.category} motifs and pricing range
            </p>
          </div>
          <Link
            to={`/designs?category=${currentDesign.category}`}
            className="text-xs font-serif font-bold text-brand-maroon hover:text-brand-gold underline underline-offset-4 hidden sm:block"
          >
            Explore All {currentDesign.category} ({similarDesigns.length + 1}) →
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

    </div>
  );
}

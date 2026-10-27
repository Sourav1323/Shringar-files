import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, Sparkles, Download, Share2, 
  MessageCircle, Trash2, Calendar, ArrowRight, Wand2, Compass
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

const InstagramIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const CATEGORIES = [
  { id: 'all', label: 'All Designs' },
  { id: 'bridal', label: 'Bridal' },
  { id: 'arabic', label: 'Arabic' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'fusion', label: 'Fusion' },
];

const SEED_GALLERY_ITEMS = [
  {
    id: 'glr_001',
    userName: 'Ananya Deshmukh',
    userLocation: 'Mumbai',
    designId: 2,
    designName: 'Rajasthani Bridal Jaal',
    designCategory: 'Bridal',
    imageUrl: '/images/rajasthani-bridal.jpg',
    caption: 'Tried the royal Rajasthani Jaal before my sangeet. The deep stain depth looks unbelievable in person!',
    likes: 42,
    price: 2500,
    createdAt: '2026-10-25T14:30:00Z',
  },
  {
    id: 'glr_002',
    userName: 'Meera Kapoor',
    userLocation: 'Delhi NCR',
    designId: 1,
    designName: 'Arabic Glam Sawan Bel',
    designCategory: 'Arabic',
    imageUrl: '/images/arabic-sawan.jpg',
    caption: 'Flowing index finger trail for my sister’s engagement. The fine jaal shading rendered flawlessly on my hand.',
    likes: 38,
    price: 1500,
    createdAt: '2026-10-24T18:20:00Z',
  },
  {
    id: 'glr_003',
    userName: 'Pooja Iyer',
    userLocation: 'Bangalore',
    designId: 4,
    designName: 'Indo-Arabic Lotus Fusion',
    designCategory: 'Fusion',
    imageUrl: '/images/indo-arabic.png',
    caption: 'Mandala center with delicate palm vines. Booked my artist appointment right after seeing this preview.',
    likes: 29,
    price: 2000,
    createdAt: '2026-10-23T11:15:00Z',
  },
  {
    id: 'glr_004',
    userName: 'Sunita Rathore',
    userLocation: 'Jaipur',
    designId: 5,
    designName: 'Mughal Classic Arches',
    designCategory: 'Traditional',
    imageUrl: '/images/mughal-classic.jpg',
    caption: 'Authentic Marwari court arches. Perfect symmetry and rich mahogany stain.',
    likes: 51,
    price: 2200,
    createdAt: '2026-10-22T09:45:00Z',
  },
  {
    id: 'glr_005',
    userName: 'Kavita Joshi',
    userLocation: 'Pune',
    designId: 3,
    designName: 'Floral Minimalist Bloom',
    designCategory: 'Minimal',
    imageUrl: '/images/floral-minimal.jpg',
    caption: 'Subtle lotus cuff for Karwa Chauth. Lightweight, quick to apply, and elegant.',
    likes: 19,
    price: 800,
    createdAt: '2026-10-21T16:00:00Z',
  },
];

export default function GalleryPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('all');
  const [items, setItems] = useState([]);
  const [likedSet, setLikedSet] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('shringar_liked_gallery') || '[]'));
    } catch {
      return new Set();
    }
  });

  // Load items from localStorage or initialize with seed data
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shringar_community_gallery');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          return;
        }
      }
      // If none, seed initial items
      localStorage.setItem('shringar_community_gallery', JSON.stringify(SEED_GALLERY_ITEMS));
      setItems(SEED_GALLERY_ITEMS);
    } catch (e) {
      setItems(SEED_GALLERY_ITEMS);
    }
  }, []);

  const handleLike = (id) => {
    if (likedSet.has(id)) {
      showInfo('You already liked this preview.');
      return;
    }
    const nextSet = new Set(likedSet);
    nextSet.add(id);
    setLikedSet(nextSet);
    localStorage.setItem('shringar_liked_gallery', JSON.stringify(Array.from(nextSet)));

    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, likes: (item.likes || 0) + 1 };
      }
      return item;
    });
    setItems(updated);
    localStorage.setItem('shringar_community_gallery', JSON.stringify(updated));
    showSuccess('Liked preview!');
  };

  const handleDownload = (item) => {
    const a = document.createElement('a');
    a.href = item.imageUrl;
    a.download = `shringar-${item.designName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSuccess('Design preview downloaded.');
  };

  const handleShareWhatsApp = (item) => {
    const text = `Check out my Shringar mehndi AI try-on: "${item.designName}" → ${window.location.origin}/gallery`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareInstagram = (item) => {
    handleDownload(item);
    showInfo('Image saved! Opening Instagram so you can post to your Story or Feed.');
    setTimeout(() => {
      window.open('https://www.instagram.com', '_blank');
    }, 600);
  };

  const handleBookDesign = (item) => {
    addToCart({
      id: item.designId,
      name: item.designName,
      price: item.price || 1500,
      category: item.designCategory,
      thumbnail: item.imageUrl,
    });
    showSuccess(`Added "${item.designName}" to booking cart!`);
    navigate('/booking');
  };

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.designCategory.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-brand-cream/60 py-12 px-4 sm:px-6 lg:px-10 selection:bg-brand-gold/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brand-gold/20 pb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase font-serif font-bold tracking-[0.2em] text-[#4A2511] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B58E34]" />
              Community Bridal Lookbook
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#4A2511] font-bold leading-tight">
              Real ceremonies,<br />
              <em className="text-[#B58E34] font-normal">adorned by masters</em>
            </h1>
            <p className="text-[#7A6356] text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
              Explore authentic bridal, festive, and Arabic mehndi artistry created for real celebrations across India. 
              Find inspiration and reserve a certified master artist for your home appointment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/designs"
              className="shr-btn-primary !py-3 !px-6 !text-xs uppercase tracking-wider font-medium"
            >
              <Compass className="w-4 h-4 text-[#B58E34]" />
              <span>Explore Designs Catalogue</span>
            </Link>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-5 py-2 rounded-full text-xs font-serif font-bold tracking-wider uppercase whitespace-nowrap transition-all border ${
                activeCategory === c.id
                  ? 'bg-brand-maroon text-brand-gold border-brand-maroon shadow-md'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-brand-gold/60'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 shadow-sm max-w-md mx-auto space-y-4">
            <Sparkles className="w-10 h-10 text-brand-gold mx-auto" />
            <h3 className="font-serif text-xl font-bold text-brand-maroon">No designs in this category yet</h3>
            <p className="text-stone-500 text-xs">Explore more exquisite bridal patterns in our collection.</p>
            <Link
              to="/designs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#4A2511] text-[#FDFBF7] font-medium text-xs uppercase tracking-wider shadow"
            >
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                {/* Image Container with Watermark and Floating Badges */}
                <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.designName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-brand-maroon/90 backdrop-blur-md text-brand-gold text-[10px] font-serif font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-brand-gold/30 shadow">
                    {item.designCategory}
                  </span>

                  {/* Brand Watermark Pill */}
                  <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-serif font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-md border border-white/20">
                    Shringar Bridal Look
                  </span>

                  {/* Like Button on Image */}
                  <button
                    onClick={() => handleLike(item.id)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition backdrop-blur-md shadow-md ${
                      likedSet.has(item.id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-black/40 hover:bg-black/60 text-white'
                    }`}
                    title="Like this design"
                  >
                    <Heart className={`w-4 h-4 ${likedSet.has(item.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                      <span className="font-semibold text-stone-800">{item.userName}</span>
                      <span>{item.userLocation || 'Verified Patron'}</span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-brand-maroon group-hover:text-brand-gold-dark transition">
                      {item.designName}
                    </h3>

                    {item.caption && (
                      <p className="text-xs text-stone-600 italic mt-2 line-clamp-2">
                        "{item.caption}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <strong className="text-stone-800">{item.likes || 0}</strong> patrons liked
                      </span>
                      <span className="font-serif font-bold text-brand-maroon text-sm">
                        ₹{item.price || 1500}
                      </span>
                    </div>

                    {/* Social & Booking Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleShareWhatsApp(item)}
                        className="py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1 transition"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handleShareInstagram(item)}
                        className="py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1 transition"
                        title="Share on Instagram"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Story</span>
                      </button>

                      <button
                        onClick={() => handleDownload(item)}
                        className="py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1 transition"
                        title="Download HD Image"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">HD</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleBookDesign(item)}
                      className="w-full py-2.5 rounded-xl bg-brand-maroon hover:bg-brand-maroon-dark text-white font-serif font-bold text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Book This Pattern</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

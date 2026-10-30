import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, User, X, Shield, 
  Calendar, Compass, Search, Palette, HeartHandshake,
  LogOut, ChevronDown, Heart, Camera, MapPin, ArrowRight,
  Sparkles, Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCity } from '../../context/CityContext';
import { DesignsAPI } from '../../services/api';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allDesigns, setAllDesigns] = useState([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { favoriteCount, openFavorites } = useFavorites();
  const { city, openCityModal } = useCity();
  const location = useLocation();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Pre-load design catalog for instant relevant search suggestions
  useEffect(() => {
    let mounted = true;
    DesignsAPI.getAll()
      .then(res => {
        if (mounted && res) {
          setAllDesigns(Array.isArray(res) ? res : (res.content || []));
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Close profile dropdown & search suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (
        desktopSearchRef.current && !desktopSearchRef.current.contains(e.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu & suggestions on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  const searchWords = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const matchingCategories = searchWords.length === 0 ? [] : [
    { label: 'Bridal Couture', value: 'Bridal' },
    { label: 'Arabic Contemporary', value: 'Arabic' },
    { label: 'Rajasthani Royal', value: 'Bridal' },
    { label: 'Indo-Western Fusion', value: 'Indo-Arabic' },
    { label: 'Mughal Jaal Artwork', value: 'Mughal' },
    { label: 'Minimalist Floral', value: 'Minimal' },
    { label: 'Full Hand & Arms', value: 'Bridal' },
    { label: 'Feet & Ankles', value: 'Bridal' }
  ].filter(c => searchWords.some(w => c.label.toLowerCase().includes(w) || c.value.toLowerCase().includes(w)));

  const matchingDesigns = searchWords.length === 0 ? [] : allDesigns.filter(d => {
    const text = `${d.name || ''} ${d.category || ''} ${d.description || ''} ${d.tags || ''}`.toLowerCase();
    return searchWords.some(word => text.includes(word));
  }).slice(0, 5);

  const handleSelectSuggestion = (type, value) => {
    setShowSuggestions(false);
    setSearchOpen(false);
    setSearchQuery('');
    if (type === 'design') {
      navigate(`/designs/${value}`);
    } else if (type === 'category') {
      navigate(`/designs?category=${encodeURIComponent(value)}`);
    } else {
      navigate(`/designs?search=${encodeURIComponent(value)}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/designs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleLogoutClick = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const userInitial = user?.firstName?.charAt(0) || user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'S';
  const userName = user?.fullName || user?.firstName || 'Royal Patron';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 text-[#2C160A] border-b border-[#E6DFD3] shadow-xs transition-all duration-300 w-full">
      <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 w-full">
        
        {/* Brand Logo & Title (Increased mobile size) */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0" data-testid="nav-logo">
          <img
            src="/images/shringar-logo.png"
            alt="Shringar Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-[#B58E34]/80 shadow-xs group-hover:scale-105 transition-transform duration-300 shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-2xl font-bold tracking-wider text-[#4A2511] leading-tight">
              SHRINGAR
            </span>
            <span className="hidden sm:inline text-[9px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#B58E34] font-semibold -mt-0.5">
              Luxury Mehendi Art
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 font-medium text-[13px] tracking-[0.14em] uppercase">
          <Link
            to="/"
            className={`transition-colors hover:text-[#B58E34] ${isActive('/') ? 'text-[#B58E34] font-semibold border-b-2 border-[#B58E34] pb-0.5' : 'text-[#4A2511]'}`}
          >
            Home
          </Link>

          <Link
            to="/designs"
            className={`transition-colors hover:text-[#B58E34] flex items-center gap-1.5 ${
              isActive('/designs')
                ? 'text-[#B58E34] font-semibold border-b-2 border-[#B58E34] pb-0.5'
                : 'text-[#4A2511]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#B58E34]" />
            <span>Designs</span>
          </Link>

          <Link
            to="/gallery"
            className={`transition-colors hover:text-[#B58E34] flex items-center gap-1.5 ${
              isActive('/gallery') ? 'text-[#B58E34] font-semibold border-b-2 border-[#B58E34] pb-0.5' : 'text-[#4A2511]'
            }`}
          >
            <Camera className="w-4 h-4 text-[#B58E34]" />
            <span>Gallery</span>
          </Link>

          <Link
            to="/booking"
            className={`transition-colors hover:text-[#B58E34] flex items-center gap-1.5 ${
              isActive('/booking') ? 'text-[#B58E34] font-semibold border-b-2 border-[#B58E34] pb-0.5' : 'text-[#4A2511]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#B58E34]" />
            <span>Book Session</span>
          </Link>

          <Link
            to="/help"
            className={`transition-colors hover:text-[#B58E34] ${isActive('/help') ? 'text-[#B58E34] font-semibold border-b-2 border-[#B58E34] pb-0.5' : 'text-[#4A2511]'}`}
          >
            Help & Care
          </Link>
        </nav>

        {/* Global Search Bar (Desktop) */}
        <div className="flex-1 max-w-xs hidden md:block relative" ref={desktopSearchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#7A6356] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search bridal, arabic motifs..."
              className="w-full pl-9 pr-3 py-2 rounded-sm bg-[#F3EFE6] text-[#2C160A] placeholder-[#7A6356]/70 text-xs border border-[#E6DFD3] focus:outline-none focus:border-[#B58E34] focus:ring-1 focus:ring-[#B58E34] transition"
            />
          </form>

          {/* Real-time Search Suggestions Dropdown (Desktop) */}
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#FDFBF7] rounded-xl shadow-2xl border border-[#B58E34]/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {matchingCategories.length > 0 && (
                <div className="p-2.5 border-b border-[#E6DFD3]/60 bg-[#F8F5EE]">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#7A6356] mb-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#B58E34]" /> Categories
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchingCategories.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSuggestion('category', c.value)}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-[#EFE9DB] hover:bg-[#B58E34] hover:text-white text-[#4A2511] font-medium transition cursor-pointer"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchingDesigns.length > 0 ? (
                <div className="divide-y divide-[#E6DFD3]/40 max-h-64 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#7A6356] bg-[#FDFBF7]">
                    Matching Designs
                  </div>
                  {matchingDesigns.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectSuggestion('design', d.id)}
                      className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-[#F3EFE6] transition text-left cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-stone-200 shrink-0 border border-[#B58E34]/20 flex items-center justify-center text-xs">
                        {d.imageUrl ? (
                          <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        ) : (
                          <span>{d.emojiIcon || '🤲'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#4A2511] truncate group-hover:text-[#B58E34] transition">
                          {d.name}
                        </div>
                        <div className="text-[10px] text-[#7A6356] flex items-center gap-1.5">
                          <span>{d.category || 'Mehendi'}</span>
                          {d.price && <span>• ₹{d.price}</span>}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B58E34] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-xs text-[#7A6356] text-center italic">
                  Press enter to search "{searchQuery}"
                </div>
              )}

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full px-3 py-2 bg-[#F3EFE6] hover:bg-[#E6DFD3] text-center text-xs font-semibold text-[#4A2511] flex items-center justify-center gap-1.5 border-t border-[#E6DFD3]/60 cursor-pointer"
              >
                <span>View all results for "{searchQuery}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B58E34]" />
              </button>
            </div>
          )}
        </div>

        {/* Action Icons (City Selector, Search, Favorites, Cart & Unified Profile Menu) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* City Location Selector */}
          <button
            type="button"
            onClick={openCityModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-[#F3EFE6] hover:bg-[#E6DFD3] border border-[#B58E34]/40 text-[#4A2511] text-[11px] sm:text-xs font-semibold transition group shrink-0 shadow-2xs hover:shadow-xs"
            title="Celebration City (Click to change location)"
            aria-label="Current celebration city"
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B58E34] group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden sm:inline text-stone-500 font-normal text-[11px]">In:</span>
            <span className="font-serif font-bold max-w-[70px] sm:max-w-[130px] truncate text-[#4A2511]">{city || 'City'}</span>
            <ChevronDown className="w-3 h-3 text-[#B58E34] opacity-80 shrink-0 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-sm hover:bg-[#F3EFE6] text-[#4A2511] transition"
            title="Search Designs"
            aria-label="Search Designs"
          >
            <Search className="w-4.5 h-4.5" />
          </button>

          {/* Saved Favorites Icon with Live Badge (Increased mobile size) */}
          <button
            onClick={openFavorites}
            className="flex relative w-8 h-8 sm:w-9 sm:h-9 rounded-sm border border-[#E6DFD3] items-center justify-center hover:border-[#B58E34] hover:bg-[#F3EFE6]/60 text-[#4A2511] transition group"
            title="Saved Favorites (Liked Designs)"
            aria-label="Saved Designs"
          >
            <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition ${favoriteCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-[#4A2511] group-hover:text-[#B58E34]'}`} />
            {favoriteCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1 bg-[#4A2511] text-[#FDFBF7] rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Cart Icon with Live Item Counter Badge (Increased mobile size) */}
          <Link
            to="/cart"
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-sm border border-[#E6DFD3] flex items-center justify-center hover:border-[#B58E34] hover:bg-[#F3EFE6]/60 text-[#4A2511] transition group"
            title="View Booking Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#4A2511] group-hover:text-[#B58E34] transition" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1 bg-[#B58E34] text-[#FDFBF7] rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow">
                {itemCount}
              </span>
            )}
          </Link>

          {/* ── UNIFIED PROFILE & MENU CONTROLLER ──
              Desktop: Opens floating account dropdown (or Sign In button if guest)
              Mobile/Tablet: Acts as the SINGLE, CONSOLIDATED menu trigger containing Profile + All Navigation!
          */}
          
          {/* Desktop View (screens >= lg) */}
          <div className="hidden lg:block relative" ref={profileDropdownRef}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-[#4A2511] text-[#FDFBF7] flex items-center justify-center font-serif font-bold text-sm shadow-sm border border-[#B58E34] hover:scale-105 transition-all focus:outline-none"
                  title="Account Menu"
                  data-testid="nav-profile-btn"
                >
                  {userInitial.toUpperCase()}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white text-stone-800 rounded-sm shadow-xl border border-[#E6DFD3] py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-[#E6DFD3]/60 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4A2511] text-[#FDFBF7] flex items-center justify-center font-serif font-bold text-base shadow-sm">
                        {userInitial.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-serif font-bold text-sm text-[#4A2511] truncate">
                          {userName}
                        </p>
                        <p className="text-[11px] text-[#7A6356] truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider bg-[#F3EFE6] text-[#4A2511] border border-[#E6DFD3]">
                          {isAdmin ? 'Royal Administrator' : 'Royal Patron'}
                        </span>
                      </div>
                    </div>

                    <div className="py-2 text-xs">
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#F3EFE6] text-[#2C160A] hover:text-[#B58E34] transition font-medium"
                      >
                        <User className="w-4 h-4 text-[#B58E34]" />
                        <span>My Profile & Bookings</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#F3EFE6] text-[#2C160A] hover:text-[#B58E34] transition font-medium"
                      >
                        <Calendar className="w-4 h-4 text-[#B58E34]" />
                        <span>My Ceremonies & History</span>
                      </Link>

                      <Link
                        to="/custom-design"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#F3EFE6] text-[#2C160A] hover:text-[#B58E34] transition font-medium"
                      >
                        <Palette className="w-4 h-4 text-[#B58E34]" />
                        <span>Custom Design Commissions</span>
                      </Link>

                      <Link
                        to="/become-artist"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#F3EFE6] text-[#2C160A] hover:text-[#B58E34] transition font-medium"
                      >
                        <HeartHandshake className="w-4 h-4 text-[#B58E34]" />
                        <span>Join as Henna Artist</span>
                      </Link>

                      {isAdmin && (
                        <a
                          href="/admin-portal/index.html"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 bg-[#F3EFE6] hover:bg-[#E6DFD3] text-[#4A2511] transition font-bold border-y border-[#E6DFD3] my-1"
                          data-testid="nav-admin-link"
                        >
                          <Shield className="w-4 h-4 text-[#B58E34]" />
                          <span>Admin Control Portal</span>
                        </a>
                      )}
                    </div>

                    <div className="border-t border-[#E6DFD3]/60 pt-2 px-3">
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs text-rose-700 hover:bg-rose-50 transition font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="shr-btn-primary !py-2 !px-4 !text-xs font-semibold tracking-wider uppercase rounded-sm shadow-sm"
                title="Sign In"
                data-testid="nav-login-btn"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile & Tablet Unified Profile/Menu Trigger (screens < lg)
              Only ONE button here: toggles the unified menu containing profile + all navigation!
          */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#B58E34] bg-[#4A2511] text-[#FDFBF7] shadow-xs active:scale-95 transition"
            title={isAuthenticated ? 'Account & Navigation Menu' : 'Menu & Sign In'}
            aria-label="Toggle Navigation & Profile Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-amber-200" />
            ) : isAuthenticated ? (
              <span className="font-serif font-bold text-xs sm:text-sm text-[#FDFBF7]">{userInitial.toUpperCase()}</span>
            ) : (
              <User className="w-5 h-5 text-amber-200" />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Search Bar Dropdown */}
      {searchOpen && (
        <div className="md:hidden bg-[#FDFBF7] px-4 py-3 border-t border-[#E6DFD3] relative" ref={mobileSearchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#7A6356] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search bridal, arabic motifs..."
              className="w-full pl-9 pr-3 py-2 rounded-sm bg-[#F3EFE6] text-[#2C160A] placeholder-[#7A6356]/70 text-xs border border-[#E6DFD3] focus:outline-none focus:border-[#B58E34]"
            />
          </form>

          {/* Real-time Search Suggestions Dropdown (Mobile) */}
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="mt-2 bg-[#FDFBF7] rounded-xl shadow-2xl border border-[#B58E34]/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {matchingCategories.length > 0 && (
                <div className="p-2.5 border-b border-[#E6DFD3]/60 bg-[#F8F5EE]">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#7A6356] mb-1.5 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#B58E34]" /> Categories
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchingCategories.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSuggestion('category', c.value)}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-[#EFE9DB] text-[#4A2511] font-medium transition cursor-pointer"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchingDesigns.length > 0 ? (
                <div className="divide-y divide-[#E6DFD3]/40 max-h-56 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#7A6356] bg-[#FDFBF7]">
                    Matching Designs
                  </div>
                  {matchingDesigns.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectSuggestion('design', d.id)}
                      className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-[#F3EFE6] transition text-left cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-stone-200 shrink-0 border border-[#B58E34]/20 flex items-center justify-center text-xs">
                        {d.imageUrl ? (
                          <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{d.emojiIcon || '🤲'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#4A2511] truncate">
                          {d.name}
                        </div>
                        <div className="text-[10px] text-[#7A6356] flex items-center gap-1.5">
                          <span>{d.category || 'Mehendi'}</span>
                          {d.price && <span>• ₹{d.price}</span>}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B58E34]" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-xs text-[#7A6356] text-center italic">
                  Press search for "{searchQuery}"
                </div>
              )}

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full px-3 py-2 bg-[#F3EFE6] hover:bg-[#E6DFD3] text-center text-xs font-semibold text-[#4A2511] flex items-center justify-center gap-1.5 border-t border-[#E6DFD3]/60 cursor-pointer"
              >
                <span>View all results for "{searchQuery}"</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B58E34]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── UNIFIED MOBILE MENU & PROFILE DRAWER ──
          Consolidates Profile information AND all site options into one single, clean panel.
          Cart is omitted because Cart icon is already in the navbar!
      */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FDFBF7] border-t border-[#E6DFD3] px-5 py-5 space-y-4 animate-in slide-in-from-top duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl">
          
          {/* Patron Profile Header Card (Top of Drawer) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A2511] to-[#34180A] text-[#FDFBF7] shadow-md border border-[#B58E34]/40">
            {isAuthenticated ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#B58E34] text-[#4A2511] font-serif font-bold text-base flex items-center justify-center shadow-xs shrink-0">
                    {userInitial.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif font-bold text-sm text-[#FDFBF7] truncate">
                      {userName}
                    </p>
                    <p className="text-[11px] text-amber-200/80 truncate">{user?.email}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/10 text-amber-200 border border-white/20">
                      {isAdmin ? 'Royal Administrator' : 'Royal Patron'}
                    </span>
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#B58E34] hover:bg-yellow-500 text-[#4A2511] font-serif font-bold text-xs uppercase tracking-wider shadow shrink-0 flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 text-amber-200 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#FDFBF7]">Welcome to Shringar</h3>
                    <p className="text-[11px] text-amber-200/80">Sign in to view your bookings and saved preferences.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 text-center rounded-lg bg-[#B58E34] text-[#4A2511] font-serif font-bold text-xs uppercase tracking-wider shadow"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 text-center rounded-lg bg-white/10 hover:bg-white/20 text-[#FDFBF7] border border-white/20 font-serif font-semibold text-xs uppercase tracking-wider"
                  >
                    Track Booking
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile City Selector */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openCityModal();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F3EFE6] border border-[#E6DFD3] text-xs text-[#4A2511]"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#B58E34]" />
              <span className="font-semibold text-stone-600">Location:</span>
              <strong className="font-serif text-[#4A2511] font-bold">{city || 'Select City'}</strong>
            </div>
            <span className="text-[#B58E34] font-bold text-[11px] underline">Change</span>
          </button>

          {/* Unified Navigation Links (Hamburger Options) */}
          <div className="space-y-2 pt-1 text-sm font-medium text-[#4A2511]">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-[#F3EFE6] uppercase tracking-wider text-xs font-semibold"
            >
              Home
            </Link>

            <Link
              to="/designs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#F3EFE6] uppercase tracking-wider text-xs font-semibold text-[#B58E34]"
            >
              <Compass className="w-4 h-4 text-[#B58E34]" />
              <span>Explore All Designs</span>
            </Link>

            <Link
              to="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#F3EFE6] uppercase tracking-wider text-xs font-semibold"
            >
              <Camera className="w-4 h-4 text-[#B58E34]" />
              <span>Community Gallery</span>
            </Link>

            <Link
              to="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#F3EFE6] uppercase tracking-wider text-xs font-semibold"
            >
              <Calendar className="w-4 h-4 text-[#B58E34]" />
              <span>Book Appointment</span>
            </Link>

            {/* Direct Profile & Bookings Access */}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#F3EFE6] uppercase tracking-wider text-xs font-semibold"
            >
              <User className="w-4 h-4 text-[#B58E34]" />
              <span>My Profile & Bookings</span>
            </Link>

            <Link
              to="/custom-design"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#F3EFE6] uppercase tracking-wider text-xs font-semibold"
            >
              <Palette className="w-4 h-4 text-[#B58E34]" />
              <span>Custom Design Commissions</span>
            </Link>

            <Link
              to="/become-artist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#F3EFE6] uppercase tracking-wider text-xs font-semibold"
            >
              <HeartHandshake className="w-4 h-4 text-[#B58E34]" />
              <span>Join as Henna Artist</span>
            </Link>

            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-[#F3EFE6] uppercase tracking-wider text-xs font-semibold"
            >
              Mehendi Care & Help
            </Link>

            {/* Dedicated Admin Portal Link */}
            {isAdmin && (
              <a
                href="/admin-portal/index.html"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-[#F3EFE6] text-[#4A2511] font-bold uppercase tracking-wider text-xs border border-[#E6DFD3]"
              >
                <Shield className="w-4 h-4 text-[#B58E34]" />
                <span>Admin Control Portal</span>
              </a>
            )}
          </div>

          {/* Sign Out at the Bottom */}
          {isAuthenticated && (
            <div className="pt-3 border-t border-[#E6DFD3]">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-rose-700 bg-rose-50/80 font-bold uppercase tracking-wider hover:bg-rose-100 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

        </div>
      )}
    </header>
  );
}

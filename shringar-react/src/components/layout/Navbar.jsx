import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Sparkles, User, Menu, X, Shield, 
  Calendar, Compass, Search, Palette, HeartHandshake,
  LogOut, ChevronDown, CheckCircle2, Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { favoriteCount, openFavorites } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/designs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogoutClick = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/');
  };

  const userInitial = user?.firstName?.charAt(0) || user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'S';

  return (
    <header className="sticky top-0 z-40 bg-brand-maroon text-brand-cream border-b border-brand-gold-dark/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img
            src="/images/shringar-logo.png"
            alt="Shringar Logo"
            className="w-12 h-12 rounded-full object-cover border-2 border-brand-gold shadow-md shadow-brand-gold/30 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="flex flex-col">
            <span className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-widest gold-gradient-text">
              SHRINGAR
            </span>
            <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-brand-cream/80 font-medium -mt-1">
              Luxury Mehendi Art
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 font-medium text-sm">
          <Link
            to="/"
            className={`transition hover:text-brand-gold ${isActive('/') ? 'text-brand-gold font-semibold' : 'text-brand-cream/90'}`}
          >
            Home
          </Link>

          <Link
            to="/designs"
            className={`relative px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${
              isActive('/designs')
                ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/50 font-semibold shadow-sm'
                : 'text-brand-cream/95 hover:text-brand-gold hover:bg-black/20'
            }`}
          >
            <Compass className="w-4 h-4 text-brand-gold" />
            <span>Explore Designs</span>
          </Link>

          <Link
            to="/custom-design"
            className={`transition flex items-center gap-1.5 hover:text-brand-gold ${
              isActive('/custom-design') ? 'text-brand-gold font-semibold' : 'text-brand-cream/90'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-300" />
            <span>Custom Design</span>
          </Link>

          {/* AI Try-On link temporarily commented out for end-user testing
          <Link
            to="/ai-tryon"
            className={`transition flex items-center gap-1.5 hover:text-brand-gold ${
              isActive('/ai-tryon') ? 'text-brand-gold font-semibold' : 'text-brand-cream/90'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Try-On</span>
          </Link>
          */}

          <Link
            to="/booking"
            className={`transition flex items-center gap-1.5 hover:text-brand-gold ${
              isActive('/booking') ? 'text-brand-gold font-semibold' : 'text-brand-cream/90'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Book Artist</span>
          </Link>

          <Link
            to="/help"
            className={`transition hover:text-brand-gold ${isActive('/help') ? 'text-brand-gold font-semibold' : 'text-brand-cream/90'}`}
          >
            Help & Care
          </Link>
        </nav>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xs hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-brand-gold/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search motifs, bridal, arabic..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-black/25 text-brand-cream placeholder-brand-cream/50 text-xs border border-brand-gold/30 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition"
            />
          </form>
        </div>

        {/* Right Action Icons (Search, Cart & Profile Avatar Dropdown) */}
        <div className="flex items-center gap-3">
          
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-full hover:bg-black/20 text-brand-cream transition"
            title="Search Designs"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Saved Favorites Icon with Live Badge */}
          <button
            onClick={openFavorites}
            className="relative p-2 rounded-full hover:bg-black/20 text-brand-cream transition group"
            title="Saved Favorites"
            aria-label="Saved Designs"
          >
            <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition ${favoriteCount > 0 ? 'text-rose-400 fill-rose-400' : 'text-brand-cream group-hover:text-brand-gold'}`} />
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-600 text-white rounded-full text-[11px] font-black flex items-center justify-center shadow-lg border-2 border-brand-maroon">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Cart Icon with Live Item Counter Badge */}
          <Link
            to="/cart"
            className="relative p-2 rounded-full hover:bg-black/20 text-brand-cream transition group"
            title="View Booking Cart"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-brand-cream group-hover:text-brand-gold transition" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 rounded-full text-[11px] font-black flex items-center justify-center shadow-lg border-2 border-brand-maroon">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Luxury Profile Avatar (ONLY icon displayed on header bar, name & logout in dropdown) */}
          {isAuthenticated ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-gold-dark via-brand-gold to-amber-200 text-brand-dark flex items-center justify-center font-serif font-bold text-base shadow-md border-2 border-brand-gold/80 hover:scale-105 transition-all focus:outline-none"
                title="Account Menu"
              >
                {userInitial.toUpperCase()}
              </button>

              {/* Luxury Floating Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white text-stone-800 rounded-2xl shadow-2xl border border-stone-200/90 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Header */}
                  <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-brand-maroon text-brand-gold flex items-center justify-center font-serif font-bold text-lg shadow-inner">
                      {userInitial.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-sm text-stone-900 truncate">
                        {user?.fullName || user?.firstName || 'Esteemed Patron'}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-brand-maroon">
                        {isAdmin ? 'Royal Administrator' : 'Royal Patron'}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Menu Links */}
                  <div className="py-2 text-xs">
                    <Link
                      to="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-brand-maroon transition font-medium"
                    >
                      <Calendar className="w-4 h-4 text-brand-gold" />
                      <span>My Bookings & Ceremonies</span>
                    </Link>

                    <Link
                      to="/custom-design"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-brand-maroon transition font-medium"
                    >
                      <Palette className="w-4 h-4 text-brand-gold" />
                      <span>Custom Design Commissions</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-brand-maroon transition font-medium"
                    >
                      <User className="w-4 h-4 text-brand-gold" />
                      <span>Profile & Venue Preferences</span>
                    </Link>

                    <Link
                      to="/become-artist"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-stone-50 text-stone-700 hover:text-brand-maroon transition font-medium"
                    >
                      <HeartHandshake className="w-4 h-4 text-brand-gold" />
                      <span>Join as Henna Artist</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 bg-amber-50/70 hover:bg-amber-100 text-brand-maroon transition font-bold border-y border-amber-200/60 my-1"
                      >
                        <Shield className="w-4 h-4 text-brand-maroon" />
                        <span>Admin Executive Console</span>
                      </Link>
                    )}
                  </div>

                  {/* Logout Row */}
                  <div className="border-t border-stone-100 pt-2 px-3">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-700 hover:bg-rose-50 transition font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="p-2.5 rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-dark text-brand-dark shadow-md hover:brightness-110 transition flex items-center justify-center"
              title="Sign In"
            >
              <User className="w-5 h-5" />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-brand-cream hover:bg-black/20 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Search Bar Dropdown */}
      {searchOpen && (
        <div className="md:hidden bg-brand-maroon-dark px-4 py-3 border-t border-brand-gold/20">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-brand-gold/70 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search motifs, bridal, arabic..."
              className="w-full pl-9 pr-3 py-2 rounded-full bg-black/40 text-brand-cream placeholder-brand-cream/50 text-xs border border-brand-gold/40 focus:outline-none"
            />
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-brand-maroon-dark border-t border-brand-gold/20 px-5 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-brand-cream hover:text-brand-gold"
          >
            Home
          </Link>
          <Link
            to="/designs"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-brand-gold flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Explore All Designs</span>
          </Link>
          <Link
            to="/custom-design"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-brand-cream hover:text-brand-gold flex items-center gap-2"
          >
            <Palette className="w-4 h-4 text-amber-300" />
            <span>Commission Custom Design</span>
          </Link>

          {/* AI Try-On temporarily commented out
          <Link
            to="/ai-tryon"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-brand-cream hover:text-brand-gold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>3D Virtual Hand Try-On</span>
          </Link>
          */}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openFavorites();
            }}
            className="w-full text-left text-base font-medium text-brand-cream hover:text-brand-gold flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Heart className={`w-4 h-4 ${favoriteCount > 0 ? 'text-rose-400 fill-rose-400' : 'text-brand-cream'}`} />
              <span>Saved Favorites</span>
            </div>
            {favoriteCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-xs">
                {favoriteCount} saved
              </span>
            )}
          </button>

          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-brand-cream hover:text-brand-gold flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>Booking Cart</span>
            </div>
            {itemCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold text-xs">
                {itemCount} items
              </span>
            )}
          </Link>

          <Link
            to="/booking"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-brand-cream hover:text-brand-gold flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </Link>
          <Link
            to="/help"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-brand-cream hover:text-brand-gold"
          >
            Mehendi Care & Help
          </Link>

          <Link
            to="/become-artist"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-brand-gold-light hover:text-brand-gold flex items-center gap-2 pt-2 border-t border-brand-cream/10"
          >
            <HeartHandshake className="w-4 h-4 text-brand-gold" />
            <span>Apply to Become an Artist</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-brand-gold flex items-center gap-2 pt-1"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management Portal</span>
            </Link>
          )}

          <div className="pt-4 border-t border-brand-cream/10 flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-brand-gold flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.firstName || user?.fullName || 'My Profile'}</span>
                </Link>
                <button onClick={handleLogoutClick} className="text-xs text-rose-300 underline">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-brand-gold text-brand-dark font-bold text-sm tracking-wide shadow"
              >
                Sign In / Create Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

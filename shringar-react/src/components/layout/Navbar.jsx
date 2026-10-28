import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Sparkles, User, Menu, X, Shield, 
  Calendar, Compass, Search, Palette, HeartHandshake,
  LogOut, ChevronDown, CheckCircle2, Heart, Camera, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCity } from '../../context/CityContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { favoriteCount, openFavorites } = useFavorites();
  const { city, openCityModal } = useCity();
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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#FDFBF7]/95 text-[#2C160A] border-b border-[#E6DFD3] shadow-sm transition-all duration-300 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-1 sm:gap-4 w-full">
        
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0" data-testid="nav-logo">
          <img
            src="/images/shringar-logo.png"
            alt="Shringar Logo"
            className="w-7 h-7 sm:w-11 sm:h-11 rounded-full object-cover border border-[#B58E34]/80 shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-serif text-sm sm:text-2xl font-bold tracking-wider text-[#4A2511] leading-tight">
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

          {/* AI Try-On feature temporarily commented out until next release
          <Link
            to="/try-on"
            className={`transition-colors hover:text-[#B58E34] flex items-center gap-1.5 ${
              isActive('/try-on') || isActive('/ai-tryon')
                ? 'text-[#B58E34] font-semibold border-b-2 border-[#B58E34] pb-0.5'
                : 'text-[#4A2511]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#B58E34]" />
            <span>AI Try-On</span>
          </Link>
          */}

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

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xs hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#7A6356] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bridal, arabic motifs..."
              className="w-full pl-9 pr-3 py-2 rounded-sm bg-[#F3EFE6] text-[#2C160A] placeholder-[#7A6356]/70 text-xs border border-[#E6DFD3] focus:outline-none focus:border-[#B58E34] focus:ring-1 focus:ring-[#B58E34] transition"
            />
          </form>
        </div>

        {/* Right Action Icons (Search, Cart & Profile Avatar Dropdown) */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          
          {/* City Location Selector with Story Accent */}
          <button
            type="button"
            onClick={openCityModal}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#F3EFE6] hover:bg-[#E6DFD3] border border-[#B58E34]/40 text-[#4A2511] text-[11px] sm:text-xs font-semibold transition group shrink-0 shadow-2xs hover:shadow-xs"
            title="Celebration City (Click to change location & local artists)"
            aria-label="Current celebration city"
          >
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#B58E34] group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden sm:inline text-stone-500 font-normal text-[11px]">In:</span>
            <span className="font-serif font-bold max-w-[65px] sm:max-w-[130px] truncate text-[#4A2511]">{city || 'City'}</span>
            <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#B58E34] opacity-80 shrink-0 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-1.5 rounded-sm hover:bg-[#F3EFE6] text-[#4A2511] transition"
            title="Search Designs"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Saved Favorites Icon with Live Badge (Responsive across Mobile, Tablet & Desktop) */}
          <button
            onClick={openFavorites}
            className="flex relative w-7 h-7 sm:w-9 sm:h-9 rounded-sm border border-[#E6DFD3] items-center justify-center hover:border-[#B58E34] hover:bg-[#F3EFE6]/60 text-[#4A2511] transition group"
            title="Saved Favorites (Liked Designs)"
            aria-label="Saved Designs"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition ${favoriteCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-[#4A2511] group-hover:text-[#B58E34]'}`} />
            {favoriteCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[15px] sm:min-w-[18px] h-[15px] sm:h-[18px] px-1 bg-[#4A2511] text-[#FDFBF7] rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Cart Icon with Live Item Counter Badge */}
          <Link
            to="/cart"
            className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-sm border border-[#E6DFD3] flex items-center justify-center hover:border-[#B58E34] hover:bg-[#F3EFE6]/60 text-[#4A2511] transition group"
            title="View Booking Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A2511] group-hover:text-[#B58E34] transition" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[15px] sm:min-w-[18px] h-[15px] sm:h-[18px] px-1 bg-[#B58E34] text-[#FDFBF7] rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Luxury Profile Avatar or Clean Sign In Button */}
          {isAuthenticated ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full bg-[#4A2511] text-[#FDFBF7] flex items-center justify-center font-serif font-bold text-sm shadow-sm border border-[#B58E34] hover:scale-105 transition-all focus:outline-none"
                title="Account Menu"
                data-testid="nav-profile-btn"
              >
                {userInitial.toUpperCase()}
              </button>

              {/* Luxury Floating Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white text-stone-800 rounded-sm shadow-xl border border-[#E6DFD3] py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Header */}
                  <div className="px-4 py-3 border-b border-[#E6DFD3]/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4A2511] text-[#FDFBF7] flex items-center justify-center font-serif font-bold text-base shadow-sm">
                      {userInitial.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-sm text-[#4A2511] truncate">
                        {user?.fullName || user?.firstName || 'Esteemed Patron'}
                      </p>
                      <p className="text-[11px] text-[#7A6356] truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider bg-[#F3EFE6] text-[#4A2511] border border-[#E6DFD3]">
                        {isAdmin ? 'Royal Administrator' : 'Royal Patron'}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Menu Links */}
                  <div className="py-2 text-xs">
                    <Link
                      to="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#F3EFE6] text-[#2C160A] hover:text-[#B58E34] transition font-medium"
                    >
                      <Calendar className="w-4 h-4 text-[#B58E34]" />
                      <span>My Bookings & Ceremonies</span>
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
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#F3EFE6] text-[#2C160A] hover:text-[#B58E34] transition font-medium"
                    >
                      <User className="w-4 h-4 text-[#B58E34]" />
                      <span>Profile & Venue Preferences</span>
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
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 bg-[#F3EFE6] hover:bg-[#E6DFD3] text-[#4A2511] transition font-bold border-y border-[#E6DFD3] my-1"
                        data-testid="nav-admin-link"
                      >
                        <Shield className="w-4 h-4 text-[#B58E34]" />
                        <span>Admin Executive Console</span>
                      </Link>
                    )}
                  </div>

                  {/* Logout Row */}
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
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/profile"
                className="flex md:hidden w-7 h-7 rounded-sm border border-[#E6DFD3] items-center justify-center text-[#4A2511] hover:bg-[#F3EFE6] transition"
                title="My Profile & Bookings"
                aria-label="My Profile & Bookings"
              >
                <User className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/login"
                className="hidden md:inline-flex shr-btn-primary !py-1.5 sm:!py-2 !px-3 sm:!px-4 !text-xs font-semibold tracking-wider uppercase rounded-sm shadow-sm"
                title="Sign In"
                data-testid="nav-login-btn"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-sm text-[#4A2511] hover:bg-[#F3EFE6] focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Search Bar Dropdown */}
      {searchOpen && (
        <div className="md:hidden bg-[#FDFBF7] px-4 py-3 border-t border-[#E6DFD3]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-[#7A6356] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bridal, arabic motifs..."
              className="w-full pl-9 pr-3 py-2 rounded-sm bg-[#F3EFE6] text-[#2C160A] placeholder-[#7A6356]/70 text-xs border border-[#E6DFD3] focus:outline-none focus:border-[#B58E34]"
            />
          </form>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FDFBF7] border-t border-[#E6DFD3] px-5 py-6 space-y-4 animate-in slide-in-from-top duration-200 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          {/* Mobile City Selector */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openCityModal();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F3EFE6] border border-[#E6DFD3] text-xs text-[#4A2511]"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#B58E34]" />
              <span className="font-semibold text-stone-600">Location:</span>
              <strong className="font-serif text-[#4A2511] font-bold">{city || 'Select City'}</strong>
            </div>
            <span className="text-[#B58E34] font-bold text-[11px] underline">Change</span>
          </button>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm uppercase tracking-wider font-medium text-[#4A2511] hover:text-[#B58E34]"
          >
            Home
          </Link>
          <Link
            to="/designs"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm uppercase tracking-wider font-semibold text-[#B58E34] flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Explore All Designs</span>
          </Link>
          {/* AI Try-On temporarily commented out
          <Link
            to="/try-on"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm uppercase tracking-wider font-medium text-[#4A2511] hover:text-[#B58E34] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#B58E34]" />
            <span>AI Virtual Hand Try-On</span>
          </Link>
          */}

          <Link
            to="/gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm uppercase tracking-wider font-medium text-[#4A2511] hover:text-[#B58E34] flex items-center gap-2"
          >
            <Camera className="w-4 h-4 text-[#B58E34]" />
            <span>Community Gallery</span>
          </Link>

          <Link
            to="/booking"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm uppercase tracking-wider font-medium text-[#4A2511] hover:text-[#B58E34] flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#B58E34]" />
            <span>Book Appointment</span>
          </Link>

          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm uppercase tracking-wider font-medium text-[#4A2511] hover:text-[#B58E34] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#B58E34]" />
              <span>Booking Cart</span>
            </div>
            {itemCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#B58E34] text-[#FDFBF7] font-bold text-xs">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile Liked Designs (Saved Favorites) */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openFavorites();
            }}
            className="w-full flex items-center justify-between text-sm uppercase tracking-wider font-medium text-[#4A2511] hover:text-[#B58E34] text-left"
          >
            <div className="flex items-center gap-2">
              <Heart className={`w-4 h-4 ${favoriteCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-[#B58E34]'}`} />
              <span>Liked Designs (Favorites)</span>
            </div>
            {favoriteCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#4A2511] text-[#FDFBF7] font-bold text-xs">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Mobile Direct Profile & My Bookings Link */}
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm uppercase tracking-wider font-medium text-[#4A2511] hover:text-[#B58E34] flex items-center gap-2"
          >
            <User className="w-4 h-4 text-[#B58E34]" />
            <span>My Profile & Bookings</span>
          </Link>

          <Link
            to="/help"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm uppercase tracking-wider font-medium text-[#4A2511] hover:text-[#B58E34]"
          >
            Mehendi Care & Help
          </Link>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm uppercase tracking-wider font-bold text-[#B58E34] flex items-center gap-2 pt-2 border-t border-[#E6DFD3]"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management Portal</span>
            </Link>
          )}

          <div className="pt-4 border-t border-[#E6DFD3] flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-[#4A2511] flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.firstName || user?.fullName || 'My Profile'}</span>
                </Link>
                <button onClick={handleLogoutClick} className="text-xs text-rose-700 underline font-semibold">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-sm bg-[#4A2511] text-[#FDFBF7] font-bold text-xs uppercase tracking-wider shadow"
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

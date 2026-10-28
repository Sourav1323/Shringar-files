import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Sparkles, Plus, Check, Heart, MapPin, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCity } from '../../context/CityContext';
import { isDesignAvailableInCity, getDesignOriginCity } from '../../utils/cityUtils';
import { getArtistCompatibility } from '../../utils/artistOptimizer';

export default function DesignCard({ design, isLocalAvailable, currentCity }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { city } = useCity();
  const navigate = useNavigate();

  const effectiveCity = currentCity || city || 'Delhi NCR';
  const isAvailable = isLocalAvailable !== undefined 
    ? isLocalAvailable 
    : isDesignAvailableInCity(design, effectiveCity);
  const origin = getDesignOriginCity(design);

  // Artist compatibility with existing cart (minimizes visiting artists)
  const artistCompat = getArtistCompatibility(design, cartItems, effectiveCity);

  const cartItem = cartItems.find((item) => String(item.id) === String(design.id));
  const quantity = cartItem?.quantity || 0;
  const isInCart = quantity > 0;
  const favorited = isFavorite(design.id);

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

  const handleCardClick = (e) => {
    if (!e.target.closest('button, a')) {
      navigate(`/designs/${design.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-sm overflow-hidden border border-[#E6DFD3] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
      data-testid="design-card"
    >
      
      {/* Image & Badges */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img
          src={getImageUrl(design.imageUrl)}
          alt={design.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/images/rajasthani-bridal.jpg';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1 z-10">
          {design.badge && (
            <span
              className="text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider text-white shadow-md"
              style={{ backgroundColor: design.badgeColor || '#7a2c1a' }}
            >
              {design.badge}
            </span>
          )}
          {design.category && (
            <span className="hidden xs:inline-block text-[9px] sm:text-[11px] font-semibold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/60 text-amber-200 backdrop-blur-sm shadow-sm">
              {design.category}
            </span>
          )}
        </div>

        {/* Favorites Heart Toggle Top-Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(design);
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-sm z-10 ${
            favorited
              ? 'bg-white text-rose-600 scale-105'
              : 'bg-black/40 hover:bg-black/60 text-white hover:scale-105'
          }`}
          title={favorited ? 'Remove from saved favorites' : 'Save to favorites'}
          aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition ${favorited ? 'fill-rose-600 text-rose-600' : 'text-white'}`} />
        </button>

        {/* Coverage Chip Bottom Right */}
        {design.coverage && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded text-[9px] sm:text-[11px] font-semibold text-stone-800 shadow-sm border border-stone-200 z-10">
            {design.coverage}
          </div>
        )}
      </div>

      {/* Details Body */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          <Link to={`/designs/${design.id}`}>
            <h3 className="font-serif font-bold text-xs sm:text-base text-[#4A2511] group-hover:text-[#B58E34] transition line-clamp-1">
              {design.name}
            </h3>
          </Link>

          {/* Descriptive text on tablet/desktop, hidden on mobile for clean tight cards */}
          <p className="hidden sm:block text-xs text-[#7A6356] mt-1 line-clamp-2 leading-relaxed">
            {design.description || 'Intricate artisan handcrafted henna pattern.'}
          </p>

          {/* Metadata Specs (Duration & Cones) */}
          <div className="flex items-center gap-1.5 sm:gap-3 mt-1.5 sm:mt-3 text-[10px] sm:text-xs text-[#7A6356] font-medium border-t border-[#E6DFD3]/60 pt-1.5 sm:pt-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#B58E34]" />
              <span>
                {design.durationMinHours || 1}–{design.durationMaxHours || 2}h
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#B58E34]" />
              <span>{design.conesNeeded || 1} {Number(design.conesNeeded) === 1 ? 'cone' : 'cones'}</span>
            </div>
          </div>

          {/* Location Availability Notice */}
          <div className="mt-2 px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[10px] sm:text-[11px] text-stone-700 flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold text-[#4A2511] truncate">
              <CheckCircle2 className={`w-3 h-3 shrink-0 ${isAvailable ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span className="truncate">{isAvailable ? `In ${effectiveCity}` : `${origin || 'Heritage'}`}</span>
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 ${isAvailable ? 'text-emerald-700' : 'text-amber-800'}`}>
              {isAvailable ? 'Local' : 'Available'}
            </span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="mt-2 sm:mt-3 pt-2 border-t border-[#E6DFD3]/60 flex items-center justify-between gap-1">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#7A6356] block">
              Starts at
            </span>
            <span className="text-xs sm:text-base font-serif font-bold text-[#4A2511]">
              {formatPrice(design.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {isInCart ? (
              <div 
                className="inline-flex items-center rounded-sm border border-[#B58E34] bg-[#FDFBF7] shadow-2xs overflow-hidden"
                title="Change design quantity"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(design.id, quantity - 1);
                  }}
                  className="w-5 h-6 sm:w-6 sm:h-7 flex items-center justify-center text-[#4A2511] hover:bg-[#F3EFE6] hover:text-[#B58E34] transition active:scale-90 font-bold text-xs sm:text-sm select-none"
                  title="Decrease quantity"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[16px] sm:min-w-[20px] text-center font-bold text-[11px] sm:text-xs text-[#4A2511] select-none px-0.5">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(design.id, quantity + 1);
                  }}
                  className="w-5 h-6 sm:w-6 sm:h-7 flex items-center justify-center text-[#4A2511] hover:bg-[#F3EFE6] hover:text-[#B58E34] transition active:scale-90 font-bold text-xs sm:text-sm select-none"
                  title="Increase quantity"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(design, 1);
                }}
                className="p-1.5 sm:p-2 rounded-sm text-xs font-semibold flex items-center justify-center bg-[#F3EFE6] hover:bg-[#E6DFD3] text-[#4A2511] border border-[#E6DFD3] transition"
                title="Add to booking package"
                aria-label="Add to cart"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A2511]" />
              </button>
            )}

            <Link
              to={`/designs/${design.id}`}
              className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm bg-[#4A2511] hover:bg-[#3A1D0D] text-[#FDFBF7] text-[10px] sm:text-xs font-medium uppercase tracking-wider transition shadow-sm"
            >
              View
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

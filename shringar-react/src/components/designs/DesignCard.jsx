import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Sparkles, Plus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function DesignCard({ design }) {
  const { cartItems, addToCart } = useCart();
  const isInCart = cartItems.some((item) => item.id === design.id);

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

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-brand-cream-dark/80 shadow-md hover:shadow-2xl hover:border-brand-gold/60 transition-all duration-300 flex flex-col justify-between">
      
      {/* Image & Badges */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <Link to={`/designs/${design.id}`}>
          <img
            src={getImageUrl(design.imageUrl)}
            alt={design.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/images/rajasthani-bridal.jpg';
            }}
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {design.badge && (
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white shadow-md"
              style={{ backgroundColor: design.badgeColor || '#7a2c1a' }}
            >
              {design.badge}
            </span>
          )}
          {design.category && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/60 text-amber-200 backdrop-blur-sm shadow-sm">
              {design.category}
            </span>
          )}
        </div>

        {/* Coverage Chip Bottom Right */}
        {design.coverage && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-stone-800 shadow-sm border border-stone-200">
            {design.coverage}
          </div>
        )}
      </div>

      {/* Details Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <Link to={`/designs/${design.id}`}>
            <h3 className="font-cinzel font-bold text-base sm:text-lg text-brand-dark group-hover:text-brand-maroon transition line-clamp-1">
              {design.name}
            </h3>
          </Link>

          <p className="text-xs text-brand-muted mt-1 line-clamp-2 leading-relaxed">
            {design.description || 'Intricate artisan handcrafted henna pattern.'}
          </p>

          {/* Metadata Specs (Duration & Cones) */}
          <div className="flex items-center gap-3 mt-3 text-xs text-stone-600 font-medium border-t border-stone-100 pt-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-gold-dark" />
              <span>
                {design.durationMinHours || 1}–{design.durationMaxHours || 2} hrs
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-dark" />
              <span>{design.conesNeeded || 1} {Number(design.conesNeeded) === 1 ? 'cone' : 'cones'}</span>
            </div>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              Starts at
            </span>
            <span className="text-lg font-bold text-brand-maroon">
              {formatPrice(design.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => addToCart(design)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                isInCart
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-brand-cream-dark hover:bg-brand-gold/30 text-brand-dark border border-stone-200'
              }`}
              title={isInCart ? 'Already in cart' : 'Add to cart'}
            >
              {isInCart ? <Check className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4" />}
            </button>

            <Link
              to={`/designs/${design.id}`}
              className="px-3.5 py-2 rounded-xl bg-brand-maroon hover:bg-brand-maroon-dark text-white text-xs font-bold transition shadow-sm hover:shadow"
            >
              View
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, X, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';

export default function FavoritesModal() {
  const { favorites, isFavoritesOpen, closeFavorites, removeFavorite, clearFavorites } = useFavorites();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  if (!isFavoritesOpen) return null;

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

  const handleCardClick = (id) => {
    closeFavorites();
    navigate(`/designs/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeFavorites}
      />

      {/* Slide-Over Drawer */}
      <div className="relative w-full max-w-md bg-stone-50 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 bg-brand-maroon text-brand-cream border-b border-brand-gold/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/40 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-brand-gold text-brand-gold" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-brand-cream">
                Saved Favorites
              </h2>
              <p className="text-[11px] text-brand-cream/80">
                {favorites.length} {favorites.length === 1 ? 'handcrafted design' : 'handcrafted designs'} saved
              </p>
            </div>
          </div>
          <button
            onClick={closeFavorites}
            className="p-2 rounded-full hover:bg-white/10 text-brand-cream/80 hover:text-white transition"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-20 h-20 rounded-full bg-amber-100 text-brand-maroon border-2 border-brand-gold/30 flex items-center justify-center mx-auto">
                <Heart className="w-10 h-10 text-brand-maroon stroke-[1.5]" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-stone-800">
                Your Favorites List is Empty
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Save your favorite mehendi designs by tapping the heart icon on any design card while exploring.
              </p>
              <button
                onClick={() => {
                  closeFavorites();
                  navigate('/designs');
                }}
                className="mt-4 px-6 py-2.5 rounded-full bg-brand-maroon hover:bg-brand-maroon-dark text-white font-bold text-xs uppercase tracking-wider shadow transition"
              >
                Browse Designs Catalog
              </button>
            </div>
          ) : (
            favorites.map((item) => {
              const inCart = cartItems.some((c) => String(c.id) === String(item.id));
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition flex items-center gap-4 group"
                >
                  {/* Thumbnail Image */}
                  <div
                    onClick={() => handleCardClick(item.id)}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 cursor-pointer border border-stone-200"
                  >
                    <img
                      src={getImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4
                      onClick={() => handleCardClick(item.id)}
                      className="font-cinzel font-bold text-sm text-stone-900 truncate cursor-pointer hover:text-brand-maroon transition"
                    >
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-brand-maroon">
                        {item.category || 'Bridal'}
                      </span>
                      {item.coverage && (
                        <span className="text-[10px] text-stone-500">
                          {item.coverage}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-bold text-brand-maroon">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addToCart(item)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition ${
                        inCart
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-brand-maroon hover:bg-brand-maroon-dark text-white shadow-sm'
                      }`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>{inCart ? 'In Cart' : 'Add'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {favorites.length > 0 && (
          <div className="p-6 bg-white border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={clearFavorites}
                className="text-xs text-stone-500 hover:text-red-600 transition font-medium"
              >
                Clear All Favorites
              </button>
              <button
                onClick={() => {
                  closeFavorites();
                  navigate('/designs');
                }}
                className="text-xs text-brand-maroon hover:underline font-bold"
              >
                Explore More Designs →
              </button>
            </div>
            <button
              onClick={() => {
                closeFavorites();
                navigate('/cart');
              }}
              className="w-full py-3.5 rounded-2xl bg-brand-maroon hover:bg-brand-maroon-dark text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Go to Booking Cart</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

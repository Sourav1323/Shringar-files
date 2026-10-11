import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const FavoritesContext = createContext();

const STORAGE_KEY = 'shringar_favorites_v2';

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('shringar_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not persist favorites to localStorage:', e);
    }
  }, [favorites]);

  const isFavorite = (id) => {
    if (!id) return false;
    return favorites.some((item) => String(item.id) === String(id));
  };

  const toggleFavorite = (design) => {
    if (!design || !design.id) return;

    const exists = isFavorite(design.id);
    if (exists) {
      setFavorites((prev) => prev.filter((item) => String(item.id) !== String(design.id)));
      toast.showInfo?.(`🤍 Removed "${design.name}" from saved favorites`);
    } else {
      const cleanDesign = {
        id: design.id,
        name: design.name,
        price: design.price || 0,
        imageUrl: design.imageUrl || '/images/rajasthani-bridal.jpg',
        category: design.category || 'Bridal',
        coverage: design.coverage || 'Full hand',
        badge: design.badge || '',
        description: design.description || '',
      };
      setFavorites((prev) => [cleanDesign, ...prev]);
      toast.showSuccess?.(`❤️ Saved "${design.name}" to your favorites!`);
    }
  };

  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((item) => String(item.id) !== String(id)));
    toast.showInfo?.('🤍 Removed from favorites');
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('shringar_favorites');
    toast.showInfo?.('Favorites list cleared');
  };

  const openFavorites = () => setIsFavoritesOpen(true);
  const closeFavorites = () => setIsFavoritesOpen(false);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteCount: favorites.length,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
        isFavoritesOpen,
        openFavorites,
        closeFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

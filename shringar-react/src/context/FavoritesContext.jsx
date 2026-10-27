import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const currentUserId = user?.id ? String(user.id) : 'guest';
  const loadedUserRef = useRef(currentUserId);

  const getFavKey = (uid) => (uid ? `shringar_favorites_user_${uid}` : 'shringar_favorites_guest');

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(getFavKey(user?.id));
      if (saved) return JSON.parse(saved);
      // Legacy migration check only for guest
      if (!user?.id) {
        const legacy = localStorage.getItem('shringar_favorites_v2') || localStorage.getItem('shringar_favorites');
        return legacy ? JSON.parse(legacy) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const toast = useToast();

  // Reload favorites specifically when active user changes (login / logout / switch account)
  useEffect(() => {
    if (loadedUserRef.current !== currentUserId) {
      loadedUserRef.current = currentUserId;
      try {
        const saved = localStorage.getItem(getFavKey(user?.id));
        setFavorites(saved ? JSON.parse(saved) : []);
      } catch {
        setFavorites([]);
      }
    }
  }, [currentUserId, user?.id]);

  // Persist favorites ONLY if current state matches the current user
  useEffect(() => {
    if (loadedUserRef.current === currentUserId) {
      try {
        localStorage.setItem(getFavKey(user?.id), JSON.stringify(favorites));
      } catch (e) {
        console.warn('Could not persist favorites to localStorage:', e);
      }
    }
  }, [favorites, currentUserId, user?.id]);

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
    try {
      localStorage.removeItem(getFavKey(user?.id));
    } catch {}
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

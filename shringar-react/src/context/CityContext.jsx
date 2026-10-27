import React, { createContext, useContext, useState, useEffect } from 'react';

const CityContext = createContext(null);

export const SUPPORTED_CITIES = [
  { name: 'Delhi NCR', icon: '🏛️', tag: 'Top Availability', artistsCount: '18+ Master Artists', state: 'National Capital Region' },
  { name: 'Mumbai', icon: '🌊', tag: 'Fast Response', artistsCount: '24+ Master Artists', state: 'Maharashtra' },
  { name: 'Bangalore', icon: '💻', tag: 'Popular Hub', artistsCount: '15+ Master Artists', state: 'Karnataka' },
  { name: 'Jaipur', icon: '🌸', tag: 'Heritage Royalty', artistsCount: '20+ Master Artists', state: 'Rajasthan' },
  { name: 'Hyderabad', icon: '🕌', tag: 'Nizami Specialist', artistsCount: '12+ Master Artists', state: 'Telangana' },
  { name: 'Kolkata', icon: '🎨', tag: 'Traditional Bridal', artistsCount: '10+ Master Artists', state: 'West Bengal' },
  { name: 'Pune', icon: '⛰️', tag: 'Modern & Minimal', artistsCount: '14+ Master Artists', state: 'Maharashtra' },
  { name: 'Ahmedabad', icon: '🧵', tag: 'Kundan & Jaal', artistsCount: '11+ Master Artists', state: 'Gujarat' },
];

const SESSION_KEY = 'shringar_city_modal_acknowledged_v6';

export function CityProvider({ children }) {
  const [city, setCityState] = useState(() => {
    try {
      return localStorage.getItem('shringar_selected_city') || '';
    } catch {
      return '';
    }
  });

  // Always show modal upon landing if not confirmed in this session
  const [isCityModalOpen, setIsCityModalOpen] = useState(() => {
    try {
      const acknowledged = sessionStorage.getItem(SESSION_KEY);
      return !acknowledged;
    } catch {
      return true;
    }
  });

  const setCity = (newCity) => {
    if (!newCity) return;
    const cleanCity = newCity.trim();
    setCityState(cleanCity);
    try {
      localStorage.setItem('shringar_selected_city', cleanCity);
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {
      console.warn('Could not save selected city:', e);
    }
    setIsCityModalOpen(false);
    window.dispatchEvent(new CustomEvent('shringar_city_changed', { detail: { city: cleanCity } }));
  };

  const openCityModal = () => setIsCityModalOpen(true);

  const closeCityModal = () => {
    const chosen = city || 'Delhi NCR';
    if (!city) {
      setCity(chosen);
    }
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {}
    setIsCityModalOpen(false);
  };

  // Sync state if another tab or component updates localStorage
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'shringar_selected_city' && e.newValue) {
        setCityState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <CityContext.Provider
      value={{
        city: city || 'Delhi NCR',
        hasChosenCity: !!city,
        isCityModalOpen,
        openCityModal,
        closeCityModal,
        setCity,
        supportedCities: SUPPORTED_CITIES,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CITY_DEFAULT_PINCODES } from '../utils/pincodeDistance';

const CityContext = createContext(null);

export const SUPPORTED_CITIES = [
  { name: 'Delhi NCR', icon: '🏛️', tag: 'Top Availability', artistsCount: '18+ Master Artists', state: 'National Capital Region', basePincode: '110001' },
  { name: 'Mumbai', icon: '🌊', tag: 'Fast Response', artistsCount: '24+ Master Artists', state: 'Maharashtra', basePincode: '400001' },
  { name: 'Bangalore', icon: '💻', tag: 'Popular Hub', artistsCount: '15+ Master Artists', state: 'Karnataka', basePincode: '560001' },
  { name: 'Jaipur', icon: '🌸', tag: 'Heritage Royalty', artistsCount: '20+ Master Artists', state: 'Rajasthan', basePincode: '302001' },
  { name: 'Hyderabad', icon: '🕌', tag: 'Nizami Specialist', artistsCount: '12+ Master Artists', state: 'Telangana', basePincode: '500001' },
  { name: 'Kolkata', icon: '🎨', tag: 'Traditional Bridal', artistsCount: '10+ Master Artists', state: 'West Bengal', basePincode: '700001' },
  { name: 'Pune', icon: '⛰️', tag: 'Modern & Minimal', artistsCount: '14+ Master Artists', state: 'Maharashtra', basePincode: '411001' },
  { name: 'Ahmedabad', icon: '🧵', tag: 'Kundan & Jaal', artistsCount: '11+ Master Artists', state: 'Gujarat', basePincode: '380001' },
];

const SESSION_KEY = 'shringar_city_modal_acknowledged_v7';

export function CityProvider({ children }) {
  const [city, setCityState] = useState(() => {
    try {
      return localStorage.getItem('shringar_selected_city') || '';
    } catch {
      return '';
    }
  });

  const [pincode, setPincodeState] = useState(() => {
    try {
      return localStorage.getItem('shringar_selected_pincode') || '';
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

  const setCityAndPincode = (newCity, newPincode) => {
    if (!newCity) return;
    const cleanCity = newCity.trim();
    const cleanPin = (newPincode || CITY_DEFAULT_PINCODES[cleanCity] || '110001').trim();
    
    setCityState(cleanCity);
    setPincodeState(cleanPin);

    try {
      localStorage.setItem('shringar_selected_city', cleanCity);
      localStorage.setItem('shringar_selected_pincode', cleanPin);
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {
      console.warn('Could not save selected city and pincode:', e);
    }

    setIsCityModalOpen(false);
    window.dispatchEvent(
      new CustomEvent('shringar_city_changed', {
        detail: { city: cleanCity, pincode: cleanPin },
      })
    );
  };

  const setCity = (newCity) => {
    const defaultPin = CITY_DEFAULT_PINCODES[newCity] || pincode || '110001';
    setCityAndPincode(newCity, defaultPin);
  };

  const setPincode = (newPin) => {
    if (!newPin) return;
    const clean = newPin.trim();
    setPincodeState(clean);
    try {
      localStorage.setItem('shringar_selected_pincode', clean);
    } catch {}
  };

  const openCityModal = () => setIsCityModalOpen(true);

  const closeCityModal = () => {
    const chosen = city || 'Delhi NCR';
    const chosenPin = pincode || CITY_DEFAULT_PINCODES[chosen] || '110001';
    if (!city || !pincode) {
      setCityAndPincode(chosen, chosenPin);
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
      if (e.key === 'shringar_selected_pincode' && e.newValue) {
        setPincodeState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <CityContext.Provider
      value={{
        city: city || 'Delhi NCR',
        pincode: pincode || CITY_DEFAULT_PINCODES[city || 'Delhi NCR'] || '110001',
        hasChosenCity: !!city && !!pincode,
        isCityModalOpen,
        openCityModal,
        closeCityModal,
        setCity,
        setPincode,
        setCityAndPincode,
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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CitiesAPI } from '../services/api';
import { isValidIndianPincode } from '../utils/pincodeDistance';

const CityContext = createContext(null);

const SESSION_KEY = 'shringar_city_modal_acknowledged_v10';
const LEGACY_DEFAULT_PINCODES = ['110001', '302001', '400001', '560001', '500001', '700001', '411001', '380001'];

const CITY_ICONS = {
  mumbai: '🌊',
  pune: '⛰️',
  delhi: '🏛️',
  delhi_ncr: '🏛️',
  new_delhi: '🏛️',
  gurugram: '🏢',
  bangalore: '💻',
  bengaluru: '💻',
  jaipur: '🌸',
  ajmer: '🕌',
  hyderabad: '🕌',
  kolkata: '🎨',
  ahmedabad: '🧵',
  nashik: '🍇',
  udaipur: '🏰',
  jodhpur: '🏰',
  lucknow: '🪡',
  chandigarh: '🌳',
  chennai: '🪔',
};

function formatCityFromApi(c) {
  const normKey = (c.name || '').toLowerCase().replace(/[\s-]+/g, '_');
  const icon = CITY_ICONS[normKey] || '🏛️';
  const displayName = c.displayName || (c.name ? c.name.charAt(0).toUpperCase() + c.name.slice(1) : 'City');
  const artistCount = c.artistCount || 0;
  const tag = c.isComingSoon
    ? (c.launchQuarter || 'Coming Soon')
    : (artistCount > 0 ? `${artistCount} Artists Available` : 'Active Hub');
  const artistsText = c.isComingSoon
    ? 'Launching Soon'
    : (artistCount > 0 ? `${artistCount}+ Master Artists` : 'Verified Artists');

  return {
    id: c.id,
    internalName: c.name,
    name: displayName,
    displayName: displayName,
    icon: icon,
    tag: tag,
    artistsCount: artistsText,
    isActive: c.isActive !== false,
    isComingSoon: !!c.isComingSoon,
    areas: c.areas || [],
  };
}

export function CityProvider({ children }) {
  const [supportedCities, setSupportedCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);

  const [city, setCityState] = useState(() => {
    try {
      return localStorage.getItem('shringar_selected_city') || '';
    } catch {
      return '';
    }
  });

  const [pincode, setPincodeState] = useState(() => {
    try {
      const savedPin = localStorage.getItem('shringar_selected_pincode');
      if (savedPin && LEGACY_DEFAULT_PINCODES.includes(savedPin)) {
        localStorage.removeItem('shringar_selected_pincode');
        return '';
      }
      return isValidIndianPincode(savedPin) ? savedPin : '';
    } catch {
      return '';
    }
  });

  // Purge any legacy default pincode on mount
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem('shringar_selected_pincode');
      if (savedPin && LEGACY_DEFAULT_PINCODES.includes(savedPin)) {
        localStorage.removeItem('shringar_selected_pincode');
        setPincodeState('');
      }
    } catch {}
  }, []);

  // Always show modal upon landing if not confirmed in this session
  const [isCityModalOpen, setIsCityModalOpen] = useState(() => {
    try {
      const acknowledged = sessionStorage.getItem(SESSION_KEY);
      return !acknowledged;
    } catch {
      return true;
    }
  });

  // Fetch live cities from backend (syncing with Admin Portal Locations)
  const fetchCities = useCallback(async () => {
    try {
      setLoadingCities(true);
      const data = await CitiesAPI.getAll();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(formatCityFromApi);
        setSupportedCities(formatted);
      }
    } catch (err) {
      console.warn('Could not fetch live cities from backend, using current active state:', err);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // If city is not set yet, sync with first available city once loaded
  useEffect(() => {
    if (supportedCities.length > 0 && !city) {
      const firstActive = supportedCities.find((c) => c.isActive && !c.isComingSoon) || supportedCities[0];
      if (firstActive) {
        setCityState(firstActive.name);
      }
    }
  }, [supportedCities, city]);

  const setCityAndPincode = (newCity, newPincode) => {
    if (!newCity) return;
    const cleanCity = newCity.trim();
    const cleanPin = newPincode && isValidIndianPincode(newPincode) ? newPincode.trim() : '';

    setCityState(cleanCity);
    setPincodeState(cleanPin);

    try {
      localStorage.setItem('shringar_selected_city', cleanCity);
      if (cleanPin) {
        localStorage.setItem('shringar_selected_pincode', cleanPin);
      } else {
        localStorage.removeItem('shringar_selected_pincode');
      }
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
    setCityAndPincode(newCity, pincode || '');
  };

  const setPincode = (newPin) => {
    const clean = newPin ? String(newPin).trim() : '';
    setPincodeState(clean);
    try {
      if (clean && isValidIndianPincode(clean)) {
        localStorage.setItem('shringar_selected_pincode', clean);
      } else {
        localStorage.removeItem('shringar_selected_pincode');
      }
    } catch {}
  };

  const openCityModal = () => setIsCityModalOpen(true);

  const closeCityModal = () => {
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
      if (e.key === 'shringar_selected_pincode') {
        setPincodeState(e.newValue || '');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <CityContext.Provider
      value={{
        city: city || (supportedCities[0]?.name || ''),
        pincode: pincode || '',
        hasChosenCity: !!city && !!pincode,
        isCityModalOpen,
        openCityModal,
        closeCityModal,
        setCity,
        setPincode,
        setCityAndPincode,
        supportedCities,
        loadingCities,
        refreshCities: fetchCities,
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

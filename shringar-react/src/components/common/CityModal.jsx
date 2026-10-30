import React, { useState, useEffect } from 'react';
import { MapPin, Search, CheckCircle2, X, ArrowRight, ShieldCheck, AlertCircle, Compass, Loader2 } from 'lucide-react';
import { useCity } from '../../context/CityContext';
import { isValidIndianPincode } from '../../utils/pincodeDistance';

export default function CityModal() {
  const { city, pincode, isCityModalOpen, closeCityModal, setCityAndPincode, supportedCities, loadingCities } = useCity();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPendingCity, setSelectedPendingCity] = useState(city || '');
  const [inputPincode, setInputPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');

  // When modal is opened, sync selectedPendingCity once from current active city, and ensure pincode input starts completely empty
  useEffect(() => {
    if (isCityModalOpen) {
      if (city) {
        setSelectedPendingCity(city);
      } else if (supportedCities.length > 0) {
        const firstActive = supportedCities.find((c) => c.isActive && !c.isComingSoon) || supportedCities[0];
        if (firstActive) setSelectedPendingCity(firstActive.name);
      }
      setSearchTerm('');
      setInputPincode('');
      setPincodeError('');
    }
  }, [isCityModalOpen]);

  // If cities were still loading when modal opened and just finished loading, pick first active city only if none selected
  useEffect(() => {
    if (!selectedPendingCity && supportedCities.length > 0) {
      const firstActive = supportedCities.find((c) => c.isActive && !c.isComingSoon) || supportedCities[0];
      if (firstActive) setSelectedPendingCity(firstActive.name);
    }
  }, [supportedCities]);

  if (!isCityModalOpen) return null;

  const filteredCities = supportedCities.filter((c) =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleCityPick = (cityName) => {
    setSelectedPendingCity(cityName);
    // When changing city, always clear pincode so old city's pincode never leaks
    setInputPincode('');
    setPincodeError('');
  };

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setInputPincode(val);
    if (!val) {
      setPincodeError('Area PIN code is mandatory.');
    } else if (val.length < 6) {
      setPincodeError(`PIN code must be exactly 6 numeric digits (${val.length}/6 entered).`);
    } else {
      setPincodeError('');
    }
  };

  const handleConfirm = () => {
    const cleanPin = inputPincode.trim();
    if (!cleanPin) {
      setPincodeError('Mandatory: Please enter your 6-digit area PIN code.');
      return;
    }
    if (!isValidIndianPincode(cleanPin)) {
      setPincodeError('Please enter a valid 6-digit Indian PIN code (e.g. 110001, 302001, 560001).');
      return;
    }

    const targetCity = selectedPendingCity || (supportedCities[0]?.name || '');
    if (!targetCity) {
      setPincodeError('Please select a service city.');
      return;
    }

    setPincodeError('');
    setCityAndPincode(targetCity, cleanPin);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/75 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={closeCityModal}
    >
      <div
        className="bg-[#FDFBF7] text-[#2C160A] w-full max-w-3xl lg:max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#B58E34]/40 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Story Connected Header */}
        <div className="bg-gradient-to-br from-[#4A2511] via-[#3A1D0D] to-[#241711] text-[#FDFBF7] p-5 sm:p-7 lg:p-8 relative border-b border-[#B58E34]/30 shrink-0">
          <button
            onClick={closeCityModal}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-[#FDFBF7] flex items-center justify-center transition"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Connected Flow Step Bar */}
          <div className="flex items-center gap-2 flex-wrap text-[#E8C87A] text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-5 h-5 rounded-full bg-[#B58E34] text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Step 1: City & Area PIN</span>
            <span className="text-stone-400">⟶</span>
            <span className="text-stone-400 font-normal">2. Royal Motifs</span>
            <span className="text-stone-400">⟶</span>
            <span className="text-stone-400 font-normal">3. Doorstep Visit</span>
          </div>

          <h2 className="font-serif text-xl sm:text-3xl lg:text-3xl font-bold text-white tracking-wide">
            Where Should Your Ritual Begin?
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm lg:text-base mt-1.5 leading-relaxed max-w-2xl">
            Choose your city from our verified service regions and enter your area PIN code to check artist availability for your ceremony.
          </p>

          <div className="flex items-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-[#E8C87A] flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Verified Master Artisans
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Compass className="w-4 h-4 text-[#B58E34] shrink-0" />
              Doorstep Service at Your Venue
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 lg:p-8 overflow-y-auto space-y-6">
          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search listed cities (Ajmer, Bengaluru, Gurugram, Jaipur, New Delhi...)"
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl bg-white border border-[#E6DFD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#B58E34] text-[#2C160A] placeholder-stone-400 shadow-xs"
            />
          </div>

          {/* Listed Cities Grid ONLY (Live from Admin Portal) */}
          <div>
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">
              <span>Select Listed City</span>
              <span className="text-[#B58E34] font-bold">Configured Service Cities</span>
            </div>

            {loadingCities && supportedCities.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-stone-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#B58E34]" />
                <span className="text-sm">Loading available service cities…</span>
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="text-center py-8 bg-amber-50/50 rounded-xl border border-amber-200 text-stone-600 text-sm">
                No cities found matching &quot;{searchTerm}&quot;. Please check the spelling or add via Admin Portal.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
                {filteredCities.map((c) => {
                  const isSelected = selectedPendingCity?.toLowerCase() === c.name.toLowerCase();
                  return (
                    <button
                      key={c.id || c.name}
                      type="button"
                      onClick={() => handleCityPick(c.name)}
                      className={`flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border transition-all text-left group ${
                        isSelected
                          ? 'bg-[#4A2511] text-white border-[#4A2511] shadow-md scale-[1.02]'
                          : 'bg-white hover:bg-[#F3EFE6] border-[#E6DFD3] text-[#2C160A] hover:border-[#B58E34]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full mb-2">
                        <span className="text-2xl p-1.5 bg-stone-100 rounded-lg group-hover:scale-105 transition-transform">
                          {c.icon}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#E8C87A]" />}
                      </div>

                      <div>
                        <div className="font-serif font-bold text-sm sm:text-base leading-tight">
                          {c.displayName || c.name}
                        </div>
                        <div className={`text-xs mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {c.artistsCount}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mt-2.5 w-fit ${
                          isSelected ? 'bg-[#B58E34] text-white' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* MANDATORY AREA PINCODE INPUT (No Auto-Fill) */}
          <div className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border-2 border-amber-300/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#4A2511] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#B58E34]" />
                <span>Mandatory Area PIN Code</span>
                <span className="text-red-600 font-bold">*</span>
              </label>
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                India (6 Digits)
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-snug">
              Select your city above, then enter your 6-digit venue PIN code manually to check artist availability for <strong>{selectedPendingCity || 'your city'}</strong>.
            </p>

            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                maxLength={6}
                value={inputPincode}
                onChange={handlePincodeChange}
                placeholder="Enter 6-digit PIN (e.g. 110001, 302001, 560001)"
                className={`w-full px-4 py-3 rounded-xl border text-base font-mono tracking-widest font-bold focus:outline-none focus:ring-2 ${
                  pincodeError
                    ? 'border-red-400 bg-red-50/50 focus:ring-red-400 text-red-900'
                    : 'border-amber-300 bg-white focus:ring-[#B58E34] text-[#2C160A]'
                }`}
              />
            </div>

            {pincodeError ? (
              <div className="text-xs font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pincodeError}</span>
              </div>
            ) : isValidIndianPincode(inputPincode) ? (
              <div className="text-emerald-700 text-xs flex items-center gap-1.5 font-medium pt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Coverage active for {selectedPendingCity} (PIN: {inputPincode})</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F3EFE6] px-5 sm:px-8 py-4 border-t border-[#E6DFD3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-stone-600 flex items-center justify-center sm:justify-start gap-1.5">
            <MapPin className="w-4 h-4 text-[#B58E34] shrink-0" />
            <span>
              Target: <strong className="text-[#4A2511] font-serif">{selectedPendingCity || 'None'}</strong> · PIN:{' '}
              {inputPincode ? (
                <strong className="font-mono text-[#4A2511]">{inputPincode}</strong>
              ) : (
                <span className="text-amber-800 font-semibold italic">Not entered (Required)</span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto justify-center px-8 py-3 bg-[#4A2511] hover:bg-[#3A1D0D] text-[#FDFBF7] rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest transition shadow-md flex items-center gap-2 active:scale-98 cursor-pointer"
          >
            <span>Confirm & Explore Designs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

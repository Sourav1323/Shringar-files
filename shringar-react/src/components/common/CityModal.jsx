import React, { useState, useEffect } from 'react';
import { MapPin, Search, CheckCircle2, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCity } from '../../context/CityContext';

export default function CityModal() {
  const { city, isCityModalOpen, closeCityModal, setCity, supportedCities, hasChosenCity } = useCity();
  const [searchTerm, setSearchTerm] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [selectedPendingCity, setSelectedPendingCity] = useState(city || 'Delhi NCR');

  useEffect(() => {
    if (city) {
      setSelectedPendingCity(city);
    }
  }, [city]);

  if (!isCityModalOpen) return null;

  const filteredCities = supportedCities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleCityPick = (cityName) => {
    setSelectedPendingCity(cityName);
    setCity(cityName);
  };

  const handleCustomCitySubmit = (e) => {
    e.preventDefault();
    if (customCity.trim()) {
      handleCityPick(customCity.trim());
      setCustomCity('');
    }
  };

  const handleConfirm = () => {
    handleCityPick(selectedPendingCity || city || 'Delhi NCR');
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={closeCityModal}
    >
      <div 
        className="bg-[#FDFBF7] text-[#2C160A] w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#B58E34]/40 overflow-hidden flex flex-col max-h-[96vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Story Connected Prologue Banner */}
        <div className="bg-gradient-to-br from-[#4A2511] via-[#3A1D0D] to-[#241711] text-[#FDFBF7] p-3.5 sm:p-7 relative border-b border-[#B58E34]/30 shrink-0">
          <button
            onClick={closeCityModal}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FDFBF7] flex items-center justify-center transition"
            title="Close and continue"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Connected Flow Step Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[#E8C87A] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider sm:tracking-widest mb-1.5 sm:mb-2">
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#B58E34] text-white flex items-center justify-center text-[9px] sm:text-[10px]">1</span>
            <span>Step 1: City</span>
            <span className="text-stone-400">⟶</span>
            <span className="text-stone-400 font-normal">2. Designs</span>
            <span className="text-stone-400">⟶</span>
            <span className="text-stone-400 font-normal">3. Doorstep Visit</span>
          </div>

          <h2 className="font-serif text-lg sm:text-3xl font-bold text-white tracking-wide">
            Where Should Your Ritual Begin?
          </h2>
          <p className="hidden sm:block text-stone-300 text-xs sm:text-sm mt-1.5 sm:mt-2 leading-relaxed">
            Shringar delivers verified master henna artisans to your doorstep. Choose your city to unveil local artisan availability, doorstep appointment slots, and regional heritage motifs.
          </p>

          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-white/10 text-[10px] sm:text-[11px] text-[#E8C87A] flex-wrap">
            <span className="flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Store Cones by Preference
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#B58E34] shrink-0" />
              Doorstep Master Artisans
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search major city (e.g. Pune, Delhi NCR, Mumbai, Jaipur...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E6DFD3] text-sm focus:outline-none focus:ring-2 focus:ring-[#B58E34] text-[#2C160A] placeholder-stone-400 shadow-xs"
              autoFocus
            />
          </div>

          {/* Supported Cities Grid */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
              <span>Select Your Location</span>
              <span className="text-[#B58E34] font-bold">Verified Artisans Ready</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredCities.map((c) => {
                const isSelected = (selectedPendingCity || city)?.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleCityPick(c.name)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group ${
                      isSelected
                        ? 'bg-[#4A2511] text-white border-[#4A2511] shadow-md scale-[1.01]'
                        : 'bg-white hover:bg-[#F3EFE6] border-[#E6DFD3] text-[#2C160A] hover:border-[#B58E34]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1 bg-stone-100 rounded-xl group-hover:scale-110 transition-transform">
                        {c.icon}
                      </span>
                      <div>
                        <div className="font-serif font-bold text-sm flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#E8C87A]" />}
                        </div>
                        <div className={`text-[11px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {c.artistsCount}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-[#B58E34] text-white' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredCities.length === 0 && (
              <div className="text-center py-6 text-stone-500 text-sm">
                No matching city in our quick list. You can enter your specific town below.
              </div>
            )}
          </div>

          {/* Custom City Entry */}
          <div className="bg-white p-4 rounded-2xl border border-[#E6DFD3] space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Other City or Wedding Destination
            </label>
            <form onSubmit={handleCustomCitySubmit} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Enter your town (e.g. Udaipur, Lucknow, Chandigarh)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B58E34]"
                />
              </div>
              <button
                type="submit"
                disabled={!customCity.trim()}
                className="px-4 py-2 bg-[#4A2511] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#3A1D0D] transition disabled:opacity-40"
              >
                Set
              </button>
            </form>
          </div>
        </div>

        {/* Footer with Connected Story Action */}
        <div className="bg-[#F3EFE6] px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#E6DFD3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-600 flex items-center justify-center sm:justify-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#B58E34] shrink-0" />
            <span>Selected: <strong className="text-[#4A2511] font-serif">{selectedPendingCity || city || 'Delhi NCR'}</strong></span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto justify-center px-6 py-3 sm:py-2.5 bg-[#4A2511] hover:bg-[#3A1D0D] text-[#FDFBF7] rounded-full text-xs font-bold uppercase tracking-widest transition shadow-md flex items-center gap-2 active:scale-98"
          >
            <span>Begin in {selectedPendingCity || city || 'Delhi NCR'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Download, Share2, Calendar, Sparkles, Maximize2, Minimize2 
} from 'lucide-react';

/**
 * Mobile-optimized, touch-friendly Fullscreen Image Gallery Viewer Lightbox
 * Supports swipe gestures, zoom in/out, keyboard navigation, and action buttons.
 */
export default function ImageGalleryViewer({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onIndexChange,
  onBook,
}) {
  const [index, setIndex] = useState(currentIndex || 0);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  useEffect(() => {
    setIndex(currentIndex || 0);
    setIsZoomed(false);
  }, [currentIndex, isOpen]);

  // Lock background scroll when viewer is active
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, index, images.length]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentItem = images[index] || {};
  const currentImageUrl = typeof currentItem === 'string' 
    ? currentItem 
    : (currentItem.imageUrl || currentItem.url || currentItem.image);

  const handleNext = () => {
    setIsZoomed(false);
    const nextIdx = (index + 1) % images.length;
    setIndex(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx);
  };

  const handlePrev = () => {
    setIsZoomed(false);
    const prevIdx = (index - 1 + images.length) % images.length;
    setIndex(prevIdx);
    if (onIndexChange) onIndexChange(prevIdx);
  };

  // Touch Swipe Handling for Mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (isZoomed) return; // Allow panning when zoomed
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Minimum horizontal swipe distance of 45px, and horizontal travel must exceed vertical
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleDownload = () => {
    if (!currentImageUrl) return;
    const a = document.createElement('a');
    a.href = currentImageUrl;
    a.download = `shringar-artwork-${index + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none animate-fadeIn"
      style={{ touchAction: isZoomed ? 'pan-x pan-y' : 'pan-y' }}
    >
      {/* ── Top Header Toolbar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 z-20 bg-gradient-to-b from-black/80 to-transparent">
        {/* Left: Counter & Title */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-serif font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-stone-800/90 text-amber-300 border border-amber-400/20 shadow-sm">
            {index + 1} / {images.length}
          </span>
          {currentItem.title && (
            <span className="text-white font-serif font-semibold text-xs sm:text-sm truncate max-w-[180px] sm:max-w-xs">
              {currentItem.title}
            </span>
          )}
        </div>

        {/* Right: Zoom, Download, Close Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Toggle */}
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition"
            title={isZoomed ? "Zoom Out" : "Zoom In (HD Inspection)"}
            aria-label="Toggle Zoom"
          >
            {isZoomed ? <ZoomOut className="w-5 h-5 text-amber-300" /> : <ZoomIn className="w-5 h-5" />}
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition"
            title="Download HD Image"
            aria-label="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Close Modal Button (Large touch target for mobile) */}
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-rose-600/80 active:bg-rose-700 text-white flex items-center justify-center transition ml-1"
            title="Close Viewer (Esc)"
            aria-label="Close Gallery Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Main Image Center Stage ── */}
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden px-2 sm:px-12 py-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrow Previous (Visible on desktop & tablet, or tapped on mobile) */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition backdrop-blur-md border border-white/20 shadow-xl active:scale-95"
            title="Previous Artwork (Left Arrow)"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Center Artwork Image */}
        <div 
          className={`relative max-w-full max-h-[75vh] flex items-center justify-center transition-transform duration-300 ${
            isZoomed ? 'scale-150 sm:scale-175 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentImageUrl}
            alt={currentItem.title || currentItem.designName || `Gallery Artwork #${index + 1}`}
            className="max-h-[72vh] max-w-[94vw] sm:max-w-[85vw] object-contain rounded-xl shadow-2xl transition-all"
            loading="eager"
            onError={(e) => {
              e.target.src = '/images/rajasthani-bridal.jpg';
            }}
          />

          {/* Zoom hint on mobile */}
          {!isZoomed && (
            <div className="absolute bottom-3 bg-black/65 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-stone-200 pointer-events-none border border-white/10">
              Tap image to zoom · Swipe left/right
            </div>
          )}
        </div>

        {/* Navigation Arrow Next */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition backdrop-blur-md border border-white/20 shadow-xl active:scale-95"
            title="Next Artwork (Right Arrow)"
            aria-label="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* ── Bottom Information & Actions Footer ── */}
      <div className="z-20 bg-gradient-to-t from-black via-black/80 to-transparent p-4 sm:p-6 space-y-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Metadata & Description */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-white text-base sm:text-lg">
                {currentItem.title || currentItem.designName || 'Handcrafted Mehndi Couture'}
              </h3>
              {(currentItem.category || currentItem.designCategory || currentItem.badge) && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-maroon/90 text-amber-200 border border-brand-gold/30">
                  {currentItem.category || currentItem.designCategory || currentItem.badge}
                </span>
              )}
            </div>

            {(currentItem.notes || currentItem.subtitle || currentItem.caption) && (
              <p className="text-xs text-stone-300 max-w-2xl line-clamp-2 leading-relaxed">
                {currentItem.notes || currentItem.subtitle || currentItem.caption}
              </p>
            )}

            {currentItem.userName && (
              <div className="text-[11px] text-stone-400">
                Shared by <strong className="text-stone-200">{currentItem.userName}</strong>
                {currentItem.userLocation ? ` (${currentItem.userLocation})` : ''}
              </div>
            )}
          </div>

          {/* Quick Booking Action */}
          {onBook && (
            <button
              type="button"
              onClick={() => onBook(currentItem)}
              className="shrink-0 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#B58E34] to-[#e6c068] text-[#2a1a08] font-serif font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-lg flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book This Pattern</span>
            </button>
          )}
        </div>

        {/* Thumbnail Selector Strip for multi-image viewing */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-none max-w-xl mx-auto">
            {images.map((img, idx) => {
              const url = typeof img === 'string' ? img : (img.imageUrl || img.url || img.image);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsZoomed(false);
                    setIndex(idx);
                    if (onIndexChange) onIndexChange(idx);
                  }}
                  className={`relative w-11 h-11 sm:w-13 sm:h-13 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                    index === idx 
                      ? 'border-amber-400 scale-105 shadow-md ring-2 ring-amber-400/40' 
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Jump to image ${idx + 1}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

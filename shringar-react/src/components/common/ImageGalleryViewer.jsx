import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Download, Calendar, RotateCcw
} from 'lucide-react';

/**
 * Fullscreen Interactive Lightbox Modal with Pinch-Zoom for Mobile
 * and Click-to-Zoom for Desktop.
 * - Supports pinch-to-zoom (multitouch distance tracking 1x to 3.5x)
 * - Supports double-tap to zoom (toggle 1x <-> 2x)
 * - Supports smooth pan dragging when zoomed
 * - Supports click-to-zoom on desktop
 * - Full Esc key and close button support
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Touch tracking refs
  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);
  const initialDistanceRef = useRef(null);
  const initialScaleRef = useRef(1);
  const lastTapRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  // Reset zoom and pan on slide change or open
  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    setIndex(currentIndex || 0);
    resetTransform();
  }, [currentIndex, isOpen, resetTransform]);

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

  // Keyboard navigation & Esc key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === '0') resetTransform();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, index, images.length, scale, resetTransform]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentItem = images[index] || {};
  const currentImageUrl = typeof currentItem === 'string' 
    ? currentItem 
    : (currentItem.imageUrl || currentItem.url || currentItem.image);

  const handleNext = () => {
    resetTransform();
    const nextIdx = (index + 1) % images.length;
    setIndex(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx);
  };

  const handlePrev = () => {
    resetTransform();
    const prevIdx = (index - 1 + images.length) % images.length;
    setIndex(prevIdx);
    if (onIndexChange) onIndexChange(prevIdx);
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(3.5, Number((prev + 0.5).toFixed(1))));
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const toggleClickZoom = () => {
    if (scale > 1) {
      resetTransform();
    } else {
      setScale(2);
      setPosition({ x: 0, y: 0 });
    }
  };

  // ── Multi-touch Pinch & Pan Gestures ──
  const getTouchDistance = (touches) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch gesture start
      initialDistanceRef.current = getTouchDistance(e.touches);
      initialScaleRef.current = scale;
      isDraggingRef.current = false;
    } else if (e.touches.length === 1) {
      // Single touch: double tap detection or pan start
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap!
        toggleClickZoom();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;

      if (scale > 1) {
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        startPosRef.current = { ...position };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialDistanceRef.current) {
      // Pinching in progress
      e.preventDefault();
      const newDist = getTouchDistance(e.touches);
      const ratio = newDist / initialDistanceRef.current;
      const newScale = Math.min(3.5, Math.max(1, initialScaleRef.current * ratio));
      setScale(Number(newScale.toFixed(2)));
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isDraggingRef.current && scale > 1) {
      // Panning when zoomed
      e.preventDefault();
      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const deltaY = e.touches[0].clientY - dragStartRef.current.y;
      const maxOffset = (scale - 1) * 150;
      setPosition({
        x: Math.max(-maxOffset, Math.min(maxOffset, startPosRef.current.x + deltaX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, startPosRef.current.y + deltaY)),
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      initialDistanceRef.current = null;
    }
    if (e.touches.length === 0) {
      isDraggingRef.current = false;

      // Handle swipe to next/prev ONLY if not zoomed in
      if (scale === 1 && touchStartXRef.current !== null && touchStartYRef.current !== null) {
        const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
        const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0) handleNext();
          else handlePrev();
        }
      }
      touchStartXRef.current = null;
      touchStartYRef.current = null;
    }
  };

  const handleDownload = () => {
    if (!currentImageUrl) return;
    const a = document.createElement('a');
    a.href = currentImageUrl;
    a.download = `shringar-design-${index + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isZoomed = scale > 1;

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none animate-fadeIn"
      style={{ touchAction: isZoomed ? 'none' : 'pan-y' }}
      role="dialog"
      aria-modal="true"
    >
      {/* ── Top Header Toolbar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 z-20 bg-gradient-to-b from-black/90 to-transparent">
        {/* Left: Counter & Title */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-serif font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-stone-800/90 text-amber-300 border border-amber-400/20 shadow-sm">
            {index + 1} / {images.length}
          </span>
          {currentItem.title && (
            <span className="text-white font-serif font-semibold text-xs sm:text-sm truncate max-w-[170px] sm:max-w-xs">
              {currentItem.title}
            </span>
          )}
        </div>

        {/* Right: Zoom controls, Download, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Level Indicator & Reset */}
          {isZoomed && (
            <button
              type="button"
              onClick={resetTransform}
              className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1 transition hover:bg-amber-500/30"
              title="Reset Zoom (1x)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{Math.round(scale * 100)}%</span>
            </button>
          )}

          {/* Zoom Out Button */}
          <button
            type="button"
            disabled={scale <= 1}
            onClick={zoomOut}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            disabled={scale >= 3.5}
            onClick={zoomIn}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition"
            title="Download HD Image"
            aria-label="Download Image"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Close Modal Button (Prominent & accessible) */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-600/80 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center transition ml-1 cursor-pointer"
            title="Close Viewer (Esc)"
            aria-label="Close Gallery Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Main Image Center Stage with Pinch & Click Zoom ── */}
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden px-2 sm:px-12 py-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrow Previous */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition backdrop-blur-md border border-white/20 shadow-xl active:scale-95"
            title="Previous (Left Arrow)"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Center Artwork Image Container */}
        <div 
          className={`relative max-w-full max-h-[75vh] flex items-center justify-center transition-transform ${
            isDraggingRef.current ? 'duration-0' : 'duration-300'
          } ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
          onClick={toggleClickZoom}
        >
          <img
            src={currentImageUrl}
            alt={currentItem.title || currentItem.designName || `Gallery Artwork #${index + 1}`}
            className="max-h-[72vh] max-w-[94vw] sm:max-w-[85vw] object-contain rounded-xl shadow-2xl pointer-events-none select-none"
            loading="eager"
            onError={(e) => {
              e.target.src = '/images/rajasthani-bridal.jpg';
            }}
          />

          {/* Mobile hint */}
          {!isZoomed && (
            <div className="absolute bottom-3 bg-black/70 backdrop-blur-md px-3.5 py-1 rounded-full text-[10.5px] text-stone-200 pointer-events-none border border-white/10 shadow-lg">
              Tap / pinch to zoom · Double-tap for 2x
            </div>
          )}
        </div>

        {/* Navigation Arrow Next */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition backdrop-blur-md border border-white/20 shadow-xl active:scale-95"
            title="Next (Right Arrow)"
            aria-label="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* ── Bottom Information & Actions Footer ── */}
      <div className="z-20 bg-gradient-to-t from-black via-black/85 to-transparent p-4 sm:p-6 space-y-3">
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

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-none max-w-xl mx-auto">
            {images.map((img, idx) => {
              const url = typeof img === 'string' ? img : (img.imageUrl || img.url || img.image);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    resetTransform();
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

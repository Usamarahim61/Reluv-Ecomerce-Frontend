'use client'
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Reset to initial index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4 md:p-6" onClick={onClose}>
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute  right-0 z-50 rounded-full bg-black/50 backdrop-blur-md p-2 sm:p-3 text-white transition-all hover:bg-black/70 hover:scale-110 border cursor-pointer border-white/20 outline-none"
          aria-label="Close"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Main Image */}
        <div className="relative">
          <img
            src={images[currentImageIndex]}
            alt={`Product ${currentImageIndex + 1}`}
            className="w-full h-auto max-h-[60vh] sm:max-h-[70vh] md:max-h-[75vh] lg:max-h-[80vh] object-contain select-none"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchMove={(e) => {
              touchEndX.current = e.touches[0].clientX;
            }}
            onTouchEnd={() => {
              if (!touchStartX.current || !touchEndX.current) return;
              const distance = touchStartX.current - touchEndX.current;
              const isLeftSwipe = distance > 50;
              const isRightSwipe = distance < -50;

              if (isLeftSwipe) {
                setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
              }
              if (isRightSwipe) {
                setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
              }
            }}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-2 sm:p-3 text-white rounded-full hover:bg-black/60 transition-all hover:scale-105"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-2 sm:p-3 text-white rounded-full hover:bg-black/60 transition-all hover:scale-105"
                aria-label="Next image"
              >
                <ChevronRightIcon size={20} className="sm:w-6 sm:h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="mt-3 sm:mt-4 flex justify-center gap-1 sm:gap-2 overflow-x-auto max-w-full px-2 sm:px-4 scrollbar-hide">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 rounded transition-all ${
                  index === currentImageIndex
                    ? 'border-[#007782] scale-105'
                    : 'border-gray-400 hover:border-gray-300'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </button>
            ))}
          </div>
        )}

        {/* Image Counter */}
        <div className="text-center mt-2 sm:mt-3 text-white text-sm sm:text-base font-medium">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;

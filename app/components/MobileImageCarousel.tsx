'use client'
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileImageCarouselProps {
  images: string[];
  title: string;
}

const MobileImageCarousel: React.FC<MobileImageCarouselProps> = ({ images, title }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const dragEndX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    dragEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!dragStartX.current || !dragEndX.current) return;
    const distance = dragStartX.current - dragEndX.current;
    const isLeftSwipe = distance > 30;
    const isRightSwipe = distance < -30;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
    setIsDragging(false);
  };

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    dragEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!dragStartX.current || !dragEndX.current) return;
    const distance = dragStartX.current - dragEndX.current;
    const isLeftSwipe = distance > 30;
    const isRightSwipe = distance < -30;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
    setIsDragging(false);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!images.length) return null;

  return (
    <div className="w-full bg-[#f5f5f5] rounded-sm p-2">
      {/* Main carousel container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-[#f5f5f5] rounded-md"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={isDragging ? handleMouseUp : undefined}
      >
        {/* Image display */}
        <div className="relative w-full aspect-square overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={`${title} ${currentImageIndex + 1}`}
            className="w-full h-full object-contain select-none transition-opacity duration-200"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          />

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all"
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          )}

          {/* Image counter */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Thumbnail indicators */}
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                index === currentImageIndex
                  ? 'border-[#cb6f4d] scale-105'
                  : 'border-gray-300 opacity-60 hover:opacity-100'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? 'w-6 bg-[#cb6f4d]'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileImageCarousel;

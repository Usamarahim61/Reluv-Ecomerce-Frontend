import React, { useState, useRef } from "react";

const ImageZoom = ({ src, alt }: { src: string; alt?: string }) => {
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();

    let x = ((e.clientX - left) / width) * 100;
    let y = ((e.clientY - top) / height) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    setPosition({ x, y });
    setCursorPosition({
      x: e.clientX - left,
      y: e.clientY - top,
    });
  };

  return (
    <>
      <div className="group relative overflow-hidden bg-gray-50 aspect-[3/4]">
        {/* Zoom Area */}
        <div
          className="w-full h-full cursor-crosshair"
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />

          {showZoom && (
            <>
              {/* The Lens (Square following cursor) */}
              <div
                className="absolute pointer-events-none border border-black/10 bg-white/10 shadow-sm z-20"
                style={{
                  width: "160px",
                  height: "160px",
                  left: `${cursorPosition.x - 80}px`,
                  top: `${cursorPosition.y - 80}px`,
                }}
              />

              {/* The Zoomed Result Overlay */}
              <div
                className="absolute inset-0 z-30 pointer-events-none transition-opacity duration-200"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundPosition: `${position.x}% ${position.y}%`,
                  backgroundSize: "300%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </>
          )}
        </div>

        {/* --- Enlarge Icon (Bottom Right) --- */}
        <button
          onClick={() => setShowModal(true)}
          className="absolute bottom-2 right-2 z-40 bg-white/90 p-2 rounded-sm shadow-md hover:bg-white transition-all transform group-hover:scale-110 active:scale-97 cursor-pointer"
          aria-label="Enlarge Image"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </div>

      {/* Modal for enlarged image */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 z-50 rounded-full bg-black/30 backdrop-blur-md p-3 text-white transition-all hover:bg-black/60 hover:scale-110 border cursor-pointer border-white/20 outline-none"
            aria-label="Close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ImageZoom;

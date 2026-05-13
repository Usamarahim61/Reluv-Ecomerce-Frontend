'use client'
import React, { useState } from "react";
import { Maximize2, X } from "lucide-react";

const ImageZoom = ({ src, alt }: { src: string; alt?: string }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="group relative aspect-[3/4] overflow-hidden bg-[#f4f4f4]">
        <img
          src={src}
          alt={alt || "Product image"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="absolute bottom-2 right-2 z-20 rounded-full border border-[#d8d8d8] bg-white/95 p-1.5 text-[#444] shadow-sm transition hover:bg-white"
          aria-label="Open image preview"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowModal(false)}
        >
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white backdrop-blur-sm transition hover:bg-white/25"
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
          <img
            src={src}
            alt={alt || "Product image"}
            className="max-h-[92vh] max-w-[92vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ImageZoom;

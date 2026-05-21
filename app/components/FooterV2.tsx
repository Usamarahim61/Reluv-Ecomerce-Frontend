import React from 'react';

export default function FooterV2() {
  return (
    <footer className="w-full border-t border-gray-100 bg-[#fbfbfb] py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand Name - Serif Font */}
        <span className="font-serif text-xl font-bold text-gray-900">
          <img src="/reLuv_logo.png" alt="Reluv Logo" className="h-14 pt-2" />
        </span>

        {/* Copyright Text */}
        <span className="text-sm text-gray-500 font-normal">
          © 2026 Reluv. Sustainable fashion marketplace.
        </span>
      </div>
    </footer>
  );
}
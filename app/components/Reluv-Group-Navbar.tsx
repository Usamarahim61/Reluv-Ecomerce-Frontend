"use client";

import React, { useState, useEffect } from "react";
// Import the components we built previously
import Newsroom from "../newsroom/page";
import Sustainability from "../sustainability/page";
import ReluvVentures from "../ReluvVentures/page";
import MediaAssets from "../mediaAssets/page"

type Path =  '/sustainability' | '/newsroom' | '/mediaAssets' | '/ReluvVentures';

export default function ReluvGroup() {
  const [currentPath, setCurrentPath] = useState<Path>('/sustainability');
  const navigateTo = (path: Path) => {
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Section */}
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => navigateTo('/newsroom')}
          >
             <span className="text-[#cb6f4d] text-3xl font-bold tracking-tighter">Reluv</span>
          </div>

          {/* Nav Links mapped to your Footer paths */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigateTo('/newsroom')}
              className={`text-[15px] font-medium transition-colors ${
                currentPath === '/newsroom' ? "text-[#cb6f4d]" : "text-slate-600 hover:text-[#cb6f4d]"
              }`}
            >
              Newsroom
            </button>
            
            <button
                 onClick={() => navigateTo('/mediaAssets')}
              className={`text-[15px] font-medium transition-colors ${
                currentPath === '/mediaAssets' ? "text-[#cb6f4d]" : "text-slate-600 hover:text-[#cb6f4d]"
              }`}
            >
              Media Assets
            </button>

            <button
              onClick={() => navigateTo('/sustainability')}
              className={`text-[15px] font-medium transition-colors ${
                currentPath === '/sustainability' ? "text-[#cb6f4d]" : "text-slate-600 hover:text-[#cb6f4d]"
              }`}
            >
              Sustainability
            </button>

            <button
              onClick={() => navigateTo('/ReluvVentures')}
              className={`text-[15px] font-medium transition-colors ${
                currentPath === '/ReluvVentures' ? "text-[#cb6f4d]" : "text-slate-600 hover:text-[#cb6f4d]"
              }`}
            >
              Reluv Ventures
            </button>

            {/* Language Dropdown */}
            <div className="flex items-center gap-1 text-slate-600 text-[15px] cursor-pointer ml-4 border-l pl-4 border-gray-200">
              <span>EN</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Content Rendering based on Path */}
      <main className="transition-all duration-300">
        {currentPath === '/newsroom' && <Newsroom />}
        {currentPath === '/sustainability' && <Sustainability />}
        {currentPath === '/ReluvVentures' && <ReluvVentures />}
        {currentPath === '/mediaAssets' && <MediaAssets />}
        
        {/* Placeholder for paths not yet built
        {(currentPath === '/aboutUs' || currentPath === '/advertisment') && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h2>
            <p className="text-slate-500">The {currentPath.replace('/', '')} page is currently under development.</p>
          </div>
        )} */}
      </main>
    </div>
  );
}
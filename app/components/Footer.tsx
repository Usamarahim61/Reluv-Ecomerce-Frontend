"use client";

import { Facebook, Linkedin, Instagram, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Capacitor } from '@capacitor/core';

type FooterLink = {
  label: string;
  href: string;
};

export default function Footer() {
  if (Capacitor.isNativePlatform()) return null;

  const sections: { title: string; links: FooterLink[] }[] = [
    {
      title: 'Reluv',
      links: [
        { label: 'About us', href: '/aboutUs' },
        { label: 'Sustainability', href: '/ReluvGroup?view=sustainability' },
        { label: 'Press', href: '/ReluvGroup?view=press' },
        { label: 'Advertising', href: '/advertisment' },
        { label: 'Accessibility', href: '/Accessibility' },
      ],
    },
    {
      title: 'Discover',
      links: [
        { label: 'How it works', href: '/how-is-it-works' },
        { label: 'Item Verification', href: '/Item-Verification' },
        { label: 'Mobile apps', href: '/' },
        { label: 'Infoboard', href: '/' },
      ],
    },
    {
      title: 'Help',
      links: [
        { label: 'Help Centre', href: '#' },
        { label: 'Selling', href: '#' },
        { label: 'Buying', href: '#' },
        { label: 'Trust and Safety', href: '#' },
      ],
    },
  ];

  return (
    <footer className="mt-20 w-full border-t border-gray-200 bg-white pb-8 pt-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Main Grid: Centered on mobile, left-aligned on MD */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {sections.map((section) => (
            <div 
              key={section.title} 
              className="flex flex-col items-center text-center md:items-start md:text-left"
            >
              {section.title === 'Reluv' ? (
                <Link href="/" className="flex items-center gap-2 group mb-4 pr-6">
                  {/* <div className="bg-[#fdfcfb] p-1 rounded-lg flex items-center justify-center">
                    <ShoppingBag 
                      size={20}
                      className="w-5 h-5 sm:w-6 sm:h-6 text-[#cb6f4d]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1816] tracking-tight">
                    Reluv
                  </h1> */}
                  <Image src="/reLuv_logo.png" alt="Reluv Logo" width={100} height={40} />
                </Link>
              ) : (
                <h4 className="mb-4 text-[16px] font-medium text-gray-500">
                  {section.title}
                </h4>
              )}
              
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-gray-600 transition-colors hover:text-[#cb6f4d]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="mb-8 border-gray-100" />

        {/* Socials and App Badges Section */}
        <div className="mb-8 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex gap-4 text-gray-400">
            <Facebook size={24} className="cursor-pointer hover:text-gray-600" />
            <Linkedin size={24} className="cursor-pointer hover:text-gray-600" />
            <Instagram size={24} className="cursor-pointer hover:text-gray-600" />
          </div>

          <div className="flex flex-row justify-center gap-4 w-full md:w-auto">
            <button className="transition-transform active:scale-95">
              <img src="https://marketplace-web-assets.vinted.com/assets/app-badges/ios/en.svg" alt="App Store" className="h-10 w-auto" />
            </button>
            <button className="transition-transform active:scale-95">
              <img 
                src="https://marketplace-web-assets.vinted.com/assets/app-badges/android/en.svg"
                alt="Google Play" 
                className="h-10 w-auto rounded-md shadow-sm" 
              />
            </button>
          </div>
        </div>

        {/* Bottom Links: Centered on mobile */}
        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-[13px] text-gray-500">
          <a href="#" className="hover:underline">Privacy Centre</a>
          <a href="#" className="hover:underline">Cookie Policy</a>
          <a href="#" className="hover:underline">Cookie Settings</a>
          <a href="#" className="hover:underline">Terms & Conditions</a>
          <a href="#" className="hover:underline">Our Platform</a>
        </div>
      </div>
    </footer>
  );
}
// components/Footer.tsx
import Image from 'next/image';
import { Facebook, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const sections = [
    {
      title: "Rulv",
      links: ["About us", "Sustainability", "Press", "Advertising", "Accessibility"]
    },
    {
      title: "Discover",
      links: ["How it works", "Item Verification", "Mobile apps", "Infoboard"]
    },
    {
      title: "Help",
      links: ["Help Centre", "Selling", "Buying", "Trust and Safety"]
    }
  ];

  return (
    <footer className="w-full bg-white border-t border-gray-200 pt-10 pb-12 mt-10 md:mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Links Grid - Centered text on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10 mb-12 text-center md:text-left">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-gray-900 font-semibold md:text-gray-500 text-[16px] mb-4">
                {section.title}
              </h4>
              <ul className="space-y-4 md:space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-600 hover:text-[#007782] text-[15px] md:text-[14px] transition-colors block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Social and App Stores - Fully centered column on mobile */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-10">
          
          {/* Social Icons */}
          <div className="flex justify-center gap-8 text-gray-400">
            <Facebook size={26} className="cursor-pointer hover:text-[#007782] transition-colors" />
            <Linkedin size={26} className="cursor-pointer hover:text-[#007782] transition-colors" />
            <Instagram size={26} className="cursor-pointer hover:text-[#007782] transition-colors" />
          </div>

          {/* App Badges - Centered row */}
          <div className="flex flex-row justify-center gap-4 w-full md:w-auto">
            <button className="transition-transform active:scale-95">
              <img src="/app-store.svg" alt="App Store" className="h-10 w-auto" />
            </button>
            <button className="transition-transform active:scale-95">
              <img 
                src="https://tse4.mm.bing.net/th/id/OIP.tMkAAu0j6IOyh_6d1XWOhgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" 
                alt="Google Play" 
                className="h-10 w-auto rounded-md shadow-sm" 
              />
            </button>
          </div>
        </div>

        {/* Bottom Legal Links - Centered block */}
        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-4 text-[13px] text-gray-500 text-center border-t border-gray-50 pt-8 md:border-none md:pt-0">
          <a href="#" className="hover:underline min-w-[120px] md:min-w-0">Privacy Centre</a>
          <a href="#" className="hover:underline min-w-[120px] md:min-w-0">Cookie Policy</a>
          <a href="#" className="hover:underline min-w-[120px] md:min-w-0">Cookie Settings</a>
          <a href="#" className="hover:underline min-w-[120px] md:min-w-0">Terms & Conditions</a>
          <a href="#" className="hover:underline min-w-[120px] md:min-w-0">Our Platform</a>
        </div>
      </div>
    </footer>
  );
}
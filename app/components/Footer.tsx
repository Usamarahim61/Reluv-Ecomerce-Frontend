// components/Footer.tsx
import Image from 'next/image';
import { Facebook, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const sections = [
    {
      title: "Vinted",
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
    <footer className="w-full bg-white border-t border-gray-200 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Main Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-gray-500 text-[16px] mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-600 hover:text-[#007782] text-[14px] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Social and App Stores */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          {/* Social Icons */}
          <div className="flex gap-4 text-gray-400">
            <Facebook size={24} className="cursor-pointer hover:text-gray-600" />
            <Linkedin size={24} className="cursor-pointer hover:text-gray-600" />
            <Instagram size={24} className="cursor-pointer hover:text-gray-600" />
          </div>

          {/* App Badges */}
          <div className="flex gap-3">
            <button className="transition-opacity hover:opacity-80">
              <img src="/app-store.svg" alt="Download on App Store" className="h-10" />
            </button>
            <button className="transition-opacity hover:opacity-80">
              <img src="https://tse4.mm.bing.net/th/id/OIP.tMkAAu0j6IOyh_6d1XWOhgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" alt="Get it on Google Play" className="h-10" />
            </button>
          </div>
        </div>

        {/* Bottom Legal Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-gray-500">
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
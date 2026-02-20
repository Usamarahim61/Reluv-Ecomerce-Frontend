"use client";

import React from "react";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  // Pass the current path and the navigation function from your main layout
  currentPath: string;
  onNavigate: (path: any) => void;
}

const RluvGroupFooter: React.FC<FooterProps> = ({ currentPath, onNavigate }) => {
  const sections: { title: string; links: FooterLink[] }[] = [
    {
      title: 'Rluv Group', // Based on reference structure
      links: [
        { label: 'Newsroom', href: '/newsroom' },
        { label: 'Media Assets', href: '/mediaAssets' },
        { label: 'Sustainability', href: '/sustainability' },
        { label: 'Tax Strategy', href: '/taxStrategy' },
        { label: 'Vinted Ventures', href: '/vintedVentures' },
      ],
    },
    {
      title: 'Follow us on',
      links: [
        { label: 'Facebook', href: '#' },
        { label: 'Instagram', href: '#' },
        { label: 'LinkedIn', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-white pt-20 pb-12 px-4 md:px-8 border-t border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          
          {/* Brand Column */}
          <div className="flex-1">
            <span className="text-[#007782] text-3xl font-bold tracking-tighter cursor-pointer" onClick={() => onNavigate('/sustainability')}>
              Rluv
            </span>
          </div>

          {/* Links Columns */}
          <div className="flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-8">
            {sections.map((section, idx) => (
              <div key={idx}>
                <h4 className="text-[16px] font-bold text-slate-900 mb-6 uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <button
                        onClick={() => link.href !== '#' && onNavigate(link.href)}
                        className={`text-[15px] transition-colors hover:text-[#007782] text-left ${
                          currentPath === link.href 
                            ? "text-[#007782] font-semibold underline underline-offset-4" 
                            : "text-slate-600"
                        }`}
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Legal Section */}
        <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2026 Rluv Group. Second-hand is for everyone.
          </p>
          <div className="flex gap-6 text-xs text-slate-400 uppercase tracking-widest">
            <span className="cursor-pointer hover:text-slate-600">Privacy Policy</span>
            <span className="cursor-pointer hover:text-slate-600">Terms & Conditions</span>
            <span className="cursor-pointer hover:text-slate-600">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default RluvGroupFooter;
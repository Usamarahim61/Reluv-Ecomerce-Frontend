'use client';

import React from "react";
import { useRouter, usePathname } from "next/navigation";

interface FooterLink {
  label: string;
  href: string;
}

const ReluvGroupFooter: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const onNavigate = (path: string) => {
    router.push(path);
  };

  const sections: { title: string; links: FooterLink[] }[] = [
    {
      title: 'Reluv Group',
      links: [
        { label: 'Newsroom', href: '/ReluvGroup?view=press' },
        { label: 'Media Assets', href: '/ReluvGroup?view=mediaAssets' },
        { label: 'Sustainability', href: '/ReluvGroup?view=sustainability' },
        { label: 'Tax Strategy', href: '/taxStrategy' },
        { label: 'Reluv Ventures', href: '/ReluvGroup?view=reluvVentures' },
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
    <footer className="bg-white pt-20 pb-12 px-4 md:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          
          <div className="flex-1">
            <span
              className="text-[#007782] text-3xl font-bold cursor-pointer"
              onClick={() => onNavigate('/ReluvGroup?view=sustainability')}
            >
              Reluv
            </span>
          </div>

          <div className="flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-8">
            {sections.map((section, idx) => (
              <div key={idx}>
                <h4 className="text-[16px] font-bold text-slate-900 mb-6 uppercase">
                  {section.title}
                </h4>

                <ul className="space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <button
                        onClick={() => link.href !== '#' && onNavigate(link.href)}
                        className={`text-[15px] hover:text-[#007782] text-left ${
                          pathname === link.href
                            ? "text-[#007782] font-semibold underline"
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

        <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between">
          <p className="text-slate-400 text-sm">
            © 2026 Reluv Group. Second-hand is for everyone.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ReluvGroupFooter;

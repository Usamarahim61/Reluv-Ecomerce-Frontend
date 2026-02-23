import React from 'react';
import Image from 'next/image';
import { DownloadIcon } from 'lucide-react'; // Optional: npm install lucide-react

// types/media.ts
export type AssetCategory = 'Logos' | 'Photography' | 'Brand Guidelines' | 'Video';

export interface MediaAsset {
  id: string;
  title: string;
  category: AssetCategory;
  thumbnailUrl: string;
  downloadUrl: string;
  fileSize?: string; // e.g., "4.2 MB"
  format?: string;   // e.g., "PNG, SVG"
}

const mediaAssets: MediaAsset[] = [
  { id: '1', title: 'Corporate Logos', category: 'Logos', thumbnailUrl: '/assets/logos-thumb.jpg', downloadUrl: '/files/logos.zip', format: 'SVG, PNG' },
  { id: '2', title: 'Executive Portraits', category: 'Photography', thumbnailUrl: '/assets/leadership-thumb.jpg', downloadUrl: '/files/portraits.zip', fileSize: '45 MB' },
  { id: '3', title: 'Office & Culture', category: 'Photography', thumbnailUrl: '/assets/hq-thumb.jpg', downloadUrl: '/files/office-stills.zip', fileSize: '120 MB' },
  { id: '4', title: 'Brand B-Roll', category: 'Video', thumbnailUrl: '/assets/video-thumb.jpg', downloadUrl: '/files/b-roll.mp4', format: 'MP4 (4K)' },
];

const MediaAssets = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <header className="mb-12 border-b border-gray-100 pb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Media Assets</h2>
        <p className="mt-4 text-lg text-gray-600">
          High-resolution resources for press and editorial use.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {mediaAssets.map((asset) => (
          <div key={asset.id} className="group relative flex flex-col">
            {/* Image Container */}
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={asset.thumbnailUrl}
                alt={asset.title}
                fill
                className="object-cover transition-opacity group-hover:opacity-75"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/20">
                <a 
                  href={asset.downloadUrl}
                  download
                  className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <DownloadIcon className="w-6 h-6 text-gray-900" />
                </a>
              </div>
            </div>

            {/* Text Content */}
            <div className="mt-4 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">{asset.category}</p>
                <h3 className="mt-1 text-lg font-semibold text-gray-900 leading-tight">
                  {asset.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {asset.format && <span>{asset.format}</span>}
                  {asset.fileSize && <span> • {asset.fileSize}</span>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Disclaimer Footer (re-styled from your image) */}
      <footer className="mt-20 p-6 bg-gray-50 rounded-xl border border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 uppercase mb-2">Usage Disclaimer</h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          These assets are provided solely for editorial use. Any commercial use, including advertising or 
          merchandising, is strictly prohibited without written permission.
        </p>
      </footer>
    </div>
  );
};

export default MediaAssets;
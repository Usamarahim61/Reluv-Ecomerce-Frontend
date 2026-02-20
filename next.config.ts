import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.vinted.com',
      },
      {
        protocol: 'https',
        hostname: 'images1.vinted.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
            {
        protocol: 'https',
        hostname: 'marketplace-web-assets.vinted.com',
      },
            {
        protocol: 'https',
        hostname: 'static-assets.vinted.com',
      },
    ],
  },
};

export default nextConfig;

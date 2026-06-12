import type { NextConfig } from "next";
import { BACKEND_URL } from "./constants";

const nextConfig: NextConfig = {
  // experimental: {
  //   optimizePackageImports: ['lucide-react'],
  // },
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
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
            {
        protocol: 'https',
        hostname: 'https://reluv-ecomerce-backend-1.onrender.com',
      },
                  {
        protocol: 'https',
        hostname: 'https://reluv-ecomerce-frontend.vercel.app',
      },
                  {
        protocol: 'https',
        hostname: 'https://wealthy-authority-eb78443cb3.strapiapp.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Main app: allow it to communicate with same-origin popups
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
      {
        // Callback page: must NOT isolate from opener so window.opener is available
        source: '/auth/callback/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;

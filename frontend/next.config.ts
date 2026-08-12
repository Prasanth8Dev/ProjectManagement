import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow the dev server to be accessed from any host on the LAN
  experimental: {},
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3001' },
      { protocol: 'http', hostname: '192.168.*', port: '3001' },
      { protocol: 'http', hostname: '10.*', port: '3001' },
    ],
  },
};

export default nextConfig;

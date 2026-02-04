/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  },
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  async redirects() {
    return [
      { source: '/favicon.ico', destination: '/icon.svg', permanent: false },
      { source: '/favicon.png', destination: '/icon.svg', permanent: false },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  optimizeFonts: false,
  experimental: {
    serverActions: true,
  },
  transpilePackages: ['@whatsou/shared'],
};

module.exports = nextConfig;



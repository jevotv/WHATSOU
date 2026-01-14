/** @type {import('next').NextConfig} */

const nextConfig = {
    output: 'export',
    distDir: 'out',
    transpilePackages: ['@whatsou/shared'],

    images: { unoptimized: true },

    eslint: {
        ignoreDuringBuilds: true,
    },

    typescript: {
        ignoreBuildErrors: true,
    },

    trailingSlash: true,
};

module.exports = nextConfig;

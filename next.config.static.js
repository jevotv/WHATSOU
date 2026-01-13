/** @type {import('next').NextConfig} */

// Static export config for Capacitor mobile app
// This config excludes dynamic routes and only exports dashboard pages

const nextConfig = {
    output: 'export',
    distDir: 'out',

    // Disable features not compatible with static export
    images: { unoptimized: true },

    eslint: {
        ignoreDuringBuilds: true,
    },

    typescript: {
        ignoreBuildErrors: true, // Temporary for static build
    },

    // Enable server actions for import compatibility
    experimental: {
        serverActions: true,
    },

    // Trailing slash for proper file resolution in Capacitor
    trailingSlash: true,
};

module.exports = nextConfig;

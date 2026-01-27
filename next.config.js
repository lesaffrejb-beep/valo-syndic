/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Désactiver SSR pour react-pdf (client-side only)
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        return config;
    },
};

module.exports = nextConfig;

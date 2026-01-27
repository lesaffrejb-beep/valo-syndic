/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@react-pdf/renderer'],
    webpack: (config, { isServer }) => {
        config.resolve.alias.canvas = false;

        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                https: false,
                http: false,
                "node:fs": false,
                "node:https": false,
                child_process: false,
                tls: false,
                net: false,
            };
            config.resolve.alias = {
                ...config.resolve.alias,
                "node:fs": false,
                "node:https": false,
                "node:http": false,
            }
        }
        return config;
    },
};

module.exports = nextConfig;

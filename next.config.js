/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@react-pdf/renderer'],
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; " +
                            "img-src 'self' data: blob: maps.googleapis.com maps.gstatic.com https://lh3.googleusercontent.com; " +
                            "connect-src 'self' https://maps.googleapis.com https://data.ademe.fr https://georisques.gouv.fr; " +
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com; " +
                            "style-src 'self' 'unsafe-inline' maps.gstatic.com; " +
                            "font-src 'self' data:;"
                    }
                ]
            }
        ];
    },
    webpack: (config, { isServer, webpack }) => {
        config.resolve.alias.canvas = false;

        if (!isServer) {
            // FALLBACKS
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

            // IGNORE PLUGIN for node: schemes (Nuclear Option for Webpack 5)
            // Fixes "node:https" errors from pptxgenjs/other libs
            config.plugins.push(
                new webpack.IgnorePlugin({
                    resourceRegExp: /^node:/,
                })
            );
        }
        return config;
    },
};

module.exports = nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    {
                        key: "Cross-Origin-Embedder-Policy",
                        value: "require-corp",
                    },
                    {
                        key: "Cross-Origin-Opener-Policy",
                        value: "same-origin",
                    },
                ],
            },
        ];
    },
    images: {
        //allow imgs from the /public folder
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'localhost',
            }
        ]
    }
};

export default nextConfig;

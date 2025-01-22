import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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

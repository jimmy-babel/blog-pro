import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode:false,
  images: {
    remotePatterns: [
      {
        protocol: 'https', 
        hostname: 'res.cloudinary.com', 
        pathname: '/**', 
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ["src"], 
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // 调整为 5MB（可根据需求设置更大值，如 '10mb'）
    },
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  env: {
    CREATOR_PRIVATE_KEY: process.env.CREATOR_PRIVATE_KEY,
  },
};

module.exports = nextConfig; 
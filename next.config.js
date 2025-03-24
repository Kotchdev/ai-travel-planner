/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  //swcMinify: true,
  // Ensure consistent styling
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Ensure consistent image optimization
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV !== "production",
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure consistent styling
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Ensure consistent image optimization
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV !== "production",
  },
  // Ensure CSS modules work consistently
  webpack(config) {
    config.module.rules.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader", "postcss-loader"],
    });
    return config;
  },
};

module.exports = nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",  // Required for static export to GitHub Pages
  images: {
    unoptimized: true, // Required because next/image component doesn't work with static export
  },
  /* config options here */
};

export default nextConfig;

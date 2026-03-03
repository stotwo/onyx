import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/onyx" : "", // Configuration manuelle du chemin pour GitHub Pages
  images: {
    unoptimized: true,
  },
  /* config options here */
};

export default nextConfig;

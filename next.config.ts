import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Explicitly set project root to silence multiple lockfiles warning
  experimental: {
    webpackBuildWorker: true,
    optimizePackageImports: ["@react-three/fiber", "@react-three/drei", "three"],
    optimizeCss: true,
  },
  turbopack: {
    root: __dirname,
  },
  output: process.env.DOCKER === "true" ? "standalone" : "export",
  reactStrictMode: true,
  images: {
    unoptimized: process.env.DOCKER !== "true",
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  devIndicators: {
    position: "bottom-left",
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  productionBrowserSourceMaps: false,
};

export default withBundleAnalyzer(nextConfig);

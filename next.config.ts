import type { NextConfig } from "next";

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("CRITICAL: NEXT_PUBLIC_API_URL is not defined");
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

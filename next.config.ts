import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
      output: "export" as const,
      trailingSlash: true,
      images: { unoptimized: true },
    }
    : {}),
};

export default nextConfig;

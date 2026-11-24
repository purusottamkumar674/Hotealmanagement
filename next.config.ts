import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL
        ? [
            {
              protocol: new URL(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
              ).protocol.replace(":", "") as "https" | "http",
              hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
              port: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).port,
              pathname: "/storage/v1/object/public/hotel-media/**",
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default nextConfig;

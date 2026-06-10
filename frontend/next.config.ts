import type { NextConfig } from "next";

// Define strict Content Security Policy directives
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://maps.googleapis.com https://maps.gstatic.com;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' https://generativelanguage.googleapis.com https://vision.googleapis.com https://maps.googleapis.com;
  frame-src 'self';
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  // Inject security headers to protect PWA components
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },

  // Proxy /_/backend to localhost only during local development.
  // In production, NEXT_PUBLIC_API_URL is used directly.
  ...(process.env.NODE_ENV === "development" && {
    async rewrites() {
      return [
        {
          source: "/_/backend/:path*",
          destination: "http://127.0.0.1:8000/:path*",
        },
      ];
    },
  }),
};

export default nextConfig;

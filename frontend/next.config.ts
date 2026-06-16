import type { NextConfig } from "next";

// Proxy /api/backend/* → the FastAPI backend (same-origin, no CORS).
// Override with BACKEND_URL when the backend runs on a different host/port.
const backend = process.env.BACKEND_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/backend/:path*", destination: `${backend}/:path*` }];
  },
};

export default nextConfig;

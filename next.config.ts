import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Car artwork is local, trusted SVG in /public/cars. Allow next/image to
    // serve it, hardened so SVGs can't execute scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // PWA service workers break Next.js App Router navigation on Vercel when
  // the start URL / auth redirects are cached. Re-enable once SW rules are tuned.
  disable: true,
  register: false,
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);

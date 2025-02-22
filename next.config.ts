import withPWA, { type PWAConfig } from "next-pwa";

const pwaConfig: PWAConfig = {
  dest: "public",
  disable: process.env.NODE_ENV === "development",
};

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(pwaConfig)(nextConfig);

/** @type {import('next').NextConfig} */
import withPWA, { type PWAConfig } from "next-pwa";

const pwaConfig: PWAConfig = {
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  sw: "service-worker.js",
};

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(pwaConfig)(nextConfig);

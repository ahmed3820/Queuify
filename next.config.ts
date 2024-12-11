import { type NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  reactStrictMode: true,
  experimental: {
    // turbo: {},
  },
};

export default config;

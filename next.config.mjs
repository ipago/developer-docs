import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Emit a self-contained server for the container image (see Dockerfile).
  output: "standalone",
};

export default withMDX(config);

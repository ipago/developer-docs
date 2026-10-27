import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Emit a self-contained server for the container image (see Dockerfile).
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/creators/getting-paid/payouts",
        destination: "/creators/getting-paid/invoices",
        permanent: true,
      },
      {
        source: "/md/creators/getting-paid/payouts",
        destination: "/md/creators/getting-paid/invoices",
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);

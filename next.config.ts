import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ?? "";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${backendBase}/uploads/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(nextConfig);
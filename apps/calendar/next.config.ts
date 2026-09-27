import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/calendar",
  serverExternalPackages: ["@prisma/client"],
};

export default withNextIntl(nextConfig);

import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const ownerName = process.env.GITHUB_REPOSITORY?.split("/")[0] ?? "";
const isUserSite = repositoryName === `${ownerName}.github.io`;
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const basePath = isGitHubPages && !isUserSite ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: { unoptimized: true },
        typescript: { tsconfigPath: "tsconfig.github.json" },
      }
    : {}),
};

export default nextConfig;

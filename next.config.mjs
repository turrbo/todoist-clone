/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/todoist-clone",
  assetPrefix: "/todoist-clone/",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

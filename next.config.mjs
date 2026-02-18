/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use "standalone" only for Docker; Vercel handles this automatically
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),
};

export default nextConfig;

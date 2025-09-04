/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.50.238"],
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://dashboard.researchfrc.com",
  },
  // Removed the rewrite rule that was causing CORS conflicts
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/frc/:path*",
  //       destination: "https://dashboard.researchfrc.com/api/frc/:path*",
  //     },
  //   ];
  // },
};

export default nextConfig;

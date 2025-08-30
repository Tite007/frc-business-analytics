/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.50.238"],
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.50.238"],
  async rewrites() {
    return [
      {
        source: "/api/frc/:path*",
        destination: "https://dashboard.researchfrc.com/api/frc/:path*",
      },
    ];
  },
};

export default nextConfig;

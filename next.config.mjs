/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabling strict mode prevents React from mounting and firing every data fetching useEffect twice in development
  reactStrictMode: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "exceljs", "jose"],
  },
};

export default nextConfig;

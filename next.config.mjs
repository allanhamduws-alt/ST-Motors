/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker/Coolify deployment
  output: "standalone",
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable strict mode for better debugging
  reactStrictMode: true,
};

export default nextConfig;

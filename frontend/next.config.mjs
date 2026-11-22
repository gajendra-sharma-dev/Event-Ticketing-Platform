/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination:
          "https://event-ticketing-platform-q9d1.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;

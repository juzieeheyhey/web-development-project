/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "http://cs392-team-2-1afc9b5c9a9a.herokuapp.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const rawApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiBase = rawApiUrl.replace(/\/+$/, '');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@mui/material', '@mui/icons-material'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;

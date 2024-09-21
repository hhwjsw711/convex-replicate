/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['replicate.delivery'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_VERCEL_URL,
        pathname: '/_next/image/**',
      },
    ],
  },
};

export default nextConfig;

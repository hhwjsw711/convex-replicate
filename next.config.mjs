/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'aware-gnu-19.convex.cloud',
      },
      ...(process.env.NEXT_PUBLIC_VERCEL_URL
        ? [
            {
              protocol: 'https',
              hostname: process.env.NEXT_PUBLIC_VERCEL_URL,
              pathname: '/_next/image/**',
            },
          ]
        : []),
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/_next/image/**',
      },
    ],
  },
};

export default nextConfig;
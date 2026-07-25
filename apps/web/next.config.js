/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(mp3|wav|ogg|m4a|flac)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'gansuni-audio-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.(png|jpe?g|gif|webp|svg|avif)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'gansuni-image-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
})

const nextConfig = withPWA({
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@gansuni/shared', '@gansuni/db'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'audio=(*)' },
        ],
      },
    ]
  },
})

module.exports = nextConfig

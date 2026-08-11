/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(mp3|wav|ogg|m4a|flac|webm|m4a)$/i,
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
    {
      urlPattern: /^https:\/\/.*youtube.*\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'gansuni-youtube-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
})

const nextConfig = withPWA({
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  transpilePackages: ['@gansuni/shared', '@gansuni/db'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
})

module.exports = nextConfig

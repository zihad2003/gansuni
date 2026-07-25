import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { PlayerProvider } from '@/providers/PlayerProvider'
import { Toaster } from 'sonner'
import './globals.css'


export const metadata: Metadata = {
  title: {
    default: 'Gaansuni | Music Streaming',
    template: '%s | Gaansuni',
  },
  description: 'Stream music, playlists, and full-length tracks on Gaansuni.',
  keywords: [
    'Gaansuni',
    'Music',
    'Songs',
    'Streaming',
    'Audio',
    'Playlists',
    'MP3',
  ],
  authors: [{ name: 'Gaansuni Team' }],
  creator: 'Gaansuni',
  publisher: 'Gaansuni',
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gansuni.app',
    siteName: 'Gaansuni',
    title: 'Gaansuni | Music Streaming',
    description: 'Stream music, playlists, and full-length tracks on Gaansuni.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gaansuni',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gaansuni — Stream & Listen to Music',
    description: 'Discover, stream, and download your favorite Bangla music.',
    images: ['https://gansuni.app/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Music',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}): ReactNode {
  return (
    <html lang="bn-BD" suppressHydrationWarning>
      <body className="theme-transition-all">
        <ThemeProvider>
          <PlayerProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-center"
              style={{
                marginBottom: '100px',
              }}
              toastOptions={{
                style: {
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  borderRadius: '24px',
                },
                className: 'glass-toast',
              }}
            />
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

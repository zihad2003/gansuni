import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { PlayerProvider } from '@/providers/PlayerProvider'
import { Toaster } from 'sonner'
import './globals.css'


export const metadata: Metadata = {
  title: {
    default: 'Gansuni — গানশুনি | Premium Bengali Audio Streaming',
    template: '%s · Gansuni',
  },
  description:
    'Discover, stream, and download your favorite Bangla music. Premium Bengali audio streaming with offline playback.',
  keywords: [
    'bangla music',
    'bengali audio',
    'bangla songs',
    'গানশুনি',
    'gansuni',
    'bangla streaming',
    'rabindra sangeet',
    'nazrul geeti',
    'bangla folk',
    'baul',
  ],
  authors: [{ name: 'Gansuni' }],
  creator: 'Gansuni',
  publisher: 'Gansuni',
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
    locale: 'bn_BD',
    url: 'https://gansuni.app',
    siteName: 'Gansuni — গানশুনি',
    title: 'Gansuni — Premium Bengali Audio Streaming',
    description: 'Discover, stream, and download your favorite Bangla music.',
    images: [
      {
        url: 'https://gansuni.app/og.png',
        width: 1200,
        height: 630,
        alt: 'Gansuni — গানশুনি',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gansuni — Premium Bengali Audio Streaming',
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

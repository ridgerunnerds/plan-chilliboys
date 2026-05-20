import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chilli Boys | Cerritos Beach Identifier & Surf Report',
  description: 'Cerritos Beach surf report, bird identifier, car & plant ID, and marine conditions for Cerritos Beach, Baja California Sur, Mexico. Plan your Cerritos Beach session with live wave, wind, and tide data.',
  keywords: 'Cerritos Beach, Playa Los Cerritos, Cerritos surf, Cerritos Beach surf report, Cerritos tide, Cerritos Beach Baja California Sur, Cerritos Beach Mexico, surf Cerritos, Cerritos Beach waves, Cerritos Beach conditions, Chilli Boys, bird identifier, plant identifier, car identifier',
  metadataBase: new URL('https://plan.chilliboys.mx'),
  openGraph: {
    title: 'Chilli Boys | Cerritos Beach Identifier & Surf Report',
    description: 'Live surf conditions, bird, car & plant identification for Cerritos Beach, Baja California Sur, Mexico.',
    url: 'https://plan.chilliboys.mx',
    siteName: 'Chilli Boys — Cerritos Beach',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cerritos Beach Surf Report & Identifier — Chilli Boys',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chilli Boys | Cerritos Beach Identifier & Surf Report',
    description: 'Live surf conditions, bird, car & plant identification for Cerritos Beach, Baja California Sur, Mexico.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-45X1BFK922"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-45X1BFK922');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-200px)]">{children}</main>
          <Footer />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}

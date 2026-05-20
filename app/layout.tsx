import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chilli Boys Manufacturing',
  description: 'Design, plan, and quote your custom metalwork projects with Chilli Boys Manufacturing.',
  metadataBase: new URL('https://plan.chilliboys.mx'),
  openGraph: {
    title: 'Chilli Boys Manufacturing',
    description: 'Engineering & Fabrication in Baja California Sur, Mexico. Design, plan, and quote your custom metalwork projects.',
    url: 'https://plan.chilliboys.mx',
    siteName: 'Chilli Boys Manufacturing',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chilli Boys Manufacturing — Engineering & Fabrication',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chilli Boys Manufacturing',
    description: 'Engineering & Fabrication in Baja California Sur, Mexico.',
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

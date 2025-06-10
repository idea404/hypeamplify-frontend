// This is a server component (no 'use client' directive)
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { ClientAuthWrapper } from '@/components/ClientAuthWrapper'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HypeAmplify – AI-Powered X (Twitter) Growth & Engagement',
  description: 'Supercharge your X (formerly Twitter) presence with AI-generated, viral tweet suggestions tailored to your style. Grow your audience and boost engagement effortlessly with HypeAmplify.',
  openGraph: {
    title: 'HypeAmplify – AI-Powered X (Twitter) Growth & Engagement',
    description: 'Supercharge your X (formerly Twitter) presence with AI-generated, viral tweet suggestions tailored to your style. Grow your audience and boost engagement effortlessly with HypeAmplify.',
    url: 'https://hypeamplify.com/',
    siteName: 'HypeAmplify',
    images: [
      {
        url: 'https://hypeamplify.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HypeAmplify – AI-Powered X (Twitter) Growth & Engagement',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HypeAmplify – AI-Powered X (Twitter) Growth & Engagement',
    description: 'Supercharge your X (formerly Twitter) presence with AI-generated, viral tweet suggestions tailored to your style. Grow your audience and boost engagement effortlessly with HypeAmplify.',
    images: ['https://hypeamplify.com/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 relative`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ClientAuthWrapper>
              {children}
            </ClientAuthWrapper>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
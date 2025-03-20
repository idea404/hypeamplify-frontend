// This is a server component (no 'use client' directive)
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { ClientAuthWrapper } from '@/components/ClientAuthWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HypeAmplify',
  description: 'X growth and engagement optimization',
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
      </body>
    </html>
  )
}
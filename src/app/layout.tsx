import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { WebGLBackground } from '@/components/WebGLBackground'

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
            <WebGLBackground />
            <div className="absolute inset-0 bg-white/40 dark:bg-black/30 backdrop-blur-[2px] -z-5" />
            <div className="absolute top-4 left-4 z-50">
              <ThemeToggle />
            </div>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
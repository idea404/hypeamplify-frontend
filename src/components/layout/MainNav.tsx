'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth/AuthContext'

export default function MainNav() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const { user, logout, credits } = useAuth()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the theme UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">HypeAmplify</span>
        </Link>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 hidden md:block">
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/dashboard' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/twitter/suggest" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith('/twitter') ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Tweet Suggestions
              </Link>
              <Link 
                href="/payments" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith('/payments') ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Credits & Payments
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/auth/login' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/auth/register' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                Register
              </Link>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <div className="text-sm font-medium mr-4">
              Credits: <span className="text-accent font-bold">{credits}</span>
            </div>
          )}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
          {user && (
            <button
              onClick={logout}
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
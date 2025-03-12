'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth/AuthContext'
import { ThemeToggle } from "@/components/ui/ThemeToggle"

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
          <ThemeToggle />
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
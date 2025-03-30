'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/lib/auth/AuthContext'
import { Logo } from './logo'
import { ThemeToggle } from './theme-toggle'
import { Menu, X, User, Home, CreditCard } from 'lucide-react'
import { Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useTheme } from 'next-themes'

export interface NavbarItemProps {
  key: string
  element: React.ReactNode
  position?: 'left' | 'right'
  order?: number
}

export interface NavbarProps {
  items?: NavbarItemProps[]
  showUserEmail?: boolean
  showCredits?: boolean
  onDashboardClick?: () => void
}

export function Navbar({
  items = [],
  showUserEmail = false,
  showCredits = false,
  onDashboardClick,
}: NavbarProps) {
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuthContext()
  const [credits, setCredits] = useState<number>(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  // Fetch credits if needed
  useEffect(() => {
    setIsLoaded(true)
    
    if (showCredits && isLoggedIn) {
      const fetchCredits = async () => {
        try {
          const { api } = await import('@/lib/api/client')
          const creditsData = await api.payments.getCredits()
          setCredits(creditsData.credits || 0)
        } catch (err) {
          console.error('Error fetching credits:', err)
        }
      }
      
      fetchCredits()
    }
  }, [showCredits, isLoggedIn])

  // Filter and sort items
  const leftItems = items
    .filter(item => item.position === 'left')
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  const rightItems = items
    .filter(item => item.position === 'right')
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  const handleLogout = () => {
    logout()
  }

  const handleDashboardClick = () => {
    if (onDashboardClick) {
      onDashboardClick()
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Logo width={120} height={36} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {/* Left items */}
            {leftItems.map(item => (
              <div key={item.key}>{item.element}</div>
            ))}

            {/* Right items */}
            {rightItems.map(item => (
              <div key={item.key}>{item.element}</div>
            ))}

            {/* Theme toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-50"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={isMobileMenuOpen}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="lg:hidden absolute right-2 top-16 z-50">
          <div className="rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 bg-card overflow-hidden min-w-[280px]">
            {/* User info if logged in */}
            {showUserEmail && user && (
              <div className="px-4 py-3 flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.email}</span>
                    <span className="text-xs text-muted-foreground">Your account</span>
                  </div>
                </div>
              </div>
            )}

            {/* Credits if shown */}
            {showCredits && (
              <div className="px-4 py-3 flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{credits} credits</span>
                  <span className="text-xs text-muted-foreground">Available</span>
                </div>
              </div>
            )}

            {/* Navigation items with standardized width */}
            <div className="p-2 space-y-1 w-full">
              {/* Dashboard button for logged in users */}
              {isLoggedIn && (
                <div className="px-2 w-full">
                  <Button 
                    variant="outline"
                    className="w-full justify-start cursor-pointer h-10"
                    size="default"
                    onClick={handleDashboardClick}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </div>
              )}

              {/* Other navigation buttons */}
              {items.map(item => (
                <div key={item.key} className="px-2 w-full">
                  {item.element}
                </div>
              ))}

              {/* Theme toggle button with consistent styling */}
              <div className="px-2 w-full">
                <Button 
                  variant="outline" 
                  className="w-full justify-start cursor-pointer h-10"
                  size="default"
                  onClick={() => {
                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                    setTheme(newTheme);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  Toggle Theme
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  )
} 
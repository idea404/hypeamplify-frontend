'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/lib/auth/AuthContext'
import { Logo } from './logo'
import { ThemeToggle } from './theme-toggle'
import { Menu, X, User, Home, Coins } from 'lucide-react'
import { Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useTheme } from 'next-themes'
import { delay, motion } from 'framer-motion'

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

  // Animation variants
  const navVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delay: 0.2,
        // stagger: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20
      }
    }
  }

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Desktop Navigation - Left Side */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {/* Theme toggle first */}
            <motion.div variants={itemVariants}>
              <ThemeToggle />
            </motion.div>
            
            {/* Home button if logged in */}
            {isLoggedIn && (
              <motion.div variants={itemVariants}>
                <Button 
                  variant="outline" 
                  onClick={handleDashboardClick}
                  className="cursor-pointer space-x-1.5"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </motion.div>
            )}
            
            {/* User account name if logged in */}
            {showUserEmail && user && (
              <motion.div 
                variants={itemVariants}
                className="flex items-center text-sm font-medium"
              >
                {user.email}
              </motion.div>
            )}
          </div>

          {/* Mobile logo - centered */}
          <motion.div 
            className="flex items-center lg:hidden"
            variants={itemVariants}
          >
            <Link href="/" className="flex-shrink-0">
              <Logo width={120} height={36} />
            </Link>
          </motion.div>

          {/* Desktop Navigation - Right Side */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {/* Credits if shown */}
            {showCredits && (
              <motion.div 
                variants={itemVariants}
                className="flex items-center space-x-2 text-sm"
              >
                <Coins className="h-4 w-4 text-primary" />
                <span>{credits} credits</span>
              </motion.div>
            )}
            
            {/* Right items */}
            {rightItems.map(item => (
              <motion.div key={item.key} variants={itemVariants}>
                {item.element}
              </motion.div>
            ))}
          </div>

          {/* Mobile menu button */}
          <motion.div 
            className="flex items-center lg:hidden"
            variants={itemVariants}
          >
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
          </motion.div>
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
                  <Coins className="h-4 w-4 text-primary" />
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
                    className="w-full justify-start cursor-pointer h-10 space-x-1.5"
                    size="default"
                    onClick={handleDashboardClick}
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
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
                  className="w-full justify-start cursor-pointer h-10 space-x-1.5"
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
    </motion.nav>
  )
} 
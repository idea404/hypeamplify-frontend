'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/lib/auth/AuthContext'

export interface NavbarItemProps {
  key: string
  element: React.ReactNode
  position: 'left' | 'right'
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
    <>
      {/* Left side items */}
      {(leftItems.length > 0 || showUserEmail) && (
        <motion.div 
          className="absolute top-5 left-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            {showUserEmail && isLoggedIn && (
              <div 
                className="text-sm px-4 py-1 bg-background rounded-full border border-input text-primary cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={handleDashboardClick}
              >
                {user?.email || 'username not found'}
              </div>
            )}
            
            {leftItems.map(item => (
              <div key={item.key}>{item.element}</div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Right side items */}
      {(rightItems.length > 0 || showCredits || isLoggedIn) && (
        <motion.div 
          className="absolute top-4 right-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            {showCredits && isLoggedIn && (
              <div className="text-sm px-4 py-1 bg-background rounded-full border border-input text-primary">
                {credits} credits available
              </div>
            )}
            
            {rightItems.map(item => (
              <div key={item.key}>{item.element}</div>
            ))}
            
            {/* Default auth buttons when no custom right items */}
            {rightItems.length === 0 && (
              isLoggedIn ? (
                <>
                  <Button variant="default" onClick={() => router.push('/payments')} className="cursor-pointer">
                    Buy Credits
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="cursor-pointer">
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              )
            )}
          </div>
        </motion.div>
      )}
    </>
  )
} 
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { motion } from 'framer-motion'
import { useAuthContext } from '@/lib/auth/AuthContext'
import { Navbar, NavbarItemProps } from '@/components/ui/navbar'
import { CreditCard, LogOut } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { logout, refreshCredits } = useAuthContext()

  // Refresh credits when the page loads after successful payment
  useEffect(() => {
    refreshCredits()
  }, [refreshCredits])

  // Navbar items for this page
  const navbarItems: NavbarItemProps[] = [
    {
      key: 'buy-more',
      element: (
        <Button variant="default" onClick={() => router.push('/payments')} className="w-full justify-start h-10 cursor-pointer">
          <CreditCard className="h-4 w-4" />
          Buy More Credits
        </Button>
      ),
      position: 'right',
      order: 1
    },
    {
      key: 'sign-out',
      element: (
        <Button variant="outline" onClick={logout} className="w-full justify-start h-10 cursor-pointer">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      ),
      position: 'right',
      order: 2
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Use the Navbar component, show credits */}
      <Navbar 
        items={navbarItems}
        showUserEmail={true}
        showCredits={true}
        onDashboardClick={() => router.push('/dashboard')} // Ensure dashboard button works
      />

      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-green-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your credits have been added to your account.
          </p>
          <div className="space-x-4">
            <Button onClick={() => router.push('/dashboard')} size="lg">
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push('/payments')} size="lg">
              Buy More Credits
            </Button>
          </div>
        </motion.div>
      </main>

      {/* HypeAmplify Logo - only visible on desktop */}
      <motion.div 
        className="absolute bottom-6 left-6 hidden lg:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/">
          <Logo width={200} height={60} />
        </Link>
      </motion.div>
    </div>
  );
} 
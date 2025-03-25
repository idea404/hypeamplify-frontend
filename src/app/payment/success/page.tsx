'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [credits, setCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const creditsData = await api.payments.getCredits()
        setCredits(creditsData.credits || 0)
      } catch (error) {
        console.error('Error fetching credits:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCredits()
    
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [router])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full p-8 rounded-lg border shadow-lg bg-background"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          
          {isLoading ? (
            <p className="text-gray-500 mb-6">Loading your updated credits...</p>
          ) : (
            <p className="text-gray-500 mb-6">
              Your payment was successful! You now have <span className="font-bold text-primary">{credits}</span> credits in your account.
            </p>
          )}
          
          <Button 
            onClick={() => router.push('/dashboard')} 
            className="w-full cursor-pointer"
          >
            Continue to Dashboard
          </Button>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-6 left-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/">
          <Logo width={200} height={60} />
        </Link>
      </motion.div>
    </div>
  )
} 
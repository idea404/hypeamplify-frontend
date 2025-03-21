'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'
import { api } from '@/lib/api/client'

export default function PaymentSuccess() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        // Get updated credits
        const creditsData = await api.payments.getCredits()
        setCredits(creditsData.credits || 0)
      } catch (error) {
        console.error('Error fetching user credits:', error)
      }
    }

    fetchUserCredits()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div 
        className="max-w-md w-full mx-auto p-8 rounded-lg shadow-lg border bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-500 mb-6">
            Your payment has been processed and credits have been added to your account.
          </p>
          
          {credits !== null && (
            <div className="text-lg font-semibold mb-8">
              Your current balance: <span className="text-primary">{credits} credits</span>
            </div>
          )}
          
          <Button
            className="w-full cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  )
} 
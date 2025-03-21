'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { XCircle } from 'lucide-react'

export default function PaymentCancel() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div 
        className="max-w-md w-full mx-auto p-8 rounded-lg shadow-lg border bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center text-center">
          <XCircle className="w-16 h-16 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
          <p className="text-gray-500 mb-6">
            Your payment was cancelled and you have not been charged.
          </p>
          
          <div className="space-y-4 w-full">
            <Button
              className="w-full cursor-pointer"
              onClick={() => router.push('/payments')}
            >
              Try Again
            </Button>
            
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentCancelPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to payments page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/payments')
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
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-gray-500 mb-6">
            Your payment was cancelled. No charges were made to your card.
          </p>
          
          <Button 
            onClick={() => router.push('/payments')} 
            className="w-full cursor-pointer"
          >
            Back to Buy Credits
          </Button>
        </div>
      </motion.div>
      
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
  )
} 
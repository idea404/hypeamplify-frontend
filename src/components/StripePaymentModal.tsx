'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { loadStripe } from '@stripe/stripe-js'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api/client'

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51R06pJ4WwS1lLgDtc0YHSBMDDUls2Gno7JkizH959eLBktTZ9pagizVPdAzzeF1jQXp2xTTbwbm8LqgTRuGhEHb800wCUV95Qw')

export function StripePaymentModal({
  isOpen,
  onClose,
  packageId,
  packageName,
  packageCredits,
  packagePrice,
  onSuccess
}) {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState('')
  
  const handleCheckout = async () => {
    setIsRedirecting(true)
    setError('')
    
    try {
      // Use the checkout endpoint instead of createPaymentIntent
      const result = await api.payments.checkout(packageId)
      
      // Redirect to Stripe Checkout page
      window.location.href = result.url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setError('Could not initialize checkout. Please try again.')
      setIsRedirecting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Purchase {packageName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between mb-2">
              <span className="font-medium">{packageName}</span>
              <span className="font-bold">${packagePrice.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              You will receive {packageCredits} credits
            </div>
            
            {error && (
              <div className="text-sm text-red-500 mt-2">
                {error}
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isRedirecting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCheckout} 
              className="flex-1"
              disabled={isRedirecting}
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                `Pay $${packagePrice.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
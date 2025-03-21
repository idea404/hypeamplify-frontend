'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { api } from '@/lib/api/client'

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51R06pJ4WwS1lLgDtc0YHSBMDDUls2Gno7JkizH959eLBktTZ9pagizVPdAzzeF1jQXp2xTTbwbm8LqgTRuGhEHb800wCUV95Qw')

// PaymentForm component to handle the actual payment logic
const PaymentForm = ({ packageId, packageName, packageCredits, packagePrice, onSuccess, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  
  // Create a Payment Intent when the component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // Add a new API endpoint for creating payment intents
        const result = await api.payments.createPaymentIntent(packageId)
        setClientSecret(result.clientSecret)
      } catch (error) {
        setErrorMessage('Could not initialize payment. Please try again.')
        console.error('Error creating payment intent:', error)
      }
    }
    
    createPaymentIntent()
  }, [packageId])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!stripe || !elements || !clientSecret) {
      return
    }
    
    setIsProcessing(true)
    setErrorMessage('')
    
    // Get the card element
    const cardElement = elements.getElement(CardElement)
    
    try {
      // Confirm payment with the card element
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })
      
      if (error) {
        setErrorMessage(error.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
        return
      }
      
      if (paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true)
        
        // Get updated credits
        const creditsData = await api.payments.getCredits()
        onSuccess(creditsData.credits || 0)
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.')
      console.error('Payment error:', error)
      setIsProcessing(false)
    }
  }
  
  if (paymentSuccess) {
    return (
      <motion.div 
        className="flex flex-col items-center text-center py-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <p className="text-lg mb-6">
          Your payment was successful! {packageCredits} credits have been added to your account.
        </p>
        <Button onClick={onCancel} className="w-full">
          Close
        </Button>
      </motion.div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="flex justify-between mb-2">
          <span className="font-medium">{packageName}</span>
          <span className="font-bold">${packagePrice.toFixed(2)}</span>
        </div>
        <div className="text-sm text-gray-500 mb-4">
          You will receive {packageCredits} credits
        </div>
        
        <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#32325d',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                  iconColor: '#fa755a',
                },
              },
            }}
          />
        </div>
        
        {errorMessage && (
          <div className="text-sm text-red-500 mt-2">
            {errorMessage}
          </div>
        )}
      </div>
      
      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? 'Processing...' : `Pay $${packagePrice.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}

// Main StripePaymentModal component
export function StripePaymentModal({
  isOpen,
  onClose,
  packageId,
  packageName,
  packageCredits,
  packagePrice,
  onSuccess
}) {
  const handleSuccess = (credits) => {
    if (onSuccess) {
      onSuccess(credits)
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
        
        <Elements stripe={stripePromise}>
          <PaymentForm 
            packageId={packageId}
            packageName={packageName}
            packageCredits={packageCredits}
            packagePrice={packagePrice}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { loadStripe } from '@stripe/stripe-js'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'

// Initialize Stripe - make sure to use your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface Package {
  id: string
  name: string
  description?: string
  credits: number
  price_usd: number
}

export default function PaymentsPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await api.payments.getPackages()
        setPackages(data.packages || [])
      } catch (error) {
        console.error('Error fetching packages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const handleCheckout = async (packageId: string) => {
    try {
      setProcessingId(packageId)
      const checkout = await api.payments.checkout(packageId)
      
      // Redirect to Stripe checkout page
      window.location.href = checkout.url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setProcessingId(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        {/* Header/Navigation */}
        <div className="py-6 px-8 flex justify-between items-center border-b">
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
          <Logo width={150} height={45} />
        </div>

        <main className="flex-1 max-w-4xl mx-auto w-full py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-8 text-center">Buy Credits</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 text-center">
              Purchase credits to generate tweet suggestions
            </p>

            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="border rounded-lg p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-gray-500 mb-4">{pkg.description}</p>
                    )}
                    <div className="text-3xl font-bold mb-2">${pkg.price_usd}</div>
                    <p className="text-primary mb-6">{pkg.credits} credits</p>
                    <Button
                      className="w-full cursor-pointer"
                      onClick={() => handleCheckout(pkg.id)}
                      disabled={processingId === pkg.id}
                    >
                      {processingId === pkg.id ? 'Processing...' : 'Buy Now'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  )
} 
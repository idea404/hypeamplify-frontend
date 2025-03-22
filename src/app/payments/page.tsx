'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import Link from 'next/link'
import { StripePaymentModal } from '@/components/StripePaymentModal'
import { useAuthContext } from '@/lib/auth/AuthContext'

interface Package {
  id: string
  name: string
  description?: string
  credits: number
  price_usd: number
}

export default function PaymentsPage() {
  const router = useRouter()
  const { user, logout } = useAuthContext()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg)
    setIsModalOpen(true)
  }

  const handlePaymentSuccess = (credits: number) => {
    // Close the modal after a short delay to show the success message
    setTimeout(() => {
      setIsModalOpen(false)
      setSelectedPackage(null)
      
      // Optionally redirect to dashboard
      router.push('/dashboard')
    }, 3000)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        {/* Username next to theme toggle */}
        <motion.div 
          className="absolute top-5 left-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => router.push('/dashboard')}
        >
          <div className="text-sm px-4 py-1 bg-background rounded-full border border-input text-primary cursor-pointer">
            {user?.email || 'username not found'}
          </div>
        </motion.div>

        <main className="flex-1 flex items-center justify-center p-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-7xl font-bold mb-8 text-center">Buy Credits</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max- text-center">
              Purchase credits to generate tweet suggestions. Every credit generates 3 tweet suggestions for any profile.
            </p>

            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {packages.map((pkg) => {
                  const isPremium = pkg.name.toLowerCase() === 'premium';
                  const isStandard = pkg.name.toLowerCase() === 'standard';
                  
                  return (
                    <motion.div
                      key={pkg.id}
                      className={`rounded-lg p-6 shadow-sm relative overflow-hidden 
                        backdrop-blur-md bg-background/20 backdrop-saturate-150
                        ${!isPremium ? 'border' : 'border-0'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ 
                        scale: 1.03, 
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                        border: isPremium ? "1px solid var(--primary)" : undefined,
                        borderColor: !isPremium ? "var(--primary)" : undefined
                      }}
                      transition={{ 
                        scale: { duration: 0.15, ease: "easeOut" },
                        boxShadow: { duration: 0.15, ease: "easeOut" },
                        borderColor: { duration: 0.15, ease: "easeOut" },
                        border: { duration: 0.15, ease: "easeOut" }
                      }}
                    >
                      {/* Animated multicolor border for Premium plan */}
                      {isPremium && (
                        <motion.div 
                          className="absolute inset-0 rounded-lg z-0"
                          style={{ 
                            background: 'linear-gradient(90deg, #ff0000, #ff9a00, #d0de21, #4fdc4a, #3fdad8, #2fc9e2, #1c7fee, #5f15f2, #ba0cf8, #fb07d9, #ff0000)',
                            backgroundSize: '500% 500%',
                            padding: '2px', // Border thickness
                          }}
                          animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '200% 0%', '300% 100%', '400% 0%'],
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          <div className="absolute inset-0 bg-background/90 rounded-lg" />
                        </motion.div>
                      )}

                      {/* Best Value tag for Premium */}
                      {isPremium && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium text-xs px-2 py-1 rounded-full z-10 shadow-md border border-yellow-200">
                          Best Value
                        </div>
                      )}

                      {/* Silver "< $1 per Credit" tag for Standard */}
                      {isStandard && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-medium text-xs px-2 py-1 rounded-full z-10 shadow-md border border-gray-200">
                          &lt; $1 per Credit
                        </div>
                      )}
                      
                      {/* Card content container with glassmorphism */}
                      <div className="relative z-10 h-full">
                        {/* Metallic shine effect overlay - improved */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/40 to-transparent pointer-events-none" 
                          initial={{ opacity: 0, left: "-100%" }}
                          whileHover={{ opacity: 1, left: "100%" }}
                          transition={{ 
                            duration: 1.2, 
                            ease: "easeInOut"
                          }}
                          style={{
                            width: "70%",
                            filter: "blur(8px)",
                            transform: "skewX(-20deg)",
                            zIndex: 10
                          }}
                        />
                        
                        <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                        {pkg.description && (
                          <p className="text-gray-500 mb-4">{pkg.description}</p>
                        )}
                        <div className="text-3xl font-bold mb-2">${pkg.price_usd}</div>
                        <p className="text-primary mb-3">{pkg.credits} credits</p> 
                        
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{pkg.credits * 3} tweet suggestions</p>
                        <Button
                          className={`w-full cursor-pointer ${
                            isPremium 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:text-yellow-300 hover:border hover:border-yellow-300 dark:hover:border-yellow-600' 
                              : ''
                          }`}
                          onClick={() => handlePackageSelect(pkg)}
                        >
                          Buy Now
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* HypeAmplify Logo */}
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
        </main>

        {selectedPackage && (
          <StripePaymentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            packageId={selectedPackage.id}
            packageName={selectedPackage.name}
            packageCredits={selectedPackage.credits}
            packagePrice={selectedPackage.price_usd}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </ProtectedRoute>
  )
} 
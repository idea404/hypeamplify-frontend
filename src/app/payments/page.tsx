'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'
import { useAuthContext } from '@/lib/auth/AuthContext'
import { Loader2, LogOut, CheckCircle, XCircle, Loader2 as SmallLoader } from 'lucide-react'
import { Navbar, NavbarItemProps } from '@/components/ui/navbar'
import { Input } from '@/components/ui/input'

interface Package {
  id: string
  name: string
  description?: string
  credits: number
  price_usd: number
}

export default function PaymentsPage() {
  const router = useRouter()
  const { user, logout, refreshCredits } = useAuthContext()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [processingPackage, setProcessingPackage] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState('')
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')
  const [validationMessage, setValidationMessage] = useState('')
  const [bonusFactor, setBonusFactor] = useState(1.0)

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

    // Check for session_id in the URL when redirected back from Stripe
    const url = new URL(window.location.href)
    const sessionId = url.searchParams.get('session_id')
    
    if (sessionId) {
      // Clean up the URL to remove the session_id
      url.searchParams.delete('session_id')
      window.history.replaceState({}, '', url.toString())
      
      // Navigate to success page for consistent UX
      router.push('/payment/success')
    }
  }, [router])

  // Debounced effect for referral code validation
  useEffect(() => {
    // Clear previous timeout if exists
    const handler = setTimeout(async () => {
      if (!referralCode) {
        setValidationStatus('idle')
        setValidationMessage('')
        setBonusFactor(1.0)
        return
      }

      setValidationStatus('validating')
      setValidationMessage('')
      setBonusFactor(1.0)

      try {
        const result = await api.payments.validateReferralCode(referralCode)
        if (result.valid) {
          setValidationStatus('valid')
          setValidationMessage(result.message || 'Referral code applied!')
          setBonusFactor(result.bonus_credits_factor || 1.0)
        } else {
          setValidationStatus('invalid')
          setValidationMessage(result.message || 'Invalid referral code.')
        }
      } catch (error) {
        console.error('Error validating referral code:', error)
        setValidationStatus('invalid')
        setValidationMessage('Could not validate code. Please try again.')
      }
    }, 500) // Debounce for 500ms

    // Cleanup function to clear timeout
    return () => {
      clearTimeout(handler)
    }
  }, [referralCode]) // Re-run effect when referralCode changes

  const handlePackageSelect = async (pkg: Package) => {
    setProcessingPackage(pkg.id)
    setCheckoutError(null)
    
    // Determine the referral code to send (only if valid)
    const codeToSend = validationStatus === 'valid' ? referralCode : undefined
    
    try {
      // Directly call the checkout endpoint, passing the validated referral code
      const result = await api.payments.checkout(pkg.id, codeToSend)
      
      // Redirect to Stripe Checkout page
      window.location.href = result.url
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      // Check if error message contains specific referral issue
      const errorDetail = error.response?.data?.detail || 'Could not initialize checkout. Please try again.';
      if (errorDetail.toLowerCase().includes('referral')) {
        setCheckoutError(errorDetail) // Show referral-specific error
        setValidationStatus('invalid') // Mark code as invalid again if checkout fails due to it
        setValidationMessage(errorDetail)
      } else {
        setCheckoutError('Could not initialize checkout. Please try again.')
      }
      setProcessingPackage(null)
    }
  }

  // Custom navbar items
  const navbarItems: NavbarItemProps[] = [
    {
      key: 'sign-out',
      element: (
        <Button variant="outline" onClick={logout} className="w-full justify-start h-10 cursor-pointer">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      ),
      position: 'right',
      order: 1
    }
  ];

  // Variants for the container and items
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        {/* Use the Navbar component */}
        <Navbar 
          items={navbarItems}
          showUserEmail={true}
          showCredits={true}
        />

        <main className="flex-1 flex items-center justify-center p-4 lg:p-32 mt-16 lg:mt-0">
          <motion.div
            className="w-full max-w-4xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Buy Credits
            </motion.h1>

            <motion.div 
              className="flex justify-center mx-auto max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400 text-center">
                Purchase credits to generate tweet suggestions. Every credit generates 3 tweet suggestions for any profile.
              </p>
            </motion.div>
            
            {/* Referral Code Input */} 
            <motion.div 
              className="mt-6 mb-8 w-full max-w-xl md:max-w-md lg:max-w-70 mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="relative">
                <Input
                  id="referral-code"
                  type="text"
                  placeholder="Enter referral code here"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())} // Convert to uppercase for consistency
                  className={`pr-10 ${validationStatus === 'valid' ? 'border-green-500 focus:border-green-600' : validationStatus === 'invalid' ? 'border-red-500 focus:border-red-600' : ''}`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {validationStatus === 'validating' && <SmallLoader className="h-5 w-5 text-gray-400 animate-spin" />}
                  {validationStatus === 'valid' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {validationStatus === 'invalid' && referralCode && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
              {/* {validationMessage && (
                <p className={`mt-2 text-sm ${validationStatus === 'valid' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {validationMessage}
                </p>
              )} */}
            </motion.div>

            {/* Show error if checkout failed */}
            {checkoutError && (
              <motion.div 
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-center max-w-md mx-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {checkoutError}
              </motion.div>
            )}
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {packages.map((pkg) => {
                  const isPremium = pkg.name.toLowerCase() === 'premium'
                  const isStandard = pkg.name.toLowerCase() === 'standard'
                  
                  return (
                    <motion.div
                      key={pkg.id}
                      className={`rounded-lg p-6 shadow-sm relative overflow-hidden 
                        backdrop-blur-md bg-background/20 backdrop-saturate-150
                        border`}
                      variants={itemVariants}
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
                            padding: '2px'
                          }}
                          animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '200% 0%', '300% 100%', '400% 0%']
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
                        <motion.div 
                          className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium text-xs px-2 py-1 rounded-full z-10 shadow-md border border-yellow-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                        >
                          Best Value
                        </motion.div>
                      )}

                      {/* Silver "< $1 per Credit" tag for Standard */}
                      {isStandard && (
                        <motion.div 
                          className="absolute top-3 right-3 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-medium text-xs px-2 py-1 rounded-full z-10 shadow-md border border-gray-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                        >
                          &lt; $1 per Credit
                        </motion.div>
                      )}
                      
                      {/* Card content container with glassmorphism */}
                      <div className="relative z-10 h-full flex flex-col"> 
                        {/* Metallic shine effect overlay */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/40 to-transparent pointer-events-none" 
                          initial={{ opacity: 0, left: "-100%" }}
                          whileHover={{ opacity: 1, left: "100%" }}
                          transition={{ duration: 1.2, ease: "easeInOut" }}
                          style={{
                            width: "70%",
                            filter: "blur(8px)",
                            transform: "skewX(-20deg)",
                            zIndex: 10
                          }}
                        />
                        
                        <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                        {pkg.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{pkg.description}</p>
                        )}
                        <div className="text-3xl font-bold mb-2">${pkg.price_usd}</div>
                        
                        {/* Credits line with potential bonus */}
                        <p className="text-primary mb-1 flex items-center flex-wrap">
                          <span>{pkg.credits} credits</span>
                          {(() => {
                            // Calculate bonus only if code is valid and factor > 1
                            if (validationStatus === 'valid' && bonusFactor > 1.0) {
                              const totalCredits = Math.floor(pkg.credits * bonusFactor);
                              const bonusAmount = totalCredits - pkg.credits;
                              
                              // Only show bonus text if bonusAmount > 0
                              if (bonusAmount > 0) {
                                return (
                                  <motion.span
                                    className="ml-2 font-semibold text-transparent bg-clip-text"
                                    style={{
                                      backgroundImage: 'linear-gradient(90deg, #ff0000, #ff9a00, #d0de21, #4fdc4a, #3fdad8, #2fc9e2, #1c7fee, #5f15f2, #ba0cf8, #fb07d9, #ff0000)',
                                      backgroundSize: '300% 100%', // Control size for animation
                                    }}
                                    animate={{
                                      // Animate background position horizontally
                                      backgroundPosition: ['0% 50%', '150% 50%', '300% 50%'] 
                                    }}
                                    transition={{
                                      duration: 3, // Speed of animation
                                      repeat: Infinity,
                                      ease: "linear"
                                    }}
                                  >
                                    + {bonusAmount} free
                                  </motion.span>
                                );
                              }
                            }
                            return null; // Return null if no bonus text needed
                          })()}
                        </p>

                        {/* Updated suggestions text to reflect potential bonus */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          {Math.floor(pkg.credits * (validationStatus === 'valid' ? bonusFactor : 1.0)) * 3} total tweet suggestions
                        </p>
                        
                        {/* Added mt-auto to push button to bottom of flex container */}
                        <Button
                          className={`w-full cursor-pointer mt-auto ${ 
                            isPremium 
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:text-yellow-300 hover:border hover:border-yellow-300 dark:hover:border-yellow-600' 
                              : ''
                          }`}
                          onClick={() => handlePackageSelect(pkg)}
                          disabled={processingPackage !== null}
                        >
                          {processingPackage === pkg.id ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </div>
                          ) : (
                            'Buy Now'
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
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
    </ProtectedRoute>
  )
} 
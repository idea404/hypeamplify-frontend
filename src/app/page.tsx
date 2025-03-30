'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "@/components/ui/logo"
import ProfileButton from "@/components/ui/profile-button"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { TwitterCard } from "@/components/ui/twitter-card"
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'
import { useAuthContext } from '@/lib/auth/AuthContext'
import { Navbar, NavbarItemProps } from '@/components/ui/navbar'
import { CreditCard, LogOut, User } from 'lucide-react'

// Step indicator component with independent alignment and animations for number and title
const StepIndicator = ({ step }: { step: number }) => {
  const titles = {
    1: "Select X Profile",
    2: "Generating...",
    3: "Profit 💰"
  };
  
  return (
    <div className="flex items-center mb-6 relative">
      <div className="flex items-center lg:absolute" style={{ left: "0", position: "relative", marginRight: "0.75rem", width: "auto", display: "inline-flex" }}>
        <motion.span 
          className="text-2xl lg:text-4xl font-bold tracking-tighter"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {step}
        </motion.span>
        <motion.span
          className="text-2xl lg:text-4xl font-bold tracking-tighter text-muted-foreground mx-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          .
        </motion.span>
      </div>
      
      <motion.h2 
        className="text-2xl lg:text-4xl font-bold tracking-tighter"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {titles[step as keyof typeof titles]}
        </motion.span>
      </motion.h2>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuthContext()
  const [step, setStep] = useState(1)
  const [hoverSide, setHoverSide] = useState<'left' | 'right'>('left')
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [copiedTweets, setCopiedTweets] = useState<{[key: number]: boolean}>({})
  const [shuffledMessages, setShuffledMessages] = useState<string[]>([])
  const [credits, setCredits] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  // Check if we're on desktop on mount
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024)
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Add effect for mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDesktop) {
        if (e.clientX < window.innerWidth / 2) {
          setHoverSide('left')
        } else {
          setHoverSide('right')
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isDesktop])

  // Profile-specific tweet suggestions from demo data
  const profileSuggestions = {
    "elonmusk": {
        "name": "Elon Musk",
        "suggestions": [
            "Sew one button, doesn't make u a tailor; cook one meal, doesn't make u a chef; but f* one horse and u r a horsef*er for all of history...",
            "Cybertruck production update: Now comes pre-dented and with a rock inside",
            "Funding secured."
        ]
    },
    "realDonaldTrump": {
        "name": "Donald J. Trump",
        "suggestions": [
            "I'm much more humble than you would understand.",
            "How many favors has anybody done for the USA lately? Not many, and that's why they're coming here illegally",
            "Do you even know who you are? You're a loser, and I'm the president"
        ]
    },
    "taylorswift13": {
        "name": "Taylor Swift",
        "suggestions": [
            "Let your heart remain breakable, but never by the same hands twice",
            "Be good to people. Being good to people is a wonderful legacy to leave behind.",
            "Learn to live alongside cringe. No matter how hard you try to avoid being cringe, you will look back on your life and cringe retrospectively."
        ]
    },
    "kanyewest": {
        "name": "Ye",
        "suggestions": [
            "Sometimes I'm wishin that my dick had go pro",
            "Mayonnaise colored Benz, I push miracle whips",
            "You left your fridge open somebody just took a sandwich"
        ]
    }
  };

  // Get current tweet suggestions based on selected profile
  const getTweetSuggestions = () => {
    return selectedProfile && profileSuggestions[selectedProfile as keyof typeof profileSuggestions]
      ? profileSuggestions[selectedProfile as keyof typeof profileSuggestions].suggestions
      : [];
  };

  // Display name for the selected profile
  const getProfileDisplayName = () => {
    return selectedProfile && profileSuggestions[selectedProfile as keyof typeof profileSuggestions]
      ? profileSuggestions[selectedProfile as keyof typeof profileSuggestions].name
      : selectedProfile;
  };

  useEffect(() => {
    // Initialize
    setIsLoaded(true)
    
    // Only fetch credits if logged in
    if (isLoggedIn) {
      const fetchCredits = async () => {
        try {
          const creditsData = await api.payments.getCredits()
          setCredits(creditsData.credits || 0)
        } catch (err) {
          console.error('Error fetching credits:', err)
        }
      }
      
      fetchCredits()
    }
  }, [isLoggedIn])
  
  // Handle logout
  const handleLogout = () => {
    logout()
  }
  
  // Handle navigation to dashboard
  const goToDashboard = () => {
    router.push('/dashboard')
  }

  // Handle profile selection
  const handleProfileSelect = (profile: string) => {
    setSelectedProfile(profile)
    setStep(2)
    
    // Simulate AI processing
    setTimeout(() => {
      setIsComplete(true)
      setTimeout(() => {
        setStep(3)
      }, 1000)
    }, 6000)
  }

  // Add function to copy text to clipboard
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      // Set this tweet as copied
      setCopiedTweets(prev => ({ ...prev, [index]: true }))
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedTweets(prev => ({ ...prev, [index]: false }))
      }, 2000)
    })
  }

  // Custom navbar items for logged in and logged out states
  const loggedInNavItems: NavbarItemProps[] = [
    {
      key: 'buy-credits',
      element: (
        <Button variant="default" onClick={() => router.push('/payments')} className="w-full justify-start h-10 cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          Buy Credits
        </Button>
      ),
      position: 'right',
      order: 1
    },
    {
      key: 'sign-out',
      element: (
        <Button variant="outline" onClick={handleLogout} className="w-full justify-start h-10 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      ),
      position: 'right',
      order: 2
    }
  ];

  const loggedOutNavItems: NavbarItemProps[] = [
    {
      key: 'sign-in',
      element: (
        <Button asChild variant="outline" className="w-full justify-start h-10">
          <Link href="/auth/login">
            <User className="mr-2 h-4 w-4" />
            Sign In
          </Link>
        </Button>
      ),
      position: 'right',
      order: 1
    }
  ];

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Use the Navbar component */}
      <Navbar 
        items={isLoggedIn ? loggedInNavItems : loggedOutNavItems}
        showUserEmail={isLoggedIn}
        showCredits={isLoggedIn}
      />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden mt-16 lg:mt-0">
        {/* Left Half - Intro */}
        <motion.div
          className={`w-full lg:w-1/2 flex items-center justify-center p-4 lg:pr-12 lg:p-8 ${isDesktop && hoverSide === 'right' ? 'blur-sm' : ''} transition-all duration-300`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
          transition={{ delay: 0.3 }}
        >
          <div className="max-w-md space-y-6 text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter sm:text-5xl/none">
              Supercharge Your Presence on X
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Get AI-powered tweet suggestions based on your profile and audience. 
              HypeAmplify analyzes your content and generates high-performing tweets.
            </p>
            <div>
              <Button asChild size="lg">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Right Half - Profile Selection / Generation */}
        <motion.div
          className={`w-full lg:w-1/2 flex items-center justify-start p-4 lg:pl-12 lg:p-8 ${isDesktop && hoverSide === 'left' ? 'blur-sm' : ''} transition-all duration-300`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 50 }}
          transition={{ delay: 0.4 }}
        >
          <div className="max-w-md w-full space-y-6">
            {/* Fixed header */}
            <div className="mb-6">
              <StepIndicator step={step} />
            </div>
            
            {/* Content container with fixed height to prevent movement */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ProfileButton name="elonmusk" onClick={() => handleProfileSelect('elonmusk')} useLocalImagesFirst={true} />
                      <ProfileButton name="realDonaldTrump" onClick={() => handleProfileSelect('realDonaldTrump')} useLocalImagesFirst={true} />
                      <ProfileButton name="taylorswift13" onClick={() => handleProfileSelect('taylorswift13')} useLocalImagesFirst={true} />
                      <ProfileButton name="kanyewest" onClick={() => handleProfileSelect('kanyewest')} useLocalImagesFirst={true} />
                    </div>
                  </motion.div>
                )}
                
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <AnimatePresence mode="wait">
                      {!isComplete ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <LoadingAnimation />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="complete"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="flex items-center gap-2 text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <p className="text-xl">Done!</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
                
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      {getTweetSuggestions().map((tweet, index) => (
                        <TwitterCard
                          key={index}
                          tweet={tweet}
                          username={selectedProfile}
                          displayName={getProfileDisplayName()}
                          index={index}
                          animationDelay={0.2}
                          useLocalImagesFirst={true}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
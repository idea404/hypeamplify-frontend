'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Logo } from "@/components/ui/Logo"

// Step indicator component with independent alignment and animations for number and title
const StepIndicator = ({ step }: { step: number }) => {
  const titles = {
    1: "Select X Profile",
    2: "Generating...",
    3: "Profit 💰"
  };
  
  return (
    <div className="flex items-center mb-6 relative">
      <div className="flex items-center absolute" style={{ left: "-3rem" }}>
        <motion.span 
          className="text-4xl font-bold tracking-tighter"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {step}
        </motion.span>
        <motion.span
          className="text-4xl font-bold tracking-tighter text-muted-foreground mx-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          .
        </motion.span>
      </div>
      
      <motion.h2 
        className="text-4xl font-bold tracking-tighter"
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

// X Profile Button component with profile image
const ProfileButton = ({ 
  name, 
  onClick 
}: { 
  name: string,
  onClick: () => void
}) => {
  // Clean name for image path (removing @ if present)
  const imageName = name.replace('@', '').toLowerCase() + '.png';
  
  return (
    <Button
      variant="outline" 
      onClick={onClick}
      className="w-full text-base relative overflow-hidden group transition-all duration-200 hover:bg-accent/50 hover:border-primary/30 hover:shadow-md px-2 py-5"
    >
      <div className="flex items-center w-full justify-start gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border">
          <img 
            src={`/images/${imageName}`} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        <span>@{name.replace('@', '')}</span>
      </div>
      <motion.div 
        className="absolute inset-0 bg-primary/5 pointer-events-none opacity-0 group-hover:opacity-100" 
        layoutId="profileButtonHighlight"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    </Button>
  )
}

// Loading animation component
const LoadingAnimation = ({ messages }: { messages: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    if (currentIndex < messages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(index => index + 1)
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, messages.length])
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-5 h-5 border-t-2 border-accent rounded-full"
        />
        <p>AI is thinking...</p>
      </div>
      <AnimatePresence>
        {messages.map((message, index) => (
          index <= currentIndex && (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground"
            >
              {message}
            </motion.p>
          )
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function Home() {
  const [step, setStep] = useState(1)
  const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [copiedTweets, setCopiedTweets] = useState<{[key: number]: boolean}>({})
  const [shuffledMessages, setShuffledMessages] = useState<string[]>([])
  
  // Mock loading messages
  const loadingMessages = [
    "Inflating follower egos...",
    "Teaching AI to understand memes...",
    "Analyzing what's trending before it trends...",
    "Brewing viral tweet potential...",
    "Convincing algorithms you're interesting...",
    "Stalking your competition (legally)...",
    "Simulating human authenticity..."
  ]

  // Mock tweet suggestions
  const tweetSuggestions = [
    "Just learned a fascinating fact about machine learning: 90% of the work is data preparation. #MachineLearning #DataScience",
    "Hot take: TypeScript isn't just for large projects. Even small apps benefit from better tooling. #TypeScript #WebDev",
    "Thinking about how the best products focus on solving one problem extremely well. What's your favorite single-purpose tool? #ProductDesign"
  ]

  // Initial page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Effect to shuffle messages once when step changes to 2
  useEffect(() => {
    if (step === 2) {
      setShuffledMessages([...loadingMessages].sort(() => Math.random() - 0.5));
    }
  }, [step]);

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

  return (
    <div 
      className="flex flex-col min-h-screen relative"
      onMouseMove={(e) => {
        // Determine which side of the screen the mouse is on
        if (e.clientX < window.innerWidth / 2) {
          setHoverSide('left')
        } else {
          setHoverSide('right')
        }
      }}
    >
      {/* Sign In Button */}
      <motion.div 
        className="absolute top-4 right-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
        transition={{ delay: 0.2 }}
      >
        <Button asChild variant="ghost">
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </motion.div>
      
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Half - Intro */}
        <motion.div
          className={`w-1/2 flex items-center justify-center pr-12 p-8 ${hoverSide === 'right' ? 'blur-sm' : ''} transition-all duration-300`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
          transition={{ delay: 0.3 }}
        >
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl/none">
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
          className={`w-1/2 flex items-center justify-start pl-12 p-8 ${hoverSide === 'left' ? 'blur-sm' : ''} transition-all duration-300`}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProfileButton name="elonmusk" onClick={() => handleProfileSelect('elonmusk')} />
                      <ProfileButton name="realDonaldTrump" onClick={() => handleProfileSelect('realDonaldTrump')} />
                      <ProfileButton name="taylorswift13" onClick={() => handleProfileSelect('taylorswift13')} />
                      <ProfileButton name="kanyewest" onClick={() => handleProfileSelect('kanyewest')} />
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
                          <LoadingAnimation messages={shuffledMessages} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="complete"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="flex items-center gap-2 text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <p>All set! Ready!</p>
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
                      {tweetSuggestions.map((tweet, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            transition: { delay: index * 0.2 }
                          }}
                          className="p-4 bg-white dark:bg-black rounded-md relative group border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            {/* Profile Image */}
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
                              <img 
                                src={`/images/${selectedProfile.toLowerCase()}.png`} 
                                alt={selectedProfile} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Tweet Content */}
                            <div className="flex-1">
                              {/* Account Info */}
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm">
                                  {selectedProfile === 'elonmusk' ? 'Elon Musk' : 
                                   selectedProfile === 'realDonaldTrump' ? 'Donald J. Trump' :
                                   selectedProfile === 'taylorswift13' ? 'Taylor Swift' :
                                   selectedProfile === 'kanyewest' ? 'Ye' : selectedProfile}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">@{selectedProfile}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">· now</span>
                              </div>
                              
                              {/* Tweet Text */}
                              <p className="text-sm">{tweet}</p>
                            </div>
                            
                            {/* Copy Button - Centered vertically */}
                            <button 
                              onClick={() => copyToClipboard(tweet, index)}
                              className="self-center ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none cursor-pointer"
                              aria-label="Copy to clipboard"
                            >
                              {copiedTweets[index] ? (
                                <motion.svg 
                                  initial={{ scale: 0.8 }} 
                                  animate={{ scale: 1 }}
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="text-green-500"
                                >
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </motion.svg>
                              ) : (
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="18" 
                                  height="18" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* HypeAmplify Logo */}
      <motion.div 
        className="absolute bottom-6 left-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ delay: 0.5 }}
      >
        <Logo width={200} height={60} />
      </motion.div>
    </div>
  )
}
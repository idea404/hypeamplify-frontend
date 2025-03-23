'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingAnimationProps {
  messages?: string[]
  messageDelay?: number
  minDuration?: number
  onComplete?: () => void
  isComplete?: boolean
}

export function LoadingAnimation({ 
  messages,
  messageDelay = 1600,
  minDuration = 3000,
  onComplete,
  isComplete: externalComplete
}: LoadingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [shuffledMessages, setShuffledMessages] = useState<string[]>([])
  
  // Default messages to use if none provided
  const defaultMessages = [
    "Analyzing profile history...",
    "Evaluating audience demographics...",
    "Examining engagement metrics...",
    "Identifying trending topics...",
    "Studying content patterns...",
    "Optimizing for maximum impact...",
    "Crafting personalized suggestions...",
    "Over-engineering your tweet suggestions because why not?",
    "Distilling your personality into 280 characters...",
    "Because your tweets deserve to be this good...",
    "Laser-targeting your audience's fragile ego...",
    "Tweet suggestions so sharp, they'll cut through the noise...",
    "Inserting sublimated messages...",
    "Searching for Llamas...",
    "Normalizing Social Network...",
    "Making a Little Bit of Magic...",
    "Making a Mess...",
    "Running a vibe check on your timeline…",
    "Checking your profile for any signs of life...",
    "Fact-checking… just kidding.",
    "Scanning Twitter trends… regretting it instantly.",
    "Avoiding cancellation…",
    "Running the algorithm… please don't ask how it works.",
    "Adding unnecessary commas, for dramatic, effect.",
    "Simulating the perfect hot take…",
    "Preparing a thread nobody asked for…",
    "Drafting, deleting, drafting, deleting…",
    "Generating Intrigue...",
  ]
  
  // Use provided messages or fall back to default
  const displayMessages = messages || defaultMessages
  
  // Shuffle the messages array when component mounts
  useEffect(() => {
    // Fisher-Yates shuffle algorithm
    const shuffleArray = (array: string[]) => {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
    }
    
    setShuffledMessages(shuffleArray(displayMessages))
  }, [displayMessages])
  
  // Track animation start time to enforce minimum duration
  const [startTime] = useState(Date.now())
  
  const finishAnimation = useCallback(() => {
    const elapsedTime = Date.now() - startTime
    
    if (elapsedTime < minDuration) {
      // If we haven't reached minimum duration, wait until we do
      setTimeout(() => {
        setIsComplete(true)
        // Show completion message after the last message was shown
        setTimeout(() => {
          setShowComplete(true)
          if (onComplete) onComplete()
        }, 1000) // Show "Done!" after a delay
      }, minDuration - elapsedTime)
    } else {
      // We've exceeded minimum duration, proceed to completion
      setIsComplete(true)
      setTimeout(() => {
        setShowComplete(true)
        if (onComplete) onComplete()
      }, 1000) // Show "Done!" after a delay
    }
  }, [minDuration, startTime, onComplete])
  
  // Handle message cycling - update to use shuffled messages
  useEffect(() => {
    // If externally controlled completion state is provided and true
    if (externalComplete) {
      setIsComplete(true)
      setTimeout(() => setShowComplete(true), 500)
      return
    }
    
    // Check if we have shuffled messages and haven't reached the end
    if (shuffledMessages.length > 0 && currentIndex < shuffledMessages.length - 1 && !isComplete) {
      const timer = setTimeout(() => {
        setCurrentIndex(index => index + 1)
      }, messageDelay)
      return () => clearTimeout(timer)
    } else if (shuffledMessages.length > 0 && currentIndex >= shuffledMessages.length - 1 && !isComplete) {
      // We've shown all messages, initiate completion
      finishAnimation()
    }
  }, [
    currentIndex, 
    shuffledMessages.length, 
    messageDelay, 
    isComplete, 
    finishAnimation,
    externalComplete
  ])
  
  // Don't render until we have shuffled the messages
  if (shuffledMessages.length === 0) {
    return null
  }
  
  return (
    <div className="space-y-2" style={{ background: 'transparent' }}>
      <AnimatePresence mode="wait">
        {!showComplete ? (
          <motion.div 
            key="loading"
            exit={{ opacity: 0 }}
            className="space-y-2"
            style={{ background: 'transparent' }}
          >
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-t-2 border-primary rounded-full shadow-sm"
              />
              <p className="text-xl">AI is thinking...</p>
            </div>
            
            {/* Transparent container */}
            <div className="h-[200px] relative overflow-hidden" style={{ background: 'transparent' }}>
              <div className="space-y-1" style={{ background: 'transparent' }}>
                {/* Use shuffledMessages instead of displayMessages */}
                {shuffledMessages.slice(0, currentIndex + 1).reverse().map((message, index) => {
                  // Deterministic stepwise opacity:
                  // - First 4 messages (index 0-3): fully visible
                  // - Message 5 (index 4): 66% visible
                  // - Message 6 (index 5): 33% visible
                  // - Message 7+ (index 6+): invisible
                  let opacity;
                  
                  if (index <= 3) {
                    opacity = 1; // First 4 messages fully visible
                  } else if (index === 4) {
                    opacity = 0.66; // 5th message: 2/3 visible
                  } else if (index === 5) {
                    opacity = 0.33; // 6th message: 1/3 visible
                  } else {
                    opacity = 0; // 7th message and beyond: invisible
                  }
                  
                  return (
                    <motion.p
                      key={`msg-${currentIndex}-${index}`}
                      initial={{ opacity: 0.5, y: -20 }}
                      animate={{ 
                        opacity, 
                        y: 0 
                      }}
                      className="text-md text-muted-foreground"
                      style={{ background: 'transparent' }}
                    >
                      {message}
                    </motion.p>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-2"
            style={{ background: 'transparent' }}
          >
            <div className="flex items-center gap-2 text-green-600">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <p className="text-xl">Done!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 
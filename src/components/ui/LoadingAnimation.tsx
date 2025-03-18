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
  messageDelay = 1200,
  minDuration = 3000,
  onComplete,
  isComplete: externalComplete
}: LoadingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  
  // Default messages to use if none provided
  const defaultMessages = [
    "Analyzing profile history...",
    "Evaluating audience demographics...",
    "Examining engagement metrics...",
    "Identifying trending topics...",
    "Studying content patterns...",
    "Optimizing for maximum impact...",
    "Crafting personalized suggestions..."
  ]
  
  // Use provided messages or fall back to default
  const displayMessages = messages || defaultMessages
  
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
  
  // Handle message cycling
  useEffect(() => {
    // If externally controlled completion state is provided and true
    if (externalComplete) {
      setIsComplete(true)
      setTimeout(() => setShowComplete(true), 500)
      return
    }
    
    if (currentIndex < displayMessages.length - 1 && !isComplete) {
      const timer = setTimeout(() => {
        setCurrentIndex(index => index + 1)
      }, messageDelay)
      return () => clearTimeout(timer)
    } else if (currentIndex >= displayMessages.length - 1 && !isComplete) {
      // We've shown all messages, initiate completion
      finishAnimation()
    }
  }, [
    currentIndex, 
    displayMessages.length, 
    messageDelay, 
    isComplete, 
    finishAnimation,
    externalComplete
  ])
  
  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        {!showComplete ? (
          <motion.div 
            key="loading"
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-t-2 border-primary rounded-full shadow-sm"
              />
              <p className="text-xl">AI is thinking...</p>
            </div>
            <div className="space-y-1">
              {displayMessages.map((message, index) => (
                index <= currentIndex && (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-md text-muted-foreground"
                  >
                    {message}
                  </motion.p>
                )
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-2"
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
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface TwitterCardProps {
  tweet: string | { text: string; createdAt: string }
  username: string
  displayName?: string
  index?: number
  animationDelay?: number
}

export function TwitterCard({ 
  tweet, 
  username, 
  displayName,
  index = 0, 
  animationDelay = 0.2 
}: TwitterCardProps) {
  const [copied, setCopied] = useState(false)
  
  // Handle both string tweets and object tweets with timestamp
  const tweetText = typeof tweet === 'string' ? tweet : tweet.text
  const tweetDate = typeof tweet === 'object' && tweet.createdAt ? 
    new Date(tweet.createdAt) : null
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(tweetText).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    })
  }
  
  // Format the date for display
  const formatDate = (date: Date) => {
    // For recent dates (within a day), show relative time
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    if (diffHours < 24) {
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `${diffMinutes}m ago`
      }
      return `${Math.floor(diffHours)}h ago`
    }
    
    // For older dates, show the formatted date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * animationDelay }}
      className="p-4 bg-white dark:bg-black rounded-md relative group border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Profile Image */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
          {/* Try to load an image if available, otherwise show a placeholder */}
          <img 
            src={`/images/${username.toLowerCase()}.png`} 
            alt={username}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.classList.add('bg-muted')
            }}
          />
        </div>
        
        {/* Tweet Content */}
        <div className="flex-1">
          {/* Account Info */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm">
              {displayName || username}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">@{username}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">· {tweetDate ? formatDate(tweetDate) : 'now'}</span>
          </div>
          
          {/* Tweet Text */}
          <p className="text-sm">{tweetText}</p>
          
          {/* Generated timestamp if available */}
          {tweetDate && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Generated at: {tweetDate.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
        
        {/* Copy Button */}
        <button 
          onClick={copyToClipboard}
          className="self-center ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none cursor-pointer"
          aria-label="Copy to clipboard"
        >
          {copied ? (
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
  )
}

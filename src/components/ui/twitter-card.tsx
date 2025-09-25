'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Copy, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface TwitterCardProps {
  tweet: string | { text: string; createdAt: string | Date; hidden?: boolean }
  username: string
  displayName?: string
  index?: number
  animationDelay?: number
  onDelete?: (tweetText: string) => Promise<void>
  useLocalImagesFirst?: boolean
  profileImageUrl?: string
}

export function TwitterCard({ 
  tweet, 
  username, 
  displayName,
  index = 0, 
  animationDelay = 0.2,
  onDelete,
  useLocalImagesFirst = false,
  profileImageUrl
}: TwitterCardProps) {
  const [copied, setCopied] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Handle both string tweets and object tweets with timestamp
  const tweetText = typeof tweet === 'string' ? tweet : tweet.text
  const tweetDate = typeof tweet === 'object' && tweet.createdAt ? 
    (typeof tweet.createdAt === 'string' ? new Date(tweet.createdAt) : tweet.createdAt) : null
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(tweetText).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    })
  }
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }
  
  const confirmDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(tweetText)
      // The component will be removed from the parent after successful deletion
    } catch (error) {
      console.error('Error deleting suggestion:', error)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }
  
  // Format the date for display
  const formatDate = (date: Date) => {
    // Convert the UTC date from server to local time
    // The server sends UTC time, but Date constructor creates it correctly
    // We just need to compare it properly with current local time
    const now = new Date()
    
    // Calculate the difference in milliseconds
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = diffMs / (1000 * 60 * 60)
    
    // Debug: log the actual times to understand what's happening
    console.log('Time comparison:', {
      serverDate: date.toISOString(),
      serverLocalTime: date.toLocaleString(),
      nowUTC: now.toISOString(), 
      nowLocal: now.toLocaleString(),
      diffMinutes,
      diffHours
    })
    
    // For very recent tweets (less than 5 minutes), show "now"
    if (diffMinutes < 5) {
      return 'now'
    }
    
    // For recent dates (within a day), show relative time
    if (diffHours < 24) {
      if (diffHours < 1) {
        return `${diffMinutes}m ago`
      }
      return `${Math.floor(diffHours)}h ago`
    }
    
    // For older dates, show the formatted date in local time
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Add a function to get the image source, similar to ProfileButton
  const getImageSrc = () => {
    if (useLocalImagesFirst) {
      return `/images/${username.toLowerCase()}.png`;
    }
    
    return profileImageUrl || `/images/${username.toLowerCase()}.png`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * animationDelay }}
        className="p-3 bg-white dark:bg-black rounded-md relative group border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm"
      >
        <div className="flex items-start gap-2 max-w-full">
          {/* Profile Image */}
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
            <img 
              src={getImageSrc()} 
              alt={username}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Show X logo as fallback
                e.currentTarget.src = "/images/x-logo.png";
                e.currentTarget.className = "w-full h-full object-cover p-1";
              }}
            />
          </div>
          
          {/* Tweet Content */}
          <div className="flex-1 min-w-0 pr-6">
            {/* Account Info */}
            <div className="flex flex-wrap items-center gap-1 mb-1">
              <span className="font-bold text-xs truncate max-w-[90px]">
                {displayName || username}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[80px]">@{username}</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">· {tweetDate ? formatDate(tweetDate) : 'now'}</span>
            </div>
            
            {/* Tweet Text */}
            <p className="text-sm break-words whitespace-pre-line">{tweetText}</p>
            
            {/* Generated timestamp if available */}
            {tweetDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Generated: {tweetDate.toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
          
          {/* Copy Button - Absolute positioned */}
          <button 
            onClick={copyToClipboard}
            className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all focus:outline-none cursor-pointer transform hover:scale-130"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                <CheckCircle size={14} className="text-green-500" />
              </motion.div>
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>

        {/* Delete Button - Always visible at top right, absolute positioned */}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all focus:outline-none cursor-pointer z-10"
            aria-label="Delete suggestion"
          >
            <Trash2 size={14} className="transform transition-transform duration-200 hover:scale-130" />
          </button>
        )}
      </motion.div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hide this suggestion?</DialogTitle>
          </DialogHeader>
          
          <DialogDescription>
            This suggestion will be hidden from your list. This action cannot be undone.
          </DialogDescription>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="dark:bg-red-800 dark:hover:bg-red-700 text-white cursor-pointer"
            >
              {isDeleting ? 'Hiding...' : 'Hide'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

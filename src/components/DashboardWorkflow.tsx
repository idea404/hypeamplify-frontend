'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from './ui/Input'
import ProfileButton from './ui/ProfileButton'
import { LoadingAnimation } from './ui/LoadingAnimation'
import { TwitterCard } from './ui/TwitterCard'
import { api } from '@/lib/api/client'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { CreditCard, AlertCircle } from 'lucide-react'

interface DashboardWorkflowProps {
  // Props that might be needed from parent
  initialProfiles?: string[]
  onProfileAdded?: (profile: string) => void
  onProfileSelected?: (profile: string) => void
  onSuggestionGenerated?: (suggestions: string[]) => void
  onProfileDeleted?: (profile: string) => void
}

export function DashboardWorkflow({
  initialProfiles = [],
  onProfileAdded,
  onProfileSelected,
  onSuggestionGenerated,
  onProfileDeleted,
}: DashboardWorkflowProps) {
  // Local state for the workflow
  const [profiles, setProfiles] = useState<string[]>(initialProfiles)
  const [currentStep, setCurrentStep] = useState(initialProfiles.length > 0 ? 3 : 1)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{
    text: string;
    hidden?: boolean;
    createdAt: Date;
  }>>([])
  const [profileUrl, setProfileUrl] = useState('')
  const [animationComplete, setAnimationComplete] = useState(false)
  const [isLoadingHistoricalTweets, setIsLoadingHistoricalTweets] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  
  // Add this effect to get the user's current credits
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const creditsData = await api.payments.getCredits()
        setUserCredits(creditsData.credits || 0)
      } catch (error) {
        console.error('Error fetching credits:', error)
        setUserCredits(0)
      }
    }
    
    fetchCredits()
  }, [])
  
  // Profile management functions
  const handleAddProfile = () => {
    if (profileUrl && !profileUrl.includes(' ')) {
      const username = profileUrl.replace('@', '').trim()
      setProfiles(prev => [...prev, username])
      setProfileUrl('')
      setCurrentStep(3) // Move to profile selection
      
      // Notify parent component if callback provided
      if (onProfileAdded) {
        onProfileAdded(username)
      }
    }
  }
  
  const handleSelectProfile = (profile: string) => {
    setSelectedProfile(profile)
    setCurrentStep(4) // Move to generate suggestions
    
    // Notify parent component if callback provided
    if (onProfileSelected) {
      onProfileSelected(profile)
    }
  }
  
  const handleGenerateSuggestions = async () => {
    if (!selectedProfile) return
    
    // Check for credits first - if we have 0 credits, show modal without trying API call
    if (userCredits !== null && userCredits <= 0) {
      setShowCreditModal(true)
      return
    }
    
    setIsGenerating(true)
    setAnimationComplete(false) // Reset animation state
    setCurrentStep(5) // Show generating state
    
    try {
      // Use real API call instead of setTimeout
      const result = await api.tweets.suggest(selectedProfile)
      
      // Prepend new suggestions to existing ones
      const newSuggestions = result.suggestions || []
      setSuggestions(prevSuggestions => [...newSuggestions, ...prevSuggestions])
      
      // Update credits after successful generation (they will have been decremented)
      try {
        const creditsData = await api.payments.getCredits()
        setUserCredits(creditsData.credits || 0)
      } catch (error) {
        console.error('Error updating credits:', error)
      }
      
      // Notify parent component if callback provided
      if (onSuggestionGenerated) {
        onSuggestionGenerated(newSuggestions)
      }
    } catch (error: any) {
      console.error('Error generating suggestions:', error)
      
      // Check if this is a payment required error (402)
      if (error.response && error.response.status === 402) {
        // Show the credit purchase modal
        setShowCreditModal(true)
        // Update our local credit state to reflect server state
        setUserCredits(0)
      }
      
      setIsGenerating(false)
      // Return to step 4 if there was an error
      setCurrentStep(4)
    }
  }
  
  // Function to handle redirecting to buy credits
  const handleBuyCredits = async () => {
    // Get available packages
    try {
      const packages = await api.payments.getPackages()
      // You could either redirect to a dedicated page or
      // implement the checkout flow directly here
      
      // For this example, we'll just close the modal
      setShowCreditModal(false)
      
      // Redirect to a payment page (you might want to implement this)
      // window.location.href = '/payments'
      
      // Alternative: You could trigger the checkout process for a specific package
      // if (packages.length > 0) {
      //   const result = await api.payments.checkout(packages[0].id)
      //   window.location.href = result.checkout_url
      // }
    } catch (error) {
      console.error('Error fetching payment packages:', error)
    }
  }
  
  // Handle completion of the loading animation
  const handleAnimationComplete = () => {
    setAnimationComplete(true)
    setTimeout(() => {
      setIsGenerating(false)
      setCurrentStep(6) // Move to results after animation completes
    }, 800) // Slight delay to let user see the completion state
  }
  
  const handleDeleteProfile = async (profile: string) => {
    try {
      // Call the API to delete the profile
      await api.tweets.profiles.deleteProfile(profile);
      
      // Update local state
      setProfiles(prev => prev.filter(p => p !== profile));
      
      // Notify parent component if callback provided
      if (onProfileDeleted) {
        onProfileDeleted(profile);
      }
      
      // If the deleted profile was selected, reset selected profile
      if (selectedProfile === profile) {
        setSelectedProfile(null);
        setCurrentStep(3); // Go back to profile selection
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };
  
  // Separate useEffect for fetching historical suggestions - this runs regardless of credit status
  useEffect(() => {
    const fetchHistoricalTweets = async () => {
      if (selectedProfile && currentStep === 4) {
        setIsLoadingHistoricalTweets(true)
        try {
          const data = await api.tweets.getSuggestions(selectedProfile)
          if (data.suggestions && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Error fetching historical tweets:', error)
        } finally {
          setIsLoadingHistoricalTweets(false)
        }
      }
    }
    
    fetchHistoricalTweets()
  }, [selectedProfile, currentStep])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Insufficient Credits Modal */}
      <Dialog open={showCreditModal} onOpenChange={setShowCreditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Insufficient Credits
            </DialogTitle>
            <DialogDescription>
              You don't have enough credits to generate suggestions for this profile. 
              Purchase more credits to continue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="rounded-lg border p-4 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Generating high-quality content requires credits. Add more credits to your account to continue generating amazing suggestions.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-medium">Buy Credits</span>
              </div>
              <span className="text-sm text-gray-500">Starting from $5</span>
            </div>
          </div>
          
          <DialogFooter>
            <div className="w-full flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCreditModal(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                className="cursor-pointer flex-1"
                onClick={handleBuyCredits}
              >
                Purchase Credits
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence mode="wait">
        {/* Step 1: Add X Profile (Initial) */}
        {currentStep === 1 && (
          <div className="min-h-[300px] flex flex-col justify-start">
            <motion.div
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <motion.h1 layoutId="addProfileHeader" className="text-4xl font-bold tracking-tighter mb-2">
                Add an X profile
              </motion.h1>
              <div className="space-y-1 text-left">
                <motion.p className="text-lg text-gray-500 dark:text-gray-400 mb-6" exit={{ opacity: 0 }}>
                  Add an X profile to get started generating suggestions.
                </motion.p>
                <motion.div exit={{ opacity: 0 }}>
                  <Button onClick={() => setCurrentStep(2)} className="cursor-pointer">
                    Add Profile
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Step 2: Add X Profile (Form) */}
        {currentStep === 2 && (
          <div className="min-h-[300px] flex flex-col justify-start">
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <motion.h1 layoutId="addProfileHeader" className="text-4xl font-bold tracking-tighter mb-2">
                Add an X Profile
              </motion.h1>
              <div className="space-y-2 text-left mb-5">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg text-gray-500 dark:text-gray-400"
                >
                  Type the username (example: @User) and press the 'Add' button
                </motion.p>
              </div>
              <div className="flex gap-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-center w-full"
                >
                  <Input
                    id="profileUsername"
                    name="profileUsername"
                    type="text"
                    placeholder="@username"
                    required
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    className="w-1/5 min-w-[200px]"
                  />
                  <Button onClick={handleAddProfile} className="cursor-pointer w-1/9">
                    Add
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Step 3: Select Profile */}
        {currentStep === 3 && (
          <div className="min-h-[300px] flex flex-col justify-start">
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <h1 className="text-4xl font-bold tracking-tighter mb-2">
                Select an X Profile
              </h1>
              <div className="space-y-2 text-start mb-5">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  Choose a profile to generate suggestions
                </p>
              </div>
              <div className="space-y-2 min-w-[280px] w-1/3 max-w-[400px] mb-4">
                {profiles.length > 0 ? (
                  profiles.map((profile, index) => (
                    <ProfileButton
                      key={index}
                      name={profile}
                      onClick={() => handleSelectProfile(profile)}
                      onDelete={() => handleDeleteProfile(profile)}
                    />
                  ))
                ) : (
                  <div className="text-left py-6 text-gray-500">
                    No profiles added yet
                  </div>
                )}
              </div>
              <div className="flex justify-left">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="cursor-pointer">
                  Add Another Profile
                </Button>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Step 4: Generate Suggestions */}
        {currentStep === 4 && (
          <div key="step4" className="w-full">
            {/* Flex container with proper 50/50 split */}
            <div className="flex w-full">
              {/* Left Side: 50% width */}
              <div className="w-1/2 pr-8 flex flex-col">
                <div className="space-y-2 text-start mb-5 flex flex-col justify-start">
                  <motion.h1 
                    className="text-4xl font-bold tracking-tighter leading-tight h-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Generate Suggestions
                  </motion.h1>
                  <p className="text-lg text-gray-500 dark:text-gray-400">
                    Generate suggestions for @{selectedProfile}
                  </p>
                </div>
                <motion.div
                  className="flex justify-left gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-1/2">
                    <ProfileButton name={selectedProfile || ''} onClick={() => setCurrentStep(3)} />
                  </div>
                  <Button 
                    onClick={handleGenerateSuggestions} 
                    className="cursor-pointer h-12"
                    disabled={isLoadingHistoricalTweets}
                  >
                    {isLoadingHistoricalTweets ? 'Loading...' : 'Generate'}
                  </Button>
                </motion.div>
              </div>
              
              {/* Right Side: Tweets column - 50% width */}
              <div className="w-1/2 pl-8 flex flex-col justify-start overflow-y-auto min-h-[300px]">
                <motion.div 
                  className="space-y-3 w-full" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                >
                  {isLoadingHistoricalTweets ? (
                    <div className="flex justify-center items-center h-[200px]">
                      <p className="text-gray-500">Loading historical suggestions...</p>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <TwitterCard
                        key={index}
                        tweet={suggestion.text}
                        username={selectedProfile || ''}
                        index={index}
                        animationDelay={0.1}
                      />
                    ))
                  ) : (
                    <div className="flex justify-center items-center h-[200px]">
                      {/* <p className="text-gray-500">No historical suggestions found. Generate new ones!</p> */}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 5: Generating */}
        {currentStep === 5 && (
          <div key="step5" className="w-full">
            {/* Split-screen layout with fixed heights */}
            <div className="flex w-full">
              {/* Left Half - Header and buttons - with fixed height */}
              <div className="w-1/2 pr-8 h-[300px] flex flex-col">
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Header section */}
                  <div className="space-y-2 text-start mb-5 min-h-[80px] flex flex-col justify-start">
                    <motion.h1 
                      layoutId="header" 
                      className="text-4xl font-bold tracking-tighter leading-tight h-12"
                    >
                      Generating...
                    </motion.h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        Analyzing profile @{selectedProfile}
                    </p>
                  </div>
                  {/* Buttons section */}
                  <div className="flex justify-left gap-4">
                    <div className="w-1/2">
                      <ProfileButton 
                        name={selectedProfile || ''} 
                        onClick={() => {}} // Non-functional during generation
                      />
                    </div>
                    <Button 
                      disabled 
                      className="opacity-50 h-12"
                    >
                      Generate
                    </Button>
                  </div>
                </motion.div>
              </div>
              
              {/* Right Half - AI thinking animation - align top with left header */}
              <div className="w-1/2 pl-8 flex flex-col">
                <div className="pt-[0.75rem]">
                  <LoadingAnimation 
                    onComplete={handleAnimationComplete}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 6: Generated Suggestions */}
        {currentStep === 6 && (
          <div key="step6" className="w-full">
            {/* Flex container with proper 50/50 split */}
            <div className="flex w-full">
              {/* Left Side: 50% width */}
              <div className="w-1/2 pr-8 flex flex-col">
                <div className="space-y-2 text-start mb-5 flex flex-col justify-start">
                  <motion.h1 
                    className="text-4xl font-bold tracking-tighter leading-tight h-12"
                  >
                    Generated Suggestions
                  </motion.h1>
                  <p className="text-lg text-gray-500 dark:text-gray-400">
                    Suggestions for profile @{selectedProfile}
                  </p>
                </div>
                <div className="flex justify-left gap-4">
                  <div className="w-1/2">
                    <ProfileButton name={selectedProfile || ''} onClick={() => setCurrentStep(3)} />
                  </div>
                  <Button onClick={handleGenerateSuggestions} className="cursor-pointer h-12">
                    Generate Again
                  </Button>
                </div>
              </div>
              
              {/* Right Side: Tweets column - 50% width */}
              <div className="w-1/2 pl-8 flex flex-col justify-start overflow-y-auto min-h-[300px]">
                <motion.div className="space-y-3 w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {suggestions.map((suggestion, index) => (
                    <TwitterCard
                      key={index}
                      tweet={suggestion.text}
                      username={selectedProfile || ''}
                      index={index}
                      animationDelay={0.1}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
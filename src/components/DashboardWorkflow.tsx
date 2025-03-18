'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from './ui/Input'
import ProfileButton from './ui/ProfileButton'
import { LoadingAnimation } from './ui/LoadingAnimation'
import { TwitterCard } from './ui/TwitterCard'

interface DashboardWorkflowProps {
  // Props that might be needed from parent
  initialProfiles?: string[]
  onProfileAdded?: (profile: string) => void
  onProfileSelected?: (profile: string) => void
  onSuggestionGenerated?: (suggestions: string[]) => void
}

export function DashboardWorkflow({
  initialProfiles = [],
  onProfileAdded,
  onProfileSelected,
  onSuggestionGenerated,
}: DashboardWorkflowProps) {
  // Local state for the workflow
  const [profiles, setProfiles] = useState<string[]>(initialProfiles)
  const [currentStep, setCurrentStep] = useState(initialProfiles.length > 0 ? 3 : 1)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [profileUrl, setProfileUrl] = useState('')
  const [animationComplete, setAnimationComplete] = useState(false)
  
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
    
    setIsGenerating(true)
    setAnimationComplete(false) // Reset animation state
    setCurrentStep(5) // Show generating state
    
    try {
      // Simulate API call for generating suggestions
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Sample suggestions - in production this would come from your API
      const generatedSuggestions = [
        "Just tried the new AI-powered feature from @HypeAmplify - my tweet engagement is up 43%! #AITwitter #ContentCreation",
        "Breaking: Our latest product launch exceeded all expectations with 2x the projected sales! The team delivered something truly exceptional.",
        "The secret to consistent growth? Test, learn, iterate. Rinse and repeat. #GrowthStrategy #BusinessTips"
      ]
      
      setSuggestions(generatedSuggestions)
      
      // We'll move to step 6 after animation completes via onComplete callback
      
      // Notify parent component if callback provided
      if (onSuggestionGenerated) {
        onSuggestionGenerated(generatedSuggestions)
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
      setIsGenerating(false)
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
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >

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
                Add an X Profile
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
                    className="w-1/5"
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
              <div className="space-y-2 w-1/3 mb-4">
                {profiles.length > 0 ? (
                  profiles.map((profile, index) => (
                    <ProfileButton
                      key={index}
                      name={profile}
                      onClick={() => handleSelectProfile(profile)}
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
          <div className="min-h-[300px] flex flex-col justify-start w-1/2">
            <motion.div
              className="space-y-2 text-start mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-4xl font-bold tracking-tighter">Generate Suggestions</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Generate suggestions for @{selectedProfile}
              </p>
            </motion.div>
            <motion.div
              className="flex justify-left gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-1/2">
                <ProfileButton name={selectedProfile || ''} onClick={() => setCurrentStep(3)} />
              </div>
              <Button onClick={handleGenerateSuggestions} className="cursor-pointer h-10">
                Generate
              </Button>
            </motion.div>
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
                      className="opacity-50 h-10"
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
                  <Button onClick={handleGenerateSuggestions} className="cursor-pointer h-10">
                    Generate Again
                  </Button>
                </div>
              </div>
              
              {/* Right Side: Tweets column - 50% width */}
              <div className="w-1/2 pl-8 flex flex-col justify-start overflow-y-auto max-h-[400px]">
                <motion.div className="space-y-3 w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {suggestions.map((suggestion, index) => (
                    <TwitterCard
                      key={index}
                      tweet={suggestion}
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
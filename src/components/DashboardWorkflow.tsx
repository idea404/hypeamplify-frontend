'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from './ui/Input'
import ProfileButton from './ui/ProfileButton'
import { LoadingAnimation } from './ui/LoadingAnimation'

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
            {/* Flex container with explicit widths to prevent collapsing */}
            <div className="flex w-full">
              {/* Left Side: Fixed width, fixed height */}
              <div className="w-[300px] flex-shrink-0 pr-8 h-[300px] flex flex-col">
                <div className="space-y-2 text-start mb-5 h-[80px] flex flex-col justify-start">
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
              
              {/* Right Side: Tweets column - takes the remaining width */}
              <div className="flex-1 pl-8 flex flex-col justify-start overflow-y-auto max-h-[400px]">
                <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white dark:bg-black shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        {/* Profile Image */}
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800 bg-muted">
                          {/* Profile image placeholder */}
                        </div>
                        {/* Tweet Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm">{selectedProfile}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">@{selectedProfile}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">· now</span>
                          </div>
                          <p className="text-sm">{suggestion}</p>
                        </div>
                        {/* Copy Button */}
                        <button 
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                          onClick={() => navigator.clipboard.writeText(suggestion)}
                          title="Copy to clipboard"
                        >
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
                        </button>
                      </div>
                    </motion.div>
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
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProfileButton from '@/components/ui/profile-button'
import { LoadingAnimation } from '@/components/ui/loading-animation'
import { TwitterCard } from '@/components/ui/twitter-card'
import { api } from '@/lib/api/client'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreditCard, AlertCircle, Link } from 'lucide-react'

// Define suggestion type
interface Suggestion {
  text: string;
  hidden?: boolean;
  createdAt: Date | string; // Allow string initially if that's what the API returns
}

interface DashboardWorkflowProps {
  // Props that might be needed from parent
  initialProfiles?: string[]
  initialProfilesData?: {[key: string]: ProfileData}
  userCredits?: number
  onProfileAdded?: (profile: string) => void
  onProfileSelected?: (profile: string) => void
  onSuggestionGenerated?: (suggestions: string[]) => void
  onProfileDeleted?: (profile: string) => void
}

// Define a new interface for profile data
interface ProfileData {
  userName: string;
  profilePicture?: string;
  name?: string;
  description?: string;
  isVerified?: boolean;
}

export function DashboardWorkflow({
  initialProfiles = [],
  initialProfilesData = {},
  userCredits = 0,
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [profileUrl, setProfileUrl] = useState('')
  const [animationComplete, setAnimationComplete] = useState(false)
  const [isLoadingHistoricalTweets, setIsLoadingHistoricalTweets] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [profileData, setProfileData] = useState<{[username: string]: ProfileData}>(initialProfilesData)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const tweetsContainerRef = useRef<HTMLDivElement>(null)
  const [isComplete, setIsComplete] = useState(false)

  // Update profile management functions
  const handleAddProfile = async () => {
    if (profileUrl && !profileUrl.includes(' ')) {
      setValidationError(null);
      setIsValidating(true);
      
      const username = profileUrl.replace('@', '').trim();
      
      try {
        // Validate profile with the backend
        const validationResult = await api.tweets.validateUsername(username);
        
        if (!validationResult.exists) {
          setValidationError(`Profile @${username} does not exist on X or is not accessible.`);
          setIsValidating(false);
          return;
        }
        
        // Add profile first
        try {
          const addProfileResult = await api.tweets.profiles.addProfile(username);
          
          // Use the userName from the validation result for correct casing
          const correctUsername = validationResult.profile?.userName || username;
          
          // Update profiles with correct casing
          setProfiles(prev => [...prev, correctUsername]);
          
          // Save profile data with correct casing as the key
          if (validationResult.profile) {
            setProfileData(prev => ({
              ...prev,
              [correctUsername]: validationResult.profile
            }));
          }
          
          setProfileUrl('');
          setCurrentStep(3); // Move to profile selection
          
          // Notify parent component if callback provided
          if (onProfileAdded) {
            onProfileAdded(correctUsername);
          }
        } catch (addError) {
          console.error('Error adding profile:', addError);
          setValidationError('Error adding profile. Please try again.');
        }
      } catch (error) {
        console.error('Error validating profile:', error);
        setValidationError('Error validating profile. Please try again.');
      } finally {
        setIsValidating(false);
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
    setIsComplete(false) // Reset completion state
    setCurrentStep(5) // Show generating state
    
    try {
      // Start the API call
      const result = await api.tweets.suggest(selectedProfile)
      
      // Prepare the new suggestions
      const newSuggestions = result.suggestions || []
      
      // Create a small artificial delay to ensure UI shows a satisfying loading animation
      // This gives the backend a moment to finish any remaining processing
      setTimeout(() => {
        // Update suggestions state
        setSuggestions(prevSuggestions => [...newSuggestions, ...prevSuggestions])
        
        // Call parent's callback for credits update
        if (onSuggestionGenerated) {
          onSuggestionGenerated(newSuggestions)
        }
        
        // Signal completion to the animation
        setIsComplete(true)
      }, 1500) // Delay by 1.5 seconds
      
    } catch (error: any) {
      console.error('Error generating suggestions:', error)
      
      // Check if this is a payment required error (402)
      if (error.response && error.response.status === 402) {
        // Show the credit purchase modal
        setShowCreditModal(true)
      }
      
      setIsGenerating(false)
      // Return to step 4 if there was an error
      setCurrentStep(4)
    }
  }
  
  // Function to handle redirecting to buy credits
  const handleBuyCredits = () => {
    // Close the modal
    setShowCreditModal(false)
    
    // Redirect to the payments page
    window.location.href = '/payments'
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
  
  // Separate useEffect for fetching historical suggestions
  useEffect(() => {
    const fetchHistoricalTweets = async () => {
      if (selectedProfile && currentStep === 4) {
        setIsLoadingHistoricalTweets(true)
        try {
          const data = await api.tweets.getSuggestions(selectedProfile);
          if (data.suggestions && data.suggestions.length > 0) {
            // Sort suggestions by createdAt date, newest first
            const sortedSuggestions = data.suggestions.sort((a: Suggestion, b: Suggestion) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setSuggestions(sortedSuggestions);
          } else {
            setSuggestions([]);
          }
        } catch (error: any) {
          console.error('Error fetching historical tweets:', error)
          // If it's a 401 error, don't show an error message as the redirect will happen
          // If it's any other error, we can show an appropriate message
          if (error.response && error.response.status !== 401) {
            // Show non-auth error message
            // setErrorMessage("Failed to load suggestions. Please try again.");
          }
        } finally {
          setIsLoadingHistoricalTweets(false)
        }
      }
    }
    
    fetchHistoricalTweets()
  }, [selectedProfile, currentStep])
  
  // Add an API function to hide a suggestion
  const handleHideSuggestion = async (suggestionText: string) => {
    if (!selectedProfile) return;
    
    try {
      // Call the API to hide the suggestion
      await api.tweets.hideSuggestion(selectedProfile, suggestionText);
      
      // Update local state - filter out the hidden suggestion
      setSuggestions(prev => prev.filter(suggestion => {
        const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
        return text !== suggestionText;
      }));
    } catch (error) {
      console.error('Error hiding suggestion:', error);
    }
  };
  
  // Fetch profile data when profiles are loaded - with added error handling
  useEffect(() => {
    const fetchProfileData = async () => {
      // Don't attempt to fetch if there are no profiles
      if (profiles.length === 0) return;
      
      const newProfileData = { ...profileData };
      let anyProfilesFetched = false;
      
      for (const profile of profiles) {
        // Only fetch if we don't already have the data
        if (!profileData[profile]) {
          try {
            const result = await api.tweets.validateUsername(profile);
            if (result.exists && result.profile) {
              newProfileData[profile] = result.profile;
              anyProfilesFetched = true;
            }
          } catch (error) {
            console.error(`Error fetching profile data for ${profile}:`, error);
          }
        }
      }
      
      // Only update state if we actually got new data
      if (anyProfilesFetched) {
        setProfileData(newProfileData);
      }
    };
    
    fetchProfileData();
  }, [profiles]);
  
  // Inside DashboardWorkflow component
  useEffect(() => {
    // Only update if there are profiles
    if (initialProfiles && initialProfiles.length > 0) {
      setProfiles(initialProfiles);
      // Set the correct initial step if profiles exist
      setCurrentStep(3); // This step should be your "select profile" step
    }
  }, [initialProfiles]);

  // Also check initialProfilesData is handled
  useEffect(() => {
    if (initialProfilesData && Object.keys(initialProfilesData).length > 0) {
      setProfileData(initialProfilesData);
    }
  }, [initialProfilesData]);
  
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
                <Link href="/payments">
                  <span className="font-medium">Buy Credits</span>
                </Link>
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
                  <Button 
                    onClick={handleAddProfile} 
                    className="cursor-pointer w-1/9"
                    disabled={isValidating}
                  >
                    {isValidating ? 'Validating...' : 'Add'}
                  </Button>
                </motion.div>
              </div>
              {validationError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm"
                >
                  {validationError}
                </motion.p>
              )}
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
              <div className="space-y-2 min-w-[280px] w-1/3 max-w-[320] mb-4">
                {profiles.length > 0 ? (
                  profiles.map((profile, index) => (
                    <ProfileButton
                      key={index}
                      name={profile}
                      profileImageUrl={profileData[profile]?.profilePicture}
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
            <div className="flex flex-col lg:flex-row w-full">
              {/* Left Side: 50% width */}
              <div className="w-full lg:w-1/2 lg:pr-8 flex flex-col min-w-0">
                <div className="space-y-2 text-start mb-5 flex flex-col justify-start">
                  <motion.h1 
                    className="text-3xl lg:text-4xl font-bold tracking-tighter leading-tight h-12"
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
                  className="flex flex-col sm:flex-row justify-left gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-full sm:w-1/2">
                    <ProfileButton 
                      name={selectedProfile || ''} 
                      profileImageUrl={profileData[selectedProfile || '']?.profilePicture}
                      onClick={() => setCurrentStep(3)} 
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateSuggestions} 
                    className="cursor-pointer h-12 w-full sm:w-auto"
                    disabled={isLoadingHistoricalTweets}
                  >
                    {isLoadingHistoricalTweets ? 'Loading...' : 'Generate'}
                  </Button>
                </motion.div>
              </div>
              
              {/* Right Side: Tweets column - 50% width */}
              <div className="w-full lg:w-1/2 lg:pl-8 relative mt-8 lg:mt-0">
                {/* Fixed height container with overflow */}
                <div 
                  className="h-[calc(100vh-320px)] overflow-hidden relative"
                >
                  <motion.div 
                    ref={tweetsContainerRef}
                    className="space-y-3 w-full h-full pr-4 pt-0 overflow-y-scroll scrollbar-hide"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    onScroll={(e) => {
                      const target = e.target as HTMLDivElement;
                      setScrolled(target.scrollTop > 0);
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: index * 0.1,
                          duration: 0.5 
                        }}
                      >
                        <TwitterCard
                          tweet={suggestion}
                          username={selectedProfile || ''}
                          index={index}
                          onDelete={handleHideSuggestion}
                          profileImageUrl={profileData[selectedProfile || '']?.profilePicture}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Scroll indicator - appears when there are 4+ tweets */}
            {suggestions.length >= 4 && (
              <motion.div 
                className="absolute bottom-4 right-4 flex justify-center items-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: scrolled ? 0 : 0.7 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    y: [0, 8, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2, 
                    ease: "easeInOut" 
                  }}
                  className="flex flex-col items-center"
                >
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Scroll for more</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-gray-500 dark:text-gray-400"
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
        
        {/* Step 5: Generating */}
        {currentStep === 5 && (
          <div key="step5" className="w-full">
            {/* Split-screen layout with fixed heights */}
            <div className="flex flex-col lg:flex-row w-full">
              {/* Left Half - Header and buttons - with fixed height */}
              <div className="w-full lg:w-1/2 lg:pr-8 h-[300px] flex flex-col">
                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Header section */}
                  <div className="space-y-2 text-start mb-5 min-h-[80px] flex flex-col justify-start">
                    <motion.h1 
                      layoutId="header" 
                      className="text-3xl lg:text-4xl font-bold tracking-tighter leading-tight h-12"
                    >
                      Generating...
                    </motion.h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        Analyzing profile @{selectedProfile}
                    </p>
                  </div>
                  {/* Buttons section */}
                  <div className="flex flex-col sm:flex-row justify-left gap-4">
                    <div className="w-full sm:w-1/2">
                      <ProfileButton 
                        name={selectedProfile || ''} 
                        profileImageUrl={profileData[selectedProfile || '']?.profilePicture}
                        onClick={() => {}} // Non-functional during generation
                      />
                    </div>
                    <Button 
                      disabled 
                      className="opacity-50 h-12 w-full sm:w-auto"
                    >
                      Generate
                    </Button>
                  </div>
                </motion.div>
              </div>
              
              {/* Right Half - AI thinking animation - align top with left header */}
              <div className="w-full lg:w-1/2 lg:pl-8 flex flex-col mt-8 lg:mt-0">
                <div className="pt-[0.75rem]">
                  <LoadingAnimation 
                    onComplete={handleAnimationComplete}
                    isComplete={isComplete}
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
                    <ProfileButton 
                      name={selectedProfile || ''} 
                      profileImageUrl={profileData[selectedProfile || '']?.profilePicture}
                      onClick={() => setCurrentStep(3)} 
                    />
                  </div>
                  <Button onClick={handleGenerateSuggestions} className="cursor-pointer h-12">
                    Generate Again
                  </Button>
                </div>
              </div>
              
              {/* Right Side: Tweets column - 50% width */}
              <div className="w-1/2 pl-8 relative">
                {/* Fixed height container with overflow */}
                <div 
                  className="h-[calc(100vh-320px)] overflow-hidden relative"
                >
                  <motion.div 
                    ref={tweetsContainerRef}
                    className="space-y-3 w-full h-full pr-4 pt-0 overflow-y-scroll scrollbar-hide"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    onScroll={(e) => {
                      const target = e.target as HTMLDivElement;
                      setScrolled(target.scrollTop > 0);
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: index * 0.1,
                          duration: 0.5 
                        }}
                      >
                        <TwitterCard
                          tweet={suggestion}
                          username={selectedProfile || ''}
                          index={index}
                          onDelete={handleHideSuggestion}
                          profileImageUrl={profileData[selectedProfile || '']?.profilePicture}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Scroll indicator - appears when there are 4+ tweets */}
            {suggestions.length >= 4 && (
              <motion.div 
                className="absolute bottom-4 right-4 flex justify-center items-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: scrolled ? 0 : 0.7 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    y: [0, 8, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2, 
                    ease: "easeInOut" 
                  }}
                  className="flex flex-col items-center"
                >
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Scroll for more</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-gray-500 dark:text-gray-400"
                  >
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
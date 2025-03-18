'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api/client'
import { Logo } from '@/components/ui/Logo'
import { DashboardWorkflow } from '@/components/DashboardWorkflow'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)
  const [userProfiles, setUserProfiles] = useState<string[]>([])
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const userData = await api.auth.me()
        setUser(userData)
        
        // Get user credits
        const creditsData = await api.payments.getCredits()
        setCredits(creditsData.credits || 0)
        
        // Fetch the user's profiles using the profiles API
        const profilesData = await api.tweets.profiles.getProfiles()
        console.log(profilesData)
        setUserProfiles(profilesData.profiles || [])
      } catch (err) {
        console.error('Error fetching user data:', err)
        // If unauthorized, redirect to login
        localStorage.removeItem('accessToken')
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [router])
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    router.push('/')
  }
  
  // Callback handlers
  const handleProfileAdded = async (profile: string) => {
    try {
      // Save the profile to the backend
      await api.tweets.profiles.addProfile(profile)
      
      // Refresh profiles after adding
      const profilesData = await api.tweets.profiles.getProfiles()
      console.log(profilesData)
      setUserProfiles(profilesData.profiles || [])
    } catch (err) {
      console.error('Error adding profile:', err)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Username next to theme toggle */}
      <motion.div 
        className="absolute top-5 left-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-sm px-4 py-1 bg-background rounded-full border border-input text-primary">
          {user?.email || 'username not found'}
        </div>
      </motion.div>

      {/* Header/Navigation */}
      <motion.div 
        className="absolute top-4 right-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-4">
          <div className="text-sm px-4 py-1 bg-background rounded-full border border-input text-primary">
            {credits} credits available
          </div>
          <Button variant="default">
            Buy Credits
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </motion.div>
      
      {/* Main Dashboard Content */}
      <main className="flex-1 flex items-center justify-start p-8 pl-48">
        {/* Use the new ProfileWorkflow component */}
        <DashboardWorkflow 
          initialProfiles={userProfiles}
          onProfileAdded={handleProfileAdded}
        />
      </main>

      {/* HypeAmplify Logo */}
      <motion.div 
        className="absolute bottom-6 left-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/">
          <Logo width={200} height={60} />
        </Link>
      </motion.div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/lib/auth/AuthContext'
import { api } from '@/lib/api/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { DashboardWorkflow } from '@/components/DashboardWorkflow'

export default function Dashboard() {
  const { user, logout } = useAuthContext();
  const [credits, setCredits] = useState(0);
  const [userProfiles, setUserProfiles] = useState<string[]>([]);
  const [profilesData, setProfilesData] = useState<{[key: string]: any}>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Consolidated function to fetch all user data
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Get user credits - await this call
        const creditsData = await api.payments.getCredits();
        setCredits(creditsData.credits || 0);
        
        // Fetch the user's profiles - await this call
        const profilesData = await api.tweets.profiles.getProfiles();
        const profiles = profilesData.profiles || [];
        setUserProfiles(profiles);
        
        // If there are profiles, fetch their data immediately (not in setTimeout)
        if (profiles.length > 0) {
          const profilesInfo: {[key: string]: any} = {};
          // Use Promise.all to fetch all profile data in parallel
          await Promise.all(
            profiles.map(async (profile: string) => {
              try {
                const validation = await api.tweets.validateUsername(profile);
                if (validation.exists && validation.profile) {
                  profilesInfo[profile] = validation.profile;
                }
              } catch (error) {
                console.error(`Error validating profile ${profile}:`, error);
              }
            })
          );
          setProfilesData(profilesInfo);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Event handlers for profile operations
  const handleProfileAdded = async (profile: string) => {
    setUserProfiles(prev => [...prev, profile]);
    
    // Also update profile data immediately
    try {
      const validation = await api.tweets.validateUsername(profile);
      if (validation.exists && validation.profile) {
        setProfilesData(prev => ({
          ...prev,
          [profile]: validation.profile
        }));
      }
    } catch (error) {
      console.error(`Error validating new profile ${profile}:`, error);
    }
  };
  
  const handleProfileDeleted = (profile: string) => {
    setUserProfiles(prev => prev.filter(p => p !== profile));
    
    // Also remove from profilesData
    setProfilesData(prev => {
      const updated = {...prev};
      delete updated[profile];
      return updated;
    });
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        {/* Username next to theme toggle */}
        <motion.div 
          className="absolute top-5 left-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-sm px-4 py-1 bg-background rounded-full border border-input text-primary cursor-pointer">
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
            <Button variant="outline" onClick={logout} className="cursor-pointer">
              Sign Out
            </Button>
          </div>
        </motion.div>
        
        {/* Main Dashboard Content */}
        <main className="flex-1 flex items-center justify-start p-48">
          {isLoading ? (
            <div className="flex justify-center items-center w-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Loading your profiles...</span>
            </div>
          ) : (
            <DashboardWorkflow 
              initialProfiles={userProfiles}
              initialProfilesData={profilesData}
              onProfileAdded={handleProfileAdded}
              onProfileDeleted={handleProfileDeleted}
            />
          )}
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
    </ProtectedRoute>
  );
}
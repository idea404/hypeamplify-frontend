'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthContext } from '@/lib/auth/AuthContext'
import { api } from '@/lib/api/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { DashboardWorkflow } from '@/components/DashboardWorkflow'
import { Navbar, NavbarItemProps } from '@/components/ui/navbar'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [userProfiles, setUserProfiles] = useState<string[]>([]);
  const [profilesData, setProfilesData] = useState<{[key: string]: any}>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // This function will be called after suggestion generation to refresh credits
  const handleSuggestionGenerated = async () => {
    try {
      const creditsData = await api.payments.getCredits();
      setCredits(creditsData.credits || 0);
    } catch (error) {
      console.error('Error refreshing credits:', error);
    }
  };
  
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
        
        // Update this section to handle the new response format
        const profiles = profilesData.profiles.map((profile: any) => profile.twitter_account || profile.userName) || [];
        setUserProfiles(profiles);
        
        // Build the profile data object
        if (profilesData.profiles.length > 0) {
          const profilesInfo: {[key: string]: any} = {};
          
          // Process profiles and their data
          profilesData.profiles.forEach((profileItem: any) => {
            const username = profileItem.twitter_account || profileItem.userName;
            if (profileItem.profile) {
              profilesInfo[username] = profileItem.profile;
            }
          });
          
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
    try {
      // Fetch the latest profiles to ensure we have the correct data
      const profilesData = await api.tweets.profiles.getProfiles();
      
      // Update profiles with the latest data
      const profiles = profilesData.profiles.map((profile: any) => profile.twitter_account || profile.userName) || [];
      setUserProfiles(profiles);
      
      // Update profile data
      const profilesInfo: {[key: string]: any} = {};
      profilesData.profiles.forEach((profileItem: any) => {
        const username = profileItem.twitter_account || profileItem.userName;
        if (profileItem.profile) {
          profilesInfo[username] = profileItem.profile;
        }
      });
      setProfilesData(profilesInfo);
    } catch (error) {
      console.error(`Error updating profiles after adding ${profile}:`, error);
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
  
  // Custom navbar items
  const navbarItems: NavbarItemProps[] = [
    {
      key: 'buy-credits',
      element: (
        <Button variant="default" onClick={() => router.push('/payments')} className="cursor-pointer">
          Buy Credits
        </Button>
      ),
      position: 'right',
      order: 1
    },
    {
      key: 'sign-out',
      element: (
        <Button variant="outline" onClick={logout} className="cursor-pointer">
          Sign Out
        </Button>
      ),
      position: 'right',
      order: 2
    }
  ];
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        {/* Use the Navbar component */}
        <Navbar 
          items={navbarItems}
          showUserEmail={true}
          showCredits={true}
        />
        
        {/* Main Dashboard Content */}
        <main className="flex-1 flex items-center justify-start p-32">
          {isLoading ? (
            <div className="flex justify-center items-center w-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Loading your profiles...</span>
            </div>
          ) : (
            <DashboardWorkflow 
              initialProfiles={userProfiles}
              initialProfilesData={profilesData}
              userCredits={credits}
              onProfileAdded={handleProfileAdded}
              onProfileDeleted={handleProfileDeleted}
              onSuggestionGenerated={handleSuggestionGenerated}
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
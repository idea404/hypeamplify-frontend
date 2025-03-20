'use client'

import { useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { WebGLBackground } from '@/components/WebGLBackground'
import { useAuthContext } from '@/lib/auth/AuthContext'

interface ClientAuthWrapperProps {
  children: React.ReactNode
}

export function ClientAuthWrapper({ children }: ClientAuthWrapperProps) {
  const { checkAuth } = useAuthContext();
  
  // Only set up periodic checks, don't check on mount
  // since useAuth already does that
  useEffect(() => {
    // Only set up the interval - no immediate check
    const interval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [checkAuth]);
  
  return (
    <>
      <WebGLBackground />
      <div className="absolute inset-0 bg-white/50 dark:bg-black/40 backdrop-blur-[3px] -z-5" />
      <div className="absolute top-4 left-4 z-50">
        <ThemeToggle />
      </div>
      {children}
    </>
  );
} 
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/lib/auth/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, loading, checkAuth } = useAuthContext();
  const router = useRouter();
  
  useEffect(() => {
    // Only check auth if we don't already know the login status
    if (!isLoggedIn && !loading) {
      checkAuth();
    }
  }, [checkAuth, isLoggedIn, loading]);
  
  useEffect(() => {
    // Only redirect if we're not loading and not logged in
    if (!loading && !isLoggedIn) {
      // Use replace instead of push to avoid adding to browser history
      router.replace('/auth/login');
    }
  }, [isLoggedIn, loading, router]);
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Verifying your access...</p>
        </div>
      </div>
    );
  }
  
  // Only render children if logged in, otherwise render nothing
  return isLoggedIn ? <>{children}</> : null;
} 
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
    // Always check auth when the component mounts to ensure we have fresh data
    checkAuth();
  }, [checkAuth]);
  
  useEffect(() => {
    // Only redirect if we're not loading and not logged in
    if (!loading && !isLoggedIn) {
      router.push('/auth/login');
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
  // (the redirect effect will handle moving to login page)
  return isLoggedIn ? <>{children}</> : null;
} 
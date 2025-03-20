import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

export function useAuth() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to check auth status
  const checkAuth = useCallback(async () => {
    setLoading(true);
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      setLoading(false);
      return false;
    }
    
    try {
      const userData = await api.auth.me();
      setUser(userData);
      setIsLoggedIn(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Auth check error:', err);
      // Token is invalid, clear it
      localStorage.removeItem('accessToken');
      setIsLoggedIn(false);
      setUser(null);
      setLoading(false);
      return false;
    }
  }, []);

  // Login function to handle authentication in one place
  const login = useCallback(async (token: string, userData?: any) => {
    localStorage.setItem('accessToken', token);
    
    if (userData) {
      // If userData is provided, use it directly
      setUser(userData);
      setIsLoggedIn(true);
      setLoading(false);
    } else {
      // Otherwise fetch user data from API
      await checkAuth();
    }
  }, [checkAuth]);

  // Logout function that can be called from anywhere
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setUser(null);
    
    // Use replace instead of push to avoid adding to browser history
    router.replace('/auth/login');
  }, [router]);

  // Listen for auth-logout events
  useEffect(() => {
    const handleLogout = () => {
      setIsLoggedIn(false);
      setUser(null);
      router.replace('/auth/login');
    };

    window.addEventListener('auth-logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth-logout', handleLogout);
    };
  }, [router]);

  // Initial auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    checkAuth,
  };
} 
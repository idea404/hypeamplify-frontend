import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

export function useAuth() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [credits, setCredits] = useState<number | null>(null);

  // Function to fetch credits
  const fetchCredits = useCallback(async () => {
    console.log("Attempting to fetch credits...");
    if (localStorage.getItem('accessToken')) { // Only fetch if token potentially exists
      try {
        // Clear cache before fetching if we want guaranteed fresh data
        // api.payments.clearCreditsCache(); // Optional: uncomment if needed
        const creditsData = await api.payments.getCredits();
        setCredits(creditsData.credits || 0);
        console.log("Credits fetched:", creditsData.credits);
      } catch (err) {
        // Check if the error is 401 - interceptor should handle logout
        // @ts-ignore
        if (err.response && err.response.status === 401) {
          console.log("Credit fetch failed with 401, letting interceptor handle logout.");
          // No need to explicitly call logout here, interceptor handles it
          setCredits(null); // Clear credits on auth error
        } else {
          console.error('Error fetching credits:', err);
          setCredits(null); // Set to null on other errors
        }
      }
    } else {
        console.log("No access token found, skipping credit fetch.");
        setCredits(null); // Ensure credits are null if not logged in
    }
  }, []);

  // Function to check auth status and fetch credits
  const checkAuth = useCallback(async () => {
    setLoading(true);
    setUser(null); // Reset user initially
    setCredits(null); // Reset credits initially
    console.log("Checking auth...");
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log("No token found during auth check.");
      setIsLoggedIn(false);
      setLoading(false);
      return false;
    }
    
    try {
      console.log("Token found, verifying with /auth/me...");
      const userData = await api.auth.me();
      console.log("/auth/me successful:", userData);
      setUser(userData);
      setIsLoggedIn(true);
      // Fetch credits *after* confirming authentication
      await fetchCredits(); 
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Auth check error:', err);
      // Token is invalid or /me failed - interceptor should handle token removal and event dispatch
      setIsLoggedIn(false);
      setUser(null);
      setCredits(null);
      setLoading(false);
      return false;
    }
  }, [fetchCredits]);

  // Logout function (moved before login)
  const logout = useCallback(() => {
    console.log("Logout initiated.");
    localStorage.removeItem('accessToken');
    api.payments.clearCreditsCache(); // Clear credits cache on logout
    setIsLoggedIn(false);
    setUser(null);
    setCredits(null); // Clear credits state
    console.log("Redirecting to /auth/login");
    router.replace('/auth/login');
  }, [router]);

  // Login function (now after logout)
  const login = useCallback(async (token: string, userData?: any) => {
    console.log("Login initiated.");
    localStorage.setItem('accessToken', token);
    setIsLoggedIn(true); // Assume login is successful for responsiveness
    
    if (userData) {
      console.log("Using provided user data.");
      setUser(userData);
    } else {
      console.log("Fetching user data after login...");
      try {
        const fetchedUserData = await api.auth.me();
        setUser(fetchedUserData);
        console.log("User data fetched after login:", fetchedUserData);
      } catch (error) {
        console.error("Failed to fetch user data after login:", error);
        // If fetching user data fails, trigger logout process
        logout(); // Call logout to clear state and redirect
        return; // Stop further execution
      }
    }
    // Fetch credits after successful login and user data retrieval
    await fetchCredits();
    setLoading(false);
    console.log("Login process complete.");
  }, [fetchCredits, logout]); // Now logout is defined before being used here

  // Function to manually refresh credits
  const refreshCredits = useCallback(async () => {
      console.log("Manual credit refresh requested.");
      // Explicitly clear the cache before fetching to ensure fresh data
      api.payments.clearCreditsCache();
      await fetchCredits();
  }, [fetchCredits]);

  // Listen for auth-logout events triggered by the API interceptor
  useEffect(() => {
    const handleLogoutEvent = () => {
      console.log("Auth-logout event received.");
      // Ensure state is fully reset on external logout event
      setIsLoggedIn(false);
      setUser(null);
      setCredits(null);
      api.payments.clearCreditsCache(); // Clear cache just in case
      // Redirect if not already on login page
      if (window.location.pathname !== '/auth/login') {
           console.log("Redirecting to login due to auth-logout event.");
           router.replace('/auth/login');
      }
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, [router]);

  // Initial auth check on mount
  useEffect(() => {
    console.log("Initial auth check effect running.");
    checkAuth();
  }, [checkAuth]);

  return {
    isLoggedIn,
    user,
    loading,
    credits,
    login,
    logout,
    checkAuth,
    refreshCredits,
  };
} 
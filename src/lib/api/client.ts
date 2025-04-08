import axios from 'axios';

// Create a custom event for auth events that can be listened to throughout the app
export const authEvents = {
  logout: new CustomEvent('auth-logout'),
  // You could add other auth events here if needed
};

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (only in browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if the error is due to an unauthorized request (401)
    if (error.response && error.response.status === 401) {
      // Clear the token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        
        // Dispatch the logout event so other components can react
        window.dispatchEvent(authEvents.logout);
      }
    }
    return Promise.reject(error);
  }
);

// Create a request cache to prevent duplicate calls
const requestCache = new Map<string, Promise<any>>();
const CREDITS_CACHE_KEY = 'payments/credits'; // Define key for credits

// Clear cache entries after they resolve to prevent memory leaks
const clearCacheEntry = (cacheKey: string) => {
  setTimeout(() => {
    requestCache.delete(cacheKey);
  }, 0);
};

// API methods with deduplication
export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const formData = new FormData();
      formData.append('username', email); // API expects username field
      formData.append('password', password);
      
      const response = await apiClient.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    register: async (email: string, password: string) => {
      const response = await apiClient.post('/auth/register', { email, password });
      return response.data;
    },
    socialLogin: async (provider: string, idToken: string) => {
      const response = await apiClient.post('/auth/social-login', { provider, id_token: idToken });
      return response.data;
    },
    me: async () => {
      const cacheKey = 'auth/me';
      
      if (requestCache.has(cacheKey)) {
        return requestCache.get(cacheKey);
      }
      
      const request = apiClient.get('/auth/me')
        .then(response => {
          clearCacheEntry(cacheKey);
          return response.data;
        })
        .catch(error => {
          clearCacheEntry(cacheKey);
          // If 'me' fails with 401, the interceptor should handle logout
          if (error.response && error.response.status === 401) {
             console.log("GET /auth/me failed with 401, interceptor should handle logout.");
          } else {
             console.error("Error fetching /auth/me:", error);
          }
          throw error; // Rethrow error for calling code/interceptor
        });
      
      requestCache.set(cacheKey, request);
      return request;
    },
  },
  
  // Tweet endpoints
  tweets: {
    suggest: async (twitterAccount: string, forceCache: boolean = false) => {
      const response = await apiClient.post('/tweets/suggest', {
        twitter_account: twitterAccount,
        suggestions_force_cache: forceCache,
      });
      return response.data;
    },
    getSuggestions: async (twitterAccount: string, includeHidden: boolean = false) => {
      const response = await apiClient.get(`/tweets/suggestions?twitter_account=${twitterAccount}&include_hidden=${includeHidden}`);
      return response.data;
    },
    hideSuggestion: async (twitterAccount: string, suggestionText: string) => {
      const response = await apiClient.delete(`/tweets/suggestions`, {
        data: { twitter_account: twitterAccount, suggestion_text: suggestionText }
      });
      return response.data;
    },
    validateUsername: async (twitterUsername: string) => {
      const cacheKey = `tweets/validate-username/${twitterUsername}`;
      
      if (requestCache.has(cacheKey)) {
        return requestCache.get(cacheKey);
      }
      
      const request = apiClient.get(`/tweets/validate-username/${twitterUsername}`)
        .then(response => {
          clearCacheEntry(cacheKey);
          return response.data;
        })
        .catch(error => {
          clearCacheEntry(cacheKey);
          console.error(`Error validating Twitter username ${twitterUsername}:`, error);
          return { exists: false, error: "Could not validate username" };
        });
      
      requestCache.set(cacheKey, request);
      return request;
    },
    // Profiles endpoints
    profiles: {
      getProfiles: async () => {
        const cacheKey = 'tweets/profiles';
        
        if (requestCache.has(cacheKey)) {
          return requestCache.get(cacheKey);
        }
        
        const request = apiClient.get('/tweets/profiles')
          .then(response => {
            clearCacheEntry(cacheKey);
            return response.data;
          })
          .catch(error => {
            clearCacheEntry(cacheKey);
            throw error;
          });
        
        requestCache.set(cacheKey, request);
        return request;
      },
      addProfile: async (twitterAccount: string) => {
        const response = await apiClient.post('/tweets/profiles', { twitter_account: twitterAccount });
        // Clear the profiles cache after adding a new profile
        requestCache.delete('tweets/profiles');
        return response.data;
      },
      deleteProfile: async (twitterAccount: string) => {
        const response = await apiClient.delete(`/tweets/profiles`, {
          data: { twitter_account: twitterAccount }
        });
        return response.data;
      },
    },
  },
  
  // Payments endpoints
  payments: {
    getPackages: async () => {
      const response = await apiClient.get('/payments/packages');
      return response.data;
    },
    checkout: async (packageId: string, referralCode?: string) => {
      const response = await apiClient.post('/payments/checkout', { 
        package_id: packageId,
        referral_code: referralCode // Add referral code if provided
      });
      return response.data;
    },
    getHistory: async () => {
      const response = await apiClient.get('/payments/history');
      return response.data;
    },
    getCredits: async () => {
      const cacheKey = CREDITS_CACHE_KEY;
      
      if (requestCache.has(cacheKey)) {
        console.log("Returning cached credits promise"); // Log cache hit
        return requestCache.get(cacheKey);
      }
      
      console.log("Fetching fresh credits from API"); // Log cache miss
      const request = apiClient.get('/payments/credits')
        .then(response => {
          clearCacheEntry(cacheKey);
          return response.data;
        })
        .catch(error => {
          clearCacheEntry(cacheKey);
          // Let interceptor handle 401, just log others
          if (error.response && error.response.status !== 401) {
              console.error("Error fetching credits:", error);
          }
          throw error; // Rethrow error for calling code/interceptor
        });
      
      requestCache.set(cacheKey, request);
      return request;
    },
    createPaymentIntent: async (packageId: string, referralCode?: string) => {
      const response = await apiClient.post('/payments/create-intent', { 
        package_id: packageId,
        referral_code: referralCode // Add referral code if provided
      });
      return response.data;
    },
    // Function to explicitly clear the credits cache
    clearCreditsCache: () => {
        console.log("Clearing credits cache.");
        requestCache.delete(CREDITS_CACHE_KEY);
    },
    // New function to validate referral code
    validateReferralCode: async (referralCode: string) => {
        if (!referralCode) {
            // Optionally handle empty code validation client-side or let backend handle
            return { valid: false, message: "Please enter a code.", bonus_credits_factor: 1.0 };
        }
        const response = await apiClient.post('/payments/validate-referral', { referral_code: referralCode });
        return response.data; // Expects { valid: bool, message: str, bonus_credits_factor: float }
    },
  },
};

export default api;
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

// API methods
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
      const response = await apiClient.get('/auth/me');
      return response.data;
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
      try {
        const response = await apiClient.get(`/tweets/validate-username/${twitterUsername}`);
        return response.data;
      } catch (error) {
        console.error(`Error validating Twitter username ${twitterUsername}:`, error);
        // Return a structured response even when errors occur
        return { exists: false, error: "Could not validate username" };
      }
    },
    // Profiles endpoints
    profiles: {
      getProfiles: async () => {
        const response = await apiClient.get('/tweets/profiles');
        return response.data;
      },
      addProfile: async (twitterAccount: string) => {
        const response = await apiClient.post('/tweets/profiles', { twitter_account: twitterAccount });
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
    checkout: async (packageId: string) => {
      const response = await apiClient.post('/payments/checkout', { package_id: packageId });
      return response.data;
    },
    getHistory: async () => {
      const response = await apiClient.get('/payments/history');
      return response.data;
    },
    getCredits: async () => {
      const response = await apiClient.get('/payments/credits');
      return response.data;
    },
  },
};

export default api;
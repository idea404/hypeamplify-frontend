import axios from 'axios';

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
    getSuggestions: async (twitterAccount: string) => {
      const response = await apiClient.get(`/tweets/suggestions?twitter_account=${twitterAccount}`);
      return response.data;
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
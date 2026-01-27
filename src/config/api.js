/**
 * API Configuration & Axios Instance
 * 
 * IMPORTANT SETUP NOTES:
 * ====================
 * 
 * Current Kong Gateway Routes (http://139.59.109.5:8000):
 * ✅ POST /v0-1/model-predict → Flask /predict (WORKING)
 * ✅ GET  /v0-1/model-result/{id} → Flask /result/{id} (CONFIGURED)
 * ✅ POST /v0-1/auth-login → Authentication endpoint
 * ✅ POST /v0-1/auth-register → Registration endpoint
 * 
 * Security Implementation:
 * - JWT token stored in memory (not localStorage)
 * - Token automatically attached to requests via Axios interceptors
 * - HttpOnly cookies support (when backend implements it)
 */

import axios from 'axios';
import Cookies from 'js-cookie';

export const API_CONFIG = {
  // Base URL for the API
  // In development: uses Vite proxy (/api) to bypass CORS
  // In production: uses direct URL
  BASE_URL: import.meta.env.DEV ? "/api" : "http://139.59.109.5:8000",
  
  // Authentication endpoints
  AUTH_LOGIN: "/v0-1/auth-login",
  AUTH_REGISTER: "/v0-1/auth-register",
  
  // Prediction endpoint (working)
  PREDICT_ENDPOINT: "/v0-1/model-predict",
  
  // Result polling endpoint
  // ✅ Configured endpoint: /v0-1/model-result/{id}
  RESULT_ENDPOINT: "/v0-1/model-result",
  
  // Advice endpoint
  ADVICE_ENDPOINT: "/v0-1/model-advice",
  
  // Polling configuration
  POLLING: {
    MAX_ATTEMPTS: 120,    // 120 attempts
    INTERVAL_MS: 1000,    // 1 second between polls
    TIMEOUT_MS: 120000    // 2 minutes total timeout
  }
};

// ====================================
// TOKEN MANAGEMENT (In-Memory Storage)
// ====================================
// TODO: PLACEHOLDER - Waiting for backend to implement JWT token generation
// Backend should return: { success: true, token: "jwt_token_here", user: {...} }
let authToken = null;
let userData = null;

export const TokenManager = {
  // Set token after successful login/register
  setToken(token) {
    authToken = token;
    // Memory-only storage - token is cleared on page refresh
    // TODO: Once backend supports HttpOnly cookies, they will handle persistence
  },

  // Get current token
  getToken() {
    // Memory-only - no cookie fallback
    return authToken;
  },

  // Clear token on logout
  clearToken() {
    authToken = null;
    userData = null;
  },

  // Store user data (non-sensitive info only)
  setUserData(user) {
    // Only store non-sensitive user data (no passwords!)
    userData = {
      email: user.email,
      name: user.name,
      userId: user.userId, // From backend response
      // Add other non-sensitive fields as needed
    };
  },

  getUserData() {
    return userData;
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

// ====================================
// AXIOS INSTANCE (Centralized API Client)
// ====================================
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for HttpOnly cookie support
});

// Request Interceptor: Attach JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    
    // Attach JWT token to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Don't redirect if already on login/register page
      const publicPaths = ['/signIn', '/register', '/'];
      const currentPath = window.location.pathname;
      
      if (!publicPaths.includes(currentPath)) {
        TokenManager.clearToken();
        // Dispatch events for React components to handle
        window.dispatchEvent(new CustomEvent('auth:logout'));
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to get full endpoint URLs
export function getApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Specific API URLs
export const API_URLS = {
  predict: getApiUrl(API_CONFIG.PREDICT_ENDPOINT),
  result: (predictionId) => getApiUrl(`${API_CONFIG.RESULT_ENDPOINT}/${predictionId}`),
  advice: getApiUrl(API_CONFIG.ADVICE_ENDPOINT)
};

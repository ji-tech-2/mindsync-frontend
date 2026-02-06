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

import axios from "axios";

export const API_CONFIG = {
  // Base URL for the API
  // In development: uses Vite proxy (/api) to bypass CORS
  // In production: uses direct URL
  BASE_URL: import.meta.env.DEV ? "/api" : "http://139.59.109.5:8000",  
  
  // Authentication endpoints
  AUTH_LOGIN: "/v0-1/auth-login",
  AUTH_REGISTER: "/v0-1/auth-register",

  // Profile endpoints
  PROFILE: "/v0-1/auth-profile",
  PROFILE_REQUEST_OTP: "/v0-1/auth-profile/request-otp",
  PROFILE_CHANGE_PASSWORD: "/v0-1/auth-profile/change-password",

  // Prediction endpoint (working)
  PREDICT_ENDPOINT: "/v0-1/model-predict",

  // Result polling endpoint
  // ✅ Configured endpoint: /v0-1/model-result/{id}
  RESULT_ENDPOINT: "/v0-1/model-result",

  // Advice endpoint
  ADVICE_ENDPOINT: "/v0-1/model-advice",

  // Streak endpoint
  STREAK_ENDPOINT: "/v0-1/model-streak",

  // Weekly critical factors endpoint
  WEEKLY_CRITICAL_FACTORS: "/v0-1/weekly-critical-factors",

  // Daily suggestion endpoint
  DAILY_SUGGESTION: "/v0-1/daily-suggestion",

  // Polling configuration
  POLLING: {
    MAX_ATTEMPTS: 120, // 120 attempts
    INTERVAL_MS: 1000, // 1 second between polls
    TIMEOUT_MS: 120000, // 2 minutes total timeout
  },
};

// ====================================
// TOKEN MANAGEMENT (TEMPORARY: localStorage)
// ====================================
// TEMPORARY: Using localStorage for persistence across page reloads
// TODO: Switch to HttpOnly cookies for production security
// Backend should return: { success: true, token: "jwt_token_here", user: {...} }
let authToken = null;
let userData = null;

const TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

export const TokenManager = {
  // Set token after successful login/register
  setToken(token) {
    authToken = token;
    // TEMPORARY: Store in localStorage for persistence
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Get current token
  getToken() {
    // Return in-memory token if available
    if (authToken) {
      return authToken;
    }

    // TEMPORARY: Fallback to localStorage
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      authToken = storedToken;
      return storedToken;
    }

    return null;
  },

  // Clear token on logout
  clearToken() {
    authToken = null;
    userData = null;
    // TEMPORARY: Clear from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
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

    // TEMPORARY: Store in localStorage for persistence
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  },

  getUserData() {
    // Return in-memory data if available
    if (userData) {
      return userData;
    }

    // TEMPORARY: Fallback to localStorage
    const storedData = localStorage.getItem(USER_DATA_KEY);
    if (storedData) {
      try {
        userData = JSON.parse(storedData);
        return userData;
      } catch (e) {
        console.error("Failed to parse user data:", e);
        return null;
      }
    }

    return null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

// ====================================
// AXIOS INSTANCE (Centralized API Client)
// ====================================
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
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
  },
);

// Response Interceptor: Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Don't clear token if already on login/register page
      const publicPaths = ["/signIn", "/register", "/"];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        // Just clear the token - let ProtectedRoute handle the redirect
        // This is a session expiry, not an intentional logout
        TokenManager.clearToken();
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

// Helper function to get full endpoint URLs
export function getApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Specific API URLs
export const API_URLS = {
  predict: getApiUrl(API_CONFIG.PREDICT_ENDPOINT),
  result: (predictionId) =>
    getApiUrl(`${API_CONFIG.RESULT_ENDPOINT}/${predictionId}`),
  advice: getApiUrl(API_CONFIG.ADVICE_ENDPOINT),
  streak: (userId) =>
    getApiUrl(`${API_CONFIG.STREAK_ENDPOINT}/${userId}`),
  weeklyCriticalFactors: (userId, days = 7) =>
    getApiUrl(`${API_CONFIG.WEEKLY_CRITICAL_FACTORS}?user_id=${userId}&days=${days}`),
  dailySuggestion: (userId) =>
    getApiUrl(`${API_CONFIG.DAILY_SUGGESTION}?user_id=${userId}`),
};

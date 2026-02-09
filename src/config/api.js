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
  
  // Screening history endpoint
  // TODO: Configure Kong Gateway route: GET /v0-1/model-screening-history → Flask /screening-history
  SCREENING_HISTORY_ENDPOINT: "/v0-1/model-history",
  
  // Weekly chart endpoint
  // Kong route: /v0-1/model-weekly-chart/{user_id} → Flask /chart/weekly?user_id={user_id}
  WEEKLY_CHART_ENDPOINT: "/v0-1/model-weekly-chart",
  
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
  result: (predictionId) => getApiUrl(`${API_CONFIG.RESULT_ENDPOINT}/${predictionId}`),
  advice: getApiUrl(API_CONFIG.ADVICE_ENDPOINT),
  screeningHistory: (userId) => getApiUrl(`${API_CONFIG.SCREENING_HISTORY_ENDPOINT}/${userId}`),
  weeklyChart: (userId) => getApiUrl(`${API_CONFIG.WEEKLY_CHART_ENDPOINT}/${userId}`)
};

// ====================================
// API HELPER FUNCTIONS
// ====================================

/**
 * Fetch user's screening history
 * @param {string} userId - User ID (UUID)
 * @param {number} limit - Maximum number of results (default: 50)
 * @param {number} offset - Pagination offset (default: 0)
 * @returns {Promise} - Array of screening history
 */
export async function fetchScreeningHistory(userId, limit = 50, offset = 0) {
  try {
    // Kong strips /v0-1/model-history, Flask expects /history/<user_id>
    const url = `${API_CONFIG.SCREENING_HISTORY_ENDPOINT}/${userId}`;
    const response = await apiClient.get(url);
    
    if (response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data,
        total: response.data.total
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to fetch history'
      };
    }
  } catch (error) {
    console.error('Error fetching screening history:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Network error'
    };
  }
}

/**
 * Build weekly chart data from screening history.
 * Clamps each score to [0, 100] BEFORE averaging per day.
 * This avoids the issue where Flask averages raw negative scores.
 */
export function buildWeeklyChartFromHistory(historyItems) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group clamped scores by date
  const scoresByDate = {};
  historyItems.forEach(item => {
    const d = new Date(item.created_at || item.date);
    const key = d.toISOString().split('T')[0];
    const raw = item.prediction_score ?? item.score ?? 0;
    const clamped = Math.max(0, Math.min(100, raw));
    if (!scoresByDate[key]) scoresByDate[key] = [];
    scoresByDate[key].push(clamped);
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const scores = scoresByDate[key];
    const avg = scores
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    chart.push({ day: dayLabels[d.getDay()], date: key, value: avg });
  }
  return chart;
}

/**
 * Fetch weekly chart data (last 7 days)
 * @param {string} userId - User ID (UUID)
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Promise} - Array of daily chart data
 */
export async function fetchWeeklyChart(userId) {
  try {
    // Kong expects path param: /v0-1/model-weekly-chart/{userId}
    // Kong converts to query param for Flask: /chart/weekly?user_id={userId}
    const url = `${API_CONFIG.WEEKLY_CHART_ENDPOINT}/${userId}`;
    console.log("📡 Fetching weekly chart from:", url);
    const response = await apiClient.get(url);
    console.log("📡 Weekly chart raw response:", response.data);
    
    if (response.data.status === 'success') {
      // Map Flask fields to WeeklyChart component format
      // Flask: { label, date, mental_health_index, ... }
      // WeeklyChart: { day, date, value }
      const mappedData = response.data.data.map(item => ({
        day: item.label,
        date: item.date,
        value: Math.max(0, item.mental_health_index ?? 0)
      }));

      return {
        success: true,
        data: mappedData,
        days: mappedData.length
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to fetch chart data'
      };
    }
  } catch (error) {
    console.error('Error fetching weekly chart:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Network error'
    };
  }
}
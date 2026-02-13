/**
 * API Configuration & Axios Instance
 *
 * IMPORTANT SETUP NOTES:
 * ====================
 *
 * Current Kong Gateway Routes (https://api.mindsync.my):
 * ✅ POST /v0-1/model-predict → Flask /predict (WORKING)
 * ✅ GET  /v0-1/model-result/{id} → Flask /result/{id} (CONFIGURED)
 * ✅ POST /v0-1/auth-login → Authentication endpoint
 * ✅ POST /v0-1/auth-register → Registration endpoint
 *
 * HTTPS Configuration:
 * - All API calls use HTTPS for security
 * - Self-signed certificates allowed in development (secure: false in vite.config.js)
 *
 * Security Implementation:
 * - Authentication via HttpOnly cookies (JWT sent automatically by browser)
 * - No token storage in localStorage or memory (more secure against XSS)
 * - Credentials automatically included with requests (withCredentials: true)
 */

import axios from 'axios';

export const API_CONFIG = {
  // Base URL for the API
  // In development: uses Vite proxy (/api) to bypass CORS
  // In production: uses direct HTTPS URL
  BASE_URL: import.meta.env.DEV ? '/api' : 'https://api.mindsync.my',

  // Authentication endpoints
  AUTH_LOGIN: '/v0-1/auth-login',
  AUTH_REGISTER: '/v0-1/auth-register',

  // Profile endpoints
  PROFILE: '/v0-1/auth-profile',
  PROFILE_REQUEST_OTP: '/v0-1/auth-profile/request-otp',
  PROFILE_CHANGE_PASSWORD: '/v0-1/auth-profile/change-password',

  // Prediction endpoint (working)
  PREDICT_ENDPOINT: '/v0-1/model-predict',

  // Result polling endpoint
  // ✅ Configured endpoint: /v0-1/model-result/{id}
  RESULT_ENDPOINT: '/v0-1/model-result',

  // Advice endpoint
  ADVICE_ENDPOINT: '/v0-1/model-advice',

  // Screening history endpoint
  // TODO: Configure Kong Gateway route: GET /v0-1/model-screening-history → Flask /screening-history
  SCREENING_HISTORY_ENDPOINT: '/v0-1/model-history',

  // Weekly chart endpoint
  // Kong route: /v0-1/model-weekly-chart/{user_id} → Flask /chart/weekly?user_id={user_id}
  WEEKLY_CHART_ENDPOINT: '/v0-1/model-weekly-chart',

  // Streak endpoint
  STREAK_ENDPOINT: '/v0-1/model-streak',

  // Weekly critical factors endpoint
  WEEKLY_CRITICAL_FACTORS: '/v0-1/model-critical-factors',

  // Daily suggestion endpoint
  DAILY_SUGGESTION: '/v0-1/model-daily-suggestion',

  // Polling configuration
  POLLING: {
    MAX_ATTEMPTS: 120, // 120 attempts
    INTERVAL_MS: 1000, // 1 second between polls
    TIMEOUT_MS: 120000, // 2 minutes total timeout
  },
};

// ====================================
// USER DATA MANAGEMENT
// ====================================
// User data stored in memory only (non-sensitive info)
// Authentication state managed via HttpOnly cookies by backend
// Backend response: { success: true, user: { email, name, userId } }
let userData = null;

export const TokenManager = {
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

  // Clear user data on logout
  clearUserData() {
    userData = null;
  },

  isAuthenticated() {
    return !!userData;
  },
};

// ====================================
// AXIOS INSTANCE (Centralized API Client)
// ====================================
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with every request (required for httpOnly cookies)
});

// Response Interceptor: Handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - session expired or invalid
    if (error.response?.status === 401) {
      // Don't clear user data if already on login/sign up page
      const publicPaths = ['/signin', '/sign-up', '/'];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        // Clear user data - let ProtectedRoute handle the redirect
        // This is a session expiry, not an intentional logout
        TokenManager.clearUserData();
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
  result: (predictionId) =>
    getApiUrl(`${API_CONFIG.RESULT_ENDPOINT}/${predictionId}`),
  advice: getApiUrl(API_CONFIG.ADVICE_ENDPOINT),
  screeningHistory: (userId) =>
    getApiUrl(`${API_CONFIG.SCREENING_HISTORY_ENDPOINT}/${userId}`),
  weeklyChart: (userId) =>
    getApiUrl(`${API_CONFIG.WEEKLY_CHART_ENDPOINT}/${userId}`),
  streak: (userId) => getApiUrl(`${API_CONFIG.STREAK_ENDPOINT}/${userId}`),
  weeklyCriticalFactors: (userId) =>
    getApiUrl(`${API_CONFIG.WEEKLY_CRITICAL_FACTORS}/${userId}`),
  dailySuggestion: (userId) =>
    getApiUrl(`${API_CONFIG.DAILY_SUGGESTION}/${userId}`),
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
export async function fetchScreeningHistory(userId) {
  try {
    // Kong strips /v0-1/model-history, Flask expects /history/<user_id>
    const url = `${API_CONFIG.SCREENING_HISTORY_ENDPOINT}/${userId}`;
    const response = await apiClient.get(url);

    if (response.data.status === 'success') {
      return {
        success: true,
        data: response.data.data,
        total: response.data.total,
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to fetch history',
      };
    }
  } catch (error) {
    console.error('Error fetching screening history:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Network error',
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
  historyItems.forEach((item) => {
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
    const hasData = !!scores;
    const avg = scores
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    chart.push({ day: dayLabels[d.getDay()], date: key, value: avg, hasData });
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
    console.log('📡 Fetching weekly chart from:', url);
    const response = await apiClient.get(url);
    console.log('📡 Weekly chart raw response:', response.data);

    if (response.data.status === 'success') {
      // Map Flask fields to WeeklyChart component format
      // Flask: { label, date, mental_health_index, ... }
      // WeeklyChart: { day, date, value }
      const mappedData = response.data.data.map((item) => ({
        day: item.label,
        date: item.date,
        value: Math.max(0, item.mental_health_index ?? 0),
      }));

      return {
        success: true,
        data: mappedData,
        days: mappedData.length,
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to fetch chart data',
      };
    }
  } catch (error) {
    console.error('Error fetching weekly chart:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Network error',
    };
  }
}

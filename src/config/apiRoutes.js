/**
 * API Route Constants
 *
 * Centralized API endpoint definitions.
 * All routes are relative to the base URL configured in the axios client.
 */

export const API_ROUTES = {
  // Authentication
  AUTH_LOGIN: '/v0-1/auth-login',
  AUTH_REGISTER: '/v0-1/auth-register',

  // Profile
  PROFILE: '/v0-1/auth-profile',
  PROFILE_REQUEST_OTP: '/v0-1/auth-profile/request-otp',
  PROFILE_CHANGE_PASSWORD: '/v0-1/auth-profile/change-password',

  // Screening/Prediction
  PREDICT: '/v0-1/model-predict',
  RESULT: '/v0-1/model-result', // Append /{predictionId}

  // Dashboard Data
  HISTORY: '/v0-1/model-history', // Append /{userId}
  WEEKLY_CHART: '/v0-1/model-weekly-chart', // Append /{userId}
  STREAK: '/v0-1/model-streak', // Append /{userId}
  CRITICAL_FACTORS: '/v0-1/model-critical-factors', // Append /{userId}
  DAILY_SUGGESTION: '/v0-1/model-daily-suggestion', // Append /{userId}
};

// Polling configuration
export const POLLING_CONFIG = {
  MAX_ATTEMPTS: 120,
  INTERVAL_MS: 1000,
  TIMEOUT_MS: 120000,
};

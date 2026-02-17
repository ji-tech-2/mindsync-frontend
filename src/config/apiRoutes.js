/**
 * API Route Constants
 *
 * Centralized API endpoint definitions for v1 API.
 * All routes are relative to the base URL configured in the axios client.
 *
 * User profile routes use /me/ (JWT cookie auth — no userId needed).
 * Analytics routes use /{userId}/ (explicit user context).
 */

export const API_ROUTES = {
  // Authentication
  AUTH_LOGIN: '/v1/auth/login',
  AUTH_REGISTER: '/v1/auth/register',
  AUTH_LOGOUT: '/v1/auth/logout',
  AUTH_RESET_PASSWORD: '/v1/auth/reset-password',
  AUTH_REQUEST_SIGNUP_OTP: '/v1/auth/request-signup-otp',

  // User Profile (JWT cookie auth — /me/ prefix)
  PROFILE: '/v1/users/me/profile',
  PROFILE_REQUEST_OTP: '/v1/users/me/request-otp',
  PROFILE_CHANGE_PASSWORD: '/v1/users/me/change-password',

  // Screening/Prediction
  PREDICT: '/v1/predictions/create',
  RESULT: '/v1/predictions', // Append /{predictionId}/result

  // Analytics (userId in path)
  HISTORY: '/v1/users', // Append /{userId}/history
  WEEKLY_CHART: '/v1/users', // Append /{userId}/weekly-chart
  STREAK: '/v1/users', // Append /{userId}/streaks
  CRITICAL_FACTORS: '/v1/users', // Append /{userId}/weekly-factors
  DAILY_SUGGESTION: '/v1/users', // Append /{userId}/daily-suggestions
};

// Polling configuration
export const POLLING_CONFIG = {
  MAX_ATTEMPTS: 120,
  INTERVAL_MS: 1000,
  TIMEOUT_MS: 120000,
};

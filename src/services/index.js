/**
 * API Service - Environment-based Implementation Switcher
 *
 * This module exports the appropriate API service implementation based on environment.
 *
 * - In production: Uses real API calls (unless VITE_USE_MOCK_API=true is set)
 * - In development: ALWAYS uses mock data (no real API calls)
 *
 * Mock mode is automatically enabled in development to allow local work without backend.
 * In production, mock mode can be forced by setting VITE_USE_MOCK_API=true.
 */

const USE_MOCK_API =
  import.meta.env.MODE === 'development' ||
  import.meta.env.VITE_USE_MOCK_API === 'true';

// Log which implementation is being used
if (USE_MOCK_API) {
  console.log('🎭 Using MOCK API implementation');
} else {
  console.log('🌐 Using REAL API implementation');
}

// Export the appropriate implementation
const apiService = USE_MOCK_API
  ? await import('./api.service.mock.js')
  : await import('./api.service.js');

// Re-export all functions
export const {
  // Authentication
  signIn,
  register,
  logout,
  requestOTP,
  requestSignupOTP,
  verifyOTP,
  resetPassword,
  changePassword,

  // Profile
  getProfile,
  updateProfile,

  // Screening/Prediction
  submitScreening,
  getPredictionResult,
  pollPredictionResult,

  // History
  getScreeningHistory,

  // Dashboard
  getWeeklyChart,
  getStreak,
  getWeeklyCriticalFactors,
  getDailySuggestion,
} = apiService;

// Export flag for components that need to know
export const isMockMode = USE_MOCK_API;

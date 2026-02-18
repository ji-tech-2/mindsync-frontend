/**
 * Real API Service Implementation
 *
 * This service abstracts all API calls.
 * Components should use these functions instead of calling apiClient directly.
 */

import apiClient from '@/config/api';
import { API_ROUTES } from '@/config/apiRoutes';

// ====================================
// AUTHENTICATION SERVICES
// ====================================

/**
 * Sign in user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Response with user data
 */
export async function signIn(email, password) {
  const response = await apiClient.post(API_ROUTES.AUTH_LOGIN, {
    email,
    password,
  });
  return response.data;
}

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise} Response with registration status
 */
export async function register(userData) {
  const response = await apiClient.post(API_ROUTES.AUTH_REGISTER, userData);
  return response.data;
}

/**
 * Logout user (clears server-side session/cookie)
 * @returns {Promise} Response with logout status
 */
export async function logout() {
  const response = await apiClient.post(API_ROUTES.AUTH_LOGOUT);
  return response.data;
}

/**
 * Request OTP for password reset
 * @param {string} email - User email
 * @returns {Promise} Response with OTP status
 */
export async function requestOTP(email) {
  const response = await apiClient.post(API_ROUTES.AUTH_REQUEST_OTP, {
    email,
  });
  return response.data;
}

/**
 * Request OTP for signup email verification
 * @param {string} email - User email
 * @returns {Promise} Response with OTP status
 */
export async function requestSignupOTP(email) {
  const response = await apiClient.post(API_ROUTES.AUTH_REQUEST_SIGNUP_OTP, {
    email,
  });
  return response.data;
}

/**
 * Verify OTP for password reset or signup
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @returns {Promise} Response with verification status
 */
export async function verifyOTP(email, otp) {
  const response = await apiClient.post(API_ROUTES.AUTH_VERIFY_OTP, {
    email,
    otp,
  });
  return response.data;
}

/**
 * Reset password with OTP (forgot password flow)
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @param {string} newPassword - New password
 * @returns {Promise} Response with status
 */
export async function resetPassword(email, otp, newPassword) {
  const response = await apiClient.post(API_ROUTES.AUTH_RESET_PASSWORD, {
    email,
    otp,
    newPassword,
  });
  return response.data;
}

/**
 * Change password (authenticated user)
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} Response with status
 */
export async function changePassword(oldPassword, newPassword) {
  const response = await apiClient.post(API_ROUTES.CHANGE_PASSWORD, {
    oldPassword,
    newPassword,
  });
  return response.data;
}

// ====================================
// PROFILE SERVICES
// ====================================

/**
 * Get user profile
 * @returns {Promise} Response with user profile data
 */
export async function getProfile() {
  const response = await apiClient.get(API_ROUTES.PROFILE);
  return response.data;
}

/**
 * Update user profile
 * @param {Object} updateData - Profile fields to update
 * @returns {Promise} Response with updated profile
 */
export async function updateProfile(updateData) {
  const response = await apiClient.put(API_ROUTES.PROFILE, updateData);
  return response.data;
}

// ====================================
// SCREENING/PREDICTION SERVICES
// ====================================

/**
 * Submit screening data and get prediction
 * @param {Object} screeningData - Screening form data
 * @returns {Promise} Response with prediction ID
 */
export async function submitScreening(screeningData) {
  const response = await apiClient.post(API_ROUTES.PREDICT, screeningData);
  return response.data;
}

/**
 * Get prediction result by ID
 * @param {string} predictionId - Prediction ID
 * @returns {Promise} Response with prediction result
 */
export async function getPredictionResult(predictionId) {
  const response = await apiClient.get(
    `${API_ROUTES.RESULT}/${predictionId}/result`
  );
  return response.data;
}

/**
 * Poll prediction result until ready
 * @param {string} predictionId - Prediction ID
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} intervalMs - Interval between polls in ms
 * @returns {Promise} Response with complete result
 */
export async function pollPredictionResult(
  predictionId,
  maxAttempts = 120,
  intervalMs = 1000
) {
  let attempts = 0;

  const poll = async () => {
    attempts++;
    console.log(
      `🔄 Polling attempt ${attempts}/${maxAttempts} for prediction: ${predictionId}`
    );

    const data = await getPredictionResult(predictionId);

    // Handle different statuses
    if (data.status === 'ready') {
      console.log('✅ Prediction ready with advice:', data);

      // Timing benchmark
      const readyTiming = data.result?.timing || {};
      const readyStart = readyTiming.start_timestamp;
      let readyLatencyMs = null;
      if (readyStart) {
        readyLatencyMs = (Date.now() / 1000 - readyStart) * 1000;
        console.log(
          '⏱️  [BENCHMARK] Ridge Prediction - Model.pkl only:',
          readyTiming.ridge_prediction_ms,
          'ms'
        );
        console.log(
          '⏱️  [BENCHMARK] Ridge Prediction - Server processing:',
          readyTiming.server_processing_ms,
          'ms'
        );
        console.log(
          '⏱️  [BENCHMARK] Ridge Prediction - Total end-to-end latency:',
          readyLatencyMs.toFixed(2),
          'ms'
        );
      }

      return {
        success: true,
        status: 'ready',
        data: data.result,
        metadata: {
          created_at: data.created_at,
          numeric_completed_at: data.numeric_completed_at,
          advisory_completed_at:
            data.completed_at || data.advisory_completed_at,
          timing: {
            ridge_prediction_ms: readyTiming.ridge_prediction_ms,
            server_processing_ms: readyTiming.server_processing_ms,
            total_end_to_end_ms: readyLatencyMs,
          },
        },
      };
    }

    if (data.status === 'partial') {
      console.log('⚡ Partial result ready (without advice):', data);

      // Timing benchmark
      const timing = data.result?.timing || {};
      const startTimestamp = timing.start_timestamp;
      let totalLatencyMs = null;
      if (startTimestamp) {
        totalLatencyMs = (Date.now() / 1000 - startTimestamp) * 1000;
        console.log(
          '⏱️  [BENCHMARK] Ridge Prediction - Model.pkl only:',
          timing.ridge_prediction_ms,
          'ms'
        );
        console.log(
          '⏱️  [BENCHMARK] Ridge Prediction - Server processing:',
          timing.server_processing_ms,
          'ms'
        );
        console.log(
          '⏱️  [BENCHMARK] Ridge Prediction - Total end-to-end latency:',
          totalLatencyMs.toFixed(2),
          'ms'
        );
      } else {
        console.log(
          '⚠️ No start_timestamp in response — backend may not be sending timing data. Raw timing:',
          timing
        );
      }

      return {
        success: true,
        status: 'partial',
        data: data.result,
        metadata: {
          created_at: data.created_at,
          timing: {
            ridge_prediction_ms: timing.ridge_prediction_ms,
            server_processing_ms: timing.server_processing_ms,
            total_end_to_end_ms: totalLatencyMs,
          },
        },
      };
    }

    if (data.status === 'processing') {
      console.log('⏳ Processing: Models not ready yet...');
      if (attempts >= maxAttempts) {
        throw new Error('Timeout: Prediction took too long to process');
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      return poll();
    }

    if (data.status === 'error') {
      console.error('❌ Prediction error:', data.error);
      throw new Error(data.error || 'Prediction failed');
    }

    if (data.status === 'not_found') {
      console.error('❌ Prediction ID not found');
      throw new Error('Prediction ID not found');
    }

    throw new Error(`Unknown status: ${data.status}`);
  };

  return poll();
}

// ====================================
// HISTORY SERVICES
// ====================================

/**
 * Get user's screening history
 * @returns {Promise} Response with screening history
 */
export async function getScreeningHistory() {
  const response = await apiClient.get(API_ROUTES.HISTORY);
  return response.data;
}

// ====================================
// DASHBOARD SERVICES
// ====================================

/**
 * Get weekly chart data
 * @returns {Promise} Response with weekly chart data
 */
export async function getWeeklyChart() {
  const response = await apiClient.get(API_ROUTES.WEEKLY_CHART);
  return response.data;
}

/**
 * Get user's streak data
 * @returns {Promise} Response with streak data
 */
export async function getStreak() {
  const response = await apiClient.get(API_ROUTES.STREAK);
  return response.data;
}

/**
 * Get weekly critical factors
 * @returns {Promise} Response with critical factors
 */
export async function getWeeklyCriticalFactors() {
  const response = await apiClient.get(API_ROUTES.CRITICAL_FACTORS);
  return response.data;
}

/**
 * Get daily suggestion for user
 * @returns {Promise} Response with daily suggestion
 */
export async function getDailySuggestion() {
  const response = await apiClient.get(API_ROUTES.DAILY_SUGGESTION);
  return response.data;
}

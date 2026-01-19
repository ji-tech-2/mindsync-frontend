/**
 * API Configuration
 * 
 * IMPORTANT SETUP NOTES:
 * ====================
 * 
 * Current Kong Gateway Routes (http://139.59.109.5:8000):
 * ✅ POST /v0-1/model-predict → Flask /predict (WORKING)
 * ✅ GET  /v0-1/model-result/{id} → Flask /result/{id} (CONFIGURED)
 * 
 * The Flask backend has these endpoints:
 * - POST /predict → Returns prediction_id
 * - GET  /result/<prediction_id> → Returns prediction result
 * 
 * Kong needs to expose:
 * - POST /v0-1/model-predict → /predict
 * - GET  /v0-1/result/{id} → /result/{id}  <-- ADD THIS
 */

export const API_CONFIG = {
  // Base URL for the API
  // In development: uses Vite proxy (/api) to bypass CORS
  // In production: uses direct URL
  BASE_URL: import.meta.env.DEV ? "/api" : "http://139.59.109.5:8000",
  
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

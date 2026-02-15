/**
 * Multi-stage polling system for two models:
 * 1. Fast Numeric Model (Flask) - Returns score & category quickly
 * 2. Slow Advisory Model (Gemini API) - Returns wellness analysis asynchronously
 *
 * Kong Gateway Routes (v1 API):
 * - POST /v1/predictions/create → Flask /predict ✅
 * - GET  /v1/predictions/{id}/result → Flask /result ✅
 *
 * Response Stages:
 * - Stage 1 (partial): { status: "partial", result: { prediction_score, health_level } }
 * - Stage 2 (ready): { status: "ready", result: { prediction_score, health_level, wellness_analysis } }
 */

const KONG_ROUTE_ERROR =
  'Backend configuration error: The polling endpoint is not configured in the API gateway. ' +
  'Please contact backend team to add Kong route mapping for /result endpoint.';

/**
 * Check if the error message indicates a Kong gateway routing issue.
 */
function isKongRouteError(message) {
  return message && message.includes('no Route matched');
}

/**
 * Check if the error is non-retryable (should be thrown immediately).
 */
function isNonRetryableError(message) {
  return (
    message.includes('Timeout') ||
    message.includes('not found') ||
    message.includes('failed') ||
    message.includes('Backend configuration error')
  );
}

/**
 * Build a successful polling response from status data.
 */
function buildReadyResponse(data) {
  return {
    success: true,
    status: 'ready',
    data: data.result,
    metadata: {
      created_at: data.created_at,
      numeric_completed_at: data.numeric_completed_at,
      advisory_completed_at: data.completed_at || data.advisory_completed_at,
    },
  };
}

/**
 * Build a partial polling response.
 */
function buildPartialResponse(data) {
  return {
    success: true,
    status: 'partial',
    data: data.result,
    metadata: {
      created_at: data.created_at,
    },
  };
}

/**
 * Poll with callback support for partial results
 * @param {string} predictionId - The prediction ID to poll
 * @param {string} baseURL - Base URL for the API
 * @param {string} resultPath - Result endpoint path (v1: '/v1/predictions')
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} interval - Interval between polls in ms
 * @param {Function} onPartialResult - Callback for partial results (optional)
 * @returns {Promise} Resolves with complete result or rejects with error
 */
export async function pollPredictionResult(
  predictionId,
  baseURL = 'https://api.mindsync.my',
  resultPath = '/v1/predictions',
  maxAttempts = 60,
  interval = 2000
) {
  let attempts = 0;

  const poll = async () => {
    attempts++;
    console.log(
      `🔄 Polling attempt ${attempts}/${maxAttempts} for prediction: ${predictionId}`
    );

    try {
      const pollUrl = `${baseURL}${resultPath}/${predictionId}/result`;
      console.log(`📡 Polling URL: ${pollUrl}`);

      const response = await fetch(pollUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      // Handle known statuses via dispatch map
      const statusHandlers = {
        ready: () => {
          console.log('✅ Prediction ready with advice:', data);
          return buildReadyResponse(data);
        },
        partial: () => {
          console.log('⚡ Partial result ready (without advice):', data);
          return buildPartialResponse(data);
        },
        processing: async () => {
          console.log('⏳ Processing: Models not ready yet...');
          if (attempts >= maxAttempts) {
            throw new Error('Timeout: Prediction took too long to process');
          }
          await new Promise((resolve) => setTimeout(resolve, interval));
          return poll();
        },
        error: () => {
          console.error('❌ Prediction error:', data.error);
          throw new Error(data.error || 'Prediction failed');
        },
        not_found: () => {
          console.error('❌ Prediction ID not found');
          throw new Error('Prediction ID not found');
        },
      };

      const handler = statusHandlers[data.status];
      if (handler) return handler();

      // Check for Kong gateway route misconfiguration
      if (isKongRouteError(data.message)) {
        throw new Error(KONG_ROUTE_ERROR);
      }

      throw new Error(`Unknown status: ${data.status}`);
    } catch (error) {
      if (isKongRouteError(error.message)) {
        throw new Error(KONG_ROUTE_ERROR);
      }

      if (isNonRetryableError(error.message)) {
        throw error;
      }

      // Network errors — retry if under max attempts
      if (attempts >= maxAttempts) {
        throw new Error('Network error: Failed to fetch prediction result');
      }

      console.warn('⚠️ Network error, retrying...', error);
      await new Promise((resolve) => setTimeout(resolve, interval));
      return poll();
    }
  };

  return poll();
}

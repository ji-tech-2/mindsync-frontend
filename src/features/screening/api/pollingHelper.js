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
  const timing = data.result?.timing || {};
  const startTimestamp = timing.start_timestamp;

  // Calculate total end-to-end latency (including network + polling)
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

/**
 * Poll with callback support for partial results
 * @param {string} predictionId - The prediction ID to poll
 * @param {Object} options - Polling configuration options
 * @param {string} options.baseURL - Base URL for the API
 * @param {string} options.resultPath - Result endpoint path (v1: '/v1/predictions')
 * @param {number} options.maxAttempts - Maximum polling attempts
 * @param {number} options.interval - Interval between polls in ms
 * @returns {Promise} Resolves with complete result or rejects with error
 */
export async function pollPredictionResult(predictionId, options = {}) {
  const {
    baseURL = 'https://api.mindsync.my',
    resultPath = '/v1/predictions',
    maxAttempts = 60,
    interval = 2000,
  } = options;
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

          // Extract timing data for benchmarking
          const timing = data.result?.timing || {};
          const startTimestamp = timing.start_timestamp;

          // Calculate total end-to-end latency (including network + polling)
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
          }

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

/**
 * Multi-stage polling system for two models:
 * 1. Fast Numeric Model (Flask) - Returns score & category quickly
 * 2. Slow Advisory Model (Gemini API) - Returns wellness analysis asynchronously
 * 
 * Kong Gateway Routes:
 * - POST /v0-1/model-predict → Flask /predict ✅
 * - GET  /v0-1/model-result/{id} → Flask /result/{id} ✅
 * 
 * Response Stages:
 * - Stage 1 (partial): { status: "partial", result: { prediction_score, health_level } }
 * - Stage 2 (ready): { status: "ready", result: { prediction_score, health_level, wellness_analysis } }
 */

/**
 * Poll with callback support for partial results
 * @param {string} predictionId - The prediction ID to poll
 * @param {string} baseURL - Base URL for the API
 * @param {string} resultPath - Result endpoint path
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} interval - Interval between polls in ms
 * @param {Function} onPartialResult - Callback for partial results (optional)
 * @returns {Promise} Resolves with complete result or rejects with error
 */
export async function pollPredictionResult(
  predictionId,
  baseURL = "http://139.59.109.5:8000",
  resultPath = "/v0-1/result",
  maxAttempts = 60,
  interval = 2000,
  onPartialResult = null
) {
  let attempts = 0;
  let partialResultDelivered = false;

  const poll = async () => {
    attempts++;
    console.log(`🔄 Polling attempt ${attempts}/${maxAttempts} for prediction: ${predictionId}`);

    try {
      const pollUrl = `${baseURL}${resultPath}/${predictionId}`;
      console.log(`📡 Polling URL: ${pollUrl}`);
      
      const response = await fetch(pollUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await response.json();

      // Status: partial - Fast numeric model ready, advisory model still processing
      if (data.status === "partial" && !partialResultDelivered) {
        console.log("⚡ Stage 1 complete: Numeric model ready (partial result)");
        partialResultDelivered = true;
        
        // Deliver partial result via callback
        if (onPartialResult && typeof onPartialResult === 'function') {
          onPartialResult({
            stage: 1,
            data: data.result,
            metadata: {
              created_at: data.created_at,
              numeric_completed_at: data.numeric_completed_at || new Date().toISOString()
            }
          });
        }
        
        // Continue polling for complete result
        console.log("⏳ Stage 2 pending: Waiting for advisory model...");
        await new Promise(resolve => setTimeout(resolve, interval));
        return poll();
      }

      // Status: ready - Both models complete (numeric + advisory)
      if (data.status === "ready") {
        console.log("✅ Stage 2 complete: Full prediction ready (numeric + advisory)");
        return {
          success: true,
          stage: 2,
          data: data.result,
          metadata: {
            created_at: data.created_at,
            numeric_completed_at: data.numeric_completed_at,
            advisory_completed_at: data.completed_at || data.advisory_completed_at
          }
        };
      }

      // Status: processing - Initial processing (no results yet)
      if (data.status === "processing") {
        console.log("⏳ Processing: Models not ready yet...");
        
        if (attempts >= maxAttempts) {
          throw new Error("Timeout: Prediction took too long to process");
        }

        await new Promise(resolve => setTimeout(resolve, interval));
        return poll();
      }

      // Status: error - prediction failed
      if (data.status === "error") {
        console.error("❌ Prediction error:", data.error);
        throw new Error(data.error || "Prediction failed");
      }

      // Status: not_found
      if (data.status === "not_found") {
        console.error("❌ Prediction ID not found");
        throw new Error("Prediction ID not found");
      }

      // Check if Kong gateway route is missing (common error)
      if (data.message && data.message.includes("no Route matched")) {
        console.error("❌ Kong gateway routing error - /result endpoint not configured");
        throw new Error(
          "Backend configuration error: The polling endpoint is not configured in the API gateway. " +
          "Please contact backend team to add Kong route mapping for /result endpoint."
        );
      }

      // Unknown status
      throw new Error(`Unknown status: ${data.status}`);

    } catch (error) {
      // Check for Kong routing errors in catch block too
      if (error.message && error.message.includes("no Route matched")) {
        throw new Error(
          "Backend configuration error: The polling endpoint is not configured in the API gateway. " +
          "Please contact backend team to add Kong route mapping for /result endpoint."
        );
      }

      // Network or other errors
      if (error.message.includes("Timeout") || 
          error.message.includes("not found") || 
          error.message.includes("failed") ||
          error.message.includes("Backend configuration error")) {
        throw error;
      }

      // For network errors, retry if not exceeded max attempts
      if (attempts >= maxAttempts) {
        throw new Error("Network error: Failed to fetch prediction result");
      }

      console.warn("⚠️ Network error, retrying...", error);
      await new Promise(resolve => setTimeout(resolve, interval));
      return poll();
    }
  };

  return poll();
}

/**
 * Poll prediction result endpoint until ready, error, or timeout
 * 
 * Kong Gateway Routes:
 * - POST /v0-1/model-predict → Flask /predict ✅
 * - GET  /v0-1/model-result/{id} → Flask /result/{id} ✅
 * 
 * @param {string} predictionId - The prediction ID to poll
 * @param {string} baseURL - Base URL for the API (uses Vite proxy in dev)
 * @param {string} resultPath - Result endpoint path (default: /v0-1/model-result)
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 120)
 * @param {number} interval - Interval between polls in ms (default: 1000)
 * @returns {Promise} Resolves with result data or rejects with error
 */
export async function pollPredictionResult(
  predictionId,
  baseURL = "http://139.59.109.5:8000",
  resultPath = "/v0-1/result",
  maxAttempts = 60,
  interval = 2000
) {
  let attempts = 0;

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

      // Status: ready - prediction complete
      if (data.status === "ready") {
        console.log("✅ Prediction ready:", data);
        return {
          success: true,
          data: data.result,
          metadata: {
            created_at: data.created_at,
            completed_at: data.completed_at
          }
        };
      }

      // Status: processing - continue polling
      if (data.status === "processing") {
        console.log("⏳ Still processing...");
        
        if (attempts >= maxAttempts) {
          throw new Error("Timeout: Prediction took too long to process");
        }

        // Wait and poll again
        await new Promise(resolve => setTimeout(resolve, interval));
        return poll(); // Recursive call
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

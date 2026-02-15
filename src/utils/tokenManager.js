/**
 * Token Manager
 *
 * Manages user data in memory (non-sensitive information only).
 * Authentication state is managed via HttpOnly cookies by the backend.
 *
 * Backend response format: { success: true, user: { email, name, userId } }
 */

let userData = null;

export const TokenManager = {
  /**
   * Store user data (non-sensitive info only)
   * @param {Object} user - User data from backend
   */
  setUserData(user) {
    // Only store non-sensitive user data (no passwords!)
    userData = {
      email: user.email,
      name: user.name,
      userId: user.userId,
      // Add other non-sensitive fields as needed
    };
  },

  /**
   * Get stored user data
   * @returns {Object|null} User data or null if not set
   */
  getUserData() {
    return userData;
  },

  /**
   * Clear user data (on logout)
   */
  clearUserData() {
    userData = null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user data exists
   */
  isAuthenticated() {
    return !!userData;
  },
};

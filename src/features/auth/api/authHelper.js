/**
 * Authentication Helper Utilities
 *
 * Provides convenient functions for authentication checks and user data access
 * throughout the application.
 *
 * Note: These are helper functions. For React components, prefer using
 * the useAuth() hook from AuthContext for reactive state updates.
 */

import { TokenManager } from '../../../config/api';

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if user has valid token
 */
export function isAuthenticated() {
  return TokenManager.isAuthenticated();
}

/**
 * Get current user data (non-sensitive info only)
 * @returns {object|null} User data or null if not authenticated
 */
export function getCurrentUser() {
  return TokenManager.getUserData();
}

/**
 * Logout user by clearing token and user data
 * Dispatches event to notify AuthContext and other listeners
 * Note: Navigation is handled by AuthContext listening to 'auth:logout'
 * For React components, prefer using useAuth().logout() directly
 */
export function logout() {
  TokenManager.clearToken();

  // Dispatch logout event - AuthContext handles state update and navigation
  window.dispatchEvent(new CustomEvent('auth:logout'));
}

/**
 * Get authentication token
 * @returns {string|null} JWT token or null
 */
export function getAuthToken() {
  return TokenManager.getToken();
}

/**
 * Protected route guard
 * @deprecated Prefer using ProtectedRoute component for route protection
 * @returns {boolean} True if authenticated, false otherwise
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    // Dispatch event - let React components handle navigation
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    return false;
  }
  return true;
}

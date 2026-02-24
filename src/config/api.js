/**
 * HTTP Client Configuration (Axios)
 *
 * Centralized axios instance with authentication handling.
 *
 * Security Implementation:
 * - Authentication via HttpOnly cookies (JWT sent automatically by browser)
 * - No token storage in localStorage or memory (more secure against XSS)
 * - Credentials automatically included with requests (withCredentials: true)
 *
 * Base URL Configuration:
 * - Development: Uses Vite proxy (/api) to bypass CORS
 * - Production: Uses direct HTTPS URL (https://api.mindsync.my)
 */

import axios from 'axios';
import { TokenManager } from '@/utils/tokenManager';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api' : 'https://api.mindsync.my');

/**
 * Axios instance for API calls
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with every request (required for httpOnly cookies)
});

/**
 * Response Interceptor: Handle authentication errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - session expired or invalid
    if (error.response?.status === 401) {
      // Don't clear user data if already on login/sign up page
      const publicPaths = ['/signin', '/signup', '/'];
      const currentPath = window.location.pathname;

      if (!publicPaths.includes(currentPath)) {
        // Clear user data - let ProtectedRoute handle the redirect
        TokenManager.clearUserData();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

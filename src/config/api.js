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
 * - All requests use relative path /api, which nginx proxies to the backend.
 * - In production: nginx template substitutes ${API_BASE_URL} at container startup.
 * - In development (npm run dev): Vite dev server proxies /api → localhost:8000.
 */

import axios from 'axios';
import { TokenManager } from '@/utils/tokenManager';

const BASE_URL = import.meta.env.API_BASE_URL + '/api';

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

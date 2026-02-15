/**
 * AuthContext - Global Authentication State Management
 *
 * Enterprise-grade authentication state management with graceful logout.
 * - Manages user state and authentication status
 * - Provides login/logout methods
 * - Prevents redirect flash during logout
 */

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenManager } from '@/utils/tokenManager';
import { getProfile, logout as logoutService } from '@/services';

// Create the context
const AuthContext = createContext(null);

/**
 * Normalize user data to always include a stable userId field.
 * Falls back through userId → id → user_id → temp ID.
 */
function normalizeUser(userData, fallbackData = {}) {
  return {
    ...userData,
    userId:
      userData.userId ||
      userData.id ||
      userData.user_id ||
      fallbackData.userId ||
      fallbackData.id ||
      fallbackData.user_id ||
      `temp_${Date.now()}`,
  };
}

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();
  const logoutTimeoutRef = useRef(null);

  // Initialize auth state on mount - restore session from HttpOnly cookie
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check if we have user data in memory (fast path)
        const cachedUserData = TokenManager.getUserData();
        if (cachedUserData) {
          const normalizedUser = normalizeUser(cachedUserData);
          setUser(normalizedUser);
          setIsLoading(false);
          return;
        }

        // No cached data - validate session with backend using HttpOnly cookie
        console.log('🔐 Validating session with backend...');
        const response = await getProfile();

        if (response.success && response.data) {
          const normalizedUser = normalizeUser(response.data);
          TokenManager.setUserData(normalizedUser);
          setUser(normalizedUser);
          console.log('✅ Session restored for:', normalizedUser.email);
        } else {
          setUser(null);
        }
      } catch {
        // Session invalid or expired - user not logged in
        console.log('❌ No valid session found');
        TokenManager.clearUserData();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, []);

  // Login function
  const login = useCallback((userData) => {
    const normalizedUser = normalizeUser(userData);
    TokenManager.setUserData(normalizedUser);
    setUser(normalizedUser);
  }, []);

  // Simple logout function - clears server session and client state
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch {
      // Continue with client-side cleanup even if server call fails
    }
    TokenManager.clearUserData();
    setUser(null);
  }, []);

  // Graceful logout - prevents redirect flash
  // Sets isLoggingOut flag briefly to prevent ProtectedRoute redirect during transition
  const logoutWithTransition = useCallback(() => {
    // Set flag to prevent ProtectedRoute from redirecting to /signin
    setIsLoggingOut(true);

    // Navigate to home page first
    navigate('/', { replace: true });

    // Small delay before clearing auth state to allow navigation to begin
    // This prevents the current page from seeing the cleared auth state
    logoutTimeoutRef.current = setTimeout(async () => {
      // Call server logout
      try {
        await logoutService();
      } catch {
        // Continue with client-side cleanup even if server call fails
      }

      // Clear auth state
      TokenManager.clearUserData();
      setUser(null);

      // Clear the flag after auth is cleared
      setIsLoggingOut(false);
    }, 150);
  }, [navigate]);

  // Update user data
  const updateUser = useCallback((userData) => {
    // Merge with existing stored user data to avoid dropping fields/identifiers
    const existingUserData = TokenManager.getUserData() || {};
    const mergedUser = {
      ...existingUserData,
      ...userData,
    };
    const normalizedUser = normalizeUser(mergedUser, existingUserData);
    TokenManager.setUserData(normalizedUser);
    setUser(normalizedUser);
  }, []);

  const value = {
    user,
    isLoading,
    isLoggingOut,
    login,
    logout,
    logoutWithTransition,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

/**
 * AuthContext - Global Authentication State Management
 * 
 * Enterprise-grade authentication state management with graceful logout.
 * - Manages user state and authentication status
 * - Provides login/logout methods
 * - Prevents redirect flash during logout
 */

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TokenManager } from '../config/api';

// Create the context
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const navigate = useNavigate();
  const logoutTimeoutRef = useRef(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = TokenManager.getToken();
      const userData = TokenManager.getUserData();

      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
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
  const login = useCallback((token, userData) => {
    TokenManager.setToken(token);
    TokenManager.setUserData(userData);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // Simple logout function - just clears state (for programmatic use)
  const logout = useCallback(() => {
    TokenManager.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Graceful logout - prevents redirect flash
  // Sets isLoggingOut flag briefly to prevent ProtectedRoute redirect during transition
  const logoutWithTransition = useCallback(() => {
    // Set flag to prevent ProtectedRoute from redirecting to /signIn
    setIsLoggingOut(true);

    // Navigate to home page first
    navigate('/', { replace: true });

    // Small delay before clearing auth state to allow navigation to begin
    // This prevents the current page from seeing the cleared auth state
    logoutTimeoutRef.current = setTimeout(() => {
      // Clear auth state
      TokenManager.clearToken();
      setUser(null);
      setIsAuthenticated(false);

      // Clear the flag after auth is cleared
      setIsLoggingOut(false);
    }, 50);
  }, [navigate]);

  // Update user data
  const updateUser = useCallback((userData) => {
    TokenManager.setUserData(userData);
    setUser(userData);
  }, []);

  const value = {
    user,
    isAuthenticated,
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

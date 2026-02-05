/**
 * AuthContext - Global Authentication State Management
 * 
 * Simple, clean authentication state management.
 * - Manages user state and authentication status
 * - Provides login/logout methods
 * - Does NOT handle navigation
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { TokenManager } from '../config/api';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Login function
  const login = useCallback((token, userData) => {
    TokenManager.setToken(token);
    TokenManager.setUserData(userData);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // Logout function - just clears state
  // Caller is responsible for navigation
  const logout = useCallback(() => {
    TokenManager.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Update user data
  const updateUser = useCallback((userData) => {
    TokenManager.setUserData(userData);
    setUser(userData);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

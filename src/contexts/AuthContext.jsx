/**
 * AuthContext - Global Authentication State Management
 * 
 * Provides authentication state and methods to the entire application.
 * Wraps the app to provide user data, loading states, and auth actions.
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  // Listen for logout events from API interceptor or authHelper
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      navigate('/signIn', { replace: true });
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate]);

  // Listen for unauthorized events (401) and redirect via React Router
  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/signIn', { replace: true });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  // Login function - to be called after successful API login
  const login = useCallback((token, userData) => {
    TokenManager.setToken(token);
    TokenManager.setUserData(userData);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    TokenManager.clearToken();
    setUser(null);
    setIsAuthenticated(false);
    
    // Dispatch logout event for other components
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }, []);

  // Update user data
  const updateUser = useCallback((userData) => {
    TokenManager.setUserData(userData);
    setUser(userData);
  }, []);

  // Check if user is authenticated
  const checkAuth = useCallback(() => {
    return TokenManager.isAuthenticated();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

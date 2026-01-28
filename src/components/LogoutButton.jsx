/**
 * LogoutButton Component
 * 
 * Example component showing how to implement logout functionality
 * using the AuthContext.
 * 
 * Usage:
 * import LogoutButton from './LogoutButton';
 * <LogoutButton />
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LogoutButton = ({ className, children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Call logout from AuthContext - this will:
    // 1. Clear the JWT token from memory and cookies
    // 2. Clear user data from state
    // 3. Update isAuthenticated to false
    // 4. Dispatch logout event to all listeners
    logout();
    
    // Navigate to home or login page
    navigate('/signIn');
  };

  return (
    <button 
      onClick={handleLogout} 
      className={className || 'logout-btn'}
      type="button"
    >
      {children || 'Logout'}
    </button>
  );
};

export default LogoutButton;

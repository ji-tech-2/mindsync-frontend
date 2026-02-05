/**
 * LogoutButton Component
 * 
 * Triggers a graceful logout with visual transition overlay.
 * Uses the logoutWithTransition method from AuthContext.
 */

import React from 'react';
import useAuth from '../hooks/useAuth';

const LogoutButton = ({ className, children }) => {
  const { logoutWithTransition } = useAuth();

  const handleLogout = () => {
    logoutWithTransition();
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

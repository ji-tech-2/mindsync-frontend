/**
 * LogoutButton Component
 * 
 * Simply navigates to the /logout route which handles
 * the actual logout process. This pattern ensures we
 * leave protected routes before clearing auth state.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ className, children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
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

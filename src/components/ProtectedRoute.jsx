/**
 * ProtectedRoute - Route Guard Component
 * 
 * Wraps protected routes to ensure only authenticated users can access them.
 * Redirects unauthenticated users to the login page.
 * 
 * During logout transition, this component does NOT redirect to prevent
 * the flash of /signIn page before the logout overlay completes.
 */

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading, isLoggingOut } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user && !isLoggingOut) {
    return <Navigate to="/signIn" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

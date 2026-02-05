/**
 * LogoutHandler - Dedicated logout route component
 * 
 * This component handles the logout process cleanly:
 * 1. User navigates here from any page
 * 2. This route is PUBLIC, so ProtectedRoute doesn't interfere
 * 3. We clear auth state
 * 4. We redirect to home
 * 
 * This pattern eliminates race conditions because by the time
 * auth state is cleared, we've already left any protected routes.
 */

import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LogoutHandler = () => {
  const { logout, isAuthenticated } = useAuth();
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    // Only logout once
    if (!hasLoggedOut.current) {
      hasLoggedOut.current = true;
      logout();
    }
  }, [logout]);

  // Once logged out, redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Brief loading state while logout processes
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>Logging out...</div>
    </div>
  );
};

export default LogoutHandler;

/**
 * ProtectedRoute Component Tests
 *
 * Tests for route protection and authentication guards
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../../stores/AuthContext';
import { TokenManager } from '@/utils/tokenManager';

// Mock TokenManager
vi.mock('@/utils/tokenManager', () => ({
  TokenManager: {
    getUserData: vi.fn(),
    setUserData: vi.fn(),
    clearUserData: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

// Protected content component
const ProtectedContent = () => (
  <div data-testid="protected-content">Protected Content</div>
);

// Login page component
const LoginPage = () => <div data-testid="login-page">Login Page</div>;

// Helper to render protected route
const renderProtectedRoute = (initialRoute = '/protected') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<LoginPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-redirect"
            element={
              <ProtectedRoute redirectTo="/custom-login">
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-login"
            element={<div data-testid="custom-login">Custom Login</div>}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TokenManager.getUserData.mockReturnValue(null);
    TokenManager.isAuthenticated.mockReturnValue(false);
  });

  describe('Unauthenticated User', () => {
    it('should redirect to signIn when not authenticated', async () => {
      renderProtectedRoute('/protected');

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when specified', async () => {
      renderProtectedRoute('/custom-redirect');

      await waitFor(() => {
        expect(screen.getByTestId('custom-login')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated User', () => {
    beforeEach(() => {
      TokenManager.getUserData.mockReturnValue({ email: 'user@example.com' });
      TokenManager.isAuthenticated.mockReturnValue(true);
    });

    it('should render protected content when authenticated', async () => {
      renderProtectedRoute('/protected');

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });
  });
});

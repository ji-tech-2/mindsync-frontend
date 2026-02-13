/**
 * AuthContext Security Tests
 *
 * Tests for authentication state management and navigation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import { TokenManager } from '@/config/api';

// Mock TokenManager
vi.mock('@/config/api', () => ({
  TokenManager: {
    getUserData: vi.fn(),
    setUserData: vi.fn(),
    clearUserData: vi.fn(),
  },
}));

// Helper component to display auth state
const AuthStateDisplay = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div data-testid="loading">Loading...</div>;

  return (
    <div>
      <div data-testid="auth-status">
        {user ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <div data-testid="current-path">{location.pathname}</div>
    </div>
  );
};

// Helper component to trigger auth actions
const AuthActions = () => {
  const { login, logout } = useAuth();

  return (
    <div>
      <button
        onClick={() => login({ email: 'test@example.com', name: 'Test' })}
      >
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

// Helper to render with router
const renderWithAuth = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <AuthStateDisplay />
                <AuthActions />
              </>
            }
          />
          <Route
            path="/signin"
            element={<div data-testid="login-page">Login Page</div>}
          />
          <Route path="/dashboard" element={<AuthStateDisplay />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TokenManager.getUserData.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should show not-authenticated when no user data exists', async () => {
      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent(
          'not-authenticated'
        );
      });
    });

    it('should show authenticated when user data exists', async () => {
      TokenManager.getUserData.mockReturnValue({ email: 'user@example.com' });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent(
          'authenticated'
        );
        expect(screen.getByTestId('user-email')).toHaveTextContent(
          'user@example.com'
        );
      });
    });
  });

  describe('Login Action', () => {
    it('should update state on login', async () => {
      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent(
          'not-authenticated'
        );
      });

      // Click login
      const loginButton = screen.getByRole('button', { name: /login/i });
      act(() => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent(
          'authenticated'
        );
        expect(TokenManager.setUserData).toHaveBeenCalled();
      });
    });
  });

  describe('Logout Action', () => {
    it('should clear user data and state on logout', async () => {
      TokenManager.getUserData.mockReturnValue({ email: 'user@example.com' });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent(
          'authenticated'
        );
      });

      // Click logout
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      act(() => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(TokenManager.clearUserData).toHaveBeenCalled();
        expect(screen.getByTestId('auth-status')).toHaveTextContent(
          'not-authenticated'
        );
        expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      });
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const TestComponent = () => {
        const auth = useAuth();
        return <div>{auth.user?.email || 'no user'}</div>;
      };

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });
  });
});

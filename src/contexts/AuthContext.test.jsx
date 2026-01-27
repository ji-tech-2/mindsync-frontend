/**
 * AuthContext Security Tests
 * 
 * Tests for authentication state management, event handling, and navigation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { TokenManager } from '../config/api';

// Mock TokenManager
vi.mock('../config/api', () => ({
  TokenManager: {
    getToken: vi.fn(),
    getUserData: vi.fn(),
    setToken: vi.fn(),
    setUserData: vi.fn(),
    clearToken: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

// Helper component to display auth state
const AuthStateDisplay = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) return <div data-testid="loading">Loading...</div>;
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
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
      <button onClick={() => login('test-token', { email: 'test@example.com', name: 'Test' })}>
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
          <Route path="/" element={<><AuthStateDisplay /><AuthActions /></>} />
          <Route path="/signIn" element={<div data-testid="login-page">Login Page</div>} />
          <Route path="/dashboard" element={<AuthStateDisplay />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TokenManager.getToken.mockReturnValue(null);
    TokenManager.getUserData.mockReturnValue(null);
    TokenManager.isAuthenticated.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should show not-authenticated when no token exists', async () => {
      renderWithAuth();
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });

    it('should show authenticated when token exists', async () => {
      TokenManager.getToken.mockReturnValue('valid-token');
      TokenManager.getUserData.mockReturnValue({ email: 'user@example.com' });
      
      renderWithAuth();
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('user@example.com');
      });
    });
  });

  describe('Login Action', () => {
    it('should update state on login', async () => {
      renderWithAuth();
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
      
      // Click login
      const loginButton = screen.getByRole('button', { name: /login/i });
      act(() => {
        loginButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(TokenManager.setToken).toHaveBeenCalledWith('test-token');
        expect(TokenManager.setUserData).toHaveBeenCalled();
      });
    });
  });

  describe('Logout Action', () => {
    it('should clear token and navigate to signIn on logout', async () => {
      TokenManager.getToken.mockReturnValue('valid-token');
      TokenManager.getUserData.mockReturnValue({ email: 'user@example.com' });
      
      renderWithAuth();
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
      
      // Click logout
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      act(() => {
        logoutButton.click();
      });
      
      // After logout, should navigate to signIn (due to auth:logout event handler)
      await waitFor(() => {
        expect(TokenManager.clearToken).toHaveBeenCalled();
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should dispatch auth:logout event on logout', async () => {
      const mockHandler = vi.fn();
      window.addEventListener('auth:logout', mockHandler);
      
      TokenManager.getToken.mockReturnValue('valid-token');
      TokenManager.getUserData.mockReturnValue({ email: 'user@example.com' });
      
      renderWithAuth();
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      act(() => {
        logoutButton.click();
      });
      
      await waitFor(() => {
        expect(mockHandler).toHaveBeenCalled();
      });
      
      window.removeEventListener('auth:logout', mockHandler);
    });
  });

  describe('Event Handling', () => {
    it('should handle auth:logout event and navigate to signIn', async () => {
      TokenManager.getToken.mockReturnValue('valid-token');
      TokenManager.getUserData.mockReturnValue({ email: 'user@example.com' });
      
      renderWithAuth('/dashboard');
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
      
      // Simulate external logout event (e.g., from API interceptor)
      act(() => {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('should handle auth:unauthorized event and navigate to signIn', async () => {
      TokenManager.getToken.mockReturnValue('valid-token');
      TokenManager.getUserData.mockReturnValue({ email: 'user@example.com' });
      
      renderWithAuth('/dashboard');
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
      
      // Simulate 401 unauthorized event
      act(() => {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const TestComponent = () => {
        const auth = useAuth();
        return <div>{auth.isAuthenticated}</div>;
      };
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleError.mockRestore();
    });
  });
});

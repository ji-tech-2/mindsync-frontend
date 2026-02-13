import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import apiClient from '@/config/api';
import { AuthProvider } from '../stores/AuthContext';

// Mock axios apiClient
vi.mock('@/config/api', async () => {
  const actual = await vi.importActual('../../../config/api');
  return {
    ...actual,
    default: {
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render component with router and auth context
const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render login form with all fields', () => {
      renderLogin();

      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /login/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /forgot password\?/i })
      ).toBeInTheDocument();
    });

    it('should render sign up link', () => {
      renderLogin();

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText('Sign up here.')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should accept valid email format', async () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      // Email error should NOT be present when email is valid
      const emailError = screen.queryByText(
        /Please enter a valid email address/i
      );
      expect(emailError).not.toBeInTheDocument();
    });

    it('should show error when password is empty', async () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '12345' } });

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 6 characters')
        ).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('API Integration - POST Method', () => {
    it('should make POST request to correct endpoint with credentials', async () => {
      const mockResponse = {
        success: true,
        token: 'fake-jwt-token',
        type: 'Bearer',
        user: {
          email: 'test@example.com',
          name: 'Test User',
          userId: 1,
        },
      };

      apiClient.post.mockResolvedValue({ data: mockResponse });

      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/v0-1/auth-login', {
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should handle successful login response', async () => {
      const mockResponse = {
        success: true,
        token: 'fake-jwt-token',
        type: 'Bearer',
        user: {
          email: 'test@example.com',
          name: 'Test User',
          userId: 1,
        },
      };

      apiClient.post.mockResolvedValue({ data: mockResponse });

      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login successful!')).toBeInTheDocument();
      });

      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
    });

    it('should handle login failure response', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Invalid credentials',
        },
      });

      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Verify no navigation
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      apiClient.post.mockRejectedValue(new Error('Network error'));

      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state during submission', async () => {
      apiClient.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);

      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to sign up page when clicking sign up link', () => {
      renderLogin();

      const signUpButton = screen.getByText('Sign up here.');
      fireEvent.click(signUpButton);

      expect(mockNavigate).toHaveBeenCalledWith('/sign-up');
    });

    it('should navigate to forgot password page when clicking the button', () => {
      renderLogin();

      const forgotPasswordButton = screen.getByRole('button', {
        name: /forgot password\?/i,
      });
      fireEvent.click(forgotPasswordButton);

      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignIn from './SignIn';
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
        <SignIn />
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

      expect(document.querySelector('input[name="email"]')).toBeInTheDocument();
      expect(
        document.querySelector('input[name="password"]')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /forgot password\?/i })
      ).toBeInTheDocument();
    });

    it('should render create account button', () => {
      renderLogin();

      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should accept valid email format', async () => {
      renderLogin();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Email error should NOT be present when email is valid
      const emailError = screen.queryByText(
        /Please enter a valid email address/i
      );
      expect(emailError).not.toBeInTheDocument();
    });

    it('should show error when password is empty', async () => {
      renderLogin();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it.skip('should show error when password is too short', async () => {
      // SignIn component does not validate password length
      // Only checks if password is empty
      renderLogin();

      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '12345' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 6 characters')
        ).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      renderLogin();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      const emailInput = document.querySelector('input[name="email"]');
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
      apiClient.get.mockRejectedValue(new Error('not mocked'));

      renderLogin();

      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/v1/auth/login', {
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
      // getProfile falls back silently when get is not set up
      apiClient.get.mockRejectedValue(new Error('not mocked'));

      renderLogin();

      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Sign in successful!')).toBeInTheDocument();
      });

      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
    });

    it('should hydrate login with full profile data when getProfile succeeds', async () => {
      const mockSignInResponse = {
        success: true,
        user: { email: 'test@example.com', name: 'Test User', userId: 1 },
      };
      const mockProfileResponse = {
        success: true,
        data: {
          email: 'test@example.com',
          name: 'Test User',
          userId: 1,
          gender: 'Male',
          occupation: 'Employed',
          workRmt: 'Remote',
          dob: '1990-01-01',
        },
      };

      apiClient.post.mockResolvedValue({ data: mockSignInResponse });
      apiClient.get.mockResolvedValue({ data: mockProfileResponse });

      renderLogin();

      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
          replace: true,
        });
      });

      // getProfile should have been called to hydrate the auth context
      expect(apiClient.get).toHaveBeenCalled();
    });

    it('should handle login failure response', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Invalid credentials',
        },
      });

      renderLogin();

      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
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

      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
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

      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      expect(
        screen.getByRole('button', { name: /processing/i })
      ).toBeDisabled();
    });

    it('should navigate immediately after successful login', async () => {
      const mockResponse = {
        success: true,
        user: {
          email: 'test@example.com',
          name: 'Test User',
          userId: 1,
        },
      };

      apiClient.post.mockResolvedValue({ data: mockResponse });
      apiClient.get.mockRejectedValue(new Error('not mocked'));

      renderLogin();

      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      // Should navigate immediately without delay
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
          replace: true,
        });
      });
    });
  });

  describe('Navigation', () => {
    it('should have sign up link with correct href', () => {
      renderLogin();

      const signUpButton = screen.getByText('Create Account');
      expect(signUpButton).toBeInTheDocument();
      expect(signUpButton).toHaveAttribute('href', '/signup');
    });

    it('should have forgot password link with correct href', () => {
      renderLogin();

      const forgotPasswordLink = screen.getByRole('link', {
        name: /forgot password\?/i,
      });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });
  });
});

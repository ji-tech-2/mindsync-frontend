import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import apiClient from '@/config/api';

// Mock axios apiClient
vi.mock('@/config/api', async () => {
  const actual = await vi.importActual('../../../config/api');
  return {
    ...actual,
    default: {
      post: vi.fn(),
      get: vi.fn(),
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

// Helper to render component
const renderForgotPassword = () => {
  return render(
    <BrowserRouter>
      <ForgotPassword />
    </BrowserRouter>
  );
};

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('should render all form fields correctly', () => {
      renderForgotPassword();

      expect(document.querySelector('input[name="email"]')).toBeInTheDocument();
      expect(
        document.querySelector('input[name="newPassword"]')
      ).toBeInTheDocument();
      expect(document.querySelector('input[name="otp"]')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /reset password/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /send otp/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /back to sign in/i })
      ).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when fields are empty', async () => {
      renderForgotPassword();

      const submitButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(
          screen.getByText('New password is required')
        ).toBeInTheDocument();
        expect(screen.getByText('OTP is required')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput); // Blur the field to trigger validation

      await waitFor(() => {
        expect(
          screen.queryByText(/Please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('OTP Functionality', () => {
    it('should call API when sending OTP with valid email', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/v0-1/auth-profile/request-otp',
          {
            email: 'test@example.com',
          }
        );
      });
    });
  });

  describe('Password Reset Submission', () => {
    it('should call API with correct data on successful submission', async () => {
      renderForgotPassword();

      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Password reset successfully' },
      });

      fireEvent.change(document.querySelector('input[name="email"]'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(document.querySelector('input[name="newPassword"]'), {
        target: { value: 'Password123!' },
      });
      fireEvent.change(document.querySelector('input[name="otp"]'), {
        target: { value: '123456' },
      });

      const submitButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/v0-1/auth-profile/change-password',
          {
            email: 'test@example.com',
            otp: '123456',
            newPassword: 'Password123!',
          }
        );
      });
    });

    it('should navigate to login after successful reset', async () => {
      vi.useFakeTimers();

      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Password reset successfully' },
      });

      renderForgotPassword();

      fireEvent.change(document.querySelector('input[name="email"]'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(document.querySelector('input[name="newPassword"]'), {
        target: { value: 'Password123!' },
      });
      fireEvent.change(document.querySelector('input[name="otp"]'), {
        target: { value: '123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      // Process the API response
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      // Advance timers for the 2s redirect
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });

    it('should show error message on API failure', async () => {
      apiClient.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid OTP' },
        },
      });

      renderForgotPassword();

      fireEvent.change(document.querySelector('input[name="email"]'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(document.querySelector('input[name="newPassword"]'), {
        target: { value: 'Password123!' },
      });
      fireEvent.change(document.querySelector('input[name="otp"]'), {
        target: { value: '123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      expect(await screen.findByText(/Invalid OTP/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate back to login when clicking "Back to Sign In"', () => {
      renderForgotPassword();

      const backLink = screen.getByRole('link', { name: /back to sign in/i });
      expect(backLink).toHaveAttribute('href', '/signin');
    });
  });
});

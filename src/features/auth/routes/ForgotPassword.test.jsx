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

      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /reset password/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /send otp/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /back to login/i })
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

      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const submitButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(submitButton);

      expect(
        await screen.findByText(/Please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  describe('OTP Functionality', () => {
    it('should show error when sending OTP without email', async () => {
      renderForgotPassword();

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      expect(
        await screen.findByText(/Please enter your email first/i)
      ).toBeInTheDocument();
    });

    it('should call API when sending OTP with valid email', async () => {
      renderForgotPassword();

      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'OTP sent successfully' },
      });

      const emailInput = screen.getByPlaceholderText('Email');
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
        expect(screen.getByText('OTP sent successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Password Reset Submission', () => {
    it('should call API with correct data on successful submission', async () => {
      renderForgotPassword();

      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Password reset successfully' },
      });

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('New Password'), {
        target: { value: 'Password123!' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
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

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('New Password'), {
        target: { value: 'Password123!' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
        target: { value: '123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      // Process the API response
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(
        screen.getByText(/Password reset successfully/i)
      ).toBeInTheDocument();

      // Advance timers for the 2s redirect
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/signIn');
    });

    it('should show error message on API failure', async () => {
      apiClient.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid OTP' },
        },
      });

      renderForgotPassword();

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('New Password'), {
        target: { value: 'Password123!' },
      });
      fireEvent.change(screen.getByPlaceholderText('Enter OTP'), {
        target: { value: '123456' },
      });

      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

      expect(await screen.findByText(/Invalid OTP/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate back to login when clicking "Back to Login"', () => {
      renderForgotPassword();

      const backButton = screen.getByRole('button', { name: /back to login/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/signIn');
    });
  });
});

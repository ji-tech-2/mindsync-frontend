import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Helper to render component with router
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
  });

  describe('Stage 1: Email Input', () => {
    it('should render the page header', () => {
      renderForgotPassword();

      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(
        screen.getByText('Create a new password for your account')
      ).toBeInTheDocument();
    });

    it('should render Stage 1 email field on initial load', () => {
      renderForgotPassword();

      expect(document.querySelector('input[name="email"]')).toBeInTheDocument();
    });

    it('should render "Send OTP" button on Stage 1', () => {
      renderForgotPassword();

      expect(
        screen.getByRole('button', { name: /send otp/i })
      ).toBeInTheDocument();
    });

    it('should render the sign-in link', () => {
      renderForgotPassword();

      expect(screen.getByText('Remember your password?')).toBeInTheDocument();
      expect(screen.getByText('Back to Sign In')).toBeInTheDocument();
      expect(screen.getByText('Back to Sign In')).toHaveAttribute(
        'href',
        '/signin'
      );
    });

    it('should not render OTP or password fields on initial load', () => {
      renderForgotPassword();

      expect(
        document.querySelector('input[name="otp"]')
      ).not.toBeInTheDocument();
      expect(
        document.querySelector('input[name="newPassword"]')
      ).not.toBeInTheDocument();
      expect(
        document.querySelector('input[name="confirmPassword"]')
      ).not.toBeInTheDocument();
    });
  });

  describe('Stage 1: Email Validation', () => {
    it('should show error when email is empty and Send OTP is clicked', async () => {
      renderForgotPassword();

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeInTheDocument();
      });
    });

    it('should show email validation error on blur', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'bad' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid email address')
        ).toBeInTheDocument();
      });
    });

    it('should not show error for valid email', () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, {
        target: { value: 'user@example.com' },
      });
      fireEvent.blur(emailInput);

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Please enter a valid email address')
      ).not.toBeInTheDocument();
    });
  });

  describe('Stage 1 → Stage 2: Send OTP Transition', () => {
    it('should call API and transition to Stage 2 on successful OTP send', async () => {
      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'OTP sent successfully!' },
      });

      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, {
        target: { value: 'user@example.com' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/v0-1/auth-profile/request-otp',
          { email: 'user@example.com' }
        );
      });

      // Stage 2 OTP field should appear
      await waitFor(() => {
        expect(document.querySelector('input[name="otp"]')).toBeInTheDocument();
      });
    });

    it('should show error message on OTP send failure', async () => {
      apiClient.post.mockRejectedValueOnce({
        response: { data: { message: 'Email not found' } },
      });

      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, {
        target: { value: 'unknown@example.com' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(screen.getByText('Email not found')).toBeInTheDocument();
      });
    });

    it('should show generic error on network failure', async () => {
      apiClient.post.mockRejectedValueOnce(new Error('Network Error'));

      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, {
        target: { value: 'user@example.com' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to send OTP')).toBeInTheDocument();
      });
    });

    it('should show "Sending..." while loading', async () => {
      // Create a promise that won't resolve immediately
      let resolvePost;
      apiClient.post.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePost = resolve;
          })
      );

      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, {
        target: { value: 'user@example.com' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
      });

      // Resolve the promise to clean up
      resolvePost({ data: { success: true, message: 'OTP sent!' } });

      await waitFor(() => {
        expect(screen.queryByText('Sending...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Stage 2: OTP Input', () => {
    // Helper to reach Stage 2
    const goToStage2 = async () => {
      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'OTP sent successfully!' },
      });

      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, {
        target: { value: 'user@example.com' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(document.querySelector('input[name="otp"]')).toBeInTheDocument();
      });
    };

    it('should render OTP field, Next button, and Resend OTP button', async () => {
      await goToStage2();

      expect(document.querySelector('input[name="otp"]')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /resend otp/i })
      ).toBeInTheDocument();
    });

    it('should show error when OTP is empty and Next is clicked', async () => {
      await goToStage2();

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('OTP is required')).toBeInTheDocument();
      });
    });

    it('should show OTP validation error on blur', async () => {
      await goToStage2();

      const otpInput = document.querySelector('input[name="otp"]');
      fireEvent.focus(otpInput);
      fireEvent.blur(otpInput);

      await waitFor(() => {
        expect(screen.getByText('OTP is required')).toBeInTheDocument();
      });
    });

    it('should resend OTP when Resend OTP is clicked', async () => {
      await goToStage2();

      // Mock the second API call for resend
      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'OTP resent!' },
      });

      const resendButton = screen.getByRole('button', {
        name: /resend otp/i,
      });
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledTimes(2);
        expect(apiClient.post).toHaveBeenLastCalledWith(
          '/v0-1/auth-profile/request-otp',
          { email: 'user@example.com' }
        );
      });
    });

    it('should go back to Stage 1 when Back button is clicked', async () => {
      await goToStage2();

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(
          document.querySelector('input[name="email"]')
        ).toBeInTheDocument();
        expect(
          document.querySelector('input[name="otp"]')
        ).not.toBeInTheDocument();
      });
    });

    it('should transition to Stage 3 when OTP is filled and Next is clicked', async () => {
      await goToStage2();

      const otpInput = document.querySelector('input[name="otp"]');
      fireEvent.change(otpInput, { target: { value: '123456' } });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(
          document.querySelector('input[name="newPassword"]')
        ).toBeInTheDocument();
        expect(
          document.querySelector('input[name="confirmPassword"]')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Stage 3: New Password', () => {
    // Helper to reach Stage 3
    const goToStage3 = async () => {
      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'OTP sent successfully!' },
      });

      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, {
        target: { value: 'user@example.com' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(document.querySelector('input[name="otp"]')).toBeInTheDocument();
      });

      const otpInput = document.querySelector('input[name="otp"]');
      fireEvent.change(otpInput, { target: { value: '123456' } });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(
          document.querySelector('input[name="newPassword"]')
        ).toBeInTheDocument();
      });
    };

    it('should render password fields, Back button, and Reset Password button', async () => {
      await goToStage3();

      expect(
        document.querySelector('input[name="newPassword"]')
      ).toBeInTheDocument();
      expect(
        document.querySelector('input[name="confirmPassword"]')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /reset password/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('should show error when new password is empty', async () => {
      await goToStage3();

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(
          screen.getByText('New password is required')
        ).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      await goToStage3();

      const passwordInput = document.querySelector('input[name="newPassword"]');
      fireEvent.change(passwordInput, { target: { value: 'Pass1' } });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 8 characters')
        ).toBeInTheDocument();
      });
    });

    it('should show error when password lacks required characters', async () => {
      await goToStage3();

      const passwordInput = document.querySelector('input[name="newPassword"]');
      fireEvent.change(passwordInput, {
        target: { value: 'password123' },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Password must contain at least one uppercase, one lowercase, and one number/i
          )
        ).toBeInTheDocument();
      });
    });

    it('should show error when confirm password is empty', async () => {
      await goToStage3();

      const passwordInput = document.querySelector('input[name="newPassword"]');
      fireEvent.change(passwordInput, {
        target: { value: 'ValidPass1' },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please confirm your password')
        ).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      await goToStage3();

      const passwordInput = document.querySelector('input[name="newPassword"]');
      fireEvent.change(passwordInput, {
        target: { value: 'ValidPass1' },
      });

      const confirmInput = document.querySelector(
        'input[name="confirmPassword"]'
      );
      fireEvent.change(confirmInput, {
        target: { value: 'DifferentPass1' },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should go back to Stage 2 when Back button is clicked', async () => {
      await goToStage3();

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(document.querySelector('input[name="otp"]')).toBeInTheDocument();
        expect(
          document.querySelector('input[name="newPassword"]')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Reset Submission', () => {
    // Helper to reach Stage 3 with valid data
    const goToStage3WithData = async () => {
      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'OTP sent successfully!' },
      });

      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, {
        target: { value: 'user@example.com' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(document.querySelector('input[name="otp"]')).toBeInTheDocument();
      });

      const otpInput = document.querySelector('input[name="otp"]');
      fireEvent.change(otpInput, { target: { value: '123456' } });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(
          document.querySelector('input[name="newPassword"]')
        ).toBeInTheDocument();
      });
    };

    it('should submit password reset and navigate on success', async () => {
      await goToStage3WithData();

      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Password reset successfully!' },
      });

      const passwordInput = document.querySelector('input[name="newPassword"]');
      fireEvent.change(passwordInput, {
        target: { value: 'NewPassword1' },
      });

      const confirmInput = document.querySelector(
        'input[name="confirmPassword"]'
      );
      fireEvent.change(confirmInput, {
        target: { value: 'NewPassword1' },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/v0-1/auth-profile/change-password',
          {
            email: 'user@example.com',
            otp: '123456',
            newPassword: 'NewPassword1',
          }
        );
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/signin');
      });
    });

    it('should show error message when API returns success false', async () => {
      await goToStage3WithData();

      apiClient.post.mockResolvedValueOnce({
        data: { success: false, message: 'Invalid OTP' },
      });

      const passwordInput = document.querySelector('input[name="newPassword"]');
      fireEvent.change(passwordInput, {
        target: { value: 'NewPassword1' },
      });

      const confirmInput = document.querySelector(
        'input[name="confirmPassword"]'
      );
      fireEvent.change(confirmInput, {
        target: { value: 'NewPassword1' },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
      });

      // Should NOT navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show error message on API rejection', async () => {
      await goToStage3WithData();

      apiClient.post.mockRejectedValueOnce({
        response: { data: { message: 'OTP expired' } },
      });

      const passwordInput = document.querySelector('input[name="newPassword"]');
      fireEvent.change(passwordInput, {
        target: { value: 'NewPassword1' },
      });

      const confirmInput = document.querySelector(
        'input[name="confirmPassword"]'
      );
      fireEvent.change(confirmInput, {
        target: { value: 'NewPassword1' },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('OTP expired')).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show generic error on network failure', async () => {
      await goToStage3WithData();

      apiClient.post.mockRejectedValueOnce(new Error('Network Error'));

      const passwordInput = document.querySelector('input[name="newPassword"]');
      fireEvent.change(passwordInput, {
        target: { value: 'NewPassword1' },
      });

      const confirmInput = document.querySelector(
        'input[name="confirmPassword"]'
      );
      fireEvent.change(confirmInput, {
        target: { value: 'NewPassword1' },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(
          screen.getByText('Failed to reset password')
        ).toBeInTheDocument();
      });
    });

    it('should show "Resetting..." while loading', async () => {
      await goToStage3WithData();

      let resolvePost;
      apiClient.post.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePost = resolve;
          })
      );

      const passwordInput = document.querySelector('input[name="newPassword"]');
      fireEvent.change(passwordInput, {
        target: { value: 'NewPassword1' },
      });

      const confirmInput = document.querySelector(
        'input[name="confirmPassword"]'
      );
      fireEvent.change(confirmInput, {
        target: { value: 'NewPassword1' },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('Resetting...')).toBeInTheDocument();
      });

      // Resolve to clean up
      resolvePost({
        data: { success: true, message: 'Done!' },
      });

      await waitFor(() => {
        expect(screen.queryByText('Resetting...')).not.toBeInTheDocument();
      });
    });
  });
});

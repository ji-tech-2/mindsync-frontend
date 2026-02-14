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

  describe('Stage 1: Email Entry', () => {
    it('should render Stage 1 with email field on initial load', () => {
      renderForgotPassword();

      // Stage 1 fields should be present
      expect(document.querySelector('input[name="email"]')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /send otp/i })
      ).toBeInTheDocument();

      // Stage 2 & 3 fields should not be present
      expect(
        document.querySelector('input[name="otp"]')
      ).not.toBeInTheDocument();
      expect(
        document.querySelector('input[name="newPassword"]')
      ).not.toBeInTheDocument();
    });

    it('should have back to sign in link on Stage 1', () => {
      renderForgotPassword();

      const backLink = screen.getByRole('link', { name: /back to sign in/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/signin');
    });
  });

  describe('Stage 1 to Stage 2 Transition', () => {
    it('should show error when email is empty', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: '' } });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(
          screen.queryByText(/Please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it('should call API when sending OTP with valid email', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValue({
        data: { success: true, message: 'OTP sent' },
      });

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

    it('should transition to Stage 2 after sending OTP', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValue({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(document.querySelector('input[name="otp"]')).toBeInTheDocument();
      });
    });

    it('should show Back button on Stage 2', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValue({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Stage 2: OTP Entry', () => {
    it('should render OTP field on Stage 2', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValue({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(document.querySelector('input[name="otp"]')).toBeInTheDocument();
      });
    });

    it('should return to Stage 1 when clicking Back', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValue({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(
          document.querySelector('input[name="email"]')
        ).toBeInTheDocument();
        expect(
          document.querySelector('input[name="otp"]')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Stage 2 to Stage 3 Transition', () => {
    it('should show error when OTP is empty', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValue({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(screen.getByText('OTP is required')).toBeInTheDocument();
      });
    });

    it('should transition to Stage 3 after valid OTP', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValue({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        const otpInput = document.querySelector('input[name="otp"]');
        fireEvent.change(otpInput, { target: { value: '123456' } });
      });

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

  describe('Stage 3: Password Reset', () => {
    it('should render password fields on Stage 3', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValue({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        const otpInput = document.querySelector('input[name="otp"]');
        fireEvent.change(otpInput, { target: { value: '123456' } });
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(
          document.querySelector('input[name="newPassword"]')
        ).toBeInTheDocument();
        expect(
          document.querySelector('input[name="confirmPassword"]')
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /reset password/i })
        ).toBeInTheDocument();
      });
    });

    it('should show error when new password is empty on Stage 3', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValue({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        const otpInput = document.querySelector('input[name="otp"]');
        fireEvent.change(otpInput, { target: { value: '123456' } });
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        const resetButton = screen.getByRole('button', {
          name: /reset password/i,
        });
        fireEvent.click(resetButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/New password is required|Password is required/i)
        ).toBeInTheDocument();
      });
    });

    it('should return to Stage 2 when clicking Back on Stage 3', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValue({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        const otpInput = document.querySelector('input[name="otp"]');
        fireEvent.change(otpInput, { target: { value: '123456' } });
      });

      let nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(document.querySelector('input[name="otp"]')).toBeInTheDocument();
        expect(
          document.querySelector('input[name="newPassword"]')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Reset Submission', () => {
    it('should call API with correct data on successful submission', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        const otpInput = document.querySelector('input[name="otp"]');
        fireEvent.change(otpInput, { target: { value: '123456' } });
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        const newPasswordInput = document.querySelector(
          'input[name="newPassword"]'
        );
        const confirmPasswordInput = document.querySelector(
          'input[name="confirmPassword"]'
        );
        fireEvent.change(newPasswordInput, {
          target: { value: 'Password123!' },
        });
        fireEvent.change(confirmPasswordInput, {
          target: { value: 'Password123!' },
        });
      });

      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Password reset successfully' },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

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

    it('should navigate to login after successful password reset', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        const otpInput = document.querySelector('input[name="otp"]');
        fireEvent.change(otpInput, { target: { value: '123456' } });
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        const newPasswordInput = document.querySelector(
          'input[name="newPassword"]'
        );
        const confirmPasswordInput = document.querySelector(
          'input[name="confirmPassword"]'
        );
        fireEvent.change(newPasswordInput, {
          target: { value: 'Password123!' },
        });
        fireEvent.change(confirmPasswordInput, {
          target: { value: 'Password123!' },
        });
      });

      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'Password reset successfully' },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

      // Wait for navigation to be called (after 2s timeout in component)
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/signin');
        },
        { timeout: 3000 }
      );
    });

    it('should show error message on API failure', async () => {
      renderForgotPassword();

      const emailInput = document.querySelector('input[name="email"]');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      apiClient.post.mockResolvedValueOnce({
        data: { success: true, message: 'OTP sent' },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        const otpInput = document.querySelector('input[name="otp"]');
        fireEvent.change(otpInput, { target: { value: '123456' } });
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        const newPasswordInput = document.querySelector(
          'input[name="newPassword"]'
        );
        const confirmPasswordInput = document.querySelector(
          'input[name="confirmPassword"]'
        );
        fireEvent.change(newPasswordInput, {
          target: { value: 'Password123!' },
        });
        fireEvent.change(confirmPasswordInput, {
          target: { value: 'Password123!' },
        });
      });

      apiClient.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Invalid OTP' },
        },
      });

      const resetButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetButton);

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

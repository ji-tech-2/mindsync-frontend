import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OTPInput from './OTPInput';

describe('OTPInput Component', () => {
  const mockOnOtpChange = vi.fn();
  const mockOnSendOTP = vi.fn();

  beforeEach(() => {
    mockOnOtpChange.mockClear();
    mockOnSendOTP.mockClear();
  });

  it('should render OTP input field', () => {
    render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={false}
      />
    );

    expect(screen.getByPlaceholderText(/enter otp/i)).toBeInTheDocument();
  });

  it('should render Send OTP button', () => {
    render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={false}
      />
    );

    expect(screen.getByRole('button', { name: /send otp/i })).toBeInTheDocument();
  });

  it('should display OTP Code label', () => {
    render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={false}
      />
    );

    expect(screen.getByText('OTP Code')).toBeInTheDocument();
  });

  it('should display OTP value in input', () => {
    render(
      <OTPInput
        otpValue="123456"
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={false}
      />
    );

    const input = screen.getByPlaceholderText(/enter otp/i);
    expect(input).toHaveValue('123456');
  });

  it('should call onOtpChange when input value changes', () => {
    render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={false}
      />
    );

    const input = screen.getByPlaceholderText(/enter otp/i);
    fireEvent.change(input, { target: { value: '654321' } });

    expect(mockOnOtpChange).toHaveBeenCalledTimes(1);
  });

  it('should call onSendOTP when Send OTP button clicked', () => {
    render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={false}
      />
    );

    const button = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(button);

    expect(mockOnSendOTP).toHaveBeenCalledTimes(1);
  });

  it('should disable Send OTP button when loading', () => {
    render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={true}
      />
    );

    const button = screen.getByRole('button', { name: /send otp/i });
    expect(button).toBeDisabled();
  });

  it('should disable Send OTP button when email is empty', () => {
    render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue=""
        loading={false}
      />
    );

    const button = screen.getByRole('button', { name: /send otp/i });
    expect(button).toBeDisabled();
  });

  it('should enable Send OTP button when email is provided and not loading', () => {
    render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={false}
      />
    );

    const button = screen.getByRole('button', { name: /send otp/i });
    expect(button).not.toBeDisabled();
  });

  it('should require OTP input', () => {
    render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={false}
      />
    );

    const input = screen.getByPlaceholderText(/enter otp/i);
    expect(input).toBeRequired();
  });

  it('should have proper CSS classes', () => {
    const { container } = render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={false}
      />
    );

    expect(container.querySelector('.form-group')).toBeInTheDocument();
    expect(container.querySelector('.otp-input-group')).toBeInTheDocument();
    expect(container.querySelector('.otp-btn')).toBeInTheDocument();
  });

  it('should not submit form when Send OTP button clicked', () => {
    render(
      <OTPInput
        otpValue=""
        onOtpChange={mockOnOtpChange}
        onSendOTP={mockOnSendOTP}
        emailValue="test@example.com"
        loading={false}
      />
    );

    const button = screen.getByRole('button', { name: /send otp/i });
    expect(button).toHaveAttribute('type', 'button');
  });
});

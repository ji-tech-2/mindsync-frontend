import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/forgotPassword.css';
import apiClient from '@/config/api';
import { getPasswordError } from '@/utils/passwordValidation';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const sendOTP = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email first');
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await apiClient.post('/v0-1/auth-profile/request-otp', {
        email: email,
      });

      if (response.data.success) {
        setMessage(response.data.message || 'OTP sent successfully!');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setMessage(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    const passwordValidationError = getPasswordError(newPassword);
    if (!newPassword) {
      newErrors.password = 'New password is required';
    } else if (passwordValidationError) {
      newErrors.password = passwordValidationError;
    }

    // OTP validation
    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      const response = await apiClient.post(
        '/v0-1/auth-profile/change-password',
        {
          email: email,
          otp: otp,
          newPassword: newPassword,
        }
      );

      if (response.data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setMessage(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-wrapper">
      <div className="forgot-password-container">
        <h2>Reset Password</h2>

        <form
          onSubmit={handleSubmit}
          className="forgot-password-form"
          noValidate
        >
          <div className="form-field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-field">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-field">
            <div className="otp-input-wrapper">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  if (errors.otp) setErrors({ ...errors, otp: '' });
                }}
                className={errors.otp ? 'input-error otp-input' : 'otp-input'}
              />
              <button
                type="button"
                className="otp-send-btn"
                onClick={sendOTP}
                disabled={loading}
              >
                Send OTP
              </button>
            </div>
            {errors.otp && <span className="error-text">{errors.otp}</span>}
          </div>

          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {message && (
          <p
            className={`forgot-password-message ${message.includes('success') || message.includes('sent') ? 'success' : 'error'}`}
          >
            {message}
          </p>
        )}

        <div className="back-to-login-container">
          <p>Remember your password?</p>
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="back-to-login-btn"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

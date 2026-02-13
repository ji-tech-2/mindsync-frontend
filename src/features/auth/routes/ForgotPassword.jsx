import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/api';
import { getPasswordError } from '@/utils/passwordValidation';
import { TextField, Button, ErrorMessage, Link } from '@/components';
import PasswordField from '../components/PasswordField';
import AuthPageLayout from '../components/AuthPageLayout';
import PageHeader from '../components/PageHeader';
import FormContainer from '../components/FormContainer';
import FormSection from '../components/FormSection';
import ErrorAlert from '../components/ErrorAlert';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Create refs for form fields
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const otpRef = useRef(null);

  const [form, setForm] = useState({
    email: '',
    newPassword: '',
    otp: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [blurredFields, setBlurredFields] = useState({});
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (fieldName) => {
    setBlurredFields((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  const validateField = (fieldName) => {
    const newErrors = { ...errors };

    if (fieldName === 'email' || fieldName === 'all') {
      if (!form.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors.email;
      }
    }

    if (fieldName === 'newPassword' || fieldName === 'all') {
      const passwordError = getPasswordError(form.newPassword);
      if (!form.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (passwordError) {
        newErrors.newPassword = passwordError;
      } else {
        delete newErrors.newPassword;
      }
    }

    if (fieldName === 'otp' || fieldName === 'all') {
      if (!form.otp.trim()) {
        newErrors.otp = 'OTP is required';
      } else {
        delete newErrors.otp;
      }
    }

    setErrors(newErrors);
  };

  const scrollToFirstError = (formErrors) => {
    if (Object.keys(formErrors).length === 0) return;

    const firstErrorField = Object.keys(formErrors)[0];
    const refMap = {
      email: emailRef,
      newPassword: passwordRef,
      otp: otpRef,
    };

    if (refMap[firstErrorField]?.current) {
      refMap[firstErrorField].current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const sendOTP = async () => {
    if (!form.email.trim()) {
      setMessage('Please enter your email first');
      setIsError(true);
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setMessage('Please enter a valid email address');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await apiClient.post('/v0-1/auth-profile/request-otp', {
        email: form.email,
      });

      if (response.data.success) {
        setMessage(response.data.message || 'OTP sent successfully!');
        setIsError(false);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setMessage(error.response?.data?.message || 'Failed to send OTP');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as blurred
    setBlurredFields({
      email: true,
      newPassword: true,
      otp: true,
    });

    // Validate form
    validateField('all');

    // Check for errors
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await apiClient.post(
        '/v0-1/auth-profile/change-password',
        {
          email: form.email,
          otp: form.otp,
          newPassword: form.newPassword,
        }
      );

      if (response.data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setIsError(false);
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setMessage(response.data.message || 'Failed to reset password');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage(error.response?.data?.message || 'Failed to reset password');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <PageHeader
        title="Reset Password"
        subtitle="Enter your email and OTP to set a new password"
      />

      <FormContainer onSubmit={handleSubmit}>
        <FormSection ref={emailRef}>
          <TextField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            error={blurredFields.email && !!errors.email}
            fullWidth
          />
          {blurredFields.email && errors.email && (
            <ErrorMessage message={errors.email} />
          )}
        </FormSection>

        <FormSection ref={passwordRef}>
          <PasswordField
            label="New Password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            onBlur={() => handleBlur('newPassword')}
            error={blurredFields.newPassword && !!errors.newPassword}
            fullWidth
          />
          {blurredFields.newPassword && errors.newPassword && (
            <ErrorMessage message={errors.newPassword} />
          )}
        </FormSection>

        <FormSection ref={otpRef}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ flex: 1 }}>
              <TextField
                label="OTP"
                type="text"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                onBlur={() => handleBlur('otp')}
                error={blurredFields.otp && !!errors.otp}
                style={{ marginTop: 'var(--border-md)' }}
                fullWidth
              />
              {blurredFields.otp && errors.otp && (
                <ErrorMessage message={errors.otp} />
              )}
            </div>
            <Button
              type="button"
              variant="outlined"
              onClick={sendOTP}
              disabled={loading || !form.email}
            >
              Send OTP
            </Button>
          </div>
        </FormSection>

        <Button type="submit" variant="filled" fullWidth disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </FormContainer>

      {/* Back to Login Link */}
      <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
        Remember your password? <Link href="/signin">Back to Sign In</Link>
      </p>

      <ErrorAlert message={message} show={isError} />
    </AuthPageLayout>
  );
}

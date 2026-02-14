import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/config/api';
import { getPasswordError } from '@/utils/passwordValidation';
import { TextField, Button, Message, Link } from '@/components';
import PasswordField from '../components/PasswordField';
import AuthPageLayout from '../components/AuthPageLayout';
import PageHeader from '../components/PageHeader';
import FormContainer from '../components/FormContainer';
import FormSection from '../components/FormSection';
import ErrorAlert from '../components/ErrorAlert';
import StageContainer from '../components/StageContainer';
import BackButton from '../components/BackButton';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Create refs for form fields
  const emailRef = useRef(null);
  const otpRef = useRef(null);
  const passwordRef = useRef(null);

  const [form, setForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [blurredFields, setBlurredFields] = useState({});
  const [isError, setIsError] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [isGoingBack, setIsGoingBack] = useState(false);

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

    if (fieldName === 'otp' || fieldName === 'all') {
      if (!form.otp.trim()) {
        newErrors.otp = 'OTP is required';
      } else {
        delete newErrors.otp;
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

    if (fieldName === 'confirmPassword' || fieldName === 'all') {
      if (!form.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (form.confirmPassword !== form.newPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  // Stage 1: Email validation
  const validateStage1 = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    return newErrors;
  };

  // Stage 2: OTP validation
  const validateStage2 = () => {
    const newErrors = {};
    if (!form.otp.trim()) {
      newErrors.otp = 'OTP is required';
    }
    return newErrors;
  };

  // Stage 3: Password validation
  const validateStage3 = () => {
    const newErrors = {};

    const passwordError = getPasswordError(form.newPassword);
    if (!form.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleNextStage = () => {
    let stageErrors = {};

    if (currentStage === 0) {
      stageErrors = validateStage1();
      setBlurredFields({ email: true });
    } else if (currentStage === 1) {
      stageErrors = validateStage2();
      setBlurredFields((prev) => ({ ...prev, otp: true }));
    }

    setErrors(stageErrors);

    if (Object.keys(stageErrors).length === 0) {
      setIsGoingBack(false);
      setCurrentStage(currentStage + 1);
    } else {
      scrollToFirstError(stageErrors, currentStage);
    }
  };

  const handlePreviousStage = () => {
    setIsGoingBack(true);
    setCurrentStage(currentStage - 1);
    setErrors({});
  };

  const scrollToFirstError = (errorObj, stage) => {
    let refMap = {};

    if (stage === 0) {
      refMap = { email: emailRef };
    } else if (stage === 1) {
      refMap = { otp: otpRef };
    } else if (stage === 2) {
      refMap = { newPassword: passwordRef, confirmPassword: passwordRef };
    }

    const firstErrorField = Object.keys(errorObj)[0];
    const ref = refMap[firstErrorField];

    if (ref?.current) {
      if (typeof ref.current.scrollIntoView === 'function') {
        ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }

      if (ref.current.querySelector('input')) {
        ref.current.querySelector('input').focus();
      }
    }
  };

  const sendOTP = async () => {
    // Validate stage 1 first
    const stage1Errors = validateStage1();

    setBlurredFields({ email: true });

    if (Object.keys(stage1Errors).length > 0) {
      setErrors(stage1Errors);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);
    setErrors({});

    try {
      const response = await apiClient.post('/v0-1/auth-profile/request-otp', {
        email: form.email,
      });

      if (response.data.success) {
        setMessage(response.data.message || 'OTP sent successfully!');
        setIsError(false);
        // Proceed to next stage
        setIsGoingBack(false);
        setCurrentStage(1);
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

    // Validate stage 3
    const stage3Errors = validateStage3();

    setBlurredFields((prev) => ({
      ...prev,
      newPassword: true,
      confirmPassword: true,
    }));

    setErrors(stage3Errors);

    if (Object.keys(stage3Errors).length > 0) {
      scrollToFirstError(stage3Errors, 2);
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

  // STAGE 1: Email
  const stage1 = (
    <>
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
          <Message type="error" message={errors.email} />
        )}
      </FormSection>

      <Button
        type="button"
        variant="filled"
        fullWidth
        onClick={sendOTP}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </Button>
    </>
  );

  // STAGE 2: OTP
  const stage2 = (
    <>
      <FormSection ref={otpRef}>
        <TextField
          label="One-Time Password"
          type="text"
          name="otp"
          value={form.otp}
          onChange={handleChange}
          onBlur={() => handleBlur('otp')}
          error={blurredFields.otp && !!errors.otp}
          fullWidth
        />
        {blurredFields.otp && errors.otp && (
          <Message type="error" message={errors.otp} />
        )}
      </FormSection>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center',
        }}
      >
        <BackButton onClick={handlePreviousStage} />
        <Button
          type="button"
          variant="filled"
          fullWidth
          onClick={handleNextStage}
          disabled={loading}
        >
          Next
        </Button>
      </div>
    </>
  );

  // STAGE 3: New Password
  const stage3 = (
    <>
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
          <Message type="error" message={errors.newPassword} />
        )}
      </FormSection>

      <FormSection>
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={() => handleBlur('confirmPassword')}
          error={blurredFields.confirmPassword && !!errors.confirmPassword}
          fullWidth
        />
        {blurredFields.confirmPassword && errors.confirmPassword && (
          <Message type="error" message={errors.confirmPassword} />
        )}
      </FormSection>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center',
        }}
      >
        <BackButton onClick={handlePreviousStage} />
        <Button
          type="submit"
          variant="filled"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </div>
    </>
  );

  return (
    <AuthPageLayout>
      <PageHeader
        title="Reset Password"
        subtitle="Create a new password for your account"
      />

      <FormContainer onSubmit={handleSubmit}>
        <StageContainer
          stages={[stage1, stage2, stage3]}
          currentStage={currentStage}
          isGoingBack={isGoingBack}
        />
      </FormContainer>

      {/* Back to Login Link */}
      <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
        Remember your password? <Link href="/signin">Back to Sign In</Link>
      </p>

      <ErrorAlert message={message} show={isError} />
    </AuthPageLayout>
  );
}

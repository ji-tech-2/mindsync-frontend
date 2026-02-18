import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  requestOTP as requestOTPService,
  resetPassword as resetPasswordService,
  verifyOTP as verifyOTPService,
} from '@/services';
import { Message, Link, FormContainer, StageContainer } from '@/components';
import AuthPageLayout from '../components/AuthPageLayout';
import PageHeader from '../components/PageHeader';
import { validateForgotPasswordField } from '../utils/forgotPasswordHelpers';
import {
  getStageValidator,
  getStageBlurredFields,
  scrollToFirstError as scrollToError,
  validateEmailStage,
  handleOTPRequest,
  handlePasswordReset,
} from '../utils/forgotPasswordValidation';
import {
  EmailStage,
  OTPStage,
  PasswordStage,
} from '../components/ForgotPasswordStages';

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (fieldName) => {
    setBlurredFields((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  const validateField = (fieldName) => {
    setErrors(validateForgotPasswordField(fieldName, form, errors));
  };

  const refs = { emailRef, otpRef, passwordRef };

  const handleNextStage = async () => {
    const validator = getStageValidator(currentStage, form);
    const stageErrors = validator();

    setBlurredFields(getStageBlurredFields(currentStage, blurredFields));
    setErrors(stageErrors);

    const hasErrors = Object.keys(stageErrors).length > 0;
    if (hasErrors) {
      scrollToError(stageErrors, currentStage, refs);
      return;
    }

    // Special handling for OTP stage (stage 1): verify OTP before proceeding
    if (currentStage === 1) {
      setLoading(true);
      setMessage('');
      setIsError(false);

      try {
        const data = await verifyOTPService(form.email, form.otp);

        if (data.success) {
          setMessage('OTP verified successfully!');
          setIsError(false);
          setIsGoingBack(false);
          setCurrentStage(currentStage + 1);
        } else {
          setMessage(data.message || 'Invalid OTP');
          setIsError(true);
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
        const errorMessage =
          error.response?.data?.message || 'Invalid OTP. Please try again.';
        setMessage(errorMessage);
        setIsError(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    setIsGoingBack(false);
    setCurrentStage(currentStage + 1);
  };

  const handlePreviousStage = () => {
    setIsGoingBack(true);
    setCurrentStage(currentStage - 1);
    setErrors({});
  };

  const validateAndCheckErrors = (isResend) => {
    if (isResend) return null;

    const stage1Errors = validateEmailStage(form.email);
    setBlurredFields({ email: true });

    if (Object.keys(stage1Errors).length > 0) {
      setErrors(stage1Errors);
      return stage1Errors;
    }
    return null;
  };

  const sendOTP = async (isResend = false) => {
    const validationErrors = validateAndCheckErrors(isResend);
    if (validationErrors) return;

    setLoading(true);
    setMessage('');
    setIsError(false);
    setErrors({});

    await handleOTPRequest({
      email: form.email,
      requestOTPService,
      isResend,
      onSuccess: (msg, resending) => {
        setMessage(msg);
        setIsError(false);
        if (!resending) {
          setIsGoingBack(false);
          setCurrentStage(1);
        }
      },
      onError: (errorMsg) => {
        setMessage(errorMsg);
        setIsError(true);
      },
    });

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validator = getStageValidator(2, form);
    const stage3Errors = validator();

    setBlurredFields((prev) => ({
      ...prev,
      newPassword: true,
      confirmPassword: true,
    }));

    setErrors(stage3Errors);

    const hasErrors = Object.keys(stage3Errors).length > 0;
    if (hasErrors) {
      scrollToError(stage3Errors, 2, refs);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    await handlePasswordReset({
      email: form.email,
      otp: form.otp,
      newPassword: form.newPassword,
      resetPasswordService,
      onSuccess: (msg) => {
        setMessage(msg);
        setIsError(false);
        navigate('/signin');
      },
      onError: (errorMsg) => {
        setMessage(errorMsg);
        setIsError(true);
      },
    });

    setLoading(false);
  };

  // STAGE 1: Email
  const stage1 = (
    <EmailStage
      form={form}
      errors={errors}
      blurredFields={blurredFields}
      loading={loading}
      emailRef={emailRef}
      handleChange={handleChange}
      handleBlur={handleBlur}
      sendOTP={sendOTP}
    />
  );

  // STAGE 2: OTP
  const stage2 = (
    <OTPStage
      form={form}
      errors={errors}
      blurredFields={blurredFields}
      loading={loading}
      otpRef={otpRef}
      handleChange={handleChange}
      handleBlur={handleBlur}
      sendOTP={sendOTP}
      handlePreviousStage={handlePreviousStage}
      handleNextStage={handleNextStage}
    />
  );

  // STAGE 3: New Password
  const stage3 = (
    <PasswordStage
      form={form}
      errors={errors}
      blurredFields={blurredFields}
      loading={loading}
      passwordRef={passwordRef}
      handleChange={handleChange}
      handleBlur={handleBlur}
      handlePreviousStage={handlePreviousStage}
      handleSubmit={handleSubmit}
    />
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

      {/* Show messages */}
      {message && (
        <Message
          type={isError ? 'error' : 'success'}
          style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}
        >
          {message}
        </Message>
      )}
    </AuthPageLayout>
  );
}

/**
 * Validation helpers for ForgotPassword component
 * Extracted to reduce component complexity
 */

import { getPasswordError } from '@/utils/passwordValidation';

/**
 * Validate email field
 */
export const validateEmailStage = (email) => {
  const newErrors = {};
  if (!email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newErrors.email = 'Please enter a valid email address';
  }
  return newErrors;
};

/**
 * Validate OTP field
 */
export const validateOTPStage = (otp) => {
  const newErrors = {};
  if (!otp.trim()) {
    newErrors.otp = 'OTP is required';
  }
  return newErrors;
};

/**
 * Validate password fields
 */
export const validatePasswordStage = (newPassword, confirmPassword) => {
  const newErrors = {};

  const passwordError = getPasswordError(newPassword);
  if (!newPassword) {
    newErrors.newPassword = 'New password is required';
  } else if (passwordError) {
    newErrors.newPassword = passwordError;
  }

  if (!confirmPassword) {
    newErrors.confirmPassword = 'Please confirm your password';
  } else if (confirmPassword !== newPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }

  return newErrors;
};

/**
 * Get stage validator based on stage index
 */
export const getStageValidator = (stage, form) => {
  const validators = {
    0: () => validateEmailStage(form.email),
    1: () => validateOTPStage(form.otp),
    2: () => validatePasswordStage(form.newPassword, form.confirmPassword),
  };
  return validators[stage] || (() => ({}));
};

/**
 * Get field refs map for stage
 */
export const getStageRefMap = (stage, refs) => {
  const { emailRef, otpRef, passwordRef } = refs;
  const refMaps = {
    0: { email: emailRef },
    1: { otp: otpRef },
    2: { newPassword: passwordRef, confirmPassword: passwordRef },
  };
  return refMaps[stage] || {};
};

/**
 * Scroll to first error in stage
 */
export const scrollToFirstError = (errorObj, stage, refs) => {
  const refMap = getStageRefMap(stage, refs);
  const firstErrorField = Object.keys(errorObj)[0];
  const ref = refMap[firstErrorField];

  if (ref?.current) {
    if (typeof ref.current.scrollIntoView === 'function') {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    const input = ref.current.querySelector('input');
    if (input) input.focus();
  }
};

/**
 * Get blurred fields for stage
 */
export const getStageBlurredFields = (stage, prevBlurred = {}) => {
  const stageFields = {
    0: { email: true },
    1: { otp: true },
    2: { newPassword: true, confirmPassword: true },
  };
  return { ...prevBlurred, ...stageFields[stage] };
};

/**
 * Handle OTP request API call
 */
export const handleOTPRequest = async ({
  email,
  requestOTPService,
  isResend,
  onSuccess,
  onError,
}) => {
  try {
    const data = await requestOTPService(email);

    if (data.success) {
      const message = data.message || 'OTP sent successfully!';
      onSuccess(message, isResend);
    } else {
      onError(data.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    const errorMessage = error.response?.data?.message || 'Failed to send OTP';
    onError(errorMessage);
  }
};

/**
 * Handle password reset API call
 */
export const handlePasswordReset = async ({
  email,
  otp,
  newPassword,
  resetPasswordService,
  onSuccess,
  onError,
}) => {
  try {
    const data = await resetPasswordService(email, otp, newPassword);

    if (data.success) {
      onSuccess('Password reset successfully! Redirecting to login...');
    } else {
      onError(data.message || 'Failed to reset password');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    const errorMessage =
      error.response?.data?.message || 'Failed to reset password';
    onError(errorMessage);
  }
};

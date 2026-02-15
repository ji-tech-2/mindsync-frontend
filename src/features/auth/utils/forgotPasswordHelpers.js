/**
 * ForgotPassword field validation helpers
 * Extracted to reduce cyclomatic complexity
 */

import { getPasswordError } from '@/utils/passwordValidation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmailValue(email) {
  if (!email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
  return null;
}

function validateOtpValue(otp) {
  if (!otp.trim()) return 'OTP is required';
  return null;
}

function validateNewPasswordValue(password) {
  if (!password) return 'New password is required';
  const passwordError = getPasswordError(password);
  if (passwordError) return passwordError;
  return null;
}

function validateConfirmPasswordValue(confirmPassword, newPassword) {
  if (!confirmPassword) return 'Please confirm your password';
  if (confirmPassword !== newPassword) return 'Passwords do not match';
  return null;
}

/**
 * Apply a single validation result to errors object.
 */
function applyValidation(errors, key, error) {
  if (error) {
    errors[key] = error;
  } else {
    delete errors[key];
  }
}

/**
 * Validate a field (or all fields) for the ForgotPassword form.
 * @param {string} fieldName - Field name or 'all'
 * @param {Object} form - Current form state
 * @param {Object} existingErrors - Current errors
 * @returns {Object} Updated errors
 */
export function validateForgotPasswordField(fieldName, form, existingErrors) {
  const newErrors = { ...existingErrors };

  if (fieldName === 'email' || fieldName === 'all') {
    applyValidation(newErrors, 'email', validateEmailValue(form.email));
  }

  if (fieldName === 'otp' || fieldName === 'all') {
    applyValidation(newErrors, 'otp', validateOtpValue(form.otp));
  }

  if (fieldName === 'newPassword' || fieldName === 'all') {
    applyValidation(
      newErrors,
      'newPassword',
      validateNewPasswordValue(form.newPassword)
    );
  }

  if (fieldName === 'confirmPassword' || fieldName === 'all') {
    applyValidation(
      newErrors,
      'confirmPassword',
      validateConfirmPasswordValue(form.confirmPassword, form.newPassword)
    );
  }

  return newErrors;
}

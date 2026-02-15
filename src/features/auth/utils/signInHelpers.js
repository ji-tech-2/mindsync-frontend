/**
 * Sign In form validation helpers
 * Extracted from SignIn.jsx to reduce cyclomatic complexity
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a single sign-in form field.
 * @param {string} fieldName - 'email' or 'password'
 * @param {Object} currentForm - Current form state
 * @param {Object} existingErrors - Current error object
 * @returns {Object} Updated errors object
 */
export function validateSignInField(fieldName, currentForm, existingErrors) {
  const newErrors = { ...existingErrors };

  if (fieldName === 'email') {
    if (!currentForm.email || !currentForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(currentForm.email)) {
      newErrors.email =
        'Please enter a valid email address (e.g., user@example.com)';
    } else {
      delete newErrors.email;
    }
  } else if (fieldName === 'password') {
    if (!currentForm.password) {
      newErrors.password = 'Password is required';
    } else {
      delete newErrors.password;
    }
  }

  return newErrors;
}

/**
 * Validate entire sign-in form synchronously.
 * @param {Object} form - { email, password }
 * @returns {Object} Validation errors
 */
export function validateSignInForm(form) {
  const newErrors = {};

  if (!form.email || !form.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(form.email)) {
    newErrors.email =
      'Please enter a valid email address (e.g., user@example.com)';
  }

  if (!form.password) {
    newErrors.password = 'Password is required';
  }

  return newErrors;
}

/**
 * Scroll to and focus the first field with an error.
 * @param {Object} errorObj - Validation errors
 * @param {Array<{ref: Object, hasError: boolean}>} fieldRefs - Ordered field references
 */
export function scrollToFirstErrorField(errorObj, fieldRefs) {
  const firstErrorField = fieldRefs.find((field) => field.hasError);

  if (firstErrorField && firstErrorField.ref.current) {
    if (typeof firstErrorField.ref.current.scrollIntoView === 'function') {
      firstErrorField.ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    if (firstErrorField.ref.current.querySelector('input')) {
      firstErrorField.ref.current.querySelector('input').focus();
    }
  }
}

/**
 * Check if a status message should be displayed as an error.
 * @param {string} message - Status message
 * @returns {boolean}
 */
export function isSignInErrorMessage(message) {
  return (
    message &&
    !message.includes('successful') &&
    (message.includes('failed') ||
      message.includes('error') ||
      message.includes('Error') ||
      message.includes('credentials') ||
      message.includes('Invalid'))
  );
}

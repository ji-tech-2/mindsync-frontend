/**
 * Password validation utility
 * Validates password strength requirements
 */

/**
 * Validates password meets security requirements:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 *
 * @param {string} password - The password to validate
 * @returns {boolean} - True if password meets requirements, false otherwise
 */
export const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Gets user-friendly error messages for password validation failures
 *
 * @param {string} password - The password to validate
 * @returns {string} - Error message if validation fails, empty string if valid
 */
export const getPasswordError = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!validatePassword(password)) {
    return "Password must contain at least one uppercase, one lowercase, and one number";
  }

  return "";
};

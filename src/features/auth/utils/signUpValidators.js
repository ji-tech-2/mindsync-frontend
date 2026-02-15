/**
 * Field Validators for SignUp Form
 * Extracted from SignUp.jsx to reduce cyclomatic complexity
 */

import { validatePassword } from '@/utils/passwordValidation';

// Email validator
export function validateEmailField(email) {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return 'Please enter a valid email address (e.g., user@example.com)';
  }
  return null;
}

// Password validator
export function validatePasswordField(password) {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!validatePassword(password)) {
    return 'Password must contain uppercase, lowercase, and number';
  }
  return null;
}

// Confirm Password validator
export function validateConfirmPasswordField(confirmPassword, password) {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (confirmPassword !== password) {
    return 'Passwords do not match';
  }
  return null;
}

// Name validator
export function validateNameField(name) {
  if (!name || !name.trim()) {
    return 'Full name is required';
  }
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  if (!nameRegex.test(name)) {
    return 'Name must be 2-50 characters (letters and spaces only)';
  }
  return null;
}

// DOB presence check - returns errors for missing fields
function validateDobPresence(dobDay, dobMonth, dobYear) {
  const errors = {};

  if (!dobDay) {
    errors.dobDayError = 'Please enter day';
    errors.dobErrorMessage = 'Please enter day';
  }
  if (!dobMonth) {
    errors.dobMonthError = 'Please select month';
    if (!errors.dobErrorMessage) {
      errors.dobErrorMessage = 'Please select month';
    }
  }
  if (!dobYear) {
    errors.dobYearError = 'Please enter year';
    if (!errors.dobErrorMessage) {
      errors.dobErrorMessage = 'Please enter year';
    }
  }

  return errors;
}

// DOB range validation for individual numeric values
function validateDobRange(day, month, year) {
  if (day < 1 || day > 31) {
    return { dobDayError: true, dobErrorMessage: 'Please enter a valid day' };
  }
  if (month < 1 || month > 12) {
    return {
      dobMonthError: true,
      dobErrorMessage: 'Please enter a valid month',
    };
  }
  if (year < 1900 || year > new Date().getFullYear()) {
    return {
      dobYearError: true,
      dobErrorMessage: 'Please enter a valid date of birth',
    };
  }
  return null;
}

// DOB age validation
function validateDobAge(dob, age) {
  if (age < 16) {
    return {
      dobError: true,
      dobErrorMessage: `You must be at least 16 years old (you are ${age})`,
    };
  }
  if (age > 120) {
    return {
      dobError: true,
      dobErrorMessage: 'Please enter a valid date of birth',
    };
  }
  return null;
}

// DOB validator - returns object with specific field errors
export function validateDobField(dobDay, dobMonth, dobYear) {
  // Check if all fields are filled
  if (!dobDay || !dobMonth || !dobYear) {
    return validateDobPresence(dobDay, dobMonth, dobYear);
  }

  const day = parseInt(dobDay, 10);
  const month = parseInt(dobMonth, 10);
  const year = parseInt(dobYear, 10);

  // Validate individual field ranges
  const rangeErrors = validateDobRange(day, month, year);
  if (rangeErrors) return rangeErrors;

  // Validate complete date
  const dob = `${year}-${dobMonth}-${dobDay.padStart(2, '0')}`;
  const dateObj = new Date(dob);

  if (
    dateObj.getDate() !== day ||
    dateObj.getMonth() + 1 !== month ||
    dateObj.getFullYear() !== year
  ) {
    return {
      dobDayError: true,
      dobErrorMessage: `${dobDay} is not a valid day in this month`,
    };
  }

  // Validate age
  const age = calculateAge(dob);
  return validateDobAge(dob, age) || {};
}

// Age calculator helper
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

// Gender validator
export function validateGenderField(gender) {
  if (!gender) {
    return 'Please select a gender';
  }
  return null;
}

// Occupation validator
export function validateOccupationField(occupation) {
  if (!occupation) {
    return 'Please select an occupation';
  }
  return null;
}

// Work mode validator
export function validateWorkModeField(workRmt) {
  if (!workRmt) {
    return 'Please select a work mode';
  }
  return null;
}

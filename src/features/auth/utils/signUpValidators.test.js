import { describe, it, expect, vi } from 'vitest';
import {
  validateEmailField,
  validatePasswordField,
  validateConfirmPasswordField,
  validateNameField,
  validateDobField,
  validateGenderField,
  validateOccupationField,
  validateWorkModeField,
} from './signUpValidators';

// Mock the password validation utility
vi.mock('@/utils/passwordValidation', () => ({
  validatePassword: vi.fn((password) => {
    // Simple mock: must have uppercase, lowercase, and number
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber;
  }),
}));

describe('signUpValidators', () => {
  describe('validateEmailField', () => {
    it('should return null for valid email', () => {
      expect(validateEmailField('user@example.com')).toBeNull();
      expect(validateEmailField('test.user@domain.co.uk')).toBeNull();
      expect(validateEmailField('name+tag@email.com')).toBeNull();
    });

    it('should return error for empty email', () => {
      expect(validateEmailField('')).toBe('Email is required');
      expect(validateEmailField('   ')).toBe('Email is required');
      expect(validateEmailField(null)).toBe('Email is required');
    });

    it('should return error for invalid email format', () => {
      expect(validateEmailField('notanemail')).toBe(
        'Please enter a valid email address (e.g., user@example.com)'
      );
      expect(validateEmailField('missing@domain')).toBe(
        'Please enter a valid email address (e.g., user@example.com)'
      );
      expect(validateEmailField('@example.com')).toBe(
        'Please enter a valid email address (e.g., user@example.com)'
      );
      expect(validateEmailField('user@')).toBe(
        'Please enter a valid email address (e.g., user@example.com)'
      );
    });
  });

  describe('validatePasswordField', () => {
    it('should return null for valid password', () => {
      expect(validatePasswordField('Password123')).toBeNull();
      expect(validatePasswordField('ValidPass1')).toBeNull();
      expect(validatePasswordField('Secure123Password')).toBeNull();
    });

    it('should return error for empty password', () => {
      expect(validatePasswordField('')).toBe('Password is required');
      expect(validatePasswordField(null)).toBe('Password is required');
    });

    it('should return error for password less than 8 characters', () => {
      expect(validatePasswordField('Pass1')).toBe(
        'Password must be at least 8 characters'
      );
      expect(validatePasswordField('1234567')).toBe(
        'Password must be at least 8 characters'
      );
    });

    it('should return error for password without required characters', () => {
      expect(validatePasswordField('alllowercase123')).toBe(
        'Password must contain uppercase, lowercase, and number'
      );
      expect(validatePasswordField('ALLUPPERCASE123')).toBe(
        'Password must contain uppercase, lowercase, and number'
      );
      expect(validatePasswordField('NoNumbers')).toBe(
        'Password must contain uppercase, lowercase, and number'
      );
    });
  });

  describe('validateConfirmPasswordField', () => {
    it('should return null when passwords match', () => {
      expect(
        validateConfirmPasswordField('Password123', 'Password123')
      ).toBeNull();
      expect(validateConfirmPasswordField('test', 'test')).toBeNull();
    });

    it('should return error for empty confirm password', () => {
      expect(validateConfirmPasswordField('', 'Password123')).toBe(
        'Please confirm your password'
      );
      expect(validateConfirmPasswordField(null, 'Password123')).toBe(
        'Please confirm your password'
      );
    });

    it('should return error when passwords do not match', () => {
      expect(validateConfirmPasswordField('Password123', 'Password456')).toBe(
        'Passwords do not match'
      );
      expect(validateConfirmPasswordField('test', 'Test')).toBe(
        'Passwords do not match'
      );
    });
  });

  describe('validateNameField', () => {
    it('should return null for valid name', () => {
      expect(validateNameField('John Doe')).toBeNull();
      expect(validateNameField('Mary Jane')).toBeNull();
      expect(validateNameField('SingleName')).toBeNull();
      expect(validateNameField('Name With Multiple Spaces')).toBeNull();
    });

    it('should return error for empty name', () => {
      expect(validateNameField('')).toBe('Full name is required');
      expect(validateNameField('   ')).toBe('Full name is required');
      expect(validateNameField(null)).toBe('Full name is required');
    });

    it('should return error for name with invalid characters', () => {
      expect(validateNameField('John123')).toBe(
        'Name must be 2-50 characters (letters and spaces only)'
      );
      expect(validateNameField('John@Doe')).toBe(
        'Name must be 2-50 characters (letters and spaces only)'
      );
      expect(validateNameField('John_Doe')).toBe(
        'Name must be 2-50 characters (letters and spaces only)'
      );
    });

    it('should return error for name that is too short', () => {
      expect(validateNameField('A')).toBe(
        'Name must be 2-50 characters (letters and spaces only)'
      );
    });

    it('should return error for name that is too long', () => {
      const longName = 'A'.repeat(51);
      expect(validateNameField(longName)).toBe(
        'Name must be 2-50 characters (letters and spaces only)'
      );
    });
  });

  describe('validateDobField', () => {
    it('should return empty errors object for valid date of adult', () => {
      const errors = validateDobField('15', '06', '1990');
      expect(Object.keys(errors).length).toBe(0);
    });

    it('should return specific error for missing day', () => {
      const errors = validateDobField('', '06', '1990');
      expect(errors.dobDayError).toBe('Please enter day');
      expect(errors.dobErrorMessage).toBe('Please enter day');
    });

    it('should return specific error for missing month', () => {
      const errors = validateDobField('15', '', '1990');
      expect(errors.dobMonthError).toBe('Please select month');
      expect(errors.dobErrorMessage).toBe('Please select month');
    });

    it('should return specific error for missing year', () => {
      const errors = validateDobField('15', '06', '');
      expect(errors.dobYearError).toBe('Please enter year');
      expect(errors.dobErrorMessage).toBe('Please enter year');
    });

    it('should return error for invalid day', () => {
      const errors = validateDobField('32', '06', '1990');
      expect(errors.dobDayError).toBe(true);
      expect(errors.dobErrorMessage).toBe('Please enter a valid day');
    });

    it('should return error for day 0', () => {
      const errors = validateDobField('0', '06', '1990');
      expect(errors.dobDayError).toBe(true);
      expect(errors.dobErrorMessage).toBe('Please enter a valid day');
    });

    it('should return error for invalid month', () => {
      const errors = validateDobField('15', '13', '1990');
      expect(errors.dobMonthError).toBe(true);
      expect(errors.dobErrorMessage).toBe('Please enter a valid month');
    });

    it('should return error for month 0', () => {
      const errors = validateDobField('15', '0', '1990');
      expect(errors.dobMonthError).toBe(true);
      expect(errors.dobErrorMessage).toBe('Please enter a valid month');
    });

    it('should return error for year before 1900', () => {
      const errors = validateDobField('15', '06', '1899');
      expect(errors.dobYearError).toBe(true);
      expect(errors.dobErrorMessage).toBe('Please enter a valid date of birth');
    });

    it('should return error for future year', () => {
      const futureYear = new Date().getFullYear() + 1;
      const errors = validateDobField('15', '06', futureYear.toString());
      expect(errors.dobYearError).toBe(true);
      expect(errors.dobErrorMessage).toBe('Please enter a valid date of birth');
    });

    it('should return error for invalid date (e.g., Feb 30)', () => {
      const errors = validateDobField('30', '02', '2000');
      expect(errors.dobDayError).toBe(true);
      expect(errors.dobErrorMessage).toBe(
        '30 is not a valid day in this month'
      );
    });

    it('should return error for invalid date (e.g., April 31)', () => {
      const errors = validateDobField('31', '04', '2000');
      expect(errors.dobDayError).toBe(true);
      expect(errors.dobErrorMessage).toBe(
        '31 is not a valid day in this month'
      );
    });

    it('should accept valid leap year date (Feb 29)', () => {
      const errors = validateDobField('29', '02', '2000');
      expect(Object.keys(errors).length).toBe(0);
    });

    it('should reject Feb 29 in non-leap year', () => {
      const errors = validateDobField('29', '02', '1999');
      expect(errors.dobDayError).toBe(true);
      expect(errors.dobErrorMessage).toBe(
        '29 is not a valid day in this month'
      );
    });

    it('should return error for age less than 16', () => {
      // Calculate a date for someone who is 15 years old
      const today = new Date();
      const fifteenYearsAgo = new Date(
        today.getFullYear() - 15,
        today.getMonth(),
        today.getDate()
      );
      const errors = validateDobField(
        fifteenYearsAgo.getDate().toString(),
        (fifteenYearsAgo.getMonth() + 1).toString(),
        fifteenYearsAgo.getFullYear().toString()
      );
      expect(errors.dobError).toBe(true);
      expect(errors.dobErrorMessage).toContain(
        'You must be at least 16 years old'
      );
    });

    it('should return error for age greater than 120', () => {
      const errors = validateDobField('01', '01', '1900');
      expect(errors.dobError).toBe(true);
      expect(errors.dobErrorMessage).toBe('Please enter a valid date of birth');
    });

    it('should accept valid age between 16 and 120', () => {
      // Someone who is 25 years old
      const today = new Date();
      const twentyFiveYearsAgo = new Date(
        today.getFullYear() - 25,
        today.getMonth(),
        today.getDate() - 1
      );
      const errors = validateDobField(
        twentyFiveYearsAgo.getDate().toString().padStart(2, '0'),
        (twentyFiveYearsAgo.getMonth() + 1).toString().padStart(2, '0'),
        twentyFiveYearsAgo.getFullYear().toString()
      );
      expect(Object.keys(errors).length).toBe(0);
    });
  });

  describe('validateGenderField', () => {
    it('should return null for valid gender', () => {
      expect(validateGenderField('Male')).toBeNull();
      expect(validateGenderField('Female')).toBeNull();
      expect(validateGenderField('Other')).toBeNull();
    });

    it('should return error for empty gender', () => {
      expect(validateGenderField('')).toBe('Please select a gender');
      expect(validateGenderField(null)).toBe('Please select a gender');
    });
  });

  describe('validateOccupationField', () => {
    it('should return null for valid occupation', () => {
      expect(validateOccupationField('Employed')).toBeNull();
      expect(validateOccupationField('Student')).toBeNull();
      expect(validateOccupationField('Freelancer')).toBeNull();
    });

    it('should return error for empty occupation', () => {
      expect(validateOccupationField('')).toBe('Please select an occupation');
      expect(validateOccupationField(null)).toBe('Please select an occupation');
    });
  });

  describe('validateWorkModeField', () => {
    it('should return null for valid work mode', () => {
      expect(validateWorkModeField('Remote')).toBeNull();
      expect(validateWorkModeField('Hybrid')).toBeNull();
      expect(validateWorkModeField('On-site')).toBeNull();
    });

    it('should return error for empty work mode', () => {
      expect(validateWorkModeField('')).toBe('Please select a work mode');
      expect(validateWorkModeField(null)).toBe('Please select a work mode');
    });
  });

  describe('Edge Cases', () => {
    it('should handle email with leading/trailing spaces', () => {
      expect(validateEmailField('  user@example.com  ')).toBeNull();
    });

    it('should handle name with extra spaces between words', () => {
      // Note: The regex doesn't validate spacing, so this might pass
      const result = validateNameField('John  Doe');
      expect(result).toBeNull();
    });

    it('should handle DOB with single-digit day and month', () => {
      const errors = validateDobField('5', '6', '1990');
      expect(Object.keys(errors).length).toBe(0);
    });

    it('should handle exactly 16 years old (boundary test)', () => {
      const today = new Date();
      const sixteenYearsAgo = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate() - 1
      );
      const errors = validateDobField(
        sixteenYearsAgo.getDate().toString(),
        (sixteenYearsAgo.getMonth() + 1).toString(),
        sixteenYearsAgo.getFullYear().toString()
      );
      expect(Object.keys(errors).length).toBe(0);
    });

    it('should handle password with exactly 8 characters', () => {
      expect(validatePasswordField('Pass123!')).toBeNull(); // Assuming 8 chars
    });
  });
});

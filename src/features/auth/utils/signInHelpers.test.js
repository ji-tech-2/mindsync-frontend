import { describe, it, expect, vi } from 'vitest';
import {
  validateSignInField,
  validateSignInForm,
  scrollToFirstErrorField,
  isSignInErrorMessage,
} from './signInHelpers';

describe('signInHelpers', () => {
  describe('validateSignInField', () => {
    it('should set error for empty email', () => {
      const result = validateSignInField('email', { email: '' }, {});
      expect(result.email).toBe('Email is required');
    });

    it('should set error for whitespace-only email', () => {
      const result = validateSignInField('email', { email: '   ' }, {});
      expect(result.email).toBe('Email is required');
    });

    it('should set error for invalid email format', () => {
      const result = validateSignInField('email', { email: 'notvalid' }, {});
      expect(result.email).toContain('valid email');
    });

    it('should clear error for valid email', () => {
      const result = validateSignInField(
        'email',
        { email: 'user@example.com' },
        { email: 'old error' }
      );
      expect(result.email).toBeUndefined();
    });

    it('should set error for empty password', () => {
      const result = validateSignInField('password', { password: '' }, {});
      expect(result.password).toBe('Password is required');
    });

    it('should clear error for non-empty password', () => {
      const result = validateSignInField(
        'password',
        { password: 'mypass' },
        { password: 'old' }
      );
      expect(result.password).toBeUndefined();
    });

    it('should not touch other errors', () => {
      const result = validateSignInField(
        'email',
        { email: 'user@example.com' },
        { password: 'err' }
      );
      expect(result.password).toBe('err');
    });
  });

  describe('validateSignInForm', () => {
    it('should return errors for empty form', () => {
      const result = validateSignInForm({ email: '', password: '' });
      expect(result.email).toBeDefined();
      expect(result.password).toBeDefined();
    });

    it('should return error for invalid email only', () => {
      const result = validateSignInForm({
        email: 'bad',
        password: 'pass123',
      });
      expect(result.email).toBeDefined();
      expect(result.password).toBeUndefined();
    });

    it('should return empty for valid form', () => {
      const result = validateSignInForm({
        email: 'user@example.com',
        password: 'pass123',
      });
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('scrollToFirstErrorField', () => {
    it('should scroll and focus input of first error field', () => {
      const scrollIntoView = vi.fn();
      const focus = vi.fn();
      const fieldRefs = [
        {
          ref: {
            current: {
              scrollIntoView,
              querySelector: vi.fn((sel) =>
                sel === 'input' ? { focus } : null
              ),
            },
          },
          hasError: true,
        },
      ];
      scrollToFirstErrorField({ email: 'err' }, fieldRefs);
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
      expect(focus).toHaveBeenCalled();
    });

    it('should skip fields without errors', () => {
      const scrollIntoView = vi.fn();
      const fieldRefs = [
        { ref: { current: null }, hasError: false },
        {
          ref: {
            current: {
              scrollIntoView,
              querySelector: vi.fn(() => null),
            },
          },
          hasError: true,
        },
      ];
      scrollToFirstErrorField({}, fieldRefs);
      expect(scrollIntoView).toHaveBeenCalled();
    });

    it('should not crash when no error fields', () => {
      scrollToFirstErrorField({}, [
        { ref: { current: null }, hasError: false },
      ]);
    });

    it('should not crash when ref.current is null', () => {
      scrollToFirstErrorField({}, [{ ref: { current: null }, hasError: true }]);
    });
  });

  describe('isSignInErrorMessage', () => {
    it('should return true for "failed" messages', () => {
      expect(isSignInErrorMessage('Login failed')).toBe(true);
    });

    it('should return true for "error" messages', () => {
      expect(isSignInErrorMessage('An error occurred')).toBe(true);
    });

    it('should return true for "Invalid" messages', () => {
      expect(isSignInErrorMessage('Invalid credentials')).toBe(true);
    });

    it('should return true for "credentials" messages', () => {
      expect(isSignInErrorMessage('Bad credentials')).toBe(true);
    });

    it('should return false for success messages', () => {
      expect(isSignInErrorMessage('Login successful')).toBeFalsy();
    });

    it('should return false for null or empty', () => {
      expect(isSignInErrorMessage(null)).toBeFalsy();
      expect(isSignInErrorMessage('')).toBeFalsy();
    });
  });
});

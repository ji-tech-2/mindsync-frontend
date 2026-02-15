import { describe, it, expect } from 'vitest';
import { validateForgotPasswordField } from './forgotPasswordHelpers';

describe('forgotPasswordHelpers', () => {
  describe('validateForgotPasswordField', () => {
    describe('email validation', () => {
      it('should set error for empty email', () => {
        const result = validateForgotPasswordField(
          'email',
          { email: '  ' },
          {}
        );
        expect(result.email).toBe('Email is required');
      });

      it('should set error for invalid email format', () => {
        const result = validateForgotPasswordField(
          'email',
          { email: 'notanemail' },
          {}
        );
        expect(result.email).toBe('Please enter a valid email address');
      });

      it('should clear error for valid email', () => {
        const result = validateForgotPasswordField(
          'email',
          { email: 'user@example.com' },
          { email: 'old error' }
        );
        expect(result.email).toBeUndefined();
      });
    });

    describe('otp validation', () => {
      it('should set error for empty OTP', () => {
        const result = validateForgotPasswordField('otp', { otp: '  ' }, {});
        expect(result.otp).toBe('OTP is required');
      });

      it('should clear error for valid OTP', () => {
        const result = validateForgotPasswordField(
          'otp',
          { otp: '123456' },
          { otp: 'old' }
        );
        expect(result.otp).toBeUndefined();
      });
    });

    describe('newPassword validation', () => {
      it('should set error for empty password', () => {
        const result = validateForgotPasswordField(
          'newPassword',
          { newPassword: '' },
          {}
        );
        expect(result.newPassword).toBe('New password is required');
      });

      it('should set error for weak password', () => {
        const result = validateForgotPasswordField(
          'newPassword',
          { newPassword: 'short' },
          {}
        );
        expect(result.newPassword).toBeDefined();
      });

      it('should clear error for strong password', () => {
        const result = validateForgotPasswordField(
          'newPassword',
          { newPassword: 'Str0ng!Pass' },
          { newPassword: 'old' }
        );
        expect(result.newPassword).toBeUndefined();
      });
    });

    describe('confirmPassword validation', () => {
      it('should set error for empty confirm password', () => {
        const result = validateForgotPasswordField(
          'confirmPassword',
          { confirmPassword: '', newPassword: 'Str0ng!Pass' },
          {}
        );
        expect(result.confirmPassword).toBe('Please confirm your password');
      });

      it('should set error for mismatched passwords', () => {
        const result = validateForgotPasswordField(
          'confirmPassword',
          { confirmPassword: 'different', newPassword: 'Str0ng!Pass' },
          {}
        );
        expect(result.confirmPassword).toBe('Passwords do not match');
      });

      it('should clear error for matching passwords', () => {
        const result = validateForgotPasswordField(
          'confirmPassword',
          { confirmPassword: 'Str0ng!Pass', newPassword: 'Str0ng!Pass' },
          { confirmPassword: 'old' }
        );
        expect(result.confirmPassword).toBeUndefined();
      });
    });

    describe('all fields validation', () => {
      it('should validate all fields at once', () => {
        const form = {
          email: '',
          otp: '',
          newPassword: '',
          confirmPassword: '',
        };
        const result = validateForgotPasswordField('all', form, {});
        expect(result.email).toBeDefined();
        expect(result.otp).toBeDefined();
        expect(result.newPassword).toBeDefined();
        expect(result.confirmPassword).toBeDefined();
      });

      it('should return no errors when all fields are valid', () => {
        const form = {
          email: 'user@example.com',
          otp: '123456',
          newPassword: 'Str0ng!Pass',
          confirmPassword: 'Str0ng!Pass',
        };
        const result = validateForgotPasswordField('all', form, {});
        expect(Object.keys(result)).toHaveLength(0);
      });
    });

    it('should preserve unrelated errors', () => {
      const result = validateForgotPasswordField(
        'email',
        { email: 'valid@email.com' },
        { otp: 'existing error' }
      );
      expect(result.otp).toBe('existing error');
      expect(result.email).toBeUndefined();
    });
  });
});

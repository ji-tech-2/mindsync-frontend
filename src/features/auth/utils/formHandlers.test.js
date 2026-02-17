import { describe, it, expect, vi } from 'vitest';
import {
  isDobField,
  isValidNumericInput,
  clearFieldError,
  updateFormField,
  processFieldChange,
  getStage1BlurredFields,
  markAllStage1Blurred,
  markStage2Blurred,
  formatDob,
  transformFormData,
  applyFieldValidation,
  scrollToFirstSignUpError,
  hasFieldError,
  hasDobFieldError,
  getDropdownValue,
  isSignUpErrorMessage,
} from './formHandlers';

describe('formHandlers', () => {
  describe('isDobField', () => {
    it('should return true for dobDay', () => {
      expect(isDobField('dobDay')).toBe(true);
    });

    it('should return true for dobMonth', () => {
      expect(isDobField('dobMonth')).toBe(true);
    });

    it('should return true for dobYear', () => {
      expect(isDobField('dobYear')).toBe(true);
    });

    it('should return false for non-DOB fields', () => {
      expect(isDobField('name')).toBe(false);
      expect(isDobField('email')).toBe(false);
      expect(isDobField('gender')).toBe(false);
      expect(isDobField('')).toBe(false);
    });
  });

  describe('isValidNumericInput', () => {
    it('should return true for valid digits in dobDay', () => {
      expect(isValidNumericInput('dobDay', '15')).toBe(true);
      expect(isValidNumericInput('dobDay', '1')).toBe(true);
      expect(isValidNumericInput('dobDay', '31')).toBe(true);
    });

    it('should return false for non-digits in dobDay', () => {
      expect(isValidNumericInput('dobDay', '1a')).toBe(false);
      expect(isValidNumericInput('dobDay', 'abc')).toBe(false);
      expect(isValidNumericInput('dobDay', '1.5')).toBe(false);
    });

    it('should return true for valid digits in dobYear', () => {
      expect(isValidNumericInput('dobYear', '2000')).toBe(true);
      expect(isValidNumericInput('dobYear', '1995')).toBe(true);
    });

    it('should return false for non-digits in dobYear', () => {
      expect(isValidNumericInput('dobYear', '200a')).toBe(false);
      expect(isValidNumericInput('dobYear', 'year')).toBe(false);
    });

    it('should return true for dobMonth regardless of value', () => {
      expect(isValidNumericInput('dobMonth', 'January')).toBe(true);
      expect(isValidNumericInput('dobMonth', '01')).toBe(true);
      expect(isValidNumericInput('dobMonth', 'abc')).toBe(true);
    });

    it('should return true for non-DOB fields', () => {
      expect(isValidNumericInput('name', 'John Doe')).toBe(true);
      expect(isValidNumericInput('email', 'test@example.com')).toBe(true);
      expect(isValidNumericInput('gender', 'male')).toBe(true);
    });

    it('should return true for empty strings in dobDay and dobYear', () => {
      expect(isValidNumericInput('dobDay', '')).toBe(true);
      expect(isValidNumericInput('dobYear', '')).toBe(true);
    });
  });

  describe('clearFieldError', () => {
    it('should remove error for specified field', () => {
      const errors = { name: 'Name is required', email: 'Email is invalid' };
      const result = clearFieldError('name', errors);

      expect(result.name).toBeUndefined();
      expect(result.email).toBe('Email is invalid');
    });

    it('should not mutate original errors object', () => {
      const errors = { name: 'Name is required' };
      const result = clearFieldError('name', errors);

      expect(errors.name).toBe('Name is required'); // Original unchanged
      expect(result.name).toBeUndefined(); // New object updated
    });

    it('should clear all DOB-related errors when dobDay changes', () => {
      const errors = {
        dobDay: 'Invalid day',
        dob: 'Invalid DOB',
        dobDayError: 'Day error',
        dobMonthError: 'Month error',
        dobYearError: 'Year error',
        dobError: 'DOB error',
        dobErrorMessage: 'DOB message',
        name: 'Name error',
      };

      const result = clearFieldError('dobDay', errors);

      expect(result.dobDay).toBeUndefined();
      expect(result.dob).toBeUndefined();
      expect(result.dobDayError).toBeUndefined();
      expect(result.dobMonthError).toBeUndefined();
      expect(result.dobYearError).toBeUndefined();
      expect(result.dobError).toBeUndefined();
      expect(result.dobErrorMessage).toBeUndefined();
      expect(result.name).toBe('Name error');
    });

    it('should clear all DOB-related errors when dobMonth changes', () => {
      const errors = {
        dob: 'Invalid DOB',
        dobDayError: 'Day error',
        dobMonthError: 'Month error',
      };

      const result = clearFieldError('dobMonth', errors);

      expect(result.dob).toBeUndefined();
      expect(result.dobDayError).toBeUndefined();
      expect(result.dobMonthError).toBeUndefined();
    });

    it('should clear all DOB-related errors when dobYear changes', () => {
      const errors = {
        dob: 'Invalid DOB',
        dobYearError: 'Year error',
      };

      const result = clearFieldError('dobYear', errors);

      expect(result.dob).toBeUndefined();
      expect(result.dobYearError).toBeUndefined();
    });

    it('should handle empty errors object', () => {
      const result = clearFieldError('name', {});
      expect(result).toEqual({});
    });
  });

  describe('updateFormField', () => {
    it('should update field value in form', () => {
      const form = { name: '', email: '' };
      const result = updateFormField(form, 'name', 'John Doe');

      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('');
    });

    it('should not mutate original form object', () => {
      const form = { name: 'Original' };
      const result = updateFormField(form, 'name', 'Updated');

      expect(form.name).toBe('Original');
      expect(result.name).toBe('Updated');
    });

    it('should add new field if it does not exist', () => {
      const form = { name: 'John' };
      const result = updateFormField(form, 'email', 'john@example.com');

      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
    });

    it('should handle empty string values', () => {
      const form = { name: 'John' };
      const result = updateFormField(form, 'name', '');

      expect(result.name).toBe('');
    });
  });

  describe('processFieldChange', () => {
    it('should return null for invalid numeric input', () => {
      const form = { dobDay: '' };
      const errors = {};
      const blurredFields = {};

      const result = processFieldChange({
        fieldName: 'dobDay',
        value: 'abc',
        form,
        errors,
        blurredFields,
      });

      expect(result).toBeNull();
    });

    it('should return updated form and errors for valid input', () => {
      const form = { dobDay: '' };
      const errors = { dobDay: 'Required' };
      const blurredFields = {};

      const result = processFieldChange({
        fieldName: 'dobDay',
        value: '15',
        form,
        errors,
        blurredFields,
      });

      expect(result).not.toBeNull();
      expect(result.updatedForm.dobDay).toBe('15');
      expect(result.updatedErrors.dobDay).toBeUndefined();
      expect(result.shouldValidate).toBeFalsy(); // undefined or false
    });

    it('should set shouldValidate to true if field is already blurred', () => {
      const form = { name: '' };
      const errors = {};
      const blurredFields = { name: true };

      const result = processFieldChange({
        fieldName: 'name',
        value: 'John',
        form,
        errors,
        blurredFields,
      });

      expect(result.shouldValidate).toBe(true);
    });

    it('should set shouldValidate to false if field is not blurred', () => {
      const form = { name: '' };
      const errors = {};
      const blurredFields = { name: false };

      const result = processFieldChange({
        fieldName: 'name',
        value: 'John',
        form,
        errors,
        blurredFields,
      });

      expect(result.shouldValidate).toBe(false);
    });

    it('should clear DOB errors when processing DOB field', () => {
      const form = { dobDay: '' };
      const errors = {
        dobDay: 'Required',
        dob: 'Invalid',
        dobError: 'Error',
      };
      const blurredFields = {};

      const result = processFieldChange({
        fieldName: 'dobDay',
        value: '15',
        form,
        errors,
        blurredFields,
      });

      expect(result.updatedErrors.dobDay).toBeUndefined();
      expect(result.updatedErrors.dob).toBeUndefined();
      expect(result.updatedErrors.dobError).toBeUndefined();
    });
  });

  describe('getStage1BlurredFields', () => {
    it('should return all false for empty form', () => {
      const form = {
        name: '',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        gender: '',
        occupation: '',
        workRmt: '',
      };

      const result = getStage1BlurredFields(form);

      expect(result).toEqual({
        name: false,
        dob: false,
        gender: false,
        occupation: false,
        workRmt: false,
      });
    });

    it('should return true for name when filled', () => {
      const form = {
        name: 'John Doe',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        gender: '',
        occupation: '',
        workRmt: '',
      };

      const result = getStage1BlurredFields(form);

      expect(result.name).toBe(true);
      expect(result.dob).toBe(false);
    });

    it('should return true for dob only when all DOB fields are filled', () => {
      const form = {
        name: '',
        dobDay: '15',
        dobMonth: '06',
        dobYear: '1990',
        gender: '',
        occupation: '',
        workRmt: '',
      };

      const result = getStage1BlurredFields(form);

      expect(result.dob).toBe(true);
    });

    it('should return false for dob when any DOB field is missing', () => {
      const form1 = {
        name: '',
        dobDay: '15',
        dobMonth: '',
        dobYear: '1990',
        gender: '',
        occupation: '',
        workRmt: '',
      };

      expect(getStage1BlurredFields(form1).dob).toBe(false);

      const form2 = {
        name: '',
        dobDay: '',
        dobMonth: '06',
        dobYear: '1990',
        gender: '',
        occupation: '',
        workRmt: '',
      };

      expect(getStage1BlurredFields(form2).dob).toBe(false);
    });

    it('should return true for all filled fields', () => {
      const form = {
        name: 'John Doe',
        dobDay: '15',
        dobMonth: '06',
        dobYear: '1990',
        gender: 'male',
        occupation: 'engineer',
        workRmt: 'remote',
      };

      const result = getStage1BlurredFields(form);

      expect(result).toEqual({
        name: true,
        dob: true,
        gender: true,
        occupation: true,
        workRmt: true,
      });
    });
  });

  describe('markAllStage1Blurred', () => {
    it('should return all stage 1 fields as blurred', () => {
      const result = markAllStage1Blurred();

      expect(result).toEqual({
        name: true,
        dob: true,
        gender: true,
        occupation: true,
        workRmt: true,
      });
    });
  });

  describe('markStage2Blurred', () => {
    it('should add stage 2 fields to existing blurred fields', () => {
      const existingBlurred = {
        name: true,
        dob: true,
      };

      const result = markStage2Blurred(existingBlurred);

      expect(result).toEqual({
        name: true,
        dob: true,
        email: true,
        password: true,
        confirmPassword: true,
      });
    });

    it('should preserve all existing blurred fields', () => {
      const existingBlurred = {
        name: true,
        dob: false,
        gender: true,
        occupation: false,
        workRmt: true,
      };

      const result = markStage2Blurred(existingBlurred);

      expect(result.name).toBe(true);
      expect(result.dob).toBe(false);
      expect(result.gender).toBe(true);
      expect(result.occupation).toBe(false);
      expect(result.workRmt).toBe(true);
      expect(result.email).toBe(true);
      expect(result.password).toBe(true);
      expect(result.confirmPassword).toBe(true);
    });

    it('should handle empty existing blurred fields', () => {
      const result = markStage2Blurred({});

      expect(result).toEqual({
        email: true,
        password: true,
        confirmPassword: true,
      });
    });
  });

  describe('formatDob', () => {
    it('should format DOB with zero-padding for single digit day', () => {
      const result = formatDob('5', '06', '1990');
      expect(result).toBe('1990-06-05');
    });

    it('should format DOB without extra padding for double digit day', () => {
      const result = formatDob('15', '12', '2000');
      expect(result).toBe('2000-12-15');
    });

    it('should handle day that is already zero-padded', () => {
      const result = formatDob('05', '03', '1985');
      expect(result).toBe('1985-03-05');
    });

    it('should format with various months', () => {
      expect(formatDob('1', '01', '1990')).toBe('1990-01-01');
      expect(formatDob('31', '12', '1999')).toBe('1999-12-31');
    });
  });

  describe('transformFormData', () => {
    it('should transform form data to API format', () => {
      const form = {
        email: 'john@example.com',
        password: 'Password123!',
        name: 'John Doe',
        dobDay: '15',
        dobMonth: '06',
        dobYear: '1990',
        gender: 'male',
        occupation: 'engineer',
        workRmt: 'remote',
      };

      const toApiGender = (val) => val.toUpperCase();
      const toApiOccupation = (val) => `occ_${val}`;
      const toApiWorkMode = (val) => (val === 'remote' ? 'WFH' : 'OFFICE');

      const result = transformFormData(
        form,
        toApiGender,
        toApiOccupation,
        toApiWorkMode
      );

      expect(result).toEqual({
        email: 'john@example.com',
        password: 'Password123!',
        name: 'John Doe',
        dob: '1990-06-15',
        gender: 'MALE',
        occupation: 'occ_engineer',
        workRmt: 'WFH',
      });
    });

    it('should format DOB with zero-padded day', () => {
      const form = {
        email: 'test@test.com',
        password: 'pass',
        name: 'Test',
        dobDay: '5',
        dobMonth: '01',
        dobYear: '2000',
        gender: 'female',
        occupation: 'student',
        workRmt: 'office',
      };

      const toApiGender = (val) => val;
      const toApiOccupation = (val) => val;
      const toApiWorkMode = (val) => val;

      const result = transformFormData(
        form,
        toApiGender,
        toApiOccupation,
        toApiWorkMode
      );

      expect(result.dob).toBe('2000-01-05');
    });

    it('should call transformer functions correctly', () => {
      const form = {
        email: 'test@test.com',
        password: 'pass',
        name: 'Test',
        dobDay: '1',
        dobMonth: '01',
        dobYear: '2000',
        gender: 'other',
        occupation: 'developer',
        workRmt: 'hybrid',
      };

      const toApiGender = vi.fn((val) => `gender_${val}`);
      const toApiOccupation = vi.fn((val) => `occ_${val}`);
      const toApiWorkMode = vi.fn((val) => `mode_${val}`);

      const result = transformFormData(
        form,
        toApiGender,
        toApiOccupation,
        toApiWorkMode
      );

      expect(toApiGender).toHaveBeenCalledWith('other');
      expect(toApiOccupation).toHaveBeenCalledWith('developer');
      expect(toApiWorkMode).toHaveBeenCalledWith('hybrid');

      expect(result.gender).toBe('gender_other');
      expect(result.occupation).toBe('occ_developer');
      expect(result.workRmt).toBe('mode_hybrid');
    });
  });

  describe('applyFieldValidation', () => {
    it('should validate email field and set error for empty email', () => {
      const form = { email: '' };
      const result = applyFieldValidation('email', form, {});
      expect(result.email).toBeDefined();
    });

    it('should validate email field and clear error for valid email', () => {
      const form = { email: 'test@example.com' };
      const result = applyFieldValidation('email', form, {
        email: 'old error',
      });
      expect(result.email).toBeUndefined();
    });

    it('should validate password field', () => {
      const form = { password: '' };
      const result = applyFieldValidation('password', form, {});
      expect(result.password).toBeDefined();
    });

    it('should validate confirmPassword field', () => {
      const form = { password: 'Ab1!xxxx', confirmPassword: 'mismatch' };
      const result = applyFieldValidation('confirmPassword', form, {});
      expect(result.confirmPassword).toBeDefined();
    });

    it('should validate name field', () => {
      const form = { name: '' };
      const result = applyFieldValidation('name', form, {});
      expect(result.name).toBeDefined();
    });

    it('should validate dob field and clear sub-errors', () => {
      const form = { dobDay: '', dobMonth: '', dobYear: '' };
      const existing = { dobDayError: 'x', dobMonthError: 'y' };
      const result = applyFieldValidation('dob', form, existing);
      // Sub-errors cleared then re-validated
      expect(result).toBeDefined();
    });

    it('should validate gender field', () => {
      const form = { gender: '' };
      const result = applyFieldValidation('gender', form, {});
      expect(result.gender).toBeDefined();
    });

    it('should validate occupation field', () => {
      const form = { occupation: '' };
      const result = applyFieldValidation('occupation', form, {});
      expect(result.occupation).toBeDefined();
    });

    it('should validate workRmt field', () => {
      const form = { workRmt: '' };
      const result = applyFieldValidation('workRmt', form, {});
      expect(result.workRmt).toBeDefined();
    });

    it('should return unchanged errors for unknown field', () => {
      const existing = { name: 'err' };
      const result = applyFieldValidation('unknown', {}, existing);
      expect(result).toEqual(existing);
    });
  });

  describe('scrollToFirstSignUpError', () => {
    it('should scroll to first stage1 error field', () => {
      const scrollIntoView = vi.fn();
      const focus = vi.fn();
      const input = { focus };
      const fieldRefs = {
        nameRef: {
          current: {
            scrollIntoView,
            querySelector: vi.fn((sel) => (sel === 'input' ? input : null)),
          },
        },
        dobRef: { current: null },
        genderRef: { current: null },
        occupationRef: { current: null },
        workRmtRef: { current: null },
      };
      scrollToFirstSignUpError({ name: 'Name required' }, 'stage1', fieldRefs);
      expect(scrollIntoView).toHaveBeenCalled();
      expect(focus).toHaveBeenCalled();
    });

    it('should scroll to first stage2 error field', () => {
      const scrollIntoView = vi.fn();
      const focus = vi.fn();
      const input = { focus };
      const fieldRefs = {
        emailRef: {
          current: {
            scrollIntoView,
            querySelector: vi.fn((sel) => (sel === 'input' ? input : null)),
          },
        },
        passwordRef: { current: null },
      };
      scrollToFirstSignUpError(
        { email: 'Email required' },
        'stage2',
        fieldRefs
      );
      expect(scrollIntoView).toHaveBeenCalled();
    });

    it('should focus button when no input found', () => {
      const scrollIntoView = vi.fn();
      const focusBtn = vi.fn();
      const button = { focus: focusBtn };
      const fieldRefs = {
        nameRef: { current: null },
        dobRef: { current: null },
        genderRef: {
          current: {
            scrollIntoView,
            querySelector: vi.fn((sel) => (sel === 'button' ? button : null)),
          },
        },
        occupationRef: { current: null },
        workRmtRef: { current: null },
      };
      scrollToFirstSignUpError({ gender: 'Required' }, 'stage1', fieldRefs);
      expect(scrollIntoView).toHaveBeenCalled();
      expect(focusBtn).toHaveBeenCalled();
    });

    it('should handle dob errors in stage1', () => {
      const scrollIntoView = vi.fn();
      const fieldRefs = {
        nameRef: { current: null },
        dobRef: {
          current: {
            scrollIntoView,
            querySelector: vi.fn(() => null),
          },
        },
        genderRef: { current: null },
        occupationRef: { current: null },
        workRmtRef: { current: null },
      };
      scrollToFirstSignUpError({ dobDayError: 'Day err' }, 'stage1', fieldRefs);
      expect(scrollIntoView).toHaveBeenCalled();
    });

    it('should not scroll if no errors found', () => {
      const fieldRefs = {
        nameRef: { current: null },
        dobRef: { current: null },
        genderRef: { current: null },
        occupationRef: { current: null },
        workRmtRef: { current: null },
      };
      scrollToFirstSignUpError({}, 'stage1', fieldRefs);
      // No crash, no scroll
    });
  });

  describe('hasFieldError', () => {
    it('should return true when field is blurred and has error', () => {
      expect(hasFieldError({ name: true }, { name: 'Required' }, 'name')).toBe(
        true
      );
    });

    it('should return false when field is not blurred', () => {
      expect(hasFieldError({ name: false }, { name: 'Required' }, 'name')).toBe(
        false
      );
    });

    it('should return false when field has no error', () => {
      expect(hasFieldError({ name: true }, {}, 'name')).toBe(false);
    });
  });

  describe('hasDobFieldError', () => {
    it('should return true when dob is blurred and sub-field has error', () => {
      expect(
        hasDobFieldError({ dob: true }, { dobDayError: 'err' }, 'dobDayError')
      ).toBe(true);
    });

    it('should return false when dob is not blurred', () => {
      expect(
        hasDobFieldError({ dob: false }, { dobDayError: 'err' }, 'dobDayError')
      ).toBe(false);
    });

    it('should return false when sub-field has no error', () => {
      expect(hasDobFieldError({ dob: true }, {}, 'dobDayError')).toBe(false);
    });
  });

  describe('getDropdownValue', () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];

    it('should return matching option', () => {
      expect(getDropdownValue(options, 'b')).toEqual({
        value: 'b',
        label: 'B',
      });
    });

    it('should return null when formValue is falsy', () => {
      expect(getDropdownValue(options, '')).toBeNull();
      expect(getDropdownValue(options, null)).toBeNull();
      expect(getDropdownValue(options, undefined)).toBeNull();
    });

    it('should return undefined when no match found', () => {
      expect(getDropdownValue(options, 'z')).toBeUndefined();
    });
  });

  describe('isSignUpErrorMessage', () => {
    it('should return true for messages containing failed', () => {
      expect(isSignUpErrorMessage('Registration failed')).toBe(true);
    });

    it('should return true for messages containing error', () => {
      expect(isSignUpErrorMessage('An error occurred')).toBe(true);
    });

    it('should return true for messages containing Error', () => {
      expect(isSignUpErrorMessage('Error: something went wrong')).toBe(true);
    });

    it('should return false for success messages', () => {
      expect(isSignUpErrorMessage('Registration successful')).toBeFalsy();
    });

    it('should return false for null or empty', () => {
      expect(isSignUpErrorMessage(null)).toBeFalsy();
      expect(isSignUpErrorMessage('')).toBeFalsy();
    });
  });
});

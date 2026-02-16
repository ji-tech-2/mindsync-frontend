/**
 * Form Handler Utilities for SignUp Component
 * Extracted to reduce cyclomatic complexity
 */

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

/**
 * Check if a field name is a date of birth field
 */
export function isDobField(fieldName) {
  return (
    fieldName === 'dobDay' ||
    fieldName === 'dobMonth' ||
    fieldName === 'dobYear'
  );
}

/**
 * Validate numeric input for day and year fields
 */
export function isValidNumericInput(fieldName, value) {
  if (fieldName === 'dobDay' || fieldName === 'dobYear') {
    if (value && !/^\d*$/.test(value)) {
      return false; // Only allow digits
    }
  }
  return true;
}

/**
 * Clear field-specific errors
 */
export function clearFieldError(fieldName, errors) {
  const newErrors = { ...errors };
  delete newErrors[fieldName];

  // Also clear DOB-related errors when any DOB field changes
  if (isDobField(fieldName)) {
    delete newErrors.dob;
    delete newErrors.dobDayError;
    delete newErrors.dobMonthError;
    delete newErrors.dobYearError;
    delete newErrors.dobError;
    delete newErrors.dobErrorMessage;
  }

  return newErrors;
}

/**
 * Create updated form state with new field value
 */
export function updateFormField(form, fieldName, value) {
  return {
    ...form,
    [fieldName]: value,
  };
}

/**
 * Handle change event for form inputs
 * @param {Object} params - The parameters object
 * @param {string} params.fieldName - Name of the field
 * @param {*} params.value - New value
 * @param {Object} params.form - Current form state
 * @param {Object} params.errors - Current errors state
 * @param {Object} params.blurredFields - Fields that have been blurred
 * @returns {Object|null} Update object or null if validation fails
 */
export function processFieldChange({
  fieldName,
  value,
  form,
  errors,
  blurredFields,
}) {
  // Validate numeric input
  if (!isValidNumericInput(fieldName, value)) {
    return null; // Return null to indicate no update should occur
  }

  // Update form
  const updatedForm = updateFormField(form, fieldName, value);

  // Clear errors
  const updatedErrors = clearFieldError(fieldName, errors);

  return {
    updatedForm,
    updatedErrors,
    shouldValidate: blurredFields[fieldName], // Validate if already blurred
  };
}

/**
 * Generate blurred fields state for stage 1
 */
export function getStage1BlurredFields(form) {
  return {
    name: form.name ? true : false,
    dob: form.dobDay && form.dobMonth && form.dobYear ? true : false,
    gender: form.gender ? true : false,
    occupation: form.occupation ? true : false,
    workRmt: form.workRmt ? true : false,
  };
}

/**
 * Mark all stage 1 fields as blurred
 */
export function markAllStage1Blurred() {
  return {
    name: true,
    dob: true,
    gender: true,
    occupation: true,
    workRmt: true,
  };
}

/**
 * Mark stage 2 fields as blurred
 */
export function markStage2Blurred(existingBlurred) {
  return {
    ...existingBlurred,
    email: true,
    password: true,
    confirmPassword: true,
  };
}

/**
 * Format date of birth to YYYY-MM-DD
 */
export function formatDob(dobDay, dobMonth, dobYear) {
  return `${dobYear}-${dobMonth}-${dobDay.padStart(2, '0')}`;
}

/**
 * Transform form data to API format
 */
export function transformFormData(
  form,
  toApiGender,
  toApiOccupation,
  toApiWorkMode
) {
  const dob = formatDob(form.dobDay, form.dobMonth, form.dobYear);

  return {
    email: form.email,
    password: form.password,
    name: form.name,
    dob,
    gender: toApiGender(form.gender),
    occupation: toApiOccupation(form.occupation),
    workRmt: toApiWorkMode(form.workRmt),
  };
}

/**
 * Apply a single-field validation error to an existing errors object.
 * If error is non-null, sets it; otherwise deletes the key.
 */
function applySimpleValidation(errors, key, error) {
  if (error) {
    errors[key] = error;
  } else {
    delete errors[key];
  }
}

/**
 * Validate a single field and return updated errors object.
 * Pure function — does not mutate input.
 */
export function applyFieldValidation(fieldName, currentForm, existingErrors) {
  const newErrors = { ...existingErrors };

  const validators = {
    email: () =>
      applySimpleValidation(
        newErrors,
        'email',
        validateEmailField(currentForm.email)
      ),
    password: () =>
      applySimpleValidation(
        newErrors,
        'password',
        validatePasswordField(currentForm.password)
      ),
    confirmPassword: () =>
      applySimpleValidation(
        newErrors,
        'confirmPassword',
        validateConfirmPasswordField(
          currentForm.confirmPassword,
          currentForm.password
        )
      ),
    name: () =>
      applySimpleValidation(
        newErrors,
        'name',
        validateNameField(currentForm.name)
      ),
    dob: () => {
      delete newErrors.dobDayError;
      delete newErrors.dobMonthError;
      delete newErrors.dobYearError;
      delete newErrors.dobError;
      delete newErrors.dobErrorMessage;
      Object.assign(
        newErrors,
        validateDobField(
          currentForm.dobDay,
          currentForm.dobMonth,
          currentForm.dobYear
        )
      );
    },
    gender: () =>
      applySimpleValidation(
        newErrors,
        'gender',
        validateGenderField(currentForm.gender)
      ),
    occupation: () =>
      applySimpleValidation(
        newErrors,
        'occupation',
        validateOccupationField(currentForm.occupation)
      ),
    workRmt: () =>
      applySimpleValidation(
        newErrors,
        'workRmt',
        validateWorkModeField(currentForm.workRmt)
      ),
  };

  if (validators[fieldName]) {
    validators[fieldName]();
  }

  return newErrors;
}

/**
 * Scroll to and focus the first field with an error (SignUp variant with stages).
 */
export function scrollToFirstSignUpError(errorObj, stage, fieldRefs) {
  let fieldErrors = [];

  if (stage === 'stage1') {
    fieldErrors = [
      { ref: fieldRefs.nameRef, hasError: !!errorObj.name },
      {
        ref: fieldRefs.dobRef,
        hasError: !!(
          errorObj.dobDayError ||
          errorObj.dobMonthError ||
          errorObj.dobYearError ||
          errorObj.dobError
        ),
      },
      { ref: fieldRefs.genderRef, hasError: !!errorObj.gender },
      { ref: fieldRefs.occupationRef, hasError: !!errorObj.occupation },
      { ref: fieldRefs.workRmtRef, hasError: !!errorObj.workRmt },
    ];
  } else if (stage === 'stage2') {
    fieldErrors = [{ ref: fieldRefs.emailRef, hasError: !!errorObj.email }];
  } else if (stage === 'stage3') {
    fieldErrors = [{ ref: fieldRefs.otpRef, hasError: !!errorObj.otp }];
  } else if (stage === 'stage4') {
    fieldErrors = [
      { ref: fieldRefs.passwordRef, hasError: !!errorObj.password },
      { ref: fieldRefs.passwordRef, hasError: !!errorObj.confirmPassword },
    ];
  }

  const firstErrorField = fieldErrors.find((field) => field.hasError);

  if (firstErrorField && firstErrorField.ref.current) {
    if (typeof firstErrorField.ref.current.scrollIntoView === 'function') {
      firstErrorField.ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    if (firstErrorField.ref.current.querySelector('input')) {
      firstErrorField.ref.current.querySelector('input').focus();
    } else if (firstErrorField.ref.current.querySelector('button')) {
      firstErrorField.ref.current.querySelector('button').focus();
    }
  }
}

/**
 * Check if a field has an error and has been blurred.
 */
export function hasFieldError(blurredFields, errors, field) {
  return blurredFields[field] && !!errors[field];
}

/**
 * Check if a DOB sub-field has an error and the dob group has been blurred.
 */
export function hasDobFieldError(blurredFields, errors, subField) {
  return blurredFields.dob && !!errors[subField];
}

/**
 * Get selected dropdown option from form value, or null.
 */
export function getDropdownValue(options, formValue) {
  return formValue ? options.find((opt) => opt.value === formValue) : null;
}

/**
 * Check if a SignUp status message should be displayed as an error.
 */
export function isSignUpErrorMessage(message) {
  return (
    message &&
    (message.includes('failed') ||
      message.includes('error') ||
      message.includes('Error'))
  );
}

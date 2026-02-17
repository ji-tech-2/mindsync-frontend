import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  register as registerService,
  requestSignupOTP as requestSignupOTPService,
} from '@/services';
import {
  Dropdown,
  TextField,
  Button,
  Card,
  DateField,
  Message,
  Link,
  FormContainer,
  FormSection,
  StageContainer,
} from '@/components';
import PasswordField from '../components/PasswordField';
import AuthPageLayout from '../components/AuthPageLayout';
import PageHeader from '../components/PageHeader';
import BackButton from '../components/BackButton';
import {
  genderOptions,
  occupationOptions,
  workModeOptions,
  toApiGender,
  toApiOccupation,
  toApiWorkMode,
} from '@/utils/fieldMappings';
import {
  validateNameField,
  validateDobField,
  validateGenderField,
  validateOccupationField,
  validateWorkModeField,
  validateEmailField,
  validatePasswordField,
  validateConfirmPasswordField,
} from '../utils/signUpValidators';
import {
  processFieldChange,
  transformFormData,
  applyFieldValidation,
  scrollToFirstSignUpError,
  hasFieldError,
  hasDobFieldError,
  getDropdownValue,
} from '../utils/formHandlers';

export default function SignUp() {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(0);
  const [isGoingBack, setIsGoingBack] = useState(false);

  // Create refs for form fields
  const emailRef = useRef(null);
  const otpRef = useRef(null);
  const nameRef = useRef(null);
  const dobRef = useRef(null);
  const genderRef = useRef(null);
  const occupationRef = useRef(null);
  const workRmtRef = useRef(null);
  const passwordRef = useRef(null);

  const [form, setForm] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    name: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    gender: '',
    occupation: '',
    workRmt: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [blurredFields, setBlurredFields] = useState({});
  const [isMessageError, setIsMessageError] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    const result = processFieldChange({
      fieldName: name,
      value,
      form,
      errors,
      blurredFields,
    });

    // If result is null, input validation failed (e.g., non-numeric in numeric field)
    if (!result) return;

    const { updatedForm, updatedErrors, shouldValidate } = result;
    setForm(updatedForm);
    setErrors(updatedErrors);

    // If field is already blurred, validate immediately
    if (shouldValidate) {
      validateField(name, updatedForm);
    }
  }

  function handleTextFieldBlur(e) {
    const { name } = e.target;
    handleBlur(name, form);
  }

  function handleDateFieldBlur() {
    handleBlur('dob', form);
  }

  function handleBlur(fieldName, updatedForm = null) {
    // Mark field as blurred to show error on blur
    setBlurredFields({ ...blurredFields, [fieldName]: true });
    // Validate the specific field with current form state
    validateField(fieldName, updatedForm || form);
  }

  const validateField = (fieldName, currentForm) => {
    setErrors(applyFieldValidation(fieldName, currentForm, errors));
  };

  function handleDropdownChange(fieldName, option) {
    setForm({
      ...form,
      [fieldName]: option.value,
    });
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
    // Also clear the general DOB error when month changes
    if (fieldName === 'dobMonth') {
      if (errors.dob) {
        setErrors({ ...errors, dob: '' });
      }
    }
  }

  // Validation for Stage 1 (personal info)
  const validateStage1 = (currentForm = form) => {
    const newErrors = {};

    // Name validation
    const nameError = validateNameField(currentForm.name);
    if (nameError) {
      newErrors.name = nameError;
    }

    // Date of Birth validation
    const dobErrors = validateDobField(
      currentForm.dobDay,
      currentForm.dobMonth,
      currentForm.dobYear
    );
    Object.assign(newErrors, dobErrors);

    // Gender validation
    const genderError = validateGenderField(currentForm.gender);
    if (genderError) {
      newErrors.gender = genderError;
    }

    // Occupation validation
    const occupationError = validateOccupationField(currentForm.occupation);
    if (occupationError) {
      newErrors.occupation = occupationError;
    }

    // Work Mode validation
    const workModeError = validateWorkModeField(currentForm.workRmt);
    if (workModeError) {
      newErrors.workRmt = workModeError;
    }

    return newErrors;
  };

  // Validation for Stage 2 (email)
  const validateStage2 = (currentForm = form) => {
    const newErrors = {};

    // Email validation
    const emailError = validateEmailField(currentForm.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    return newErrors;
  };

  // Validation for Stage 3 (OTP)
  const validateStage3 = (currentForm = form) => {
    const newErrors = {};

    if (!currentForm.otp.trim()) {
      newErrors.otp = 'OTP is required';
    }

    return newErrors;
  };

  // Validation for Stage 4 (passwords)
  const validateStage4 = (currentForm = form) => {
    const newErrors = {};

    // Password validation
    const passwordError = validatePasswordField(currentForm.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirm Password validation
    const confirmPasswordError = validateConfirmPasswordField(
      currentForm.confirmPassword,
      currentForm.password
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    return newErrors;
  };

  // Send OTP for email verification
  const sendOTP = async (isResend = false) => {
    // Validate stage 2 (email) first (only if not resending)
    if (!isResend) {
      const stage2Errors = validateStage2();

      setBlurredFields((prev) => ({ ...prev, email: true }));

      if (Object.keys(stage2Errors).length > 0) {
        setErrors(stage2Errors);
        scrollToFirstError(stage2Errors, 'stage2');
        return;
      }
    }

    setLoading(true);
    setMessage('Sending OTP...');
    setIsMessageError(false);

    try {
      const data = await requestSignupOTPService(form.email);

      if (data.success) {
        setMessage(data.message || 'OTP sent successfully!');
        setIsMessageError(false);
        // Proceed to next stage only if not resending
        if (!isResend) {
          setIsGoingBack(false);
          setCurrentStage(2);
        }
      } else {
        setMessage(data.message || 'Failed to send OTP');
        setIsMessageError(true);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setMessage(error.response?.data?.message || 'Failed to send OTP');
      setIsMessageError(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle next button on stages
  const handleNextStage = () => {
    let stageErrors = {};

    if (currentStage === 0) {
      // Stage 1: Personal info validation
      stageErrors = validateStage1();
      setBlurredFields((prev) => ({
        ...prev,
        name: true,
        dob: true,
        gender: true,
        occupation: true,
        workRmt: true,
      }));
    } else if (currentStage === 1) {
      // Stage 2: Email - send OTP when clicking next
      sendOTP();
      return;
    } else if (currentStage === 2) {
      // Stage 3: OTP validation
      stageErrors = validateStage3();
      setBlurredFields((prev) => ({ ...prev, otp: true }));
    }

    setErrors(stageErrors);

    if (Object.keys(stageErrors).length === 0) {
      setIsGoingBack(false);
      setCurrentStage(currentStage + 1);
    } else {
      const stageNames = ['stage1', 'stage2', 'stage3', 'stage4'];
      scrollToFirstError(stageErrors, stageNames[currentStage]);
    }
  };

  // Handle back button
  const handlePreviousStage = () => {
    setIsGoingBack(true);
    setCurrentStage(currentStage - 1);
    setErrors({});
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate stage 4 fields (passwords)
    const stage4Errors = validateStage4(form);

    // Mark all stage 4 fields as blurred to show all errors
    setBlurredFields((prev) => ({
      ...prev,
      password: true,
      confirmPassword: true,
    }));

    // Set errors state
    setErrors(stage4Errors);

    // If there are errors, scroll to first error and return
    if (Object.keys(stage4Errors).length > 0) {
      scrollToFirstError(stage4Errors, 'stage4');
      return;
    }

    setLoading(true);
    setMessage('Processing registration...');
    setIsMessageError(false);

    try {
      // Transform form data to API format, including OTP
      const formDataToSubmit = {
        ...transformFormData(form, toApiGender, toApiOccupation, toApiWorkMode),
        otp: form.otp,
      };

      const result = await registerService(formDataToSubmit);

      if (result.success) {
        setMessage('Registration successful! Redirecting to login...');
        setIsMessageError(false);
        setLoading(false);
        navigate('/signin');
      } else {
        setLoading(false);
        setMessage(
          result.message || 'Registration failed. Please check your form data.'
        );
        setIsMessageError(true);
      }
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message ||
        'Error connecting to server. Please ensure your backend is running.';
      setMessage(errorMessage);
      setIsMessageError(true);
      console.error('Registration error:', err);
    }
  }

  const fieldRefs = {
    emailRef,
    otpRef,
    nameRef,
    dobRef,
    genderRef,
    occupationRef,
    workRmtRef,
    passwordRef,
  };

  const scrollToFirstError = (errorObj, stage = 'stage1') => {
    scrollToFirstSignUpError(errorObj, stage, fieldRefs);
  };

  // STAGE 1: Personal Information
  const stage1 = (
    <>
      <FormSection ref={nameRef}>
        <TextField
          label="Full Name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
          error={hasFieldError(blurredFields, errors, 'name')}
          fullWidth
        />
        {hasFieldError(blurredFields, errors, 'name') && (
          <Message type="error" message={errors.name} />
        )}
      </FormSection>

      <FormSection ref={dobRef}>
        <DateField
          label="Date of Birth"
          dayValue={form.dobDay}
          monthValue={form.dobMonth}
          yearValue={form.dobYear}
          onDayChange={(e) => {
            const updatedForm = { ...form, dobDay: e.target.value };
            handleChange(e);
            if (blurredFields.dob) validateField('dob', updatedForm);
          }}
          onMonthChange={(option) => {
            const updatedForm = { ...form, dobMonth: option.value };
            handleDropdownChange('dobMonth', option);
            if (blurredFields.dob) validateField('dob', updatedForm);
          }}
          onYearChange={(e) => {
            const updatedForm = { ...form, dobYear: e.target.value };
            handleChange(e);
            if (blurredFields.dob) validateField('dob', updatedForm);
          }}
          onDayBlur={handleDateFieldBlur}
          onMonthBlur={handleDateFieldBlur}
          onYearBlur={handleDateFieldBlur}
          dayError={hasDobFieldError(blurredFields, errors, 'dobDayError')}
          monthError={hasDobFieldError(blurredFields, errors, 'dobMonthError')}
          yearError={hasDobFieldError(blurredFields, errors, 'dobYearError')}
          dateError={hasDobFieldError(blurredFields, errors, 'dobError')}
        />
        {hasDobFieldError(blurredFields, errors, 'dobErrorMessage') && (
          <Message type="error" message={errors.dobErrorMessage} />
        )}
      </FormSection>

      <FormSection ref={genderRef}>
        <Dropdown
          label="Gender"
          options={genderOptions}
          value={getDropdownValue(genderOptions, form.gender)}
          onChange={(option) => {
            const updatedForm = { ...form, gender: option.value };
            handleDropdownChange('gender', option);
            if (blurredFields.gender) validateField('gender', updatedForm);
          }}
          onBlur={() => handleBlur('gender', form)}
          error={hasFieldError(blurredFields, errors, 'gender')}
          fullWidth
        />
        {hasFieldError(blurredFields, errors, 'gender') && (
          <Message type="error" message={errors.gender} />
        )}
      </FormSection>

      <FormSection ref={occupationRef}>
        <Dropdown
          label="Occupation"
          options={occupationOptions}
          value={getDropdownValue(occupationOptions, form.occupation)}
          onChange={(option) => {
            const updatedForm = { ...form, occupation: option.value };
            handleDropdownChange('occupation', option);
            if (blurredFields.occupation)
              validateField('occupation', updatedForm);
          }}
          onBlur={() => handleBlur('occupation', form)}
          error={hasFieldError(blurredFields, errors, 'occupation')}
          fullWidth
        />
        {hasFieldError(blurredFields, errors, 'occupation') && (
          <Message type="error" message={errors.occupation} />
        )}
      </FormSection>

      <FormSection ref={workRmtRef}>
        <Dropdown
          label="Work Mode"
          options={workModeOptions}
          value={getDropdownValue(workModeOptions, form.workRmt)}
          onChange={(option) => {
            const updatedForm = { ...form, workRmt: option.value };
            handleDropdownChange('workRmt', option);
            if (blurredFields.workRmt) validateField('workRmt', updatedForm);
          }}
          onBlur={() => handleBlur('workRmt', form)}
          error={hasFieldError(blurredFields, errors, 'workRmt')}
          fullWidth
        />
        {hasFieldError(blurredFields, errors, 'workRmt') && (
          <Message type="error" message={errors.workRmt} />
        )}
      </FormSection>

      <Button
        type="button"
        variant="filled"
        fullWidth
        onClick={handleNextStage}
      >
        Next
      </Button>
    </>
  );

  // STAGE 2: Email
  const stage2 = (
    <>
      <FormSection ref={emailRef}>
        <TextField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
          error={hasFieldError(blurredFields, errors, 'email')}
          fullWidth
        />
        {hasFieldError(blurredFields, errors, 'email') && (
          <Message type="error" message={errors.email} />
        )}
      </FormSection>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center',
        }}
      >
        <BackButton onClick={handlePreviousStage} />
        <Button
          type="button"
          variant="filled"
          fullWidth
          onClick={handleNextStage}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </Button>
      </div>
    </>
  );

  // STAGE 3: OTP Verification
  const stage3 = (
    <>
      <FormSection ref={otpRef}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-md)',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: 1, marginTop: 'var(--border-md)' }}>
            <TextField
              label="OTP"
              type="text"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              onBlur={handleTextFieldBlur}
              error={hasFieldError(blurredFields, errors, 'otp')}
              fullWidth
            />
          </div>
          <Button
            type="button"
            variant="outlined"
            onClick={() => sendOTP(true)}
            disabled={loading}
          >
            Resend OTP
          </Button>
        </div>
        {hasFieldError(blurredFields, errors, 'otp') && (
          <Message type="error" message={errors.otp} />
        )}
      </FormSection>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center',
        }}
      >
        <BackButton onClick={handlePreviousStage} />
        <Button
          type="button"
          variant="filled"
          fullWidth
          onClick={handleNextStage}
          disabled={loading}
        >
          Next
        </Button>
      </div>
    </>
  );

  // STAGE 4: Password
  const stage4 = (
    <>
      <FormSection ref={passwordRef}>
        <PasswordField
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
          error={hasFieldError(blurredFields, errors, 'password')}
          fullWidth
        />
        {hasFieldError(blurredFields, errors, 'password') && (
          <Message type="error" message={errors.password} />
        )}
      </FormSection>

      <FormSection>
        <PasswordField
          label="Confirm Password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
          error={hasFieldError(blurredFields, errors, 'confirmPassword')}
          fullWidth
        />
        {hasFieldError(blurredFields, errors, 'confirmPassword') && (
          <Message type="error" message={errors.confirmPassword} />
        )}
      </FormSection>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center',
        }}
      >
        <BackButton onClick={handlePreviousStage} />
        <Button
          type="submit"
          variant="filled"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </div>
    </>
  );

  return (
    <AuthPageLayout>
      <PageHeader
        title="Sign Up"
        subtitle="Join us and start your wellness journey"
      />

      <FormContainer onSubmit={handleSubmit}>
        <StageContainer
          stages={[stage1, stage2, stage3, stage4]}
          currentStage={currentStage}
          isGoingBack={isGoingBack}
        />
      </FormContainer>

      {/* Login Link Container */}
      <p style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
        Already have an account? <Link href="/signin">Sign In Here</Link>
      </p>

      {/* Show success messages */}
      {message && !isMessageError && (
        <p
          style={{
            color: 'var(--color-success, green)',
            textAlign: 'center',
            marginTop: 'var(--space-md)',
          }}
        >
          {message}
        </p>
      )}

      {/* Show error messages */}
      {isMessageError && message && <Message type="error">{message}</Message>}
    </AuthPageLayout>
  );
}

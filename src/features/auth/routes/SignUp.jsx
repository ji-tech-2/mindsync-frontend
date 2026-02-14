import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { API_CONFIG } from '@/config/api';
import { validatePassword } from '@/utils/passwordValidation';
import {
  Dropdown,
  TextField,
  Button,
  Card,
  DateField,
  Message,
  Link,
} from '@/components';
import PasswordField from '../components/PasswordField';
import AuthPageLayout from '../components/AuthPageLayout';
import PageHeader from '../components/PageHeader';
import FormContainer from '../components/FormContainer';
import FormSection from '../components/FormSection';
import ErrorAlert from '../components/ErrorAlert';
import StageContainer from '../components/StageContainer';
import BackButton from '../components/BackButton';
import {
  genderOptions,
  occupationOptions,
  workModeOptions,
  toApiGender,
  toApiOccupation,
  toApiWorkMode,
} from '@/utils/fieldMappings';

export default function SignUp() {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [isGoingBack, setIsGoingBack] = useState(false);

  // Create refs for form fields
  const nameRef = useRef(null);
  const dobRef = useRef(null);
  const genderRef = useRef(null);
  const occupationRef = useRef(null);
  const workRmtRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [form, setForm] = useState({
    email: '',
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

  function handleChange(e) {
    const { name, value } = e.target;

    // For day and year, validate input is numeric
    if (name === 'dobDay' || name === 'dobYear') {
      if (value && !/^\d*$/.test(value)) {
        return; // Only allow digits
      }
    }

    const updatedForm = {
      ...form,
      [name]: value,
    };

    setForm(updatedForm);
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    // Also clear the general DOB error when any DOB field changes
    if (name === 'dobDay' || name === 'dobMonth' || name === 'dobYear') {
      if (errors.dob) {
        setErrors({ ...errors, dob: '' });
      }
    }

    // If field is already blurred, validate immediately with updated form
    if (blurredFields[name]) {
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
    const newErrors = { ...errors };

    if (fieldName === 'email') {
      if (!currentForm.email || !currentForm.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(currentForm.email)) {
        newErrors.email =
          'Please enter a valid email address (e.g., user@example.com)';
      } else {
        delete newErrors.email;
      }
    } else if (fieldName === 'password') {
      if (!currentForm.password) {
        newErrors.password = 'Password is required';
      } else if (currentForm.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!validatePassword(currentForm.password)) {
        newErrors.password =
          'Password must contain uppercase, lowercase, and number';
      } else {
        delete newErrors.password;
      }
    } else if (fieldName === 'confirmPassword') {
      if (!currentForm.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (currentForm.confirmPassword !== currentForm.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    } else if (fieldName === 'name') {
      if (!currentForm.name || !currentForm.name.trim()) {
        newErrors.name = 'Full name is required';
      } else if (!validateName(currentForm.name)) {
        newErrors.name =
          'Name must be 2-50 characters (letters and spaces only)';
      } else {
        delete newErrors.name;
      }
    } else if (fieldName === 'dob') {
      // Clear all dob-related errors first
      delete newErrors.dobDayError;
      delete newErrors.dobMonthError;
      delete newErrors.dobYearError;
      delete newErrors.dobError;
      delete newErrors.dobErrorMessage;

      if (
        !currentForm.dobDay ||
        !currentForm.dobMonth ||
        !currentForm.dobYear
      ) {
        // Specific field errors for missing values
        if (!currentForm.dobDay) newErrors.dobDayError = 'Please enter day';
        if (!currentForm.dobMonth)
          newErrors.dobMonthError = 'Please select month';
        if (!currentForm.dobYear) newErrors.dobYearError = 'Please enter year';
        // Message shows first invalid field
        if (!currentForm.dobDay) {
          newErrors.dobErrorMessage = 'Please enter day';
        } else if (!currentForm.dobMonth) {
          newErrors.dobErrorMessage = 'Please select month';
        } else if (!currentForm.dobYear) {
          newErrors.dobErrorMessage = 'Please enter year';
        }
      } else {
        const day = parseInt(currentForm.dobDay, 10);
        const month = parseInt(currentForm.dobMonth, 10);
        const year = parseInt(currentForm.dobYear, 10);

        // Check specific field validity
        if (day < 1 || day > 31) {
          newErrors.dobDayError = true;
          newErrors.dobErrorMessage = `Please enter a valid day`;
        } else if (month < 1 || month > 12) {
          newErrors.dobMonthError = true;
          newErrors.dobErrorMessage = 'Please enter a valid month';
        } else if (year < 1900 || year > new Date().getFullYear()) {
          newErrors.dobYearError = true;
          newErrors.dobErrorMessage = `Please enter a valid date of birth`;
        } else {
          const dob = `${year}-${currentForm.dobMonth}-${currentForm.dobDay.padStart(2, '0')}`;
          const dateObj = new Date(dob);

          if (
            dateObj.getDate() !== day ||
            dateObj.getMonth() + 1 !== month ||
            dateObj.getFullYear() !== year
          ) {
            newErrors.dobDayError = true;
            newErrors.dobErrorMessage = `${currentForm.dobDay} is not a valid day in this month`;
          } else {
            const age = validateAge(dob);
            if (age < 16) {
              // General date error - all fields are invalid
              newErrors.dobError = true;
              newErrors.dobErrorMessage = `You must be at least 16 years old (you are ${age})`;
            } else if (age > 120) {
              newErrors.dobError = true;
              newErrors.dobErrorMessage = 'Please enter a valid date of birth';
            }
          }
        }
      }
    } else if (fieldName === 'gender') {
      if (!currentForm.gender) {
        newErrors.gender = 'Please select a gender';
      } else {
        delete newErrors.gender;
      }
    } else if (fieldName === 'occupation') {
      if (!currentForm.occupation) {
        newErrors.occupation = 'Please select an occupation';
      } else {
        delete newErrors.occupation;
      }
    } else if (fieldName === 'workRmt') {
      if (!currentForm.workRmt) {
        newErrors.workRmt = 'Please select a work mode';
      } else {
        delete newErrors.workRmt;
      }
    }

    setErrors(newErrors);
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

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name) => {
    // At least 2 characters, only letters and spaces
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
  };

  const validateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  // Validation for Stage 1 (personal info)
  const validateStage1 = (currentForm = form) => {
    const newErrors = {};

    // Name validation
    if (!currentForm.name || !currentForm.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (!validateName(currentForm.name)) {
      newErrors.name = 'Name must be 2-50 characters (letters and spaces only)';
    }

    // Date of Birth validation
    if (!currentForm.dobDay || !currentForm.dobMonth || !currentForm.dobYear) {
      if (!currentForm.dobDay) newErrors.dobDayError = 'Please enter day';
      if (!currentForm.dobMonth)
        newErrors.dobMonthError = 'Please select month';
      if (!currentForm.dobYear) newErrors.dobYearError = 'Please enter year';
      if (!currentForm.dobDay) {
        newErrors.dobErrorMessage = 'Please enter day';
      } else if (!currentForm.dobMonth) {
        newErrors.dobErrorMessage = 'Please select month';
      } else if (!currentForm.dobYear) {
        newErrors.dobErrorMessage = 'Please enter year';
      }
    } else {
      const day = parseInt(currentForm.dobDay, 10);
      const month = parseInt(currentForm.dobMonth, 10);
      const year = parseInt(currentForm.dobYear, 10);

      if (day < 1 || day > 31) {
        newErrors.dobDayError = true;
        newErrors.dobErrorMessage = `Please enter a valid day`;
      } else if (month < 1 || month > 12) {
        newErrors.dobMonthError = true;
        newErrors.dobErrorMessage = 'Please enter a valid month';
      } else if (year < 1900 || year > new Date().getFullYear()) {
        newErrors.dobYearError = true;
        newErrors.dobErrorMessage = `Please enter a valid date of birth`;
      } else {
        const dob = `${year}-${currentForm.dobMonth}-${currentForm.dobDay.padStart(2, '0')}`;
        const dateObj = new Date(dob);

        if (
          dateObj.getDate() !== day ||
          dateObj.getMonth() + 1 !== month ||
          dateObj.getFullYear() !== year
        ) {
          newErrors.dobDayError = true;
          newErrors.dobErrorMessage = `${currentForm.dobDay} is not a valid day in this month`;
        } else {
          const age = validateAge(dob);
          if (age < 16) {
            newErrors.dobError = true;
            newErrors.dobErrorMessage = `You must be at least 16 years old (you are ${age})`;
          } else if (age > 120) {
            newErrors.dobError = true;
            newErrors.dobErrorMessage = 'Please enter a valid date of birth';
          }
        }
      }
    }

    // Gender validation
    if (!currentForm.gender) {
      newErrors.gender = 'Please select a gender';
    }

    // Occupation validation
    if (!currentForm.occupation) {
      newErrors.occupation = 'Please select an occupation';
    }

    // Work Mode validation
    if (!currentForm.workRmt) {
      newErrors.workRmt = 'Please select a work mode';
    }

    return newErrors;
  };

  // Validation for Stage 2 (credentials)
  const validateStage2 = (currentForm = form) => {
    const newErrors = {};

    if (!currentForm.email || !currentForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(currentForm.email)) {
      newErrors.email =
        'Please enter a valid email address (e.g., user@example.com)';
    }

    if (!currentForm.password) {
      newErrors.password = 'Password is required';
    } else if (currentForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!validatePassword(currentForm.password)) {
      newErrors.password =
        'Password must contain uppercase, lowercase, and number';
    }

    if (!currentForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (currentForm.confirmPassword !== currentForm.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  // Handle next button on stage 1
  const handleNextStage = () => {
    // Validate stage 1
    const stage1Errors = validateStage1(form);

    setBlurredFields({
      name: true,
      dob: true,
      gender: true,
      occupation: true,
      workRmt: true,
    });

    setErrors(stage1Errors);

    if (Object.keys(stage1Errors).length === 0) {
      setIsGoingBack(false);
      setCurrentStage(1);
    } else {
      scrollToFirstError(stage1Errors, 'stage1');
    }
  };

  // Handle back button on stage 2
  const handlePreviousStage = () => {
    setIsGoingBack(true);
    setCurrentStage(0);
    setErrors({});
    setBlurredFields({
      name: form.name ? true : false,
      dob: form.dobDay && form.dobMonth && form.dobYear ? true : false,
      gender: form.gender ? true : false,
      occupation: form.occupation ? true : false,
      workRmt: form.workRmt ? true : false,
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate stage 2 fields
    const stage2Errors = validateStage2(form);

    // Mark all stage 2 fields as blurred to show all errors
    setBlurredFields((prev) => ({
      ...prev,
      email: true,
      password: true,
      confirmPassword: true,
    }));

    // Set errors state
    setErrors(stage2Errors);

    // If there are errors, scroll to first error and return
    if (Object.keys(stage2Errors).length > 0) {
      scrollToFirstError(stage2Errors, 'stage2');
      return;
    }

    setLoading(true);
    setMessage('Processing registration...');

    try {
      // Combine DOB fields into YYYY-MM-DD format
      const dob = `${form.dobYear}-${form.dobMonth}-${form.dobDay.padStart(2, '0')}`;

      // Transform gender and occupation values to API format
      const formDataToSubmit = {
        email: form.email,
        password: form.password,
        name: form.name,
        dob,
        gender: toApiGender(form.gender),
        occupation: toApiOccupation(form.occupation),
        workRmt: toApiWorkMode(form.workRmt),
      };
      const response = await apiClient.post(
        API_CONFIG.AUTH_REGISTER,
        formDataToSubmit
      );
      const result = response.data;
      setLoading(false);

      if (result.success) {
        setMessage('Registration successful! Welcome aboard.');
        setIsRegistered(true);
      } else {
        setMessage(
          result.message || 'Registration failed. Please check your form data.'
        );
      }
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message ||
        'Error connecting to server. Please ensure your backend is running.';
      setMessage(errorMessage);
      console.error('Registration error:', err);
    }
  }

  // Helper to check if stage 1 is complete
  const isStage1Complete = () => {
    return (
      form.name &&
      form.dobDay &&
      form.dobMonth &&
      form.dobYear &&
      form.gender &&
      form.occupation &&
      form.workRmt
    );
  };

  const scrollToFirstError = (errorObj, stage = 'stage1') => {
    // Array of errors in order of form fields for each stage
    let fieldErrors = [];

    if (stage === 'stage1') {
      fieldErrors = [
        { ref: nameRef, hasError: !!errorObj.name },
        {
          ref: dobRef,
          hasError: !!(
            errorObj.dobDayError ||
            errorObj.dobMonthError ||
            errorObj.dobYearError ||
            errorObj.dobError
          ),
        },
        { ref: genderRef, hasError: !!errorObj.gender },
        { ref: occupationRef, hasError: !!errorObj.occupation },
        { ref: workRmtRef, hasError: !!errorObj.workRmt },
      ];
    } else if (stage === 'stage2') {
      fieldErrors = [
        { ref: emailRef, hasError: !!errorObj.email },
        { ref: passwordRef, hasError: !!errorObj.password },
        {
          ref: passwordRef,
          hasError: !!errorObj.confirmPassword,
        },
      ];
    }

    // Find first field with error
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
  };

  const handleContinue = () => {
    navigate('/signin'); // Redirect to login after successful registration
  };

  // RENDER SUCCESS SCREEN
  if (isRegistered) {
    return (
      <AuthPageLayout>
        <PageHeader title="✅ Registration Successful!" subtitle="" />
        <FormContainer onSubmit={(e) => e.preventDefault()}>
          <p style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            Your account has been successfully created. Please log in to start
            your mental health journey.
          </p>
          <ErrorAlert message={message} show={true} />
          <Button
            type="button"
            variant="filled"
            fullWidth
            onClick={handleContinue}
          >
            Login Now
          </Button>
        </FormContainer>
      </AuthPageLayout>
    );
  }

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
          error={blurredFields.name && !!errors.name}
          fullWidth
        />
        {blurredFields.name && <Message type="error" message={errors.name} />}
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
          dayError={blurredFields.dob && !!errors.dobDayError}
          monthError={blurredFields.dob && !!errors.dobMonthError}
          yearError={blurredFields.dob && !!errors.dobYearError}
          dateError={blurredFields.dob && !!errors.dobError}
        />
        {blurredFields.dob && (
          <Message type="error" message={errors.dobErrorMessage} />
        )}
      </FormSection>

      <FormSection ref={genderRef}>
        <Dropdown
          label="Gender"
          options={genderOptions}
          value={
            form.gender
              ? genderOptions.find((opt) => opt.value === form.gender)
              : null
          }
          onChange={(option) => {
            const updatedForm = { ...form, gender: option.value };
            handleDropdownChange('gender', option);
            if (blurredFields.gender) validateField('gender', updatedForm);
          }}
          onBlur={() => handleBlur('gender', form)}
          error={blurredFields.gender && !!errors.gender}
          fullWidth
        />
        {blurredFields.gender && (
          <Message type="error" message={errors.gender} />
        )}
      </FormSection>

      <FormSection ref={occupationRef}>
        <Dropdown
          label="Occupation"
          options={occupationOptions}
          value={
            form.occupation
              ? occupationOptions.find((opt) => opt.value === form.occupation)
              : null
          }
          onChange={(option) => {
            const updatedForm = { ...form, occupation: option.value };
            handleDropdownChange('occupation', option);
            if (blurredFields.occupation)
              validateField('occupation', updatedForm);
          }}
          onBlur={() => handleBlur('occupation', form)}
          error={blurredFields.occupation && !!errors.occupation}
          fullWidth
        />
        {blurredFields.occupation && (
          <Message type="error" message={errors.occupation} />
        )}
      </FormSection>

      <FormSection ref={workRmtRef}>
        <Dropdown
          label="Work Mode"
          options={workModeOptions}
          value={
            form.workRmt
              ? workModeOptions.find((opt) => opt.value === form.workRmt)
              : null
          }
          onChange={(option) => {
            const updatedForm = { ...form, workRmt: option.value };
            handleDropdownChange('workRmt', option);
            if (blurredFields.workRmt) validateField('workRmt', updatedForm);
          }}
          onBlur={() => handleBlur('workRmt', form)}
          error={blurredFields.workRmt && !!errors.workRmt}
          fullWidth
        />
        {blurredFields.workRmt && (
          <Message type="error" message={errors.workRmt} />
        )}
      </FormSection>

      <Button
        type="button"
        variant="filled"
        fullWidth
        onClick={handleNextStage}
        disabled={!isStage1Complete()}
      >
        Next
      </Button>
    </>
  );

  // STAGE 2: Credentials
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
          error={blurredFields.email && !!errors.email}
          fullWidth
        />
        {blurredFields.email && <Message type="error" message={errors.email} />}
      </FormSection>

      <FormSection ref={passwordRef}>
        <PasswordField
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          onBlur={handleTextFieldBlur}
          error={blurredFields.password && !!errors.password}
          fullWidth
        />
        {blurredFields.password && (
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
          error={blurredFields.confirmPassword && !!errors.confirmPassword}
          fullWidth
        />
        {blurredFields.confirmPassword && (
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
          stages={[stage1, stage2]}
          currentStage={currentStage}
          isGoingBack={isGoingBack}
        />
      </FormContainer>

      {/* Login Link Container */}
      <p style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
        Already have an account? <Link href="/signin">Sign In Here</Link>
      </p>

      <ErrorAlert
        message={message}
        show={
          message &&
          (message.includes('failed') ||
            message.includes('error') ||
            message.includes('Error'))
        }
      />
    </AuthPageLayout>
  );
}

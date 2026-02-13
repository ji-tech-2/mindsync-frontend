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
  ErrorMessage,
  Link,
} from '@/components';
import {
  genderOptions,
  occupationOptions,
  workModeOptions,
  toApiGender,
  toApiOccupation,
  toApiWorkMode,
} from '@/utils/fieldMappings';
import styles from './SignUp.module.css';

export default function SignUp() {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);

  // Create refs for form fields
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const nameRef = useRef(null);
  const dobRef = useRef(null);
  const genderRef = useRef(null);
  const occupationRef = useRef(null);
  const workRmtRef = useRef(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
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

  const scrollToFirstError = (errorObj) => {
    // Array of errors in order of form fields
    const fieldErrors = [
      { ref: emailRef, hasError: !!errorObj.email },
      { ref: passwordRef, hasError: !!errorObj.password },
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

    // Find first field with error
    const firstErrorField = fieldErrors.find((field) => field.hasError);

    if (firstErrorField && firstErrorField.ref.current) {
      // Scroll to the element (check if method exists for test compatibility)
      if (typeof firstErrorField.ref.current.scrollIntoView === 'function') {
        firstErrorField.ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }

      // Try to focus the element
      if (firstErrorField.ref.current.querySelector('input')) {
        firstErrorField.ref.current.querySelector('input').focus();
      } else if (firstErrorField.ref.current.querySelector('button')) {
        firstErrorField.ref.current.querySelector('button').focus();
      }
    }
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

  const validateFormSync = () => {
    const newErrors = {};

    // Email validation
    if (!form.email || !form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(form.email)) {
      newErrors.email =
        'Please enter a valid email address (e.g., user@example.com)';
    }

    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!validatePassword(form.password)) {
      newErrors.password =
        'Password must contain uppercase, lowercase, and number';
    }

    // Name validation
    if (!form.name || !form.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (!validateName(form.name)) {
      newErrors.name = 'Name must be 2-50 characters (letters and spaces only)';
    }

    // Date of Birth validation
    if (!form.dobDay || !form.dobMonth || !form.dobYear) {
      // Specific field errors for missing values
      if (!form.dobDay) newErrors.dobDayError = 'Please enter day';
      if (!form.dobMonth) newErrors.dobMonthError = 'Please select month';
      if (!form.dobYear) newErrors.dobYearError = 'Please enter year';
      // Message shows first invalid field
      if (!form.dobDay) {
        newErrors.dobErrorMessage = 'Please enter day';
      } else if (!form.dobMonth) {
        newErrors.dobErrorMessage = 'Please select month';
      } else if (!form.dobYear) {
        newErrors.dobErrorMessage = 'Please enter year';
      }
    } else {
      const day = parseInt(form.dobDay, 10);
      const month = parseInt(form.dobMonth, 10);
      const year = parseInt(form.dobYear, 10);

      // Check specific field validity
      if (day < 1 || day > 31) {
        newErrors.dobDayError = true;
        newErrors.dobErrorMessage = `Invalid day: must be between 1 and 31`;
      } else if (month < 1 || month > 12) {
        newErrors.dobMonthError = true;
        newErrors.dobErrorMessage = 'Invalid month: must be between 1 and 12';
      } else if (year < 1900 || year > new Date().getFullYear()) {
        newErrors.dobYearError = true;
        newErrors.dobErrorMessage = `Invalid year: must be between 1900 and ${new Date().getFullYear()}`;
      } else {
        // Check if date is valid (e.g., Feb 30 doesn't exist)
        const dob = `${year}-${form.dobMonth}-${form.dobDay.padStart(2, '0')}`;
        const dateObj = new Date(dob);

        if (
          dateObj.getDate() !== day ||
          dateObj.getMonth() + 1 !== month ||
          dateObj.getFullYear() !== year
        ) {
          newErrors.dobDayError = true;
          newErrors.dobErrorMessage = `Invalid date: ${form.dobDay} is not a valid day in this month`;
        } else {
          // Check age
          const age = validateAge(dob);
          if (age < 13) {
            newErrors.dobError = true;
            newErrors.dobErrorMessage = `You must be at least 13 years old (you are ${age})`;
          } else if (age > 120) {
            newErrors.dobError = true;
            newErrors.dobErrorMessage = 'Please enter a valid date of birth';
          }
        }
      }
    }

    // Gender validation
    if (!form.gender) {
      newErrors.gender = 'Please select a gender';
    }

    // Occupation validation
    if (!form.occupation) {
      newErrors.occupation = 'Please select an occupation';
    }

    // Work Mode validation
    if (!form.workRmt) {
      newErrors.workRmt = 'Please select a work mode';
    }

    return newErrors;
  };
  const newErrors = {};

  // Email validation
  if (!form.email || !form.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!validateEmail(form.email)) {
    newErrors.email =
      'Please enter a valid email address (e.g., user@example.com)';
  }

  // Password validation
  if (!form.password) {
    newErrors.password = 'Password is required';
  } else if (form.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  } else if (!validatePassword(form.password)) {
    newErrors.password =
      'Password must contain uppercase, lowercase, and number';
  }

  // Name validation
  if (!form.name || !form.name.trim()) {
    newErrors.name = 'Full name is required';
  } else if (!validateName(form.name)) {
    newErrors.name = 'Name must be 2-50 characters (letters and spaces only)';
  }

  // Date of Birth validation
  if (!form.dobDay || !form.dobMonth || !form.dobYear) {
    // Specific field errors for missing values
    if (!form.dobDay) newErrors.dobDayError = 'Please enter day';
    if (!form.dobMonth) newErrors.dobMonthError = 'Please select month';
    if (!form.dobYear) newErrors.dobYearError = 'Please enter year';
    // Message shows first invalid field
    if (!form.dobDay) {
      newErrors.dobErrorMessage = 'Please enter day';
    } else if (!form.dobMonth) {
      newErrors.dobErrorMessage = 'Please select month';
    } else if (!form.dobYear) {
      newErrors.dobErrorMessage = 'Please enter year';
    }
  } else {
    const day = parseInt(form.dobDay, 10);
    const month = parseInt(form.dobMonth, 10);
    const year = parseInt(form.dobYear, 10);

    // Check specific field validity
    if (day < 1 || day > 31) {
      newErrors.dobDayError = true;
      newErrors.dobErrorMessage = `Invalid day: must be between 1 and 31`;
    } else if (month < 1 || month > 12) {
      newErrors.dobMonthError = true;
      newErrors.dobErrorMessage = 'Invalid month: must be between 1 and 12';
    } else if (year < 1900 || year > new Date().getFullYear()) {
      newErrors.dobYearError = true;
      newErrors.dobErrorMessage = `Invalid year: must be between 1900 and ${new Date().getFullYear()}`;
    } else {
      // Check if date is valid (e.g., Feb 30 doesn't exist)
      const dob = `${year}-${form.dobMonth}-${form.dobDay.padStart(2, '0')}`;
      const dateObj = new Date(dob);

      if (
        dateObj.getDate() !== day ||
        dateObj.getMonth() + 1 !== month ||
        dateObj.getFullYear() !== year
      ) {
        newErrors.dobDayError = true;
        newErrors.dobErrorMessage = `Invalid date: ${form.dobDay} is not a valid day in this month`;
      } else {
        // Check age
        const age = validateAge(dob);
        if (age < 13) {
          newErrors.dobError = true;
          newErrors.dobErrorMessage = `You must be at least 13 years old (you are ${age})`;
        } else if (age > 120) {
          newErrors.dobError = true;
          newErrors.dobErrorMessage = 'Please enter a valid date of birth';
        }
      }
    }
  }

  // Gender validation
  if (!form.gender) {
    newErrors.gender = 'Please select a gender';
  }

  // Occupation validation
  if (!form.occupation) {
    newErrors.occupation = 'Please select an occupation';
  }

  // Work Mode validation
  if (!form.workRmt) {
    newErrors.workRmt = 'Please select a work mode';
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate form synchronously to get errors immediately
    const formErrors = validateFormSync();

    // Mark all fields as blurred to show all errors
    setBlurredFields({
      email: true,
      password: true,
      name: true,
      dob: true,
      gender: true,
      occupation: true,
      workRmt: true,
    });

    // Set errors state
    setErrors(formErrors);

    // If there are errors, scroll to first error
    if (Object.keys(formErrors).length > 0) {
      scrollToFirstError(formErrors);
      return;
    }

    setLoading(true);
    setMessage('Processing registration...');
    setErrors({});

    // Backend response: { success: true, message: "...", data: { email, name } }
    // Note: Backend doesn't return token on sign up, user needs to login after
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
        // Note: User will need to login after successful registration
        // Or you can auto-login here by calling the login endpoint
      } else {
        setMessage(
          result.message || 'Registration failed. Please check your form data.'
        );
        setIsRegistered(false);
      }
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message ||
        'Error connecting to server. Please ensure your backend is running.';
      setMessage(errorMessage);
      setIsRegistered(false);
      console.error('Registration error:', err);
    }
  }

  const handleContinue = () => {
    navigate('/signIn'); // Redirect to login after successful registration
  };

  // RENDER SUCCESS SCREEN
  if (isRegistered) {
    return (
      <div className={styles.wrapper}>
        <Card padded elevation="md" variant="light" className={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <h2 className={styles.title}>✅ Registration Successful!</h2>

            <p className={`${styles.message} ${styles.successMessageBox}`}>
              {message}
            </p>

            <p>
              Your account has been successfully created. Please log in to start
              your mental health journey.
            </p>

            <Button
              type="button"
              variant="filled"
              fullWidth
              onClick={handleContinue}
            >
              Login Now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Determine message wrapper styling
  const messageWrapperClass = `${
    message &&
    (message.includes('failed') ||
      message.includes('error') ||
      message.includes('Error'))
      ? styles.error
      : styles.success
  }`;

  return (
    <div className={styles.wrapper}>
      <Card padded elevation="md" variant="light" className={styles.card}>
        <div style={{ textAlign: 'center' }}>
          <h2 className={styles.title}>Sign Up</h2>
          <p className={styles.subtitle}>
            Join us and start your wellness journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div ref={emailRef}>
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
            {blurredFields.email && <ErrorMessage message={errors.email} />}
          </div>

          <div ref={passwordRef}>
            <TextField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleTextFieldBlur}
              error={blurredFields.password && !!errors.password}
              fullWidth
            />
            {blurredFields.password && (
              <ErrorMessage message={errors.password} />
            )}
          </div>

          <div ref={nameRef}>
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
            {blurredFields.name && <ErrorMessage message={errors.name} />}
          </div>

          <div ref={dobRef}>
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
              <ErrorMessage message={errors.dobErrorMessage} />
            )}
          </div>

          <div ref={genderRef}>
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
            {blurredFields.gender && <ErrorMessage message={errors.gender} />}
          </div>

          <div ref={occupationRef}>
            <Dropdown
              label="Occupation"
              options={occupationOptions}
              value={
                form.occupation
                  ? occupationOptions.find(
                      (opt) => opt.value === form.occupation
                    )
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
              <ErrorMessage message={errors.occupation} />
            )}
          </div>

          <div ref={workRmtRef}>
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
                if (blurredFields.workRmt)
                  validateField('workRmt', updatedForm);
              }}
              onBlur={() => handleBlur('workRmt', form)}
              error={blurredFields.workRmt && !!errors.workRmt}
              fullWidth
            />
            {blurredFields.workRmt && <ErrorMessage message={errors.workRmt} />}
          </div>

          <Button type="submit" variant="filled" fullWidth disabled={loading}>
            {loading ? 'Processing...' : 'Sign Up'}
          </Button>
        </form>

        {message && (
          <div className={`${styles.messageWrapper} ${messageWrapperClass}`}>
            <p className={styles.message}>{message}</p>
          </div>
        )}

        {/* Login Link Container */}
        <div className={styles.loginLinkContainer}>
          <p>
            Already have an account? <Link href="/signIn">Login Here</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

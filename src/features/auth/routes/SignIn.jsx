import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient, { API_CONFIG } from '@/config/api';
import { Button, TextField, Message, Link } from '@/components';
import PasswordField from '../components/PasswordField';
import AuthPageLayout from '../components/AuthPageLayout';
import PageHeader from '../components/PageHeader';
import FormContainer from '../components/FormContainer';
import FormSection from '../components/FormSection';
import ErrorAlert from '../components/ErrorAlert';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Create refs for form fields
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Get the page they were trying to visit, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [blurredFields, setBlurredFields] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;

    const updatedForm = {
      ...form,
      [name]: value,
    };

    setForm(updatedForm);
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
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
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const scrollToFirstError = (errorObj) => {
    // Array of errors in order of form fields
    const fieldErrors = [
      { ref: emailRef, hasError: !!errorObj.email },
      { ref: passwordRef, hasError: !!errorObj.password },
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
      }
    }
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
    }

    return newErrors;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate form synchronously to get errors immediately
    const formErrors = validateFormSync();

    // Mark all fields as blurred to show all errors
    setBlurredFields({
      email: true,
      password: true,
    });

    // Set errors state
    setErrors(formErrors);

    // If there are errors, scroll to first error
    if (Object.keys(formErrors).length > 0) {
      scrollToFirstError(formErrors);
      return;
    }

    setLoading(true);
    setMessage('Processing sign in...');
    setErrors({});

    // Backend response: { success: true, user: { email, name, userId } }
    // Authentication via httpOnly cookie (no token in response)
    try {
      const response = await apiClient.post(API_CONFIG.AUTH_LOGIN, {
        email: form.email,
        password: form.password,
      });

      const data = response.data;
      setLoading(false);

      if (data.success && data.user) {
        setMessage('Sign in successful!');

        // Use AuthContext login to update global auth state
        // Cookie is automatically sent with subsequent requests
        login(data.user);

        // Redirect to the page they were trying to visit, or dashboard
        navigate(from, { replace: true });
      } else {
        setMessage(data.message || 'Sign in failed');
      }
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message || 'Server error occurred';
      setMessage(errorMessage);
      console.error('Sign in error:', err);
    }
  }

  return (
    <AuthPageLayout>
      <PageHeader
        title="Sign In"
        subtitle="Welcome back, let's continue your wellness journey"
      />

      <FormContainer onSubmit={handleSubmit}>
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
          {blurredFields.email && (
            <Message type="error" message={errors.email} />
          )}
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
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <Link href="/forgot-password">Forgot Password?</Link>
          </div>
        </FormSection>

        <Button type="submit" variant="filled" fullWidth disabled={loading}>
          {loading ? 'Processing...' : 'Sign In'}
        </Button>
      </FormContainer>

      {/* Create Account Button */}
      <Button
        type="button"
        variant="outlined"
        fullWidth
        href="/signup"
        style={{ marginTop: 'var(--space-sm)' }}
      >
        Create Account
      </Button>

      {/* Show success messages */}
      {message && message.includes('successful') && (
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
      <ErrorAlert
        message={message}
        show={
          message &&
          !message.includes('successful') &&
          (message.includes('failed') ||
            message.includes('error') ||
            message.includes('Error') ||
            message.includes('credentials') ||
            message.includes('Invalid'))
        }
      />
    </AuthPageLayout>
  );
}

import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signIn as signInService } from '@/services';
import {
  Button,
  TextField,
  Message,
  Link,
  FormContainer,
  FormSection,
} from '@/components';
import PasswordField from '../components/PasswordField';
import AuthPageLayout from '../components/AuthPageLayout';
import PageHeader from '../components/PageHeader';
import {
  validateSignInField,
  validateSignInForm,
  scrollToFirstErrorField,
} from '../utils/signInHelpers';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Create refs for form fields
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Get the page they were trying to visit, or default to dashboard
  const from =
    location.state?.from?.pathname || location.state?.from || '/dashboard';

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [blurredFields, setBlurredFields] = useState({});
  const [isMessageError, setIsMessageError] = useState(false);

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
      setErrors(validateSignInField(name, updatedForm, errors));
    }
  }

  function handleTextFieldBlur(e) {
    const { name } = e.target;
    handleBlur(name, form);
  }

  function handleBlur(fieldName, updatedForm = null) {
    setBlurredFields({ ...blurredFields, [fieldName]: true });
    setErrors(validateSignInField(fieldName, updatedForm || form, errors));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formErrors = validateSignInForm(form);

    setBlurredFields({
      email: true,
      password: true,
    });

    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      scrollToFirstErrorField(formErrors, [
        { ref: emailRef, hasError: !!formErrors.email },
        { ref: passwordRef, hasError: !!formErrors.password },
      ]);
      return;
    }

    setLoading(true);
    setMessage('Processing sign in...');
    setIsMessageError(false);
    setErrors({});

    // Backend response: { success: true, user: { email, name, userId } }
    // Authentication via httpOnly cookie (no token in response)
    try {
      const data = await signInService(form.email, form.password);

      if (data.success && data.user) {
        setMessage('Sign in successful!');
        setIsMessageError(false);
        setLoading(false);

        // Use AuthContext login to update global auth state
        // Cookie is automatically sent with subsequent requests
        login(data.user);

        // Redirect to the page they were trying to visit, or dashboard
        navigate(from, { replace: true });
      } else {
        setLoading(false);
        setMessage(data.message || 'Sign in failed');
        setIsMessageError(!data.success);
      }
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message || 'Server error occurred';
      setMessage(errorMessage);
      setIsMessageError(true);
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
        state={{ from: from }}
        style={{ marginTop: 'var(--space-sm)' }}
      >
        Create Account
      </Button>

      {/* Show messages */}
      {message && (
        <Message
          type={isMessageError ? 'error' : 'success'}
          style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}
        >
          {message}
        </Message>
      )}
    </AuthPageLayout>
  );
}

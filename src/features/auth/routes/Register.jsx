import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { API_CONFIG } from '@/config/api';
import { validatePassword } from '@/utils/passwordValidation';
import { Dropdown, TextField, Button } from '@/components';
import {
  genderOptions,
  occupationOptions,
  workModeOptions,
  toApiGender,
  toApiOccupation,
  toApiWorkMode,
} from '@/utils/fieldMappings';
import styles from './Register.module.css';

export default function Register() {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    dob: '',
    gender: '',
    occupation: '',
    workRmt: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  }

  function handleDropdownChange(fieldName, option) {
    setForm({
      ...form,
      [fieldName]: option.value,
    });
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
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

  const validateForm = () => {
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
    if (!form.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const age = validateAge(form.dob);
      if (age < 13) {
        newErrors.dob = 'You must be at least 13 years old';
      } else if (age > 120) {
        newErrors.dob = 'Please enter a valid date of birth';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      setMessage('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    setMessage('Processing registration...');
    setErrors({});

    // Backend response: { success: true, message: "...", data: { email, name } }
    // Note: Backend doesn't return token on register, user needs to login after
    try {
      // Transform gender and occupation values to API format
      const formDataToSubmit = {
        ...form,
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

  // Fungsi baru untuk navigasi ke Login
  const handleLoginClick = () => {
    navigate('/signIn');
  };

  // RENDER HALAMAN SUKSES
  if (isRegistered) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <h2>✅ Registration Successful!</h2>

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

  // RENDER FORM REGISTER
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2>Register</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            fullWidth
          />

          <TextField
            label="Full Name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            fullWidth
          />

          <TextField
            label="Date of Birth"
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            error={errors.dob}
            fullWidth
            max={new Date().toISOString().split('T')[0]}
          />

          <Dropdown
            label="Gender"
            options={genderOptions}
            value={
              form.gender
                ? genderOptions.find((opt) => opt.value === form.gender)
                : null
            }
            onChange={(option) => handleDropdownChange('gender', option)}
            fullWidth
          />

          <Dropdown
            label="Occupation"
            options={occupationOptions}
            value={
              form.occupation
                ? occupationOptions.find((opt) => opt.value === form.occupation)
                : null
            }
            onChange={(option) => handleDropdownChange('occupation', option)}
            fullWidth
          />

          <Dropdown
            label="Work Mode"
            options={workModeOptions}
            value={
              form.workRmt
                ? workModeOptions.find((opt) => opt.value === form.workRmt)
                : null
            }
            onChange={(option) => handleDropdownChange('workRmt', option)}
            fullWidth
          />

          <Button type="submit" variant="filled" fullWidth disabled={loading}>
            {loading ? 'Processing...' : 'Register'}
          </Button>
        </form>

        {message && (
          <div className={`${styles.messageWrapper} ${messageWrapperClass}`}>
            <p className={styles.message}>{message}</p>
          </div>
        )}

        {/* Login Link Container */}
        <div className={styles.loginLinkContainer}>
          <p>Sudah punya akun?</p>
          <Button
            variant="ghost"
            onClick={handleLoginClick}
            className={styles.loginLinkButton}
          >
            Masuk di sini.
          </Button>
        </div>
      </div>
    </div>
  );
}

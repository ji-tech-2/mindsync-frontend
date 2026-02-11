import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { API_CONFIG } from '@/config/api';
import { validatePassword } from '@/utils/passwordValidation';
import { FormSelect } from '@/components';
import {
  genderOptions,
  occupationOptions,
  workModeOptions,
  toApiGender,
  toApiOccupation,
  toApiWorkMode,
} from '@/utils/fieldMappings';
import '../assets/register.css';

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
      <div className="register-wrapper">
        <div className="register-container success-screen">
          <h2>✅ Registration Successful!</h2>

          <p className="register-message success-message-box">{message}</p>

          <p>
            Your account has been successfully created. Please log in to start
            your mental health journey.
          </p>

          <button
            type="button"
            className="register-btn"
            onClick={handleContinue}
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  // Tentukan class untuk error message
  const messageClass =
    message &&
    (message.includes('failed') ||
      message.includes('error') ||
      message.includes('Error'))
      ? 'register-message error' // Ubah ke 'error' untuk konsistensi CSS
      : 'register-message success'; // Default ke 'success' atau netral

  // RENDER FORM REGISTER
  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h2>Register</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-field">
            <input
              name="email"
              type="email"
              placeholder="Email (will be used as your username)"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-field">
            <input
              name="password"
              type="password"
              placeholder="Password (min 8 chars, include A-Z, a-z, 0-9)"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-field">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-field">
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              className={errors.dob ? 'input-error' : ''}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.dob && <span className="error-text">{errors.dob}</span>}
          </div>

          <div className="form-field">
            <FormSelect
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              options={genderOptions}
            />
          </div>

          <div className="form-field">
            <FormSelect
              label="Occupation"
              name="occupation"
              value={form.occupation}
              onChange={handleChange}
              options={occupationOptions}
            />
          </div>

          <div className="form-field">
            <FormSelect
              label="Work Mode"
              name="workRmt"
              value={form.workRmt}
              onChange={handleChange}
              options={workModeOptions}
            />
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>

        {message && (
          <div className="register-message-wrapper">
            <p className={messageClass}>{message}</p>
          </div>
        )}

        {/* Opsi Navigasi ke Login */}
        <div className="login-link-container">
          <p>Sudah punya akun?</p>
          <button
            type="button"
            onClick={handleLoginClick}
            className="login-link-btn"
          >
            Masuk di sini.
          </button>
        </div>
      </div>
    </div>
  );
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render component with router
const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  describe('Form Rendering', () => {
    it('should render login form with all fields', () => {
      renderLogin();
      
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should render register link', () => {
      renderLogin();
      
      expect(screen.getByText('Belum punya akun?')).toBeInTheDocument();
      expect(screen.getByText('Daftar di sini.')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should accept valid email format', async () => {
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      // Email error should NOT be present when email is valid
      const emailError = screen.queryByText(/Please enter a valid email address/i);
      expect(emailError).not.toBeInTheDocument();
    });

    it('should show error when password is empty', async () => {
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '12345' } });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
      
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('API Integration - POST Method', () => {
    it('should make POST request to correct endpoint with credentials', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, email: 'test@example.com', token: 'fake-token' }
      };
      
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );
      
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://139.59.109.5:8000/v0-1/auth-login',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
          }
        );
      });
    });

    it('should handle successful login response', async () => {
      const mockUserData = { 
        id: 1, 
        email: 'test@example.com', 
        token: 'fake-token' 
      };
      
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: mockUserData
          }),
        })
      );
      
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Login berhasil!')).toBeInTheDocument();
      });
      
      // Verify localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      expect(storedUser).toEqual(mockUserData);
      
      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle login failure response', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: false,
            message: 'Invalid credentials'
          }),
        })
      );
      
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
      
      // Verify no navigation
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Verify no localStorage
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should handle network error', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
      
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Terjadi kesalahan server')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state during submission', async () => {
      global.fetch = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderLogin();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to register page when clicking register link', () => {
      renderLogin();
      
      const registerButton = screen.getByText('Daftar di sini.');
      fireEvent.click(registerButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });
});

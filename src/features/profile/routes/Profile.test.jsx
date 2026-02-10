import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import { AuthProvider } from '@/features/auth';
import apiClient from '@/config/api';

// Mock apiClient
vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
  TokenManager: {
    getToken: vi.fn(),
    getUserData: vi.fn(),
    setUserData: vi.fn(),
    clearToken: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderProfile = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Profile />
      </AuthProvider>
    </BrowserRouter>
  );
};

const mockUserData = {
  name: 'John Doe',
  email: 'john@example.com',
  gender: 'Male',
  occupation: 'Employed',
  workRmt: 'Remote',
  dob: '1990-01-01',
};

describe('Profile Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  describe('Profile Loading and Display', () => {
    it('should display loading state initially', () => {
      apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      renderProfile();
      expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
    });

    it('should fetch and display user profile data', async () => {
      apiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: mockUserData,
        },
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Male')).toBeInTheDocument();
        expect(screen.getByText('Employed')).toBeInTheDocument();
        expect(screen.getByText('Remote')).toBeInTheDocument();
      });

      expect(apiClient.get).toHaveBeenCalledWith('/v0-1/auth-profile');
    });

    it('should display avatar with first letter of name', async () => {
      apiClient.get.mockResolvedValue({
        data: { success: true, data: mockUserData },
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('J')).toBeInTheDocument();
      });
    });

    it('should handle API error when fetching profile', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      apiClient.get.mockRejectedValue(new Error('Network error'));

      renderProfile();

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('Navigation', () => {
    it('should navigate back to dashboard when back button clicked', async () => {
      apiClient.get.mockResolvedValue({
        data: { success: true, data: mockUserData },
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', {
        name: /back to dashboard/i,
      });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Edit Modals', () => {
    beforeEach(async () => {
      apiClient.get.mockResolvedValue({
        data: { success: true, data: mockUserData },
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should open name edit modal when edit button clicked', async () => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]); // First edit button (Name)

      await waitFor(() => {
        expect(screen.getByText('Edit Name')).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText(/enter new name/i)
        ).toBeInTheDocument();
      });
    });

    it('should open gender edit modal', async () => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[1]); // Gender edit button

      await waitFor(() => {
        expect(screen.getByText('Edit Gender')).toBeInTheDocument();
      });
    });

    it('should open occupation edit modal', async () => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[2]); // Occupation edit button

      await waitFor(() => {
        expect(screen.getByText('Edit Occupation')).toBeInTheDocument();
      });
    });

    it('should open work mode edit modal', async () => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[3]); // Work mode edit button

      await waitFor(() => {
        expect(screen.getByText('Edit Work Mode')).toBeInTheDocument();
      });
    });

    it('should open password change modal', async () => {
      const changeButton = screen.getByRole('button', { name: /change/i });
      fireEvent.click(changeButton);

      await waitFor(() => {
        expect(screen.getByText('Change Password')).toBeInTheDocument();
      });
    });

    it('should close modal when close button clicked', async () => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Name')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Edit Name')).not.toBeInTheDocument();
      });
    });

    it('should close modal when clicking overlay', async () => {
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Name')).toBeInTheDocument();
      });

      const overlay = screen
        .getByText('Edit Name')
        .closest('.modal-content').parentElement;
      fireEvent.click(overlay);

      await waitFor(() => {
        expect(screen.queryByText('Edit Name')).not.toBeInTheDocument();
      });
    });
  });

  describe('Update Profile Fields', () => {
    beforeEach(async () => {
      apiClient.get.mockResolvedValue({
        data: { success: true, data: mockUserData },
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should update name successfully', async () => {
      apiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Profile updated successfully',
          data: { ...mockUserData, name: 'Jane Doe' },
        },
      });

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter new name/i)
        ).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/enter new name/i);
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      const submitButton = screen.getByRole('button', { name: /update name/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith('/v0-1/auth-profile', {
          name: 'Jane Doe',
        });
        expect(
          screen.getByText(/profile updated successfully/i)
        ).toBeInTheDocument();
      });
    });

    it('should update gender successfully', async () => {
      apiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Profile updated successfully',
          data: { ...mockUserData, gender: 'Female' },
        },
      });

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[1]);

      await waitFor(() => {
        expect(screen.getByText('Edit Gender')).toBeInTheDocument();
      });

      const genderSelect = screen.getByRole('combobox');
      fireEvent.change(genderSelect, { target: { value: 'Female' } });

      const submitButton = screen.getByRole('button', {
        name: /update gender/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith('/v0-1/auth-profile', {
          gender: 'Female',
        });
      });
    });

    it('should update occupation successfully', async () => {
      apiClient.put.mockResolvedValue({
        data: {
          success: true,
          message: 'Profile updated successfully',
          data: { ...mockUserData, occupation: 'Student' },
        },
      });

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[2]);

      await waitFor(() => {
        expect(screen.getByText('Edit Occupation')).toBeInTheDocument();
      });

      const occupationSelect = screen.getByRole('combobox');
      fireEvent.change(occupationSelect, { target: { value: 'Student' } });

      const submitButton = screen.getByRole('button', {
        name: /update occupation/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith('/v0-1/auth-profile', {
          occupation: 'Student',
        });
      });
    });

    it('should handle update error', async () => {
      apiClient.put.mockRejectedValue({
        response: { data: { message: 'Update failed' } },
      });

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter new name/i)
        ).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/enter new name/i);
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      const submitButton = screen.getByRole('button', { name: /update name/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Change', () => {
    beforeEach(async () => {
      apiClient.get.mockResolvedValue({
        data: { success: true, data: mockUserData },
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const changeButton = screen.getByRole('button', { name: /change/i });
      fireEvent.click(changeButton);

      await waitFor(() => {
        expect(screen.getByText('Change Password')).toBeInTheDocument();
      });
    });

    it('should send OTP when button clicked', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'OTP has been sent to your email',
        },
      });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });

      // First need to enter new password to enable OTP button
      const passwordInput = screen.getByPlaceholderText(/enter new password/i);
      fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });

      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/v0-1/auth-profile/request-otp',
          {
            email: 'john@example.com',
          }
        );
        expect(screen.getByText(/otp has been sent/i)).toBeInTheDocument();
      });
    });

    it('should change password successfully with OTP', async () => {
      apiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Password changed successfully',
        },
      });

      const passwordInput = screen.getByPlaceholderText(/enter new password/i);
      const otpInput = screen.getByPlaceholderText(/enter otp/i);

      fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });
      fireEvent.change(otpInput, { target: { value: '123456' } });

      const submitButton = screen.getByRole('button', { name: /update/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/v0-1/auth-profile/change-password',
          {
            email: 'john@example.com',
            otp: '123456',
            newPassword: 'newPassword123',
          }
        );
        expect(
          screen.getByText(/password changed successfully/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle OTP send error', async () => {
      apiClient.post.mockRejectedValue({
        response: { data: { message: 'Failed to send OTP' } },
      });

      const passwordInput = screen.getByPlaceholderText(/enter new password/i);
      fireEvent.change(passwordInput, { target: { value: 'newPassword123' } });

      const sendOtpButton = screen.getByRole('button', { name: /send otp/i });
      fireEvent.click(sendOtpButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to send otp/i)).toBeInTheDocument();
      });
    });
  });

  describe('Email Field', () => {
    it('should display email without edit button', async () => {
      apiClient.get.mockResolvedValue({
        data: { success: true, data: mockUserData },
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });

      // Check that email field row doesn't have edit button
      const emailLabel = screen.getByText('Email');
      const emailRow = emailLabel.closest('.field-row');
      const editButton = emailRow.querySelector('button');
      expect(editButton).toBeNull();
    });
  });
});

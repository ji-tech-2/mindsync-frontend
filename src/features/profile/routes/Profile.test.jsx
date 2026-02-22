import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';
import * as servicesModule from '@/services';
import { TokenManager } from '@/utils/tokenManager';

// Mock services
vi.mock('@/services', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}));

// Mock auth
const mockUpdateUser = vi.fn();
vi.mock('@/features/auth', () => ({
  useAuth: () => ({ updateUser: mockUpdateUser }),
}));

// Mock TokenManager
vi.mock('@/utils/tokenManager', () => ({
  TokenManager: {
    setUserData: vi.fn(),
  },
}));

// Mock validators
vi.mock('@/features/auth/utils/signUpValidators', () => ({
  validateNameField: vi.fn().mockReturnValue(''),
  validateDobField: vi.fn().mockReturnValue({}),
}));

vi.mock('@/features/auth/utils/formHandlers', () => ({
  hasDobFieldError: vi.fn().mockReturnValue(false),
}));

// Mock components with simple HTML equivalents
vi.mock('@/components', () => ({
  TextField: ({ label, value, onChange, disabled, onBlur }) => (
    <div>
      <label>{label}</label>
      <input
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        onBlur={onBlur}
        aria-label={label}
      />
    </div>
  ),
  Dropdown: ({ label, options, value, onChange }) => (
    <div>
      <label>{label}</label>
      <select
        aria-label={label}
        value={value?.value || ''}
        onChange={(e) => {
          const opt = options?.find((o) => o.value === e.target.value);
          if (onChange && opt) onChange(opt);
        }}
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
  Button: ({ children, onClick, disabled, type }) => (
    <button onClick={onClick} disabled={disabled} type={type || 'button'}>
      {children}
    </button>
  ),
  Message: ({ type, children }) => (
    <div data-testid="message" data-type={type}>
      {children}
    </div>
  ),
  PasswordField: ({ label, value, onChange, disabled, name }) => (
    <div>
      <label>{label}</label>
      <input
        type="password"
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  ),
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  DateField: ({
    label,
    dayValue,
    monthValue,
    yearValue,
    onDayChange,
    onMonthChange,
    onYearChange,
    onDayBlur,
    onMonthBlur,
    onYearBlur,
  }) => (
    <div>
      <label>{label}</label>
      <input
        aria-label="Day"
        value={dayValue || ''}
        onChange={onDayChange}
        onBlur={onDayBlur}
      />
      <input
        aria-label="Month"
        value={monthValue || ''}
        onChange={(e) => onMonthChange?.({ value: e.target.value })}
        onBlur={onMonthBlur}
      />
      <input
        aria-label="Year"
        value={yearValue || ''}
        onChange={onYearChange}
        onBlur={onYearBlur}
      />
    </div>
  ),
}));

vi.mock('@/layouts/PageLayout', () => ({
  default: ({ title, children }) => (
    <div data-testid="page-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// Mock PasswordChangeModal
vi.mock('../components/PasswordChangeModal', () => ({
  default: ({ isOpen, onClose, onSubmit, loading }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="password-modal">
        <h2>Change Password</h2>
        <button
          onClick={async () => {
            try {
              await onSubmit({
                oldPassword: 'old123',
                newPassword: 'New1234!',
              });
            } catch {
              // Parent re-throws errors for modal to handle
            }
          }}
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Submit Password Change'}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  },
}));

const mockUserData = {
  name: 'John Doe',
  email: 'john@example.com',
  gender: 'Male',
  occupation: 'Employed',
  workRmt: 'Remote',
  dob: '1990-01-01',
};

const renderProfile = () => {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
};

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile Loading and Display', () => {
    it('should display loading state initially', () => {
      servicesModule.getProfile.mockImplementation(() => new Promise(() => {}));
      renderProfile();
      expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
    });

    it('should show page title Settings', async () => {
      servicesModule.getProfile.mockResolvedValue({
        success: true,
        data: mockUserData,
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
    });

    it('should fetch and display user profile data', async () => {
      servicesModule.getProfile.mockResolvedValue({
        success: true,
        data: mockUserData,
      });

      renderProfile();

      await waitFor(() => {
        expect(servicesModule.getProfile).toHaveBeenCalled();
      });

      // Check Name field has the value
      const nameInput = screen.getByRole('textbox', { name: 'Name' });
      expect(nameInput.value).toBe('John Doe');

      // Check Email field has the value and is disabled
      const emailInput = screen.getByRole('textbox', { name: 'Email' });
      expect(emailInput.value).toBe('john@example.com');
      expect(emailInput.disabled).toBe(true);
    });

    it('should display avatar with first letter of name', async () => {
      servicesModule.getProfile.mockResolvedValue({
        success: true,
        data: mockUserData,
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
      servicesModule.getProfile.mockRejectedValue(new Error('Network error'));

      renderProfile();

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('should display error message when profile fetch fails', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      servicesModule.getProfile.mockRejectedValue(new Error('Network error'));

      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
      });

      console.error.mockRestore();
    });

    it('should parse DOB into separate fields', async () => {
      servicesModule.getProfile.mockResolvedValue({
        success: true,
        data: mockUserData,
      });

      renderProfile();

      await waitFor(() => {
        const dayInput = screen.getByRole('textbox', { name: 'Day' });
        const yearInput = screen.getByRole('textbox', { name: 'Year' });
        expect(dayInput.value).toBe('01');
        expect(yearInput.value).toBe('1990');
      });
    });

    it('should reverse-map In-person workRmt from API to On-site for autofill', async () => {
      servicesModule.getProfile.mockResolvedValue({
        success: true,
        data: { ...mockUserData, workRmt: 'In-person' },
      });

      renderProfile();

      await waitFor(() => {
        const workRemoteSelect = screen.getByRole('combobox', {
          name: 'Work Remote',
        });
        expect(workRemoteSelect.value).toBe('On-site');
      });
    });
  });

  describe('Inline Editing', () => {
    beforeEach(async () => {
      servicesModule.getProfile.mockResolvedValue({
        success: true,
        data: mockUserData,
      });
    });

    it('should not show Save button when no changes made', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    it('should show Save button when name is changed', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      const nameInput = screen.getByRole('textbox', { name: 'Name' });
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should show Save button when gender is changed', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      const genderSelect = screen.getByRole('combobox', { name: 'Gender' });
      fireEvent.change(genderSelect, { target: { value: 'Female' } });

      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should update profile successfully', async () => {
      servicesModule.updateProfile.mockResolvedValue({
        success: true,
        data: { ...mockUserData, name: 'Jane Doe' },
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      const nameInput = screen.getByRole('textbox', { name: 'Name' });
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(servicesModule.updateProfile).toHaveBeenCalled();
        expect(
          screen.getByText('Profile updated successfully')
        ).toBeInTheDocument();
      });
    });

    it('should call TokenManager.setUserData and updateUser on success', async () => {
      servicesModule.updateProfile.mockResolvedValue({
        success: true,
        data: { ...mockUserData, name: 'Jane Doe' },
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      const nameInput = screen.getByRole('textbox', { name: 'Name' });
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(TokenManager.setUserData).toHaveBeenCalled();
        expect(mockUpdateUser).toHaveBeenCalled();
      });
    });

    it('should handle update error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      servicesModule.updateProfile.mockRejectedValue({
        response: { data: { message: 'Update failed' } },
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      const nameInput = screen.getByRole('textbox', { name: 'Name' });
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });

      console.error.mockRestore();
    });

    it('should show Saving... text while saving', async () => {
      servicesModule.updateProfile.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: { ...mockUserData, name: 'Jane Doe' },
                }),
              100
            );
          })
      );

      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      const nameInput = screen.getByRole('textbox', { name: 'Name' });
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Password Change', () => {
    beforeEach(async () => {
      servicesModule.getProfile.mockResolvedValue({
        success: true,
        data: mockUserData,
      });
    });

    it('should open password change modal when Change button clicked', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      const changeButton = screen.getByText('Change');
      fireEvent.click(changeButton);

      expect(screen.getByTestId('password-modal')).toBeInTheDocument();
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    it('should close password modal when Cancel clicked', async () => {
      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      const changeButton = screen.getByText('Change');
      fireEvent.click(changeButton);

      expect(screen.getByTestId('password-modal')).toBeInTheDocument();

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId('password-modal')).not.toBeInTheDocument();
    });

    it('should change password successfully', async () => {
      servicesModule.changePassword.mockResolvedValue({
        success: true,
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      const changeButton = screen.getByText('Change');
      fireEvent.click(changeButton);

      const submitButton = screen.getByText('Submit Password Change');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(servicesModule.changePassword).toHaveBeenCalledWith(
          'old123',
          'New1234!'
        );
        expect(
          screen.getByText('Password changed successfully')
        ).toBeInTheDocument();
      });
    });

    it('should handle password change error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      servicesModule.changePassword.mockRejectedValue(
        new Error('Password change failed')
      );

      renderProfile();

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeTruthy();
      });

      const changeButton = screen.getByText('Change');
      fireEvent.click(changeButton);

      const submitButton = screen.getByText('Submit Password Change');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(servicesModule.changePassword).toHaveBeenCalled();
      });

      console.error.mockRestore();
    });
  });

  describe('Email Field', () => {
    it('should display email as disabled field', async () => {
      servicesModule.getProfile.mockResolvedValue({
        success: true,
        data: mockUserData,
      });

      renderProfile();

      await waitFor(() => {
        const emailInput = screen.getByRole('textbox', { name: 'Email' });
        expect(emailInput.value).toBe('john@example.com');
        expect(emailInput.disabled).toBe(true);
      });
    });
  });

  describe('Section Headers', () => {
    it('should display Profile and Your Work section titles', async () => {
      servicesModule.getProfile.mockResolvedValue({
        success: true,
        data: mockUserData,
      });

      renderProfile();

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(
          screen.getByText('Set your account profile')
        ).toBeInTheDocument();
        expect(screen.getByText('Your Work')).toBeInTheDocument();
        expect(
          screen.getByText('Set your work information')
        ).toBeInTheDocument();
      });
    });
  });
});

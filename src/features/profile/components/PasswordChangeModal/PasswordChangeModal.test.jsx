import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PasswordChangeModal from './PasswordChangeModal';

// Mock child components
vi.mock('@/components', () => ({
  PasswordField: ({ label, name, value, onChange, error, disabled }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        data-error={error}
      />
    </div>
  ),
  Button: ({ children, onClick, disabled, type, variant }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
    >
      {children}
    </button>
  ),
  Message: ({ children, type }) => <div data-type={type}>{children}</div>,
  Link: ({ children, href }) => <a href={href}>{children}</a>,
}));

vi.mock('@/utils/passwordValidation', () => ({
  getPasswordError: (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return '';
  },
}));

describe('PasswordChangeModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onSubmit.mockResolvedValue(undefined);
  });

  it('returns null when not open', () => {
    const { container } = render(
      <PasswordChangeModal {...defaultProps} isOpen={false} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders when open', () => {
    render(<PasswordChangeModal {...defaultProps} />);
    expect(
      screen.getByRole('heading', { name: 'Change Password' })
    ).toBeTruthy();
  });

  it('renders three password fields', () => {
    render(<PasswordChangeModal {...defaultProps} />);
    expect(screen.getByText('Current Password')).toBeTruthy();
    expect(screen.getByText('New Password')).toBeTruthy();
    expect(screen.getByText('Confirm New Password')).toBeTruthy();
  });

  it('renders Cancel and Submit buttons', () => {
    render(<PasswordChangeModal {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeTruthy();
    const buttons = screen.getAllByText('Change Password');
    // One is the h2 title, one is the submit button
    expect(buttons.length).toBe(2);
  });

  it('shows Changing... text when loading', () => {
    render(<PasswordChangeModal {...defaultProps} loading={true} />);
    expect(screen.getByText('Changing...')).toBeTruthy();
  });

  it('validates empty old password', async () => {
    render(<PasswordChangeModal {...defaultProps} />);
    const newPwInput = screen.getByLabelText('New Password');
    const confirmInput = screen.getByLabelText('Confirm New Password');

    fireEvent.change(newPwInput, {
      target: { name: 'newPassword', value: 'ValidPass1' },
    });
    fireEvent.change(confirmInput, {
      target: { name: 'verifyPassword', value: 'ValidPass1' },
    });

    const submitBtn = screen
      .getAllByText('Change Password')
      .find((el) => el.tagName === 'BUTTON');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Old password is required')).toBeTruthy();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('validates password mismatch', async () => {
    render(<PasswordChangeModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { name: 'oldPassword', value: 'old123' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { name: 'newPassword', value: 'ValidPass1' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { name: 'verifyPassword', value: 'DifferentPass1' },
    });

    const submitBtn = screen
      .getAllByText('Change Password')
      .find((el) => el.tagName === 'BUTTON');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeTruthy();
    });
  });

  it('validates empty verify password', async () => {
    render(<PasswordChangeModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { name: 'oldPassword', value: 'old123' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { name: 'newPassword', value: 'ValidPass1' },
    });

    const submitBtn = screen
      .getAllByText('Change Password')
      .find((el) => el.tagName === 'BUTTON');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Please verify your password')).toBeTruthy();
    });
  });

  it('submits with valid data', async () => {
    render(<PasswordChangeModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { name: 'oldPassword', value: 'OldPass123' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { name: 'newPassword', value: 'NewPass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { name: 'verifyPassword', value: 'NewPass123' },
    });

    const submitBtn = screen
      .getAllByText('Change Password')
      .find((el) => el.tagName === 'BUTTON');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        oldPassword: 'OldPass123',
        newPassword: 'NewPass123',
      });
    });
  });

  it('shows error message on submit failure', async () => {
    defaultProps.onSubmit.mockRejectedValue(new Error('Wrong password'));
    render(<PasswordChangeModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { name: 'oldPassword', value: 'OldPass123' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { name: 'newPassword', value: 'NewPass123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { name: 'verifyPassword', value: 'NewPass123' },
    });

    const submitBtn = screen
      .getAllByText('Change Password')
      .find((el) => el.tagName === 'BUTTON');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Wrong password')).toBeTruthy();
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<PasswordChangeModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<PasswordChangeModal {...defaultProps} />);
    // Click the backdrop (first child)
    fireEvent.click(container.firstChild);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not close when loading', () => {
    render(<PasswordChangeModal {...defaultProps} loading={true} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('clears errors when typing', async () => {
    render(<PasswordChangeModal {...defaultProps} />);

    // Submit to trigger validation errors
    const submitBtn = screen
      .getAllByText('Change Password')
      .find((el) => el.tagName === 'BUTTON');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Old password is required')).toBeTruthy();
    });

    // Type to clear error
    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { name: 'oldPassword', value: 'x' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Old password is required')).toBeNull();
    });
  });

  it('renders Forgot Password link', () => {
    render(<PasswordChangeModal {...defaultProps} />);
    expect(screen.getByText('Forgot Password?')).toBeTruthy();
  });

  it('stops propagation on modal click', () => {
    const onClose = vi.fn();
    const { container } = render(
      <PasswordChangeModal {...defaultProps} onClose={onClose} />
    );
    // Click inside the modal (not backdrop)
    const modal = container.firstChild.firstChild;
    fireEvent.click(modal);
    expect(onClose).not.toHaveBeenCalled();
  });
});

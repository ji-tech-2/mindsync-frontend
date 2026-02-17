import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordField from './PasswordField';

vi.mock('@/components', () => ({
  TextField: ({
    label,
    type,
    name,
    value,
    onChange,
    onBlur,
    error,
    fullWidth,
    disabled,
    variant,
    ...rest
  }) => (
    <div data-testid="textfield">
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        data-error={error}
        data-fullwidth={fullWidth}
        data-variant={variant}
        {...rest}
      />
    </div>
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }) => (
    <span data-testid="icon">{icon?.iconName || 'icon'}</span>
  ),
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faEye: { iconName: 'eye' },
  faEyeSlash: { iconName: 'eye-slash' },
}));

describe('PasswordField', () => {
  it('renders with default props', () => {
    render(<PasswordField onChange={() => {}} />);
    expect(screen.getByText('Password')).toBeTruthy();
    const input = document.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.type).toBe('password');
  });

  it('renders with custom label', () => {
    render(<PasswordField label="New Password" onChange={() => {}} />);
    expect(screen.getByText('New Password')).toBeTruthy();
  });

  it('toggles password visibility on button click', () => {
    render(<PasswordField value="secret" onChange={() => {}} />);
    const input = document.querySelector('input');
    expect(input.type).toBe('password');

    const toggleBtn = screen.getByLabelText('Show password');
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');

    const hideBtn = screen.getByLabelText('Hide password');
    fireEvent.click(hideBtn);
    expect(input.type).toBe('password');
  });

  it('hides toggle button when disabled', () => {
    render(<PasswordField disabled onChange={() => {}} />);
    expect(screen.queryByLabelText('Show password')).toBeNull();
    expect(screen.queryByLabelText('Hide password')).toBeNull();
  });

  it('passes error prop to TextField', () => {
    render(<PasswordField error onChange={() => {}} />);
    const input = document.querySelector('input');
    expect(input.dataset.error).toBe('true');
  });

  it('passes fullWidth prop', () => {
    render(<PasswordField fullWidth onChange={() => {}} />);
    const input = document.querySelector('input');
    expect(input.dataset.fullwidth).toBe('true');
  });

  it('passes variant prop to TextField', () => {
    render(<PasswordField variant="surface" onChange={() => {}} />);
    const input = document.querySelector('input');
    expect(input.dataset.variant).toBe('surface');
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<PasswordField onChange={handleChange} />);
    const input = document.querySelector('input');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('calls onBlur when field loses focus', () => {
    const handleBlur = vi.fn();
    render(<PasswordField onBlur={handleBlur} onChange={() => {}} />);
    const input = document.querySelector('input');
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalled();
  });

  it('uses custom name attribute', () => {
    render(<PasswordField name="newPassword" onChange={() => {}} />);
    const input = document.querySelector('input');
    expect(input.name).toBe('newPassword');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordField from './PasswordField';

describe('PasswordField', () => {
  it('should render password input with label', () => {
    const { container } = render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={() => {}}
      />
    );

    // PasswordField wraps TextField, so check for input
    const input = container.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.type).toBe('password');
  });

  it('should show password as hidden by default', () => {
    const { container } = render(
      <PasswordField
        label="Password"
        name="password"
        value="test123"
        onChange={() => {}}
      />
    );

    const input = container.querySelector('input[type="password"]');
    expect(input).toBeTruthy();
  });

  it('should toggle password visibility when show/hide button is clicked', () => {
    const { container } = render(
      <PasswordField
        label="Password"
        name="password"
        value="test123"
        onChange={() => {}}
      />
    );

    let input = container.querySelector('input[type="password"]');
    expect(input).toBeTruthy();

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleButton);

    input = container.querySelector('input[type="text"]');
    expect(input).toBeTruthy();

    fireEvent.click(toggleButton);
    input = container.querySelector('input[type="password"]');
    expect(input).toBeTruthy();
  });

  it('should call onChange when input value changes', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={handleChange}
      />
    );

    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: 'newpassword' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should call onBlur when input loses focus', () => {
    const handleBlur = vi.fn();
    const { container } = render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={() => {}}
        onBlur={handleBlur}
      />
    );

    const input = container.querySelector('input');
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalled();
  });

  it('should pass error prop to TextField', () => {
    const { container } = render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={() => {}}
        error="Password is required"
      />
    );

    const input = container.querySelector('input');
    expect(input).toBeTruthy();
  });

  it('should render with custom label', () => {
    render(
      <PasswordField
        label="Enter Password"
        name="password"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Enter Password')).toBeTruthy();
  });

  it('should have toggle button with aria-label', () => {
    render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={() => {}}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toBeTruthy();
  });

  it('should update toggle button aria-label when clicked', () => {
    render(
      <PasswordField
        label="Password"
        name="password"
        value="test"
        onChange={() => {}}
      />
    );

    let toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toBeTruthy();

    fireEvent.click(toggleButton);

    toggleButton = screen.getByRole('button', { name: /hide password/i });
    expect(toggleButton).toBeTruthy();
  });

  it('should pass fullWidth prop to TextField', () => {
    const { container } = render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={() => {}}
        fullWidth={true}
      />
    );

    expect(container.querySelector('input')).toBeTruthy();
  });

  it('should have correct name attribute', () => {
    const { container } = render(
      <PasswordField
        label="Password"
        name="test-password"
        value=""
        onChange={() => {}}
      />
    );

    const input = container.querySelector('input');
    expect(input.name).toBe('test-password');
  });

  it('should update when value prop changes', () => {
    const { rerender, container } = render(
      <PasswordField
        label="Password"
        name="password"
        value="initial"
        onChange={() => {}}
      />
    );

    let input = container.querySelector('input');
    expect(input.value).toBe('initial');

    rerender(
      <PasswordField
        label="Password"
        name="password"
        value="updated"
        onChange={() => {}}
      />
    );

    input = container.querySelector('input');
    expect(input.value).toBe('updated');
  });

  it('should handle empty value', () => {
    const { container } = render(
      <PasswordField
        label="Password"
        name="password"
        value=""
        onChange={() => {}}
      />
    );

    const input = container.querySelector('input');
    expect(input.value).toBe('');
  });
});

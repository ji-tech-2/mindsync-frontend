import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from './FormInput';

describe('FormInput Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render input with label', () => {
    render(
      <FormInput
        label="Name"
        name="name"
        value=""
        onChange={mockOnChange}
        placeholder="Enter name"
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('should render text input by default', () => {
    render(
      <FormInput
        label="Username"
        name="username"
        value="testuser"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should render password input when type is password', () => {
    render(
      <FormInput
        label="Password"
        type="password"
        name="password"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('should render email input when type is email', () => {
    render(
      <FormInput
        label="Email"
        type="email"
        name="email"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should display current value', () => {
    render(
      <FormInput
        label="Name"
        name="name"
        value="John Doe"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('John Doe');
  });

  it('should call onChange when value changes', () => {
    render(
      <FormInput
        label="Name"
        name="name"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Jane Doe' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should be required when required prop is true', () => {
    render(
      <FormInput
        label="Email"
        name="email"
        value=""
        onChange={mockOnChange}
        required={true}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
  });

  it('should not be required by default', () => {
    render(
      <FormInput
        label="Optional"
        name="optional"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).not.toBeRequired();
  });

  it('should display placeholder text', () => {
    render(
      <FormInput
        label="Name"
        name="name"
        value=""
        onChange={mockOnChange}
        placeholder="Enter your full name"
      />
    );

    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
  });

  it('should have proper CSS classes', () => {
    const { container } = render(
      <FormInput
        label="Test"
        name="test"
        value=""
        onChange={mockOnChange}
      />
    );

    expect(container.querySelector('.form-group')).toBeInTheDocument();
  });
});

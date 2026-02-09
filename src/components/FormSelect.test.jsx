import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormSelect from './FormSelect';

describe('FormSelect Component', () => {
  const mockOnChange = vi.fn();
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render select with label', () => {
    render(
      <FormSelect
        label="Gender"
        name="gender"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should render default placeholder option', () => {
    render(
      <FormSelect
        label="Gender"
        name="gender"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    expect(screen.getByText('Select gender')).toBeInTheDocument();
  });

  it('should render all options', () => {
    render(
      <FormSelect
        label="Choice"
        name="choice"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('should display selected value', () => {
    render(
      <FormSelect
        label="Choice"
        name="choice"
        value="option2"
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('option2');
  });

  it('should call onChange when selection changes', () => {
    render(
      <FormSelect
        label="Choice"
        name="choice"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option3' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should be required when required prop is true', () => {
    render(
      <FormSelect
        label="Gender"
        name="gender"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
        required={true}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeRequired();
  });

  it('should not be required by default', () => {
    render(
      <FormSelect
        label="Optional"
        name="optional"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).not.toBeRequired();
  });

  it('should handle empty options array', () => {
    render(
      <FormSelect
        label="Empty"
        name="empty"
        value=""
        onChange={mockOnChange}
        options={[]}
      />
    );

    expect(screen.getByText('Select empty')).toBeInTheDocument();
  });

  it('should have proper CSS classes', () => {
    const { container } = render(
      <FormSelect
        label="Test"
        name="test"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    expect(container.querySelector('.form-group')).toBeInTheDocument();
  });

  it('should render options with correct values and labels', () => {
    render(
      <FormSelect
        label="Test"
        name="test"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const option1 = screen.getByText('Option 1').closest('option');
    expect(option1).toHaveValue('option1');

    const option2 = screen.getByText('Option 2').closest('option');
    expect(option2).toHaveValue('option2');
  });
});

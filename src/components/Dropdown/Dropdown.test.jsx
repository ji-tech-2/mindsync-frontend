import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dropdown from './Dropdown';

describe('Dropdown Component', () => {
  const mockOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  it('renders correctly with label', () => {
    render(<Dropdown label="Select Index" options={mockOptions} />);
    expect(screen.getByText('Select Index')).toBeInTheDocument();
  });

  it('toggles menu when clicked', () => {
    render(<Dropdown label="Select Index" options={mockOptions} />);
    const button = screen.getByRole('button');

    // Initially closed
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();

    // Open
    fireEvent.click(button);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();

    // Close
    fireEvent.click(button);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('calls onChange and closes menu when option is selected', () => {
    const handleChange = vi.fn();
    render(<Dropdown options={mockOptions} onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Option 2'));

    expect(handleChange).toHaveBeenCalledWith(mockOptions[1]);
    expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
  });

  it('displays the label of the selected value', () => {
    render(<Dropdown options={mockOptions} value={mockOptions[0]} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(<Dropdown options={mockOptions} disabled />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('closes menu when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <Dropdown label="Select" options={mockOptions} />
      </div>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('applies fullWidth class when fullWidth prop is true', () => {
    const { container } = render(<Dropdown fullWidth />);
    expect(container.firstChild.className).toMatch(/fullWidth/);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DateField from './DateField';

describe('DateField', () => {
  it('should render all three fields', () => {
    render(<DateField />);
    expect(screen.getByPlaceholderText('DD')).toBeInTheDocument();
    expect(screen.getByText('Select a date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('YYYY')).toBeInTheDocument();
  });

  it('should display values correctly', () => {
    render(<DateField dayValue="15" monthValue="06" yearValue="2000" />);
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
  });

  it('should call onChange handlers when fields change', () => {
    const handleDayChange = vi.fn();
    const handleMonthChange = vi.fn();
    const handleYearChange = vi.fn();

    render(
      <DateField
        onDayChange={handleDayChange}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      />
    );

    const dayInput = screen.getByPlaceholderText('DD');
    const yearInput = screen.getByPlaceholderText('YYYY');

    fireEvent.change(dayInput, { target: { value: '15' } });
    fireEvent.change(yearInput, { target: { value: '2000' } });

    expect(handleDayChange).toHaveBeenCalled();
    expect(handleYearChange).toHaveBeenCalled();
  });

  it('should display error message when error prop is provided', () => {
    render(<DateField error="Invalid date" />);
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });

  it('should use custom label when provided', () => {
    render(<DateField label="Event Date" />);
    expect(screen.getByText('Event Date')).toBeInTheDocument();
  });

  it('should not display error message when no error', () => {
    const { container } = render(<DateField />);
    const errorElement = container.querySelector('.errorMessage');
    expect(errorElement).not.toBeInTheDocument();
  });
});

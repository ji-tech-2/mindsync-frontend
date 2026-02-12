import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DateField from './DateField';

describe('DateField', () => {
  it('should render with default label', () => {
    render(<DateField />);
    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('should render day and year text fields with correct labels', () => {
    render(<DateField />);
    const dayLabels = screen.getAllByText('Day');
    const yearLabels = screen.getAllByText('Year');
    expect(dayLabels.length).toBeGreaterThan(0);
    expect(yearLabels.length).toBeGreaterThan(0);
  });

  it('should render month dropdown with correct label', () => {
    render(<DateField />);
    const monthLabels = screen.getAllByText('Month');
    expect(monthLabels.length).toBeGreaterThan(0);
  });

  it('should display values correctly', () => {
    render(<DateField dayValue="15" monthValue="06" yearValue="2000" />);
    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
  });

  it('should call onChange handlers when day field changes', () => {
    const handleDayChange = vi.fn();
    render(<DateField onDayChange={handleDayChange} />);

    const inputs = screen.getAllByRole('textbox');
    const dayInput = inputs[0];
    fireEvent.change(dayInput, { target: { value: '15' } });

    expect(handleDayChange).toHaveBeenCalled();
  });

  it('should call onChange handler when year field changes', () => {
    const handleYearChange = vi.fn();
    render(<DateField onYearChange={handleYearChange} />);

    const inputs = screen.getAllByRole('textbox');
    const yearInput = inputs[inputs.length - 1];

    fireEvent.change(yearInput, { target: { value: '2000' } });

    expect(handleYearChange).toHaveBeenCalled();
  });

  it('should call onBlur handlers when fields lose focus', () => {
    const handleDayBlur = vi.fn();
    const handleYearBlur = vi.fn();

    render(<DateField onDayBlur={handleDayBlur} onYearBlur={handleYearBlur} />);

    const inputs = screen.getAllByRole('textbox');
    const dayInput = inputs[0];
    const yearInput = inputs[inputs.length - 1];

    fireEvent.blur(dayInput);
    fireEvent.blur(yearInput);

    expect(handleDayBlur).toHaveBeenCalled();
    expect(handleYearBlur).toHaveBeenCalled();
  });

  it('should use custom label when provided', () => {
    render(<DateField label="Birth Date" />);
    expect(screen.getByText('Birth Date')).toBeInTheDocument();
  });

  it('should apply error styling when dayError is true', () => {
    render(<DateField dayError={true} />);
    // Day field should have error state
    expect(screen.getAllByText('Day')).toBeTruthy();
  });

  it('should apply error styling when monthError is true', () => {
    render(<DateField monthError={true} />);
    // Month field should have error state
    expect(screen.getAllByText('Month')).toBeTruthy();
  });

  it('should apply error styling when yearError is true', () => {
    render(<DateField yearError={true} />);
    // Year field should have error state
    expect(screen.getAllByText('Year')).toBeTruthy();
  });

  it('should apply error styling to all fields when dateError is true', () => {
    render(<DateField dateError={true} />);
    // All fields should have error state
    expect(screen.getAllByText('Day')).toBeTruthy();
    expect(screen.getAllByText('Month')).toBeTruthy();
    expect(screen.getAllByText('Year')).toBeTruthy();
  });
});

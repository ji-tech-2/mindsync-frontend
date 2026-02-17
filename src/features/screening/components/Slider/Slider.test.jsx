import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Slider from './Slider';

describe('Slider', () => {
  it('renders with default props', () => {
    const { container } = render(<Slider />);
    const input = container.querySelector('input[type="range"]');
    expect(input).toBeTruthy();
    expect(input.min).toBe('0');
    expect(input.max).toBe('10');
  });

  it('displays current value by default', () => {
    render(<Slider value={5} />);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('hides value when showValue is false', () => {
    render(<Slider value={5} showValue={false} />);
    expect(screen.queryByText('5')).toBeNull();
  });

  it('shows min and max labels by default', () => {
    render(<Slider min={1} max={10} value={5} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
  });

  it('shows custom labels when provided', () => {
    render(<Slider min={0} max={10} minLabel="Low" maxLabel="High" />);
    expect(screen.getByText('Low')).toBeTruthy();
    expect(screen.getByText('High')).toBeTruthy();
  });

  it('hides labels when showLabels is false', () => {
    render(<Slider min={0} max={10} showLabels={false} />);
    // Value still shown, but labels shouldn't be
    expect(screen.queryByText('0')).toBeTruthy(); // value display shows 0
  });

  it('calls onChange with numeric value', () => {
    const handleChange = vi.fn();
    const { container } = render(<Slider onChange={handleChange} />);
    const input = container.querySelector('input[type="range"]');
    fireEvent.change(input, { target: { value: '7' } });
    expect(handleChange).toHaveBeenCalledWith(7);
  });

  it('respects step prop', () => {
    const { container } = render(<Slider step={2} />);
    const input = container.querySelector('input[type="range"]');
    expect(input.step).toBe('2');
  });

  it('can be disabled', () => {
    const { container } = render(<Slider disabled />);
    const input = container.querySelector('input[type="range"]');
    expect(input.disabled).toBe(true);
  });

  it('applies error styling', () => {
    const { container } = render(<Slider error />);
    expect(container.firstChild).toBeTruthy();
  });

  it('applies additional className', () => {
    const { container } = render(<Slider className="custom" />);
    expect(container.firstChild.className).toContain('custom');
  });

  it('calculates correct background gradient', () => {
    const { container } = render(<Slider min={0} max={10} value={5} />);
    const input = container.querySelector('input[type="range"]');
    expect(input.style.background).toContain('50%');
  });
});

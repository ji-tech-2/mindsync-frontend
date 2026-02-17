import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MultipleChoice from './MultipleChoice';

vi.mock('@/components', () => ({
  Button: ({ children, variant, onClick, disabled, fullWidth, className }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-fullwidth={fullWidth}
      className={className}
    >
      {children}
    </button>
  ),
}));

describe('MultipleChoice', () => {
  const options = ['Never', 'Sometimes', 'Often', 'Always'];

  it('renders all options', () => {
    render(<MultipleChoice options={options} onChange={() => {}} />);
    options.forEach((option) => {
      expect(screen.getByText(option)).toBeTruthy();
    });
  });

  it('shows filled variant for selected option', () => {
    render(
      <MultipleChoice options={options} value="Often" onChange={() => {}} />
    );
    const selected = screen.getByText('Often');
    expect(selected.dataset.variant).toBe('filled');
  });

  it('shows outlined variant for unselected options', () => {
    render(
      <MultipleChoice options={options} value="Often" onChange={() => {}} />
    );
    const unselected = screen.getByText('Never');
    expect(unselected.dataset.variant).toBe('outlined');
  });

  it('calls onChange when option clicked', () => {
    const handleChange = vi.fn();
    render(<MultipleChoice options={options} onChange={handleChange} />);
    fireEvent.click(screen.getByText('Sometimes'));
    expect(handleChange).toHaveBeenCalledWith('Sometimes');
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(
      <MultipleChoice options={options} disabled onChange={handleChange} />
    );
    fireEvent.click(screen.getByText('Sometimes'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders with empty options array', () => {
    const { container } = render(
      <MultipleChoice options={[]} onChange={() => {}} />
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  it('applies error class when error prop is true', () => {
    const { container } = render(
      <MultipleChoice options={options} error onChange={() => {}} />
    );
    expect(container.firstChild).toBeTruthy();
  });
});

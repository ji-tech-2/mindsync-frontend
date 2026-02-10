import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TextField from './TextField';

describe('TextField Component', () => {
  it('renders correctly with a label', () => {
    render(<TextField label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders with the correct initial value', () => {
    render(<TextField label="Username" value="johndoe" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input.value).toBe('johndoe');
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<TextField label="Username" value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies focused class on focus', () => {
    const { container } = render(<TextField label="Username" />);
    const input = screen.getByRole('textbox');
    const containerDiv = container.querySelector(`div[class*="container"]`);

    fireEvent.focus(input);
    expect(containerDiv.className).toMatch(/focused/);
  });

  it('removes focused class on blur', () => {
    const { container } = render(<TextField label="Username" />);
    const input = screen.getByRole('textbox');
    const containerDiv = container.querySelector(`div[class*="container"]`);

    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(containerDiv.className).not.toMatch(/focused/);
  });

  it('renders error message when error prop is provided', () => {
    render(<TextField label="Email" error="Invalid email address" />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    expect(screen.getByText('Invalid email address').className).toMatch(
      /errorMessage/
    );
  });

  it('applies error class to container when error prop is provided', () => {
    const { container } = render(<TextField label="Email" error="Error" />);
    const containerDiv = container.querySelector(`div[class*="container"]`);
    expect(containerDiv.className).toMatch(/error/);
  });

  it('disables the input when disabled prop is true', () => {
    render(<TextField label="Disabled" disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('applies disabled class to container when disabled prop is true', () => {
    const { container } = render(<TextField label="Disabled" disabled />);
    const containerDiv = container.querySelector(`div[class*="container"]`);
    expect(containerDiv.className).toMatch(/disabled/);
  });

  it('applies fullWidth class when fullWidth prop is true', () => {
    const { container } = render(<TextField label="Full Width" fullWidth />);
    const wrapper = container.firstChild;
    const containerDiv = container.querySelector(`div[class*="container"]`);

    expect(wrapper.className).toMatch(/fullWidth/);
    expect(containerDiv.className).toMatch(/fullWidth/);
  });

  it('applies labelActive class when input has value', () => {
    render(<TextField label="Username" value="johndoe" onChange={() => {}} />);
    const label = screen.getByText('Username');
    expect(label.className).toMatch(/labelActive/);
  });

  it('applies labelActive class when input is focused', () => {
    render(<TextField label="Username" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Username');

    fireEvent.focus(input);
    expect(label.className).toMatch(/labelActive/);
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<TextField label="Username" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileFieldRow from './ProfileFieldRow';

describe('ProfileFieldRow Component', () => {
  const mockOnEdit = vi.fn();

  it('should render label and value correctly', () => {
    render(
      <ProfileFieldRow label="Name" value="John Doe" onEdit={mockOnEdit} />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render edit button with default text', () => {
    render(
      <ProfileFieldRow
        label="Email"
        value="test@example.com"
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should render custom button text', () => {
    render(
      <ProfileFieldRow
        label="Password"
        value="••••••••"
        onEdit={mockOnEdit}
        buttonText="Change"
      />
    );

    expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument();
  });

  it('should call onEdit when button clicked', () => {
    render(<ProfileFieldRow label="Gender" value="Male" onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('should render with proper CSS classes', () => {
    const { container } = render(
      <ProfileFieldRow
        label="Occupation"
        value="Engineer"
        onEdit={mockOnEdit}
      />
    );

    expect(container.querySelector('.field-row')).toBeInTheDocument();
    expect(container.querySelector('.field-info')).toBeInTheDocument();
    expect(container.querySelector('.edit-btn')).toBeInTheDocument();
  });

  it('should handle empty values', () => {
    render(
      <ProfileFieldRow label="Optional Field" value="" onEdit={mockOnEdit} />
    );

    expect(screen.getByText('Optional Field')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

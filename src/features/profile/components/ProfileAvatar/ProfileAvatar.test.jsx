import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileAvatar from './ProfileAvatar';

describe('ProfileAvatar Component', () => {
  it('should render avatar with first letter of name', () => {
    render(<ProfileAvatar name="John Doe" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should render uppercase first letter', () => {
    render(<ProfileAvatar name="alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should handle empty name gracefully', () => {
    render(<ProfileAvatar name="" />);
    // Should not crash, will render empty string
    const avatar = document.querySelector('.avatar-circle');
    expect(avatar).toBeInTheDocument();
    expect(avatar.textContent).toBe('');
  });

  it('should handle name with spaces', () => {
    render(<ProfileAvatar name="  John Doe  " />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should render with proper CSS classes', () => {
    render(<ProfileAvatar name="Test User" />);
    const avatarCircle = screen.getByText('T').closest('.avatar-circle');
    expect(avatarCircle).toHaveClass('avatar-circle');
  });
});

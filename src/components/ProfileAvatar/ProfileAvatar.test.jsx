import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileAvatar from './ProfileAvatar';

describe('ProfileAvatar Component', () => {
  describe('Rendering', () => {
    it('renders with first letter of name', () => {
      render(<ProfileAvatar name="John Doe" />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders uppercase first letter', () => {
      render(<ProfileAvatar name="alice" />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('handles empty name gracefully', () => {
      const { container } = render(<ProfileAvatar name="" />);
      const avatar = container.querySelector('div');
      expect(avatar).toBeInTheDocument();
    });

    it('handles name with leading/trailing spaces', () => {
      render(<ProfileAvatar name="  Bob Smith  " />);
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('handles null or undefined name', () => {
      const { rerender } = render(<ProfileAvatar name={null} />);
      expect(screen.queryByText(/\w/)).not.toBeInTheDocument();

      rerender(<ProfileAvatar name={undefined} />);
      expect(screen.queryByText(/\w/)).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders small size by default', () => {
      const { container } = render(<ProfileAvatar name="Test" />);
      const circle = container.querySelector('div[class*="avatarCircle"]');
      expect(circle).toHaveClass('avatarCircle');
    });

    it('renders medium size when size="medium"', () => {
      const { container } = render(<ProfileAvatar name="Test" size="medium" />);
      const circle = container.querySelector('div[class*="avatarCircle"]');
      expect(circle).toHaveClass('avatarCircleMedium');
    });

    it('renders large size when size="large"', () => {
      const { container } = render(<ProfileAvatar name="Test" size="large" />);
      const circle = container.querySelector('div[class*="avatarCircle"]');
      expect(circle).toHaveClass('avatarCircleLarge');
    });
  });

  describe('Hover Behavior', () => {
    it('applies hover class by default', () => {
      const { container } = render(<ProfileAvatar name="Test" />);
      const circle = container.querySelector('div[class*="avatarCircle"]');
      expect(circle.className).not.toContain('noHover');
    });

    it('applies noHover class when isHoverable=false', () => {
      const { container } = render(
        <ProfileAvatar name="Test" isHoverable={false} />
      );
      const circle = container.querySelector('div[class*="avatarCircle"]');
      expect(circle).toHaveClass('noHover');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const { container } = render(<ProfileAvatar name="John" />);
      const avatar = container.firstChild;
      expect(avatar).toBeInTheDocument();
    });
  });
});

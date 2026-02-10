import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  // ==================== Basic Rendering ====================
  describe('Rendering', () => {
    it('renders as button by default', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button.tagName).toBe('BUTTON');
    });

    it('renders as anchor when href is provided', () => {
      render(<Button href="/page">Go to page</Button>);
      const link = screen.getByRole('link', { name: /go to page/i });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/page');
    });

    it('renders text content', () => {
      render(<Button>Submit</Button>);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  // ==================== Variants ====================
  describe('Variants', () => {
    it('renders stroked variant by default', () => {
      const { container } = render(<Button>Click</Button>);
      const button = container.querySelector('button');
      expect(button.className).toMatch(/stroked/);
    });

    it('renders filled variant when filled={true}', () => {
      const { container } = render(<Button filled>Click</Button>);
      const button = container.querySelector('button');
      expect(button.className).toMatch(/filled/);
    });

    it('renders ghost variant when ghost={true}', () => {
      const { container } = render(<Button ghost>Click</Button>);
      const button = container.querySelector('button');
      expect(button.className).toMatch(/ghost/);
    });

    it('ghost takes priority over filled', () => {
      const { container } = render(
        <Button ghost filled>
          Click
        </Button>
      );
      const button = container.querySelector('button');
      expect(button.className).toMatch(/ghost/);
      expect(button.className).not.toMatch(/filled/);
    });
  });

  // ==================== Sizes ====================
  describe('Sizes', () => {
    it('renders normal size by default', () => {
      const { container } = render(<Button>Click</Button>);
      const button = container.querySelector('button');
      expect(button.className).not.toMatch(/lg/);
    });

    it('renders large size when size="lg"', () => {
      const { container } = render(<Button size="lg">Click</Button>);
      const button = container.querySelector('button');
      expect(button.className).toMatch(/lg/);
    });
  });

  // ==================== Icons ====================
  describe('Icons', () => {
    it('renders icon on the left by default', () => {
      const { container } = render(
        <Button icon={<span data-testid="test-icon">🔍</span>}>Search</Button>
      );
      const button = container.querySelector('button');
      const icons = button.querySelectorAll('[data-testid="test-icon"]');
      expect(icons.length).toBe(1);
    });

    it('renders icon on the right when iconPosition="right"', () => {
      const { container } = render(
        <Button
          icon={<span data-testid="test-icon">→</span>}
          iconPosition="right"
        >
          Next
        </Button>
      );
      const button = container.querySelector('button');
      const iconSpans = button.querySelectorAll('span');
      const lastSpan = iconSpans[iconSpans.length - 1];
      expect(lastSpan).toHaveAttribute('data-testid', 'test-icon');
    });

    it('renders icon-only button without text', () => {
      render(
        <Button iconOnly icon={<span data-testid="test-icon">⚙️</span>} />
      );
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('hides text when iconOnly is true', () => {
      render(
        <Button iconOnly icon={<span userData-testid="test-icon">icon</span>}>
          Hidden Text
        </Button>
      );
      expect(screen.queryByText('Hidden Text')).not.toBeInTheDocument();
    });

    it('applies icon class when icon is present', () => {
      const { container } = render(
        <Button icon={<span>icon</span>}>Text</Button>
      );
      const button = container.querySelector('button');
      expect(button.className).toMatch(/hasIcon/);
    });
  });

  // ==================== Alignment ====================
  describe('Alignment', () => {
    it('centers content by default', () => {
      const { container } = render(<Button>Click</Button>);
      const button = container.querySelector('button');
      expect(button.className).not.toMatch(/alignLeft/);
    });

    it('left-aligns content when align="left"', () => {
      const { container } = render(<Button align="left">Click</Button>);
      const button = container.querySelector('button');
      expect(button.className).toMatch(/alignLeft/);
    });

    it('applies spaceBetween when align="left" and iconPosition="right"', () => {
      const { container } = render(
        <Button align="left" iconPosition="right" icon={<span>icon</span>}>
          Text
        </Button>
      );
      const button = container.querySelector('button');
      expect(button.className).toMatch(/spaceBetween/);
    });
  });

  // ==================== Full Width ====================
  describe('Full Width', () => {
    it('does not fill width by default', () => {
      const { container } = render(<Button>Click</Button>);
      const button = container.querySelector('button');
      expect(button.className).not.toMatch(/fullWidth/);
    });

    it('fills width when fullWidth={true}', () => {
      const { container } = render(<Button fullWidth>Click</Button>);
      const button = container.querySelector('button');
      expect(button.className).toMatch(/fullWidth/);
    });
  });

  // ==================== Disabled State ====================
  describe('Disabled', () => {
    it('renders enabled button by default', () => {
      render(<Button>Click</Button>);
      const button = screen.getByRole('button', { name: /click/i });
      expect(button).not.toBeDisabled();
    });

    it('disables button when disabled={true}', () => {
      render(<Button disabled>Click</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled class', () => {
      const { container } = render(<Button disabled>Click</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toBeDisabled();
    });

    it('disables link when href and disabled', () => {
      const { container } = render(
        <Button href="/page" disabled>
          Go
        </Button>
      );
      const link = container.querySelector('a');
      // When disabled, href should be removed to prevent navigation
      expect(link.getAttribute('href')).toBeNull();
    });
  });

  // ==================== Event Handlers ====================
  describe('Event Handlers', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole('button');
      await userEvent.click(button);
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Click
        </Button>
      );
      const button = screen.getByRole('button');
      await userEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('prevents link navigation when disabled', async () => {
      const { container } = render(
        <Button href="/page" disabled>
          Go
        </Button>
      );
      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      // When disabled, href attribute should be removed
      expect(link.getAttribute('href')).toBeNull();
    });
  });

  // ==================== Button Attributes ====================
  describe('Button Attributes', () => {
    it('sets button type to "button" by default', () => {
      render(<Button>Click</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('sets button type to "submit" when type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('sets button type to "reset" when type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  // ==================== Anchor Attributes ====================
  describe('Anchor Attributes', () => {
    it('sets href when provided', () => {
      const { container } = render(
        <Button href="/dashboard">Dashboard</Button>
      );
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('supports rel attribute on anchor', () => {
      const { container } = render(
        <Button href="https://external.com" rel="noopener noreferrer">
          External
        </Button>
      );
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('supports target attribute on anchor', () => {
      const { container } = render(
        <Button href="/page" target="_blank">
          New Tab
        </Button>
      );
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  // ==================== Custom Classes ====================
  describe('Custom Classes', () => {
    it('merges custom className', () => {
      const { container } = render(
        <Button className="custom-class">Click</Button>
      );
      const button = container.querySelector('button');
      expect(button.className).toMatch(/custom-class/);
    });

    it('combines all classes correctly', () => {
      const { container } = render(
        <Button filled size="lg" fullWidth align="left" className="extra">
          Click
        </Button>
      );
      const button = container.querySelector('button');
      expect(button.className).toMatch(/filled/);
      expect(button.className).toMatch(/lg/);
      expect(button.className).toMatch(/fullWidth/);
      expect(button.className).toMatch(/alignLeft/);
      expect(button.className).toMatch(/extra/);
    });
  });

  // ==================== Complex Scenarios ====================
  describe('Complex Scenarios', () => {
    it('renders icon-only filled button', () => {
      const { container } = render(
        <Button filled iconOnly icon={<span>⚙️</span>} />
      );
      const button = container.querySelector('button');
      expect(button.className).toMatch(/filled/);
      expect(button.className).toMatch(/iconOnly/);
    });

    it('renders large ghost button with right-aligned icon', () => {
      const { container } = render(
        <Button
          ghost
          size="lg"
          align="left"
          iconPosition="right"
          icon={<span>→</span>}
        >
          Continue
        </Button>
      );
      const button = container.querySelector('button');
      expect(button.className).toMatch(/ghost/);
      expect(button.className).toMatch(/lg/);
      expect(button.className).toMatch(/alignLeft/);
      expect(button.className).toMatch(/spaceBetween/);
    });

    it('renders full width filled link button', () => {
      const { container } = render(
        <Button href="/submit" filled fullWidth type="submit">
          Submit
        </Button>
      );
      const link = container.querySelector('a');
      expect(link.className).toMatch(/filled/);
      expect(link.className).toMatch(/fullWidth/);
    });
  });

  // ==================== Accessibility ====================
  describe('Accessibility', () => {
    it('button is keyboard accessible', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });

    it('disabled button has disabled attribute', () => {
      render(<Button disabled>Click</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });
  });
});

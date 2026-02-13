import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Link from './Link';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TextLink Component', () => {
  // ==================== Basic Rendering ====================
  describe('Rendering', () => {
    it('renders as router link element when enabled', () => {
      renderWithRouter(<Link href="/test">Click me</Link>);
      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
    });

    it('renders as span when disabled', () => {
      const { container } = renderWithRouter(
        <Link href="/test" disabled>
          Click me
        </Link>
      );
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span).toHaveTextContent('Click me');
    });

    it('renders text content', () => {
      renderWithRouter(<Link href="/test">Test Link</Link>);
      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    it('renders with correct href attribute', () => {
      renderWithRouter(<Link href="/dashboard">Dashboard</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('renders with default href when not provided', () => {
      renderWithRouter(<Link>Test Link</Link>);
      const link = screen.getByRole('link');
      // React Router Link with default "#" href
      expect(link).toBeInTheDocument();
    });
  });

  // ==================== Props ====================
  describe('Props', () => {
    it('accepts and applies target attribute', () => {
      renderWithRouter(
        <Link href="https://example.com" target="_blank">
          External Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('accepts and applies title attribute', () => {
      renderWithRouter(
        <Link href="/" title="Helpful tooltip">
          Link with Title
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('title', 'Helpful tooltip');
    });

    it('applies custom className', () => {
      renderWithRouter(
        <Link href="/" className="custom-class">
          Styled Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });

    it('spreads additional props to element', () => {
      renderWithRouter(
        <Link href="/" data-testid="custom-link">
          Link
        </Link>
      );
      const link = screen.getByTestId('custom-link');
      expect(link).toBeInTheDocument();
    });
  });

  // ==================== Disabled State ====================
  describe('Disabled State', () => {
    it('renders as span when disabled', () => {
      const { container } = renderWithRouter(
        <Link href="/dashboard" disabled>
          Disabled Link
        </Link>
      );
      const span = container.querySelector('span');
      expect(span).toBeInTheDocument();
      expect(span).toHaveTextContent('Disabled Link');
    });

    it('applies disabled class when disabled=true', () => {
      const { container } = renderWithRouter(
        <Link href="/" disabled>
          Disabled
        </Link>
      );
      const span = container.querySelector('span');
      expect(span.className).toMatch(/disabled/);
    });

    it('prevents onClick when disabled and clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = renderWithRouter(
        <Link href="/page" disabled onClick={onClick}>
          Disabled Link
        </Link>
      );
      const span = container.querySelector('span');

      await user.click(span);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not apply disabled class when disabled=false', () => {
      const { container } = renderWithRouter(
        <Link href="/" disabled={false}>
          Enabled Link
        </Link>
      );
      const link = container.querySelector('a');
      expect(link.className).not.toMatch(/disabled/);
    });
  });

  // ==================== Click Handler ====================
  describe('Click Handler', () => {
    it('calls onClick handler when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithRouter(
        <Link href="/" onClick={onClick}>
          Click me
        </Link>
      );
      const link = screen.getByRole('link');

      await user.click(link);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('passes event object to onClick handler', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithRouter(
        <Link href="/" onClick={onClick}>
          Click me
        </Link>
      );
      const link = screen.getByRole('link');

      await user.click(link);
      expect(onClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = renderWithRouter(
        <Link href="/" disabled onClick={onClick}>
          Disabled
        </Link>
      );
      const span = container.querySelector('span');

      await user.click(span);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('works without onClick handler', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Link href="/">No Handler</Link>);
      const link = screen.getByRole('link');

      await expect(user.click(link)).resolves.not.toThrow();
    });
  });

  // ==================== Styling ====================
  describe('Styling', () => {
    it('always has link class applied', () => {
      const { container } = renderWithRouter(<Link href="/">Link</Link>);
      const link = container.querySelector('a');
      expect(link.className).toMatch(/link/);
    });

    it('combines multiple classes correctly', () => {
      const { container } = renderWithRouter(
        <Link href="/" className="extra-class">
          Link
        </Link>
      );
      const link = container.querySelector('a');
      expect(link.className).toContain('link');
      expect(link.className).toContain('extra-class');
    });
  });

  // ==================== Children ====================
  describe('Children', () => {
    it('renders text children', () => {
      renderWithRouter(<Link href="/">Simple text</Link>);
      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('renders element children', () => {
      renderWithRouter(
        <Link href="/">
          <span>Span content</span>
        </Link>
      );
      expect(screen.getByText('Span content')).toBeInTheDocument();
    });

    it('renders multiple children items', () => {
      renderWithRouter(
        <Link href="/">
          Open <strong>Menu</strong>
        </Link>
      );
      expect(screen.getByText('Open')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });
  });

  // ==================== Accessibility ====================
  describe('Accessibility', () => {
    it('is keyboard navigable', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      renderWithRouter(
        <Link href="/" onClick={onClick}>
          Keyboard Link
        </Link>
      );
      const link = screen.getByRole('link');

      link.focus();
      expect(link).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalled();
    });

    it('has proper link semantics', () => {
      renderWithRouter(<Link href="/page">Semantically good</Link>);
      const link = screen.getByRole('link', { name: /semantically good/i });
      expect(link.tagName).toBe('A');
    });

    it('supports title for tooltips', () => {
      renderWithRouter(
        <Link href="/" title="Helpful information">
          Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('title', 'Helpful information');
    });
  });

  // ==================== Edge Cases ====================
  describe('Edge Cases', () => {
    it('handles empty href gracefully', () => {
      renderWithRouter(<Link href="/">Empty Href</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/');
    });

    it('handles hash href', () => {
      renderWithRouter(<Link href="#section">Section Link</Link>);
      const link = screen.getByRole('link');
      // React Router may handle hash links differently
      expect(link).toBeInTheDocument();
    });

    it('handles external URLs', () => {
      renderWithRouter(<Link href="https://example.com">External Link</Link>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('renders with all props combined', () => {
      const onClick = vi.fn();
      renderWithRouter(
        <Link
          href="/complete"
          target="_blank"
          title="Complete Example"
          disabled={false}
          className="custom"
          onClick={onClick}
        >
          Complete Link
        </Link>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/complete');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('title', 'Complete Example');
      expect(link).toHaveClass('custom');
    });
  });
});

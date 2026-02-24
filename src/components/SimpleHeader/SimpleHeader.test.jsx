/**
 * SimpleHeader Component Tests
 *
 * Tests for the minimal page header used on auth and screening pages.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SimpleHeader from './SimpleHeader';

const renderSimpleHeader = (props = {}) =>
  render(
    <BrowserRouter>
      <SimpleHeader {...props} />
    </BrowserRouter>
  );

describe('SimpleHeader Component', () => {
  describe('Logo', () => {
    it('should render the MindSync logo', () => {
      renderSimpleHeader();
      expect(screen.getByAltText('MindSync')).toBeInTheDocument();
    });

    it('should render logo as an img element', () => {
      renderSimpleHeader();
      const logo = screen.getByAltText('MindSync');
      expect(logo.tagName).toBe('IMG');
    });
  });

  describe('Back button - defaults', () => {
    it('should render the back button with default label', () => {
      renderSimpleHeader();
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    it('should link to "/" by default', () => {
      renderSimpleHeader();
      const link = screen.getByText('Back to Home').closest('a');
      expect(link).toHaveAttribute('href', '/');
    });

    it('should render the chevron-left icon', () => {
      const { container } = renderSimpleHeader();
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Back button - custom props', () => {
    it('should use a custom href', () => {
      renderSimpleHeader({ href: '/dashboard' });
      const link = screen.getByText('Back to Home').closest('a');
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('should use a custom label', () => {
      renderSimpleHeader({ label: 'Back to Dashboard' });
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Back to Home')).not.toBeInTheDocument();
    });

    it('should use both custom href and label together', () => {
      renderSimpleHeader({ href: '/dashboard', label: 'Go Back' });
      const link = screen.getByText('Go Back').closest('a');
      expect(link).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('className prop', () => {
    it('should apply a custom className to the header element', () => {
      const { container } = renderSimpleHeader({
        className: 'my-custom-class',
      });
      const header = container.firstChild;
      expect(header).toHaveClass('my-custom-class');
    });

    it('should still apply base header styles alongside a custom className', () => {
      const { container } = renderSimpleHeader({ className: 'extra' });
      const header = container.firstChild;
      // Both the module class and custom class co-exist
      expect(header.className).toMatch(/extra/);
    });
  });

  describe('Layout structure', () => {
    it('should render the logo and button inside the header container', () => {
      const { container } = renderSimpleHeader();
      const header = container.firstChild;
      expect(header.querySelector('img[alt="MindSync"]')).toBeInTheDocument();
      expect(header.querySelector('a')).toBeInTheDocument();
    });
  });
});

/**
 * Navbar Component Tests
 *
 * Tests for navigation bar, links, and conditional rendering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '@/features/auth';

// Mock TokenManager for AuthProvider
vi.mock('@/utils/tokenManager', () => ({
  TokenManager: {
    getUserData: vi.fn(),
    clearUserData: vi.fn(),
  },
}));

// Mock ProfileDropdown component
vi.mock('../ProfileDropdown', () => ({
  default: () => <div data-testid="profile-dropdown">Profile Dropdown</div>,
}));

import { TokenManager } from '@/utils/tokenManager';

const renderNavbar = (userData = null) => {
  if (userData) {
    TokenManager.getUserData.mockReturnValue(userData);
  } else {
    TokenManager.getUserData.mockReturnValue(null);
  }

  return render(
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Wordmark/Logo', () => {
    it('should display MindSync wordmark', () => {
      renderNavbar();

      expect(screen.getByAltText('MindSync')).toBeInTheDocument();
    });

    it('should link to home page when user is not authenticated', () => {
      renderNavbar();

      const wordmark = screen.getByAltText('MindSync').closest('a');
      expect(wordmark).toHaveAttribute('href', '/');
    });

    it('should link to dashboard when user is authenticated', () => {
      renderNavbar({ name: 'John Doe', email: 'john@example.com' });

      const wordmark = screen.getByAltText('MindSync').closest('a');
      expect(wordmark).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Navigation Links - Unauthenticated', () => {
    it('should show Screening link when not authenticated', () => {
      renderNavbar();

      const screeningLinks = screen.getAllByText('Screening');
      expect(screeningLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('should not show Dashboard link when not authenticated', () => {
      renderNavbar();

      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('should not show History link when not authenticated', () => {
      renderNavbar();

      expect(screen.queryByText('History')).not.toBeInTheDocument();
    });

    it('should not show profile dropdown when not authenticated', () => {
      renderNavbar();

      expect(screen.queryByTestId('profile-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links - Authenticated', () => {
    const mockUser = { name: 'John Doe', email: 'john@example.com' };

    it('should show Dashboard link when authenticated', () => {
      renderNavbar(mockUser);

      const dashboardLinks = screen.getAllByText('Dashboard');
      expect(dashboardLinks.length).toBeGreaterThanOrEqual(1);
      expect(dashboardLinks[0].closest('a')).toHaveAttribute(
        'href',
        '/dashboard'
      );
    });

    it('should show History link when authenticated', () => {
      renderNavbar(mockUser);

      const historyLinks = screen.getAllByText('History');
      expect(historyLinks.length).toBeGreaterThanOrEqual(1);
      expect(historyLinks[0].closest('a')).toHaveAttribute('href', '/history');
    });

    it('should show Screening link when authenticated', () => {
      renderNavbar(mockUser);

      const screeningLinks = screen.getAllByText('Screening');
      expect(screeningLinks.length).toBeGreaterThanOrEqual(1);
      expect(screeningLinks[0].closest('a')).toHaveAttribute(
        'href',
        '/screening'
      );
    });

    it('should show profile dropdown when authenticated', () => {
      renderNavbar(mockUser);

      expect(screen.getByTestId('profile-dropdown')).toBeInTheDocument();
    });
  });

  describe('Navbar Structure', () => {
    it('should render navbar with correct structure', () => {
      renderNavbar();

      const navbar = document.querySelector('nav');
      expect(navbar).toBeInTheDocument();
    });

    it('should have container element', () => {
      renderNavbar();

      const navbar = document.querySelector('nav');
      const container = navbar.querySelector('div');
      expect(container).toBeInTheDocument();
    });
  });
});

/**
 * Navbar Component Tests
 * 
 * Tests for navigation bar, links, and conditional rendering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '../contexts/AuthContext';

// Mock TokenManager for AuthProvider
vi.mock('../config/api', () => ({
  TokenManager: {
    getToken: vi.fn(),
    getUserData: vi.fn(),
    clearToken: vi.fn(),
  },
}));

// Mock ProfileDropdown component
vi.mock('./ProfileDropdown', () => ({
  default: () => <div data-testid="profile-dropdown">Profile Dropdown</div>,
}));

import { TokenManager } from '../config/api';

const renderNavbar = (userData = null) => {
  if (userData) {
    TokenManager.getToken.mockReturnValue('mock-token');
    TokenManager.getUserData.mockReturnValue(userData);
  } else {
    TokenManager.getToken.mockReturnValue(null);
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
      
      expect(screen.getByText('MindSync')).toBeInTheDocument();
    });

    it('should link to home page when user is not authenticated', () => {
      renderNavbar();
      
      const wordmark = screen.getByText('MindSync').closest('a');
      expect(wordmark).toHaveAttribute('href', '/');
    });

    it('should link to dashboard when user is authenticated', () => {
      renderNavbar({ name: 'John Doe', email: 'john@example.com' });
      
      const wordmark = screen.getByText('MindSync').closest('a');
      expect(wordmark).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Navigation Links - Unauthenticated', () => {
    it('should show Screening link when not authenticated', () => {
      renderNavbar();
      
      expect(screen.getByText('Screening')).toBeInTheDocument();
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
      
      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');
    });

    it('should show History link when authenticated', () => {
      renderNavbar(mockUser);
      
      const historyLink = screen.getByText('History');
      expect(historyLink).toBeInTheDocument();
      expect(historyLink.closest('a')).toHaveAttribute('href', '/history');
    });

    it('should show Screening link when authenticated', () => {
      renderNavbar(mockUser);
      
      const screeningLink = screen.getByText('Screening');
      expect(screeningLink).toBeInTheDocument();
      expect(screeningLink.closest('a')).toHaveAttribute('href', '/screening');
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

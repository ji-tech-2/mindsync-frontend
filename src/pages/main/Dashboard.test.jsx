/**
 * Dashboard Component Tests
 * 
 * Tests for dashboard layout, greeting, and navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock TokenManager for AuthProvider
vi.mock('../../config/api', () => ({
  TokenManager: {
    getToken: vi.fn(),
    getUserData: vi.fn(),
    clearToken: vi.fn(),
  },
}));

import { TokenManager } from '../../config/api';

const renderDashboard = (userData = null) => {
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
        <Dashboard />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('User Greeting', () => {
    it('should display user name when user is authenticated', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com' });
      
      expect(screen.getByText(/Hello, John Doe!/i)).toBeInTheDocument();
    });

    it('should display default greeting when user name is not available', () => {
      renderDashboard({ email: 'john@example.com' });
      
      expect(screen.getByText(/Hello, Pengguna!/i)).toBeInTheDocument();
    });

    it('should display subtitle text', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com' });
      
      expect(screen.getByText(/How are you feeling today?/i)).toBeInTheDocument();
    });
  });

  describe('Header Section', () => {
    it('should render full-width header with greeting and CTA button', () => {
      renderDashboard({ name: 'Jane Smith', email: 'jane@example.com' });
      
      const header = document.querySelector('.dashboard-header-full');
      expect(header).toBeInTheDocument();
      
      const ctaButton = screen.getByRole('button', { name: /take screening now/i });
      expect(ctaButton).toBeInTheDocument();
    });

    it('should navigate to screening page when CTA button clicked', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com' });
      
      const ctaButton = screen.getByRole('button', { name: /take screening now/i });
      fireEvent.click(ctaButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/screening');
    });
  });

  describe('Dashboard Layout', () => {
    it('should render upper section with 3 cards', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com' });
      
      const upperSection = document.querySelector('.cards-upper-section');
      expect(upperSection).toBeInTheDocument();
      
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      // Third card is the WeeklyChart component (renders chart title, not "Card 3")
      expect(screen.getByText('Aktivitas Mingguan')).toBeInTheDocument();
    });

    it('should render left column with 2 small cards', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com' });
      
      const leftColumn = document.querySelector('.cards-left-column');
      expect(leftColumn).toBeInTheDocument();
      
      const smallCards = document.querySelectorAll('.card-small');
      expect(smallCards.length).toBe(2);
    });

    it('should render one large card', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com' });
      
      const largeCard = document.querySelector('.card-large');
      expect(largeCard).toBeInTheDocument();
    });

    it('should render Critical Factors section title', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com' });
      
      expect(screen.getByText('Critical Factors')).toBeInTheDocument();
    });

    it('should render lower section with 3 cards', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com' });
      
      const lowerSection = document.querySelector('.cards-lower-section');
      expect(lowerSection).toBeInTheDocument();
      
      expect(screen.getByText('Card 4')).toBeInTheDocument();
      expect(screen.getByText('Card 5')).toBeInTheDocument();
      expect(screen.getByText('Card 6')).toBeInTheDocument();
    });
  });

  describe('Container Structure', () => {
    it('should render main dashboard container', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com' });
      
      const container = document.querySelector('.dashboard-container');
      expect(container).toBeInTheDocument();
    });

    it('should render dashboard content section', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com' });
      
      const content = document.querySelector('.dashboard-content');
      expect(content).toBeInTheDocument();
    });
  });
});

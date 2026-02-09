/**
 * Dashboard Component Tests
 * 
 * Tests for dashboard layout, greeting, navigation, and dynamic content
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock child components
vi.mock('../../components/CriticalFactorCard', () => ({
  default: ({ data, loading }) => (
    <div data-testid="critical-factor-card">
      {loading ? 'Loading factor...' : data ? data.factor_name : 'No factors found'}
    </div>
  ),
}));

vi.mock('../../components/DashboardSuggestion', () => ({
  default: ({ data, loading }) => (
    <div data-testid="dashboard-suggestion">
      {loading ? 'Loading suggestions...' : data || 'No suggestion available'}
    </div>
  ),
}));

vi.mock('../../components/StreakCard', () => ({
  default: ({ data, loading, error }) => (
    <div data-testid="streak-card">
      {loading ? 'Loading streak...' : error ? `Error: ${error}` : `Streak: ${data?.current_streak || 0}`}
    </div>
  ),
}));

// Mock TokenManager for AuthProvider
vi.mock('../../config/api', () => ({
  TokenManager: {
    getToken: vi.fn(),
    getUserData: vi.fn(),
    clearToken: vi.fn(),
  },
  API_CONFIG: {},
  API_URLS: {
    weeklyCriticalFactors: vi.fn((userId) => `http://api.test/factors/${userId}`),
    dailySuggestion: vi.fn((userId) => `http://api.test/suggestion/${userId}`),
    streak: vi.fn((userId) => `http://api.test/streak/${userId}`),
  },
}));

import { TokenManager } from '../../config/api';

const mockFactorsResponse = {
  status: 'success',
  top_critical_factors: [
    { factor_name: 'num__sleep_quality_1_5^2', count: 5, avg_impact_score: 0.8 },
    { factor_name: 'num__productivity_0_100', count: 4, avg_impact_score: 0.7 },
  ],
  advice: {
    factors: {
      'num__sleep_quality_1_5^2': {
        advices: ['Improve your sleep routine.'],
        references: ['Sleep Study 2024'],
      },
    },
  },
};

const mockSuggestionResponse = {
  status: 'success',
  suggestion: 'Try meditation today for better focus.',
};

const mockStreakResponse = {
  status: 'success',
  data: { current_streak: 7, longest_streak: 14 },
};

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
    // Setup default fetch mock for all three API calls
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        json: async () => ({ status: 'success', top_critical_factors: [], advice: {} }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ status: 'success', suggestion: '' }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ status: 'success', data: { current_streak: 0, longest_streak: 0 } }),
      });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('User Greeting', () => {
    it('should display user name when user is authenticated', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      expect(screen.getByText(/Hello, John Doe!/i)).toBeInTheDocument();
    });

    it('should display default greeting when user name is not available', () => {
      renderDashboard({ email: 'john@example.com', userId: '123' });
      
      expect(screen.getByText(/Hello, Pengguna!/i)).toBeInTheDocument();
    });

    it('should display subtitle text', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      expect(screen.getByText(/How are you feeling today?/i)).toBeInTheDocument();
    });
  });

  describe('Header Section', () => {
    it('should render full-width header with greeting and CTA button', () => {
      renderDashboard({ name: 'Jane Smith', email: 'jane@example.com', userId: '123' });
      
      const header = document.querySelector('.dashboard-header-full');
      expect(header).toBeInTheDocument();
      
      const ctaButton = screen.getByRole('button', { name: /take screening now/i });
      expect(ctaButton).toBeInTheDocument();
    });

    it('should navigate to screening page when CTA button clicked', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      const ctaButton = screen.getByRole('button', { name: /take screening now/i });
      fireEvent.click(ctaButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/screening');
    });
  });

  describe('Dashboard Layout', () => {
    it('should render upper section structure', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      const upperSection = document.querySelector('.cards-upper-section');
      expect(upperSection).toBeInTheDocument();
    });

    it('should render left column with streak and suggestion cards', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      const leftColumn = document.querySelector('.cards-left-column');
      expect(leftColumn).toBeInTheDocument();
      
      const smallCards = document.querySelectorAll('.card-small');
      expect(smallCards.length).toBe(2);
    });

    it('should render StreakCard component', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      expect(screen.getByTestId('streak-card')).toBeInTheDocument();
    });

    it('should render DashboardSuggestion component with title', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      expect(screen.getByText('Daily Suggestion')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-suggestion')).toBeInTheDocument();
    });

    it('should render one large card', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      const largeCard = document.querySelector('.card-large');
      expect(largeCard).toBeInTheDocument();
    });

    it('should render Critical Factors section title', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      expect(screen.getByText('Critical Factors')).toBeInTheDocument();
    });

    it('should render lower section', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      const lowerSection = document.querySelector('.cards-lower-section');
      expect(lowerSection).toBeInTheDocument();
    });
  });

  describe('API Data Loading', () => {
    it('should show loading state for critical factors', () => {
      global.fetch = vi.fn(() => new Promise(() => {}));
      
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      const factorCards = screen.getAllByTestId('critical-factor-card');
      expect(factorCards.length).toBeGreaterThan(0);
    });

    it('should fetch and display critical factors data', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: async () => mockFactorsResponse,
        })
        .mockResolvedValueOnce({
          json: async () => mockSuggestionResponse,
        })
        .mockResolvedValueOnce({
          json: async () => mockStreakResponse,
        });
      
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      await waitFor(() => {
        expect(screen.getByText('Sleep Quality')).toBeInTheDocument();
      });
    });

    it('should display empty state when no factors available', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: async () => ({ status: 'success', top_critical_factors: [], advice: {} }),
        })
        .mockResolvedValueOnce({
          json: async () => mockSuggestionResponse,
        })
        .mockResolvedValueOnce({
          json: async () => mockStreakResponse,
        });
      
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      await waitFor(() => {
        expect(screen.getByText('No factors found')).toBeInTheDocument();
      });
    });

    it('should fetch daily suggestion', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: async () => ({ status: 'success', top_critical_factors: [], advice: {} }),
        })
        .mockResolvedValueOnce({
          json: async () => mockSuggestionResponse,
        })
        .mockResolvedValueOnce({
          json: async () => mockStreakResponse,
        });
      
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      await waitFor(() => {
        expect(screen.getByText('Try meditation today for better focus.')).toBeInTheDocument();
      });
    });

    it('should fetch streak data', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          json: async () => ({ status: 'success', top_critical_factors: [], advice: {} }),
        })
        .mockResolvedValueOnce({
          json: async () => mockSuggestionResponse,
        })
        .mockResolvedValueOnce({
          json: async () => mockStreakResponse,
        });
      
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      await waitFor(() => {
        expect(screen.getByText('Streak: 7')).toBeInTheDocument();
      });
    });
  });

  describe('Container Structure', () => {
    it('should render main dashboard container', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      const container = document.querySelector('.dashboard-container');
      expect(container).toBeInTheDocument();
    });

    it('should render dashboard content section', () => {
      renderDashboard({ name: 'John Doe', email: 'john@example.com', userId: '123' });
      
      const content = document.querySelector('.dashboard-content');
      expect(content).toBeInTheDocument();
    });
  });
});
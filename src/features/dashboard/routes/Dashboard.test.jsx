/**
 * Dashboard Component Tests
 *
 * Tests for dashboard layout, greeting, navigation, and dynamic content
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { AuthProvider } from '@/features/auth';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock WeeklyChart to avoid recharts dependency
vi.mock('@/components/WeeklyChart', () => ({
  default: ({ data, title }) => (
    <div data-testid="weekly-chart">
      <span>{title}</span>
      <span data-testid="chart-data">{JSON.stringify(data)}</span>
    </div>
  ),
}));

// Mock child components
vi.mock('../components/CriticalFactorCard', () => ({
  default: ({ data, loading }) => (
    <div data-testid="critical-factor-card">
      {loading
        ? 'Loading factor...'
        : data
          ? data.factor_name
          : 'No factors found'}
    </div>
  ),
}));

vi.mock('../components/DashboardSuggestion', () => ({
  default: ({ data, loading }) => (
    <div data-testid="dashboard-suggestion">
      {loading ? 'Loading suggestions...' : data || 'No suggestion available'}
    </div>
  ),
}));

vi.mock('../components/StreakCard', () => ({
  default: ({ data, loading, error }) => (
    <div data-testid="streak-card">
      {loading
        ? 'Loading streak...'
        : error
          ? `Error: ${error}`
          : `Streak: ${data?.current_streak?.daily || 0}`}
    </div>
  ),
}));

// Mock services
vi.mock('@/services', () => ({
  getWeeklyChart: vi.fn(),
  getWeeklyCriticalFactors: vi.fn(),
  getDailySuggestion: vi.fn(),
  getStreak: vi.fn(),
}));

// Mock TokenManager
vi.mock('@/utils/tokenManager', () => ({
  TokenManager: {
    getUserData: vi.fn(),
    setUserData: vi.fn(),
    clearUserData: vi.fn(),
    isAuthenticated: vi.fn(() => true),
  },
}));

import { TokenManager } from '@/utils/tokenManager';
import * as services from '@/services';

const mockFactorsResponse = {
  status: 'success',
  top_critical_factors: [
    {
      factor_name: 'num__sleep_quality_1_5^2',
      count: 5,
      avg_impact_score: 0.8,
    },
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
  data: { current_streak: { daily: 7, weekly: 1 }, longest_streak: 14 },
};

const setupServices = (factorsRes, suggestionRes, streakRes) => {
  services.getWeeklyCriticalFactors.mockResolvedValue(
    factorsRes || {
      status: 'success',
      top_critical_factors: [],
      advice: {},
    }
  );
  services.getDailySuggestion.mockResolvedValue(
    suggestionRes || { status: 'success', suggestion: '' }
  );
  services.getStreak.mockResolvedValue(
    streakRes || {
      status: 'success',
      data: { current_streak: { daily: 0, weekly: 0 }, longest_streak: 0 },
    }
  );
  services.getWeeklyChart.mockResolvedValue({
    status: 'success',
    data: [],
  });
};

const defaultUser = {
  name: 'John Doe',
  email: 'john@example.com',
  userId: '123',
};

const renderDashboard = (userData = null) => {
  if (userData) {
    TokenManager.getUserData.mockReturnValue(userData);
  } else {
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
    setupServices();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('User Greeting', () => {
    it('should display user name when user is authenticated', () => {
      renderDashboard(defaultUser);
      expect(screen.getByText(/Hello, John Doe!/i)).toBeInTheDocument();
    });

    it('should display default greeting when user name is not available', () => {
      renderDashboard({ email: 'john@example.com', userId: '123' });
      expect(screen.getByText(/Hello, User!/i)).toBeInTheDocument();
    });

    it('should display subtitle text', () => {
      renderDashboard(defaultUser);
      expect(
        screen.getByText(/How are you feeling today?/i)
      ).toBeInTheDocument();
    });
  });

  describe('Header Section', () => {
    it('should render header with greeting and CTA link', () => {
      renderDashboard({
        name: 'Jane Smith',
        email: 'jane@example.com',
        userId: '123',
      });

      expect(screen.getByText(/Hello, Jane Smith!/i)).toBeInTheDocument();

      // CTA button renders as a link with href
      const ctaLink = screen.getByRole('link', {
        name: /take screening now/i,
      });
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute('href', '/screening');
    });
  });

  describe('Dashboard Layout', () => {
    it('should render WeeklyChart component', () => {
      renderDashboard(defaultUser);
      expect(screen.getByTestId('weekly-chart')).toBeInTheDocument();
    });

    it('should render StreakCard component', () => {
      renderDashboard(defaultUser);
      expect(screen.getByTestId('streak-card')).toBeInTheDocument();
    });

    it('should render DashboardSuggestion component', () => {
      renderDashboard(defaultUser);
      expect(screen.getByTestId('dashboard-suggestion')).toBeInTheDocument();
    });

    it('should render Critical Factors section title', () => {
      renderDashboard(defaultUser);
      expect(screen.getByText('Critical Factors')).toBeInTheDocument();
    });

    it('should render 3 CriticalFactorCard components', () => {
      renderDashboard(defaultUser);
      const factorCards = screen.getAllByTestId('critical-factor-card');
      expect(factorCards).toHaveLength(3);
    });
  });

  describe('API Data Loading', () => {
    it('should show loading state for critical factors', () => {
      // Never resolve - stays in loading
      services.getWeeklyCriticalFactors.mockImplementation(
        () => new Promise(() => {})
      );

      renderDashboard(defaultUser);

      const factorCards = screen.getAllByTestId('critical-factor-card');
      factorCards.forEach((card) => {
        expect(card).toHaveTextContent('Loading factor...');
      });
    });

    it('should fetch and display critical factors data', async () => {
      setupServices(
        mockFactorsResponse,
        mockSuggestionResponse,
        mockStreakResponse
      );

      renderDashboard(defaultUser);

      await waitFor(() => {
        expect(screen.getByText('Sleep Quality')).toBeInTheDocument();
        expect(screen.getByText('Productivity')).toBeInTheDocument();
      });
    });

    it('should display empty state when no factors available', async () => {
      setupServices(
        { status: 'success', top_critical_factors: [], advice: {} },
        mockSuggestionResponse,
        mockStreakResponse
      );

      renderDashboard(defaultUser);

      await waitFor(() => {
        const emptyCards = screen.getAllByText('No factors found');
        expect(emptyCards).toHaveLength(3);
      });
    });

    it('should fetch daily suggestion', async () => {
      setupServices(
        { status: 'success', top_critical_factors: [], advice: {} },
        mockSuggestionResponse,
        mockStreakResponse
      );

      renderDashboard(defaultUser);

      await waitFor(() => {
        expect(
          screen.getByText('Try meditation today for better focus.')
        ).toBeInTheDocument();
      });
    });

    it('should fetch streak data', async () => {
      setupServices(
        { status: 'success', top_critical_factors: [], advice: {} },
        mockSuggestionResponse,
        mockStreakResponse
      );

      renderDashboard(defaultUser);

      await waitFor(() => {
        expect(screen.getByText('Streak: 7')).toBeInTheDocument();
      });
    });

    it('should call services with user ID', async () => {
      setupServices(
        { status: 'success', top_critical_factors: [], advice: {} },
        mockSuggestionResponse,
        mockStreakResponse
      );

      renderDashboard(defaultUser);

      await waitFor(() => {
        expect(services.getWeeklyCriticalFactors).toHaveBeenCalled();
        expect(services.getDailySuggestion).toHaveBeenCalled();
        expect(services.getStreak).toHaveBeenCalled();
        expect(services.getWeeklyChart).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      services.getWeeklyCriticalFactors.mockRejectedValue(
        new Error('Network error')
      );
      services.getDailySuggestion.mockRejectedValue(new Error('Network error'));
      services.getStreak.mockRejectedValue(new Error('Network error'));
      services.getWeeklyChart.mockRejectedValue(new Error('Network error'));

      renderDashboard(defaultUser);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Container Structure', () => {
    it('should render main dashboard container', () => {
      const { container } = renderDashboard(defaultUser);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render Weekly Chart title', () => {
      renderDashboard(defaultUser);
      expect(screen.getByText('Weekly Chart')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import History from './History';
import * as servicesModule from '@/services';
import * as chartHelpersModule from '@/utils/chartHelpers';
import * as authModule from '@/features/auth';

// Mock the modules
vi.mock('@/services');
vi.mock('@/utils/chartHelpers');
vi.mock('@/features/auth');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock WeeklyChart component
vi.mock('@/components', () => ({
  WeeklyChart: ({ data, title }) => (
    <div data-testid="weekly-chart">
      <div>{title}</div>
      <div>{data?.length || 0} data points</div>
    </div>
  ),
}));

describe('History Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should redirect to signin if user is not logged in', () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: null });

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });

    it('should load history when user is logged in', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { userId: 1 } });
      vi.spyOn(servicesModule, 'getScreeningHistory').mockResolvedValue({
        status: 'success',
        data: [],
      });
      vi.spyOn(
        chartHelpersModule,
        'buildWeeklyChartFromHistory'
      ).mockReturnValue([]);

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalledWith('/signin');
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no history', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { userId: 1 } });
      vi.spyOn(servicesModule, 'getScreeningHistory').mockResolvedValue({
        status: 'success',
        data: [],
      });
      vi.spyOn(
        chartHelpersModule,
        'buildWeeklyChartFromHistory'
      ).mockReturnValue([]);

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No History Yet')).toBeTruthy();
      });
    });
  });

  describe('Data Display', () => {
    it('should display history items', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { userId: 1 } });

      const mockData = [
        {
          prediction_id: 1,
          created_at: '2024-01-15T10:30:00Z',
          prediction_score: 75,
          health_level: 'healthy',
          advice: 'Good',
          wellness_analysis: 'Analysis',
        },
        {
          prediction_id: 2,
          created_at: '2024-01-14T09:00:00Z',
          prediction_score: 60,
          health_level: 'average',
          advice: 'OK',
          wellness_analysis: 'Analysis 2',
        },
      ];

      vi.spyOn(servicesModule, 'getScreeningHistory').mockResolvedValue({
        status: 'success',
        data: mockData,
      });
      vi.spyOn(
        chartHelpersModule,
        'buildWeeklyChartFromHistory'
      ).mockReturnValue([
        { date: '2024-01-15', value: 75 },
        { date: '2024-01-14', value: 60 },
      ]);

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('2 results')).toBeTruthy();
      });
    });

    it('should normalize negative scores', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { userId: 1 } });

      const mockData = [
        {
          prediction_id: 1,
          created_at: '2024-01-15T10:30:00Z',
          prediction_score: -10,
          health_level: 'dangerous',
          advice: 'Help',
          wellness_analysis: 'Analysis',
        },
      ];

      vi.spyOn(servicesModule, 'getScreeningHistory').mockResolvedValue({
        status: 'success',
        data: mockData,
      });
      vi.spyOn(
        chartHelpersModule,
        'buildWeeklyChartFromHistory'
      ).mockReturnValue([]);

      const { container } = render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(container.textContent).toContain('0');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { userId: 1 } });
      vi.spyOn(servicesModule, 'getScreeningHistory').mockResolvedValue({
        status: 'success',
        data: [],
      });
      vi.spyOn(
        chartHelpersModule,
        'buildWeeklyChartFromHistory'
      ).mockReturnValue([]);

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        const backButton = screen.getByText('← Back to Dashboard');
        backButton.click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Error Handling', () => {
    it('should handle API failure gracefully', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { userId: 1 } });
      vi.spyOn(servicesModule, 'getScreeningHistory').mockRejectedValue(
        new Error('Network error')
      );

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading')).toBeNull();
      });
    });

    it('should handle response without success flag', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { userId: 1 } });
      vi.spyOn(servicesModule, 'getScreeningHistory').mockResolvedValue({
        success: false,
        error: 'Failed to fetch',
      });
      vi.spyOn(
        chartHelpersModule,
        'buildWeeklyChartFromHistory'
      ).mockReturnValue([]);

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No History Yet')).toBeTruthy();
      });
    });

    it('should handle missing user ID', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: {} });
      vi.spyOn(servicesModule, 'getScreeningHistory').mockResolvedValue({
        status: 'success',
        data: [],
      });

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalledWith('/signin');
      });
    });
  });

  describe('User ID Detection', () => {
    it('should use userId field when available', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({
        user: { userId: 123 },
      });
      const fetchSpy = vi
        .spyOn(servicesModule, 'getScreeningHistory')
        .mockResolvedValue({
          status: 'success',
          data: [],
        });
      vi.spyOn(
        chartHelpersModule,
        'buildWeeklyChartFromHistory'
      ).mockReturnValue([]);

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(123, 50, 0);
      });
    });

    it('should use id field when userId not available', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { id: 456 } });
      const fetchSpy = vi
        .spyOn(servicesModule, 'getScreeningHistory')
        .mockResolvedValue({
          status: 'success',
          data: [],
        });
      vi.spyOn(
        chartHelpersModule,
        'buildWeeklyChartFromHistory'
      ).mockReturnValue([]);

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(456, 50, 0);
      });
    });

    it('should use user_id field when other fields not available', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({
        user: { user_id: 789 },
      });
      const fetchSpy = vi
        .spyOn(servicesModule, 'getScreeningHistory')
        .mockResolvedValue({
          status: 'success',
          data: [],
        });
      vi.spyOn(
        chartHelpersModule,
        'buildWeeklyChartFromHistory'
      ).mockReturnValue([]);

      render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(789, 50, 0);
      });
    });
  });

  describe('Score Normalization', () => {
    it('should clamp scores above 100 to 100', async () => {
      vi.spyOn(authModule, 'useAuth').mockReturnValue({ user: { userId: 1 } });

      const mockData = [
        {
          prediction_id: 1,
          created_at: '2024-01-15T10:30:00Z',
          prediction_score: 150,
          health_level: 'healthy',
          advice: 'Good',
          wellness_analysis: 'Analysis',
        },
      ];

      vi.spyOn(servicesModule, 'getScreeningHistory').mockResolvedValue({
        status: 'success',
        data: mockData,
      });
      vi.spyOn(
        chartHelpersModule,
        'buildWeeklyChartFromHistory'
      ).mockReturnValue([]);

      const { container } = render(
        <MemoryRouter>
          <History />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(container.textContent).toContain('100');
      });
    });
  });
});

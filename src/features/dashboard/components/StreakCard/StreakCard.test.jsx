import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StreakCard from './StreakCard';

describe('StreakCard Component', () => {
  describe('Loading State', () => {
    it('should display loading state', () => {
      render(<StreakCard data={null} loading={true} error={null} />);

      expect(screen.getByText('Loading Streak...')).toBeTruthy();
      expect(screen.getByText('🔥')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      const errorMessage = 'Failed to fetch data';
      render(<StreakCard data={null} loading={false} error={errorMessage} />);

      expect(screen.getByText('Failed to load streak data')).toBeTruthy();
      expect(screen.getByText(errorMessage)).toBeTruthy();
      expect(screen.getByText('❌')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no data', () => {
      render(<StreakCard data={null} loading={false} error={null} />);

      expect(screen.getByText(/Start your first screening!/)).toBeTruthy();
      expect(screen.getByText(/0/)).toBeTruthy();
      expect(screen.getByText(/days/)).toBeTruthy();
    });

    it('should display empty state when data has no daily or weekly', () => {
      render(<StreakCard data={{}} loading={false} error={null} />);

      expect(screen.getByText(/Start your first screening!/)).toBeTruthy();
    });
  });

  describe('Data Display', () => {
    it('should display daily streak by default', () => {
      const mockData = {
        daily: { current: 5 },
        weekly: { current: 2 },
        completed_days_this_week: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('5')).toBeTruthy();
      expect(screen.getByText('days')).toBeTruthy();
      expect(screen.getByText('Screening Streak')).toBeTruthy();
    });

    it('should display weekly streak when toggled', () => {
      const mockData = {
        daily: { current: 5 },
        weekly: { current: 2 },
        completed_days_this_week: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      const weeklyButton = screen.getByText('Weekly');
      fireEvent.click(weeklyButton);

      expect(screen.getByText('2')).toBeTruthy();
      expect(screen.getByText('weeks')).toBeTruthy();
    });

    it('should render all days of the week', () => {
      const mockData = {
        daily: { current: 3 },
        weekly: { current: 1 },
        completed_days_this_week: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('Mon')).toBeTruthy();
      expect(screen.getByText('Tue')).toBeTruthy();
      expect(screen.getByText('Wed')).toBeTruthy();
      expect(screen.getByText('Thu')).toBeTruthy();
      expect(screen.getByText('Fri')).toBeTruthy();
      expect(screen.getByText('Sat')).toBeTruthy();
      expect(screen.getByText('Sun')).toBeTruthy();
    });

    it('should handle zero streak values', () => {
      const mockData = {
        daily: { current: 0 },
        weekly: { current: 0 },
        completed_days_this_week: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.getByText('Screening Streak')).toBeTruthy();
    });
  });

  describe('Toggle Functionality', () => {
    it('should toggle between daily and weekly views', () => {
      const mockData = {
        daily: { current: 7 },
        weekly: { current: 1 },
        completed_days_this_week: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      // Initially daily
      expect(screen.getByText('7')).toBeTruthy();
      expect(screen.getByText('days')).toBeTruthy();

      // Switch to weekly
      const weeklyButton = screen.getByText('Weekly');
      fireEvent.click(weeklyButton);
      expect(screen.getByText('1')).toBeTruthy();
      expect(screen.getByText('weeks')).toBeTruthy();

      // Switch back to daily
      const dailyButton = screen.getByText('Daily');
      fireEvent.click(dailyButton);
      expect(screen.getByText('7')).toBeTruthy();
      expect(screen.getByText('days')).toBeTruthy();
    });

    it('should apply active class to selected toggle', () => {
      const mockData = {
        daily: { current: 5 },
        weekly: { current: 2 },
        completed_days_this_week: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      const dailyButton = screen.getByText('Daily');
      const weeklyButton = screen.getByText('Weekly');

      // Daily should be active by default
      expect(dailyButton.className).toContain('activeToggle');
      expect(weeklyButton.className).not.toContain('activeToggle');

      // Click weekly
      fireEvent.click(weeklyButton);
      expect(weeklyButton.className).toContain('activeToggle');
      expect(dailyButton.className).not.toContain('activeToggle');
    });
  });

  describe('Completed Days Logic', () => {
    it('should render day circles with completed days data', () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const mockData = {
        daily: { current: 1 },
        weekly: { current: 1 },
        completed_days_this_week: [todayStr],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      // Check that day names are rendered
      expect(screen.getByText('Mon')).toBeTruthy();
      expect(screen.getByText('Tue')).toBeTruthy();
    });

    it('should handle empty completed_days_this_week array', () => {
      const mockData = {
        daily: { current: 0 },
        weekly: { current: 0 },
        completed_days_this_week: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('Screening Streak')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined current values', () => {
      const mockData = {
        daily: {},
        weekly: {},
        completed_days_this_week: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('0')).toBeTruthy();
    });

    it('should handle high streak numbers', () => {
      const mockData = {
        daily: { current: 365 },
        weekly: { current: 52 },
        completed_days_this_week: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('365')).toBeTruthy();

      const weeklyButton = screen.getByText('Weekly');
      fireEvent.click(weeklyButton);
      expect(screen.getByText('52')).toBeTruthy();
    });
  });
});

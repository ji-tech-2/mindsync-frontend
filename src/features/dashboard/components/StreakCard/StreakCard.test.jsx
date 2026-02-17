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
    it('should display zero streak when no data', () => {
      render(<StreakCard data={null} loading={false} error={null} />);

      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.getByText('days')).toBeTruthy();
    });

    it('should display zero streak when data has no current_streak', () => {
      render(<StreakCard data={{}} loading={false} error={null} />);

      expect(screen.getByText('0')).toBeTruthy();
    });
  });

  describe('Data Display', () => {
    it('should display daily streak by default', () => {
      const mockData = {
        current_streak: { daily: 5, weekly: 2 },
        daily: [
          { date: '2024-01-15', label: 'Mon', has_screening: true },
          { date: '2024-01-16', label: 'Tue', has_screening: false },
        ],
        weekly: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('5')).toBeTruthy();
      expect(screen.getByText('days')).toBeTruthy();
      expect(screen.getByText('Screening Streak')).toBeTruthy();
    });

    it('should display weekly streak when toggled', () => {
      const mockData = {
        current_streak: { daily: 5, weekly: 2 },
        daily: [],
        weekly: [
          {
            week_start: '2024-01-08',
            label: 'Jan 8 - Jan 14',
            has_screening: true,
          },
        ],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      const weeklyTab = screen.getByRole('tab', { name: 'Weekly' });
      fireEvent.click(weeklyTab);

      expect(screen.getByText('2')).toBeTruthy();
      expect(screen.getByText('weeks')).toBeTruthy();
    });

    it('should render period data labels', () => {
      const mockData = {
        current_streak: { daily: 3, weekly: 1 },
        daily: [
          { date: '2024-01-15', label: 'Mon', has_screening: true },
          { date: '2024-01-16', label: 'Tue', has_screening: false },
          { date: '2024-01-17', label: 'Wed', has_screening: true },
        ],
        weekly: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('Mon')).toBeTruthy();
      expect(screen.getByText('Tue')).toBeTruthy();
      expect(screen.getByText('Wed')).toBeTruthy();
    });

    it('should handle zero streak values', () => {
      const mockData = {
        current_streak: { daily: 0, weekly: 0 },
        daily: [],
        weekly: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.getByText('Screening Streak')).toBeTruthy();
    });
  });

  describe('Toggle Functionality', () => {
    it('should toggle between daily and weekly views', () => {
      const mockData = {
        current_streak: { daily: 7, weekly: 1 },
        daily: [{ date: '2024-01-15', label: 'Mon', has_screening: true }],
        weekly: [
          {
            week_start: '2024-01-08',
            label: 'Jan 8 - Jan 14',
            has_screening: true,
          },
        ],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      // Initially daily
      expect(screen.getByText('7')).toBeTruthy();
      expect(screen.getByText('days')).toBeTruthy();

      // Switch to weekly
      const weeklyTab = screen.getByRole('tab', { name: 'Weekly' });
      fireEvent.click(weeklyTab);
      expect(screen.getByText('1')).toBeTruthy();
      expect(screen.getByText('weeks')).toBeTruthy();

      // Switch back to daily
      const dailyTab = screen.getByRole('tab', { name: 'Daily' });
      fireEvent.click(dailyTab);
      expect(screen.getByText('7')).toBeTruthy();
      expect(screen.getByText('days')).toBeTruthy();
    });

    it('should apply active state to selected tab', () => {
      const mockData = {
        current_streak: { daily: 5, weekly: 2 },
        daily: [],
        weekly: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      const dailyTab = screen.getByRole('tab', { name: 'Daily' });
      const weeklyTab = screen.getByRole('tab', { name: 'Weekly' });

      // Daily should be active by default
      expect(dailyTab.getAttribute('aria-selected')).toBe('true');
      expect(weeklyTab.getAttribute('aria-selected')).toBe('false');

      // Click weekly
      fireEvent.click(weeklyTab);
      expect(weeklyTab.getAttribute('aria-selected')).toBe('true');
      expect(dailyTab.getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('Completed Days Logic', () => {
    it('should render checkmark for completed screening days', () => {
      const mockData = {
        current_streak: { daily: 1, weekly: 1 },
        daily: [
          { date: '2024-01-15', label: 'Mon', has_screening: true },
          { date: '2024-01-16', label: 'Tue', has_screening: false },
        ],
        weekly: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      // Check that day labels are rendered
      expect(screen.getByText('Mon')).toBeTruthy();
      expect(screen.getByText('Tue')).toBeTruthy();
      // Completed day should show checkmark
      expect(screen.getByText('✓')).toBeTruthy();
    });

    it('should handle empty period data', () => {
      const mockData = {
        current_streak: { daily: 0, weekly: 0 },
        daily: [],
        weekly: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('Screening Streak')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined current_streak values', () => {
      const mockData = {
        current_streak: {},
        daily: [],
        weekly: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('0')).toBeTruthy();
    });

    it('should handle high streak numbers', () => {
      const mockData = {
        current_streak: { daily: 365, weekly: 52 },
        daily: [],
        weekly: [],
      };

      render(<StreakCard data={mockData} loading={false} error={null} />);

      expect(screen.getByText('365')).toBeTruthy();

      const weeklyTab = screen.getByRole('tab', { name: 'Weekly' });
      fireEvent.click(weeklyTab);
      expect(screen.getByText('52')).toBeTruthy();
    });
  });
});

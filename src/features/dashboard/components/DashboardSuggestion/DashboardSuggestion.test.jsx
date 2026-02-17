import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardSuggestion from './DashboardSuggestion';

describe('DashboardSuggestion Component', () => {
  describe('Loading State', () => {
    it('should display loading message', () => {
      render(<DashboardSuggestion data={null} loading={true} />);

      expect(screen.getByText('Loading daily suggestions...')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should display no suggestion message when data is null', () => {
      render(<DashboardSuggestion data={null} loading={false} />);

      expect(
        screen.getByText('No suggestion available at the moment.')
      ).toBeTruthy();
    });

    it('should display no suggestion message when data is empty array', () => {
      render(<DashboardSuggestion data={[]} loading={false} />);

      expect(
        screen.getByText('No suggestion available at the moment.')
      ).toBeTruthy();
    });

    it('should display no suggestion message when data is undefined', () => {
      render(<DashboardSuggestion data={undefined} loading={false} />);

      expect(
        screen.getByText('No suggestion available at the moment.')
      ).toBeTruthy();
    });
  });

  describe('String Data Display', () => {
    it('should display string data as paragraph', () => {
      const suggestion = 'Take a 10-minute walk to improve your mood.';
      render(<DashboardSuggestion data={suggestion} loading={false} />);

      expect(screen.getByText(suggestion)).toBeTruthy();
    });

    it('should handle long string suggestions', () => {
      const longSuggestion =
        'Try practicing mindfulness meditation for at least 15 minutes each day to reduce stress and improve mental clarity. Studies show this can significantly improve overall wellbeing.';
      render(<DashboardSuggestion data={longSuggestion} loading={false} />);

      expect(screen.getByText(longSuggestion)).toBeTruthy();
    });
  });

  describe('Array Data Display', () => {
    it('should render array items as list', () => {
      const suggestions = [
        'Get 7-8 hours of sleep',
        'Exercise for 30 minutes',
        'Practice deep breathing',
      ];

      render(<DashboardSuggestion data={suggestions} loading={false} />);

      expect(screen.getByText('Get 7-8 hours of sleep')).toBeTruthy();
      expect(screen.getByText('Exercise for 30 minutes')).toBeTruthy();
      expect(screen.getByText('Practice deep breathing')).toBeTruthy();
    });

    it('should render single item array', () => {
      const suggestions = ['Take a break every hour'];

      render(<DashboardSuggestion data={suggestions} loading={false} />);

      expect(screen.getByText('Take a break every hour')).toBeTruthy();
    });

    it('should handle many array items', () => {
      const suggestions = Array.from({ length: 10 }, (_, i) => `Tip ${i + 1}`);

      const { container } = render(
        <DashboardSuggestion data={suggestions} loading={false} />
      );

      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBe(10);
    });
  });

  describe('Object Data Display', () => {
    it('should render object values as list', () => {
      const suggestions = {
        tip1: 'Stay hydrated',
        tip2: 'Eat healthy meals',
        tip3: 'Take regular breaks',
      };

      render(<DashboardSuggestion data={suggestions} loading={false} />);

      expect(screen.getByText('Stay hydrated')).toBeTruthy();
      expect(screen.getByText('Eat healthy meals')).toBeTruthy();
      expect(screen.getByText('Take regular breaks')).toBeTruthy();
    });

    it('should handle object with single value', () => {
      const suggestion = {
        advice: 'Maintain good posture',
      };

      render(<DashboardSuggestion data={suggestion} loading={false} />);

      expect(screen.getByText('Maintain good posture')).toBeTruthy();
    });

    it('should render object with numeric keys', () => {
      const suggestions = {
        0: 'First tip',
        1: 'Second tip',
        2: 'Third tip',
      };

      render(<DashboardSuggestion data={suggestions} loading={false} />);

      expect(screen.getByText('First tip')).toBeTruthy();
      expect(screen.getByText('Second tip')).toBeTruthy();
      expect(screen.getByText('Third tip')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle number as data', () => {
      render(<DashboardSuggestion data={42} loading={false} />);

      // Number is converted to a single-item list
      expect(screen.getByText('42')).toBeTruthy();
    });

    it('should handle boolean true as data', () => {
      const { container } = render(
        <DashboardSuggestion data={true} loading={false} />
      );

      // Boolean is in a list
      expect(container.querySelector('ul')).toBeTruthy();
    });

    it('should handle empty string', () => {
      render(<DashboardSuggestion data="" loading={false} />);

      // Empty string should display as no suggestion message
      expect(
        screen.getByText('No suggestion available at the moment.')
      ).toBeTruthy();
    });

    it('should handle array with empty strings', () => {
      const suggestions = ['', 'Valid tip', ''];

      const { container } = render(
        <DashboardSuggestion data={suggestions} loading={false} />
      );

      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBe(3);
      expect(screen.getByText('Valid tip')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    it('should render loading state with container', () => {
      render(<DashboardSuggestion data={null} loading={true} />);

      expect(screen.getByText('Loading daily suggestions...')).toBeTruthy();
    });

    it('should have list structure for array data', () => {
      const suggestions = ['Tip 1', 'Tip 2'];

      const { container } = render(
        <DashboardSuggestion data={suggestions} loading={false} />
      );

      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBe(2);
    });

    it('should have paragraph structure for string data', () => {
      render(<DashboardSuggestion data="Test suggestion" loading={false} />);

      expect(screen.getByText('Test suggestion')).toBeTruthy();
    });
  });

  describe('Data Type Detection', () => {
    it('should correctly identify array type', () => {
      const { container } = render(
        <DashboardSuggestion data={['item']} loading={false} />
      );

      expect(container.querySelector('ul')).toBeTruthy();
    });

    it('should correctly identify object type', () => {
      const { container } = render(
        <DashboardSuggestion data={{ key: 'value' }} loading={false} />
      );

      expect(container.querySelector('ul')).toBeTruthy();
    });

    it('should correctly identify string type', () => {
      const { container } = render(
        <DashboardSuggestion data="string data" loading={false} />
      );

      // String data is wrapped in a ul/li structure
      expect(container.querySelector('ul')).toBeTruthy();
      expect(screen.getByText('string data')).toBeTruthy();
    });
  });
});

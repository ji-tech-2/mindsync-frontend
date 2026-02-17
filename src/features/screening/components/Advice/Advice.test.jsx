import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Advice from './Advice';

// Mock AdviceFactor component
vi.mock('../AdviceFactor', () => ({
  default: ({ factorKey, factorData }) => (
    <div data-testid={`advice-factor-${factorKey}`}>
      {factorData.recommendation}
    </div>
  ),
}));

describe('Advice Component - Partial Polling', () => {
  const mockAdviceData = {
    description: 'Focus on improving your sleep and exercise habits',
    factors: {
      sleep: {
        recommendation: 'Aim for 7-8 hours of quality sleep per night',
        priority: 'high',
      },
      exercise: {
        recommendation: 'Engage in 30 minutes of moderate exercise daily',
        priority: 'medium',
      },
      social: {
        recommendation: 'Connect with friends and family regularly',
        priority: 'medium',
      },
    },
  };

  describe('Loading State', () => {
    it('should show loading message when isLoading is true', () => {
      render(<Advice adviceData={null} isLoading={true} />);

      expect(
        screen.getByText('Loading personalized advice...')
      ).toBeInTheDocument();
    });

    it('should not show advice content while loading', () => {
      render(<Advice adviceData={mockAdviceData} isLoading={true} />);

      // Should not show advice description even if adviceData is present
      expect(
        screen.queryByText(mockAdviceData.description)
      ).not.toBeInTheDocument();
    });
  });

  describe('No Advice State', () => {
    it('should show placeholder message when no advice data', () => {
      render(<Advice adviceData={null} isLoading={false} />);

      expect(
        screen.getByText('Advice will appear once analysis is complete...')
      ).toBeInTheDocument();
    });

    it('should not show loading message when not loading', () => {
      render(<Advice adviceData={null} isLoading={false} />);

      expect(
        screen.queryByText('Loading personalized advice...')
      ).not.toBeInTheDocument();
    });
  });

  describe('Advice Display', () => {
    it('should display advice description when data is available', () => {
      render(<Advice adviceData={mockAdviceData} isLoading={false} />);

      expect(screen.getByText(mockAdviceData.description)).toBeInTheDocument();
    });

    it('should render all advice factors', () => {
      render(<Advice adviceData={mockAdviceData} isLoading={false} />);

      // Check that all factors are rendered
      expect(screen.getByTestId('advice-factor-sleep')).toBeInTheDocument();
      expect(screen.getByTestId('advice-factor-exercise')).toBeInTheDocument();
      expect(screen.getByTestId('advice-factor-social')).toBeInTheDocument();

      // Check factor content
      expect(
        screen.getByText('Aim for 7-8 hours of quality sleep per night')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Engage in 30 minutes of moderate exercise daily')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Connect with friends and family regularly')
      ).toBeInTheDocument();
    });

    it('should not show placeholder when advice is displayed', () => {
      render(<Advice adviceData={mockAdviceData} isLoading={false} />);

      expect(
        screen.queryByText('Advice will appear once analysis is complete...')
      ).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle advice with empty factors object', () => {
      const adviceWithNoFactors = {
        description: 'You are doing well',
        factors: {},
      };

      render(<Advice adviceData={adviceWithNoFactors} isLoading={false} />);

      expect(screen.getByText('You are doing well')).toBeInTheDocument();
      // Should not crash, just show no factors
      expect(screen.queryByTestId(/advice-factor-/)).not.toBeInTheDocument();
    });

    it('should handle advice with undefined factors', () => {
      const adviceWithUndefinedFactors = {
        description: 'You are doing well',
        factors: undefined,
      };

      render(
        <Advice adviceData={adviceWithUndefinedFactors} isLoading={false} />
      );

      expect(screen.getByText('You are doing well')).toBeInTheDocument();
      // Should not crash
      expect(screen.queryByTestId(/advice-factor-/)).not.toBeInTheDocument();
    });

    it('should handle missing resultData gracefully', () => {
      render(<Advice resultData={null} adviceData={null} isLoading={false} />);

      // Should still render the component
      expect(
        screen.getByText('Advice will appear once analysis is complete...')
      ).toBeInTheDocument();
    });
  });

  describe('Partial to Full Transition', () => {
    it('should transition from loading to showing advice', () => {
      const { rerender } = render(
        <Advice adviceData={null} isLoading={true} />
      );

      // Initially loading
      expect(
        screen.getByText('Loading personalized advice...')
      ).toBeInTheDocument();

      // Simulate advice data arriving
      rerender(<Advice adviceData={mockAdviceData} isLoading={false} />);

      // Should now show advice
      expect(
        screen.queryByText('Loading personalized advice...')
      ).not.toBeInTheDocument();
      expect(screen.getByText(mockAdviceData.description)).toBeInTheDocument();
    });

    it('should transition from placeholder to showing advice', () => {
      const { rerender } = render(
        <Advice adviceData={null} isLoading={false} />
      );

      // Initially showing placeholder
      expect(
        screen.getByText('Advice will appear once analysis is complete...')
      ).toBeInTheDocument();

      // Simulate advice data arriving
      rerender(<Advice adviceData={mockAdviceData} isLoading={false} />);

      // Should now show advice
      expect(
        screen.queryByText('Advice will appear once analysis is complete...')
      ).not.toBeInTheDocument();
      expect(screen.getByText(mockAdviceData.description)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should render advice section container', () => {
      const { container } = render(
        <Advice adviceData={mockAdviceData} isLoading={false} />
      );

      // CSS modules transform class names, so we check for div structure instead
      const adviceSection = container.querySelector('div');
      expect(adviceSection).toBeInTheDocument();
      expect(adviceSection).toHaveTextContent(mockAdviceData.description);
    });

    it('should render advice factors container when advice data present', () => {
      render(<Advice adviceData={mockAdviceData} isLoading={false} />);

      // Check that factors are rendered (they're in a container div)
      expect(screen.getByTestId('advice-factor-sleep')).toBeInTheDocument();
      expect(screen.getByTestId('advice-factor-exercise')).toBeInTheDocument();
    });
  });

  describe('Multiple Factors', () => {
    it('should handle single factor', () => {
      const singleFactorAdvice = {
        description: 'Focus on sleep',
        factors: {
          sleep: {
            recommendation: 'Get 8 hours of sleep',
          },
        },
      };

      render(<Advice adviceData={singleFactorAdvice} isLoading={false} />);

      expect(screen.getByTestId('advice-factor-sleep')).toBeInTheDocument();
      expect(
        screen.queryByTestId('advice-factor-exercise')
      ).not.toBeInTheDocument();
    });

    it('should handle many factors', () => {
      const manyFactorsAdvice = {
        description: 'Comprehensive advice',
        factors: {
          sleep: { recommendation: 'Sleep well' },
          exercise: { recommendation: 'Exercise daily' },
          nutrition: { recommendation: 'Eat healthy' },
          social: { recommendation: 'Connect with others' },
          mindfulness: { recommendation: 'Practice mindfulness' },
        },
      };

      render(<Advice adviceData={manyFactorsAdvice} isLoading={false} />);

      expect(screen.getByTestId('advice-factor-sleep')).toBeInTheDocument();
      expect(screen.getByTestId('advice-factor-exercise')).toBeInTheDocument();
      expect(screen.getByTestId('advice-factor-nutrition')).toBeInTheDocument();
      expect(screen.getByTestId('advice-factor-social')).toBeInTheDocument();
      expect(
        screen.getByTestId('advice-factor-mindfulness')
      ).toBeInTheDocument();
    });
  });
});

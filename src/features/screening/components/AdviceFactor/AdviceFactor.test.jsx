import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdviceFactor from './AdviceFactor';

describe('AdviceFactor', () => {
  const mockFactorData = {
    advices: [
      'Get at least 7-8 hours of sleep',
      'Maintain a consistent sleep schedule',
      'Avoid screens before bedtime',
    ],
    references: [
      'https://example.com/sleep-study-1',
      'https://example.com/sleep-study-2',
    ],
  };

  describe('Initial Rendering', () => {
    it('should render with collapsed state by default', () => {
      render(
        <AdviceFactor
          factorKey="num__sleep_hours"
          factorData={mockFactorData}
        />
      );

      expect(screen.getByText('Sleep Duration')).toBeTruthy();
      const header = screen.getByText('Sleep Duration').parentElement;
      expect(header.getAttribute('aria-expanded')).toBe('false');
      expect(screen.queryByText('Get at least 7-8 hours of sleep')).toBeNull();
    });

    it('should format factor key title correctly', () => {
      render(
        <AdviceFactor
          factorKey="num__work_screen_hours"
          factorData={mockFactorData}
        />
      );

      expect(screen.getByText('Work Screen Hours')).toBeTruthy();
    });

    it('should remove "num__" prefix from title', () => {
      render(
        <AdviceFactor
          factorKey="num__stress_level"
          factorData={mockFactorData}
        />
      );

      expect(screen.getByText('Stress Level')).toBeTruthy();
      expect(screen.queryByText(/num__/)).toBeNull();
    });

    it('should handle underscores in factor key', () => {
      render(
        <AdviceFactor
          factorKey="num__social_hours_per_week"
          factorData={mockFactorData}
        />
      );

      expect(screen.getByText('Social Hours Per Week')).toBeTruthy();
    });
  });

  describe('Expansion Toggle', () => {
    it('should expand and show content when clicked', () => {
      render(
        <AdviceFactor
          factorKey="num__sleep_hours"
          factorData={mockFactorData}
        />
      );

      const header = screen.getByText('Sleep Duration').parentElement;
      fireEvent.click(header);

      expect(screen.getByText('Get at least 7-8 hours of sleep')).toBeTruthy();
      expect(
        screen.getByText('Maintain a consistent sleep schedule')
      ).toBeTruthy();
      expect(screen.getByText('Avoid screens before bedtime')).toBeTruthy();
      expect(header.getAttribute('aria-expanded')).toBe('true');
    });

    it('should collapse when clicked again', () => {
      render(
        <AdviceFactor
          factorKey="num__sleep_hours"
          factorData={mockFactorData}
        />
      );

      const header = screen.getByText('Sleep Duration').parentElement;

      // Expand
      fireEvent.click(header);
      expect(screen.getByText('Get at least 7-8 hours of sleep')).toBeTruthy();

      // Collapse
      fireEvent.click(header);
      expect(screen.queryByText('Get at least 7-8 hours of sleep')).toBeNull();
      expect(header.getAttribute('aria-expanded')).toBe('false');
    });

    it('should toggle aria-expanded attribute', () => {
      render(
        <AdviceFactor
          factorKey="num__sleep_hours"
          factorData={mockFactorData}
        />
      );

      const header = screen.getByText('Sleep Duration').parentElement;

      // Initially collapsed
      expect(header.getAttribute('aria-expanded')).toBe('false');

      // Expand
      fireEvent.click(header);
      expect(header.getAttribute('aria-expanded')).toBe('true');

      // Collapse
      fireEvent.click(header);
      expect(header.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Content Display', () => {
    it('should render all advice items when expanded', () => {
      render(
        <AdviceFactor
          factorKey="num__sleep_hours"
          factorData={mockFactorData}
        />
      );

      const header = screen.getByText('Sleep Duration').parentElement;
      fireEvent.click(header);

      mockFactorData.advices.forEach((advice) => {
        expect(screen.getByText(advice)).toBeTruthy();
      });
    });

    it('should render all reference links when expanded', () => {
      render(
        <AdviceFactor
          factorKey="num__sleep_hours"
          factorData={mockFactorData}
        />
      );

      const header = screen.getByText('Sleep Duration').parentElement;
      fireEvent.click(header);

      expect(screen.getByText('References:')).toBeTruthy();

      mockFactorData.references.forEach((ref, index) => {
        const link = screen.getByRole('link', {
          name: `Resource ${index + 1}`,
        });
        expect(link).toBeTruthy();
        expect(link.href).toBe(ref);
        expect(link.target).toBe('_blank');
        expect(link.rel).toContain('noopener');
      });
    });

    it('should handle empty advice list', () => {
      const emptyAdviceData = {
        advices: [],
        references: ['https://example.com/ref'],
      };

      render(
        <AdviceFactor
          factorKey="num__test_factor"
          factorData={emptyAdviceData}
        />
      );

      const header = screen.getByText('Test Factor').parentElement;
      fireEvent.click(header);

      expect(screen.getByText('References:')).toBeTruthy();
    });

    it('should handle advice with special characters', () => {
      const specialAdviceData = {
        advices: [
          'Advice with "quotes"',
          "Advice with 'apostrophe'",
          'Advice with & ampersand',
        ],
        references: [],
      };

      render(
        <AdviceFactor factorKey="num__special" factorData={specialAdviceData} />
      );

      const header = screen.getByText('Special').parentElement;
      fireEvent.click(header);

      expect(screen.getByText('Advice with "quotes"')).toBeTruthy();
      expect(screen.getByText("Advice with 'apostrophe'")).toBeTruthy();
      expect(screen.getByText('Advice with & ampersand')).toBeTruthy();
    });
  });

  describe('Title Formatting', () => {
    it('should capitalize first letter of each word', () => {
      render(
        <AdviceFactor
          factorKey="num__multiple_word_title"
          factorData={mockFactorData}
        />
      );

      expect(screen.getByText('Multiple Word Title')).toBeTruthy();
    });

    it('should handle single word titles', () => {
      render(
        <AdviceFactor
          factorKey="num__productivity"
          factorData={mockFactorData}
        />
      );

      expect(screen.getByText('Productivity')).toBeTruthy();
    });

    it('should remove "0 100" suffix from title', () => {
      render(
        <AdviceFactor
          factorKey="num__productivity_0_100"
          factorData={mockFactorData}
        />
      );

      const title = screen.getByText(/Productivity/);
      expect(title.textContent).not.toContain('0 100');
    });

    it('should remove "1 5^2" suffix from title', () => {
      render(
        <AdviceFactor
          factorKey="num__sleep_quality_1_5^2"
          factorData={mockFactorData}
        />
      );

      const title = screen.getByText(/Sleep Quality/);
      expect(title.textContent).not.toContain('1 5^2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long advice text', () => {
      const longAdviceData = {
        advices: [
          'This is a very long piece of advice that contains multiple sentences and goes on for quite a while to test how the component handles lengthy text content without breaking the layout or causing any issues with rendering.',
        ],
        references: [],
      };

      render(
        <AdviceFactor factorKey="num__long_text" factorData={longAdviceData} />
      );

      const header = screen.getByText('Long Text').parentElement;
      fireEvent.click(header);

      expect(screen.getByText(longAdviceData.advices[0])).toBeTruthy();
    });

    it('should handle multiple expansions and collapses', () => {
      render(
        <AdviceFactor factorKey="num__test" factorData={mockFactorData} />
      );

      const header = screen.getByText('Test').parentElement;

      // Multiple toggle cycles
      for (let i = 0; i < 3; i++) {
        fireEvent.click(header);
        expect(header.getAttribute('aria-expanded')).toBe('true');

        fireEvent.click(header);
        expect(header.getAttribute('aria-expanded')).toBe('false');
      }
    });

    it('should handle empty references array', () => {
      const noRefsData = {
        advices: ['Some advice'],
        references: [],
      };

      render(<AdviceFactor factorKey="num__no_refs" factorData={noRefsData} />);

      const header = screen.getByText('No Refs').parentElement;
      fireEvent.click(header);

      // Should not show references section when empty
      expect(screen.queryByText('References:')).toBeNull();
      expect(screen.getByText('Some advice')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have clickable header', () => {
      render(
        <AdviceFactor factorKey="num__test" factorData={mockFactorData} />
      );

      const header = screen.getByText('Test').parentElement;
      expect(header).toBeTruthy();
      expect(header.tagName).toBe('BUTTON');
    });

    it('should open external links in new tab with security attributes', () => {
      render(
        <AdviceFactor factorKey="num__test" factorData={mockFactorData} />
      );

      const header = screen.getByText('Test').parentElement;
      fireEvent.click(header);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link.target).toBe('_blank');
        expect(link.rel).toContain('noopener');
      });
    });
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CriticalFactorCard from './CriticalFactorCard';

describe('CriticalFactorCard Component', () => {
  describe('Loading State', () => {
    it('should display loading message', () => {
      render(<CriticalFactorCard data={null} loading={true} />);

      expect(screen.getByText('Analyzing Critical Factors...')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no data', () => {
      render(<CriticalFactorCard data={null} loading={false} />);

      expect(screen.getByText('No Analysis Yet')).toBeTruthy();
      expect(
        screen.getByText(
          /Please take the assessment first to discover and analyze/
        )
      ).toBeTruthy();
    });

    it('should show placeholder in empty state', () => {
      const { container } = render(
        <CriticalFactorCard data={null} loading={false} />
      );

      expect(screen.getByText('No Analysis Yet')).toBeTruthy();
      const divs = container.querySelectorAll('div');
      expect(divs.length).toBeGreaterThan(0);
    });
  });

  describe('Data Display', () => {
    it('should display factor name and description', () => {
      const mockData = {
        factor_name: 'Sleep Quality',
        raw_name: 'num__sleep_quality_1_5^2',
        description:
          'Getting adequate sleep is crucial for mental health and wellbeing.',
        references: [],
      };

      render(<CriticalFactorCard data={mockData} loading={false} />);

      expect(screen.getByText('Sleep Quality')).toBeTruthy();
      expect(
        screen.getByText(
          'Getting adequate sleep is crucial for mental health and wellbeing.'
        )
      ).toBeTruthy();
    });

    it('should display no suggestions message when description is null', () => {
      const mockData = {
        factor_name: 'Stress Level',
        raw_name: 'num__stress_level',
        description: null,
        references: [],
      };

      render(<CriticalFactorCard data={mockData} loading={false} />);

      expect(screen.getByText('Stress Level')).toBeTruthy();
      expect(screen.getByText('No suggestions available.')).toBeTruthy();
    });

    it('should display no suggestions when description is empty string', () => {
      const mockData = {
        factor_name: 'Productivity',
        raw_name: 'num__productivity_0_100',
        description: '',
        references: [],
      };

      render(<CriticalFactorCard data={mockData} loading={false} />);

      expect(screen.getByText('No suggestions available.')).toBeTruthy();
    });
  });

  describe('References Display', () => {
    it('should display references when available', () => {
      const mockData = {
        factor_name: 'Sleep Quality',
        raw_name: 'num__sleep_quality_1_5^2',
        description: 'Sleep is important',
        references: [
          'https://example.com/sleep-study',
          'https://example.com/mental-health',
        ],
      };

      const { container } = render(
        <CriticalFactorCard data={mockData} loading={false} />
      );

      expect(screen.getByText('References:')).toBeTruthy();
      const links = container.querySelectorAll('a[href]');
      expect(links.length).toBeGreaterThanOrEqual(2);
      const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
      expect(hrefs).toContain('https://example.com/sleep-study');
      expect(hrefs).toContain('https://example.com/mental-health');
    });

    it('should handle object references with url property', () => {
      const mockData = {
        factor_name: 'Stress',
        raw_name: 'num__stress',
        description: 'Manage stress',
        references: [
          { url: 'https://example.com/stress', title: 'Stress Management' },
          { url: 'https://example.com/tips', title: 'Tips' },
        ],
      };

      const { container } = render(
        <CriticalFactorCard data={mockData} loading={false} />
      );

      const links = container.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);
      expect(links[0].getAttribute('href')).toBe('https://example.com/stress');
    });

    it('should handle mixed string and object references', () => {
      const mockData = {
        factor_name: 'Wellness',
        raw_name: 'wellness',
        description: 'Overall wellness',
        references: [
          'https://example.com/direct-link',
          { url: 'https://example.com/object-link' },
        ],
      };

      const { container } = render(
        <CriticalFactorCard data={mockData} loading={false} />
      );

      const links = container.querySelectorAll('a');
      expect(links.length).toBe(2);
    });

    it('should not display references section when empty array', () => {
      const mockData = {
        factor_name: 'Test Factor',
        raw_name: 'test',
        description: 'Test description',
        references: [],
      };

      render(<CriticalFactorCard data={mockData} loading={false} />);

      expect(screen.queryByText('References:')).toBeFalsy();
    });

    it('should not display references section when undefined', () => {
      const mockData = {
        factor_name: 'Test Factor',
        raw_name: 'test',
        description: 'Test description',
      };

      render(<CriticalFactorCard data={mockData} loading={false} />);

      expect(screen.queryByText('References:')).toBeFalsy();
    });
  });

  describe('Image Handling', () => {
    it('should display factor image with correct src', () => {
      const mockData = {
        factor_name: 'Sleep Quality',
        raw_name: 'num__sleep_quality_1_5^2',
        description: 'Sleep info',
        references: [],
      };

      const { container } = render(
        <CriticalFactorCard data={mockData} loading={false} />
      );

      const img = container.querySelector('img');
      expect(img).toBeTruthy();
      // getFeatureImage returns the mapped image path
      expect(img?.getAttribute('src')).toBeTruthy();
      expect(img?.getAttribute('alt')).toBe('Sleep Quality');
    });

    it('should use default image for unknown factor', () => {
      const mockData = {
        factor_name: 'Unknown Factor',
        raw_name: 'unknown_factor',
        description: 'Unknown',
        references: [],
      };

      const { container } = render(
        <CriticalFactorCard data={mockData} loading={false} />
      );

      const img = container.querySelector('img');
      expect(img?.getAttribute('src')).toBeTruthy();
    });
  });

  describe('Link Properties', () => {
    it('should open links in new tab', () => {
      const mockData = {
        factor_name: 'Test',
        raw_name: 'test',
        description: 'Test',
        references: ['https://example.com'],
      };

      const { container } = render(
        <CriticalFactorCard data={mockData} loading={false} />
      );

      const link = container.querySelector('a');
      expect(link?.getAttribute('target')).toBe('_blank');
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should have correct href for string references', () => {
      const mockData = {
        factor_name: 'Test',
        raw_name: 'test',
        description: 'Test',
        references: ['https://health.example.com/article'],
      };

      const { container } = render(
        <CriticalFactorCard data={mockData} loading={false} />
      );

      const link = container.querySelector('a');
      expect(link?.getAttribute('href')).toBe(
        'https://health.example.com/article'
      );
    });
  });

  describe('CSS Classes', () => {
    it('should render card container for data', () => {
      const mockData = {
        factor_name: 'Test',
        raw_name: 'test',
        description: 'Test',
        references: [],
      };

      const { container } = render(
        <CriticalFactorCard data={mockData} loading={false} />
      );

      expect(container.querySelector('div')).toBeTruthy();
    });

    it('should render when no data', () => {
      render(<CriticalFactorCard data={null} loading={false} />);

      expect(screen.getByText('No Analysis Yet')).toBeTruthy();
    });

    it('should render loading state', () => {
      render(<CriticalFactorCard data={null} loading={true} />);

      expect(screen.getByText('Analyzing Critical Factors...')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long description', () => {
      const longDescription = 'A'.repeat(1000);
      const mockData = {
        factor_name: 'Test',
        raw_name: 'test',
        description: longDescription,
        references: [],
      };

      render(<CriticalFactorCard data={mockData} loading={false} />);

      expect(screen.getByText(longDescription)).toBeTruthy();
    });

    it('should handle many references', () => {
      const references = Array.from(
        { length: 20 },
        (_, i) => `https://example.com/ref${i}`
      );
      const mockData = {
        factor_name: 'Test',
        raw_name: 'test',
        description: 'Test',
        references,
      };

      const { container } = render(
        <CriticalFactorCard data={mockData} loading={false} />
      );

      const links = container.querySelectorAll('a');
      expect(links.length).toBe(20);
    });

    it('should handle special characters in factor name', () => {
      const mockData = {
        factor_name: 'Sleep Quality (1-5)^2',
        raw_name: 'num__sleep_quality_1_5^2',
        description: 'Test',
        references: [],
      };

      render(<CriticalFactorCard data={mockData} loading={false} />);

      expect(screen.getByText('Sleep Quality (1-5)^2')).toBeTruthy();
    });
  });
});

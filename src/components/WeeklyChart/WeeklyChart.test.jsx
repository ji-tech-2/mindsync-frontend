import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WeeklyChart from './WeeklyChart';

const renderChart = (props = {}) =>
  render(
    <MemoryRouter>
      <WeeklyChart {...props} />
    </MemoryRouter>
  );

// Mock recharts components
vi.mock('recharts', () => ({
  BarChart: ({ children, data }) => (
    <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Bar: ({ children, dataKey }) => (
    <div data-testid="bar" data-key={dataKey}>
      {children}
    </div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ content }) => <div data-testid="tooltip">{content}</div>,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: ({ fill }) => <div data-testid="cell" data-fill={fill} />,
  ReferenceLine: ({ y, stroke }) => (
    <div data-testid="reference-line" data-y={y} data-stroke={stroke} />
  ),
}));

// Mock Dropdown component
vi.mock('../Dropdown', () => ({
  default: ({ label, options, value, onChange }) => (
    <div data-testid="dropdown">
      <select
        aria-label={label}
        value={value?.value || ''}
        onChange={(e) => {
          const opt = options.find((o) => o.value === e.target.value);
          onChange(opt);
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

describe('WeeklyChart', () => {
  const mockData = [
    {
      date: '2024-01-01',
      label: 'Mon',
      has_data: true,
      mental_health_index: 75,
    },
    {
      date: '2024-01-02',
      label: 'Tue',
      has_data: true,
      mental_health_index: 45,
    },
    {
      date: '2024-01-03',
      label: 'Wed',
      has_data: true,
      mental_health_index: 20,
    },
    {
      date: '2024-01-04',
      label: 'Thu',
      has_data: true,
      mental_health_index: 8,
    },
    {
      date: '2024-01-05',
      label: 'Fri',
      has_data: true,
      mental_health_index: 90,
    },
  ];

  describe('Empty State', () => {
    it('should render no data message when data is empty array', () => {
      renderChart({ data: [] });
      expect(screen.getByText('No data to display yet')).toBeTruthy();
      expect(
        screen.getByText('Data will appear after completing a screening')
      ).toBeTruthy();
    });

    it('should render no data message when data is undefined', () => {
      renderChart();
      expect(screen.getByText('No data to display yet')).toBeTruthy();
    });

    it('should display default title in empty state', () => {
      renderChart({ data: [] });
      expect(screen.getByText('Weekly Chart')).toBeTruthy();
    });

    it('should display custom title in empty state', () => {
      renderChart({ data: [], title: 'My Custom Title' });
      expect(screen.getByText('My Custom Title')).toBeTruthy();
    });

    it('should render no data icon', () => {
      renderChart({ data: [] });
      expect(screen.getByText('📊')).toBeTruthy();
    });

    it('should still render metric selector in empty state', () => {
      renderChart({ data: [] });
      expect(screen.getByTestId('dropdown')).toBeTruthy();
    });
  });

  describe('Chart Rendering', () => {
    it('should render chart with data', () => {
      renderChart({ data: mockData });
      expect(screen.getByTestId('bar-chart')).toBeTruthy();
      expect(screen.getByTestId('bar')).toBeTruthy();
      expect(screen.getByTestId('x-axis')).toBeTruthy();
      expect(screen.getByTestId('y-axis')).toBeTruthy();
    });

    it('should render chart title', () => {
      renderChart({ data: mockData, title: 'Test Title' });
      expect(screen.getByText('Test Title')).toBeTruthy();
    });

    it('should render default title when not provided', () => {
      renderChart({ data: mockData });
      expect(screen.getByText('Weekly Chart')).toBeTruthy();
    });

    it('should render history button with href', () => {
      renderChart({ data: mockData });
      const link = document.querySelector('a[href="/history"]');
      expect(link).toBeTruthy();
    });

    it('should apply compact class when compact prop is true', () => {
      const { container } = renderChart({ data: mockData, compact: true });
      const chartContainer = container.querySelector(
        '[class*="weekly-chart-container"]'
      );
      expect(chartContainer.className).toContain('compact');
    });

    it('should not apply compact class when compact prop is false', () => {
      const { container } = renderChart({ data: mockData, compact: false });
      const chartContainer = container.querySelector(
        '[class*="weekly-chart-container"]'
      );
      expect(chartContainer.className).not.toContain('compact');
    });

    it('should apply minimal class when minimal prop is true', () => {
      const { container } = renderChart({ data: mockData, minimal: true });
      const chartContainer = container.querySelector(
        '[class*="weekly-chart-container"]'
      );
      expect(chartContainer.className).toContain('minimal');
    });

    it('should not render header in minimal mode', () => {
      renderChart({ data: mockData, minimal: true });
      expect(screen.queryByText('Weekly Chart')).toBeNull();
    });
  });

  describe('Data Visualization', () => {
    it('should pass data to BarChart', () => {
      renderChart({ data: mockData });
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));
      expect(chartData.length).toBe(mockData.length);
      expect(chartData[0].label).toBe('Mon');
    });

    it('should use mental_health_index as default dataKey', () => {
      renderChart({ data: mockData });
      const bar = screen.getByTestId('bar');
      expect(bar.getAttribute('data-key')).toBe('mental_health_index');
    });

    it('should render metric selector dropdown', () => {
      renderChart({ data: mockData });
      expect(screen.getByTestId('dropdown')).toBeTruthy();
    });

    it('should render reference lines for mental_health_index metric', () => {
      renderChart({ data: mockData });
      const referenceLines = screen.getAllByTestId('reference-line');
      expect(referenceLines.length).toBe(3);
    });

    it('should render reference lines with correct threshold values', () => {
      renderChart({ data: mockData });
      const referenceLines = screen.getAllByTestId('reference-line');
      const yValues = referenceLines.map((line) =>
        parseFloat(line.getAttribute('data-y'))
      );
      expect(yValues).toContain(12);
      expect(yValues).toContain(28.6);
      expect(yValues).toContain(61.4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single data point', () => {
      const singleData = [
        {
          date: '2024-01-01',
          label: 'Mon',
          has_data: true,
          mental_health_index: 50,
        },
      ];
      renderChart({ data: singleData });
      expect(screen.getByTestId('bar-chart')).toBeTruthy();
    });

    it('should handle data with very high values', () => {
      const highValueData = [
        {
          date: '2024-01-01',
          label: 'Mon',
          has_data: true,
          mental_health_index: 100,
        },
      ];
      renderChart({ data: highValueData });
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));
      expect(chartData[0].mental_health_index).toBe(100);
    });

    it('should handle data with zero values', () => {
      const zeroData = [
        {
          date: '2024-01-01',
          label: 'Mon',
          has_data: true,
          mental_health_index: 0,
        },
      ];
      renderChart({ data: zeroData });
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));
      expect(chartData[0].mental_health_index).toBe(0);
    });

    it('should handle empty string title', () => {
      renderChart({ data: mockData, title: '' });
      expect(screen.queryByText('Weekly Chart')).toBeNull();
    });

    it('should handle entries with has_data=false', () => {
      const dataWithNoData = [
        {
          date: '2024-01-01',
          label: 'Mon',
          has_data: true,
          mental_health_index: 75,
        },
        {
          date: '2024-01-02',
          label: 'Tue',
          has_data: false,
          mental_health_index: 0,
        },
      ];
      renderChart({ data: dataWithNoData });
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));
      expect(chartData[0].has_data).toBe(true);
      expect(chartData[1].has_data).toBe(false);
    });

    it('should handle all entries with has_data=false', () => {
      const allNoData = [
        {
          date: '2024-01-01',
          label: 'Mon',
          has_data: false,
          mental_health_index: 0,
        },
        {
          date: '2024-01-02',
          label: 'Tue',
          has_data: false,
          mental_health_index: 0,
        },
      ];
      renderChart({ data: allNoData });
      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));
      chartData.forEach((entry) => {
        expect(entry.has_data).toBe(false);
      });
    });
  });

  describe('Card Wrapper', () => {
    it('should render within a Card component', () => {
      const { container } = renderChart({ data: mockData });
      expect(container.firstChild).toBeTruthy();
    });

    it('should pass rest props to Card', () => {
      renderChart({ data: mockData, 'data-custom': 'test' });
      expect(document.querySelector('[data-custom="test"]')).toBeTruthy();
    });
  });
});

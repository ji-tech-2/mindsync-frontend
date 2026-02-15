import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeeklyChart from './WeeklyChart';

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

describe('WeeklyChart', () => {
  const mockData = [
    { day: 'Mon', date: '2024-01-01', value: 75 },
    { day: 'Tue', date: '2024-01-02', value: 45 },
    { day: 'Wed', date: '2024-01-03', value: 20 },
    { day: 'Thu', date: '2024-01-04', value: 8 },
    { day: 'Fri', date: '2024-01-05', value: 90 },
  ];

  describe('Empty State', () => {
    it('should render no data message when data is empty array', () => {
      render(<WeeklyChart data={[]} />);

      expect(screen.getByText('No data to display yet')).toBeTruthy();
      expect(
        screen.getByText('Data will appear after completing a screening')
      ).toBeTruthy();
    });

    it('should render no data message when data is null', () => {
      render(<WeeklyChart data={null} />);

      expect(screen.getByText('No data to display yet')).toBeTruthy();
    });

    it('should render no data message when data is undefined', () => {
      render(<WeeklyChart />);

      expect(screen.getByText('No data to display yet')).toBeTruthy();
    });

    it('should display default title in empty state', () => {
      render(<WeeklyChart data={[]} />);

      expect(screen.getByText('Weekly Activity')).toBeTruthy();
    });

    it('should display custom title in empty state', () => {
      render(<WeeklyChart data={[]} title="My Custom Title" />);

      expect(screen.getByText('My Custom Title')).toBeTruthy();
    });

    it('should show history button in empty state when navigate provided', () => {
      const mockNavigate = vi.fn();
      render(<WeeklyChart data={[]} navigate={mockNavigate} />);

      const button = screen.getByText('📜 History');
      expect(button).toBeTruthy();

      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/history');
    });

    it('should not show history button when navigate not provided', () => {
      render(<WeeklyChart data={[]} />);

      expect(screen.queryByText('📜 History')).toBeNull();
    });
  });

  describe('Chart Rendering', () => {
    it('should render chart with data', () => {
      render(<WeeklyChart data={mockData} />);

      expect(screen.getByTestId('bar-chart')).toBeTruthy();
      expect(screen.getByTestId('bar')).toBeTruthy();
      expect(screen.getByTestId('x-axis')).toBeTruthy();
      expect(screen.getByTestId('y-axis')).toBeTruthy();
    });

    it('should render chart title', () => {
      render(<WeeklyChart data={mockData} title="Test Title" />);

      expect(screen.getByText('Test Title')).toBeTruthy();
    });

    it('should render default title when not provided', () => {
      render(<WeeklyChart data={mockData} />);

      expect(screen.getByText('Weekly Activity')).toBeTruthy();
    });

    it('should render history button when navigate provided', () => {
      const mockNavigate = vi.fn();
      render(<WeeklyChart data={mockData} navigate={mockNavigate} />);

      const button = screen.getByText('📜 History');
      expect(button).toBeTruthy();
    });

    it('should call navigate with /history when button clicked', () => {
      const mockNavigate = vi.fn();
      render(<WeeklyChart data={mockData} navigate={mockNavigate} />);

      const button = screen.getByText('📜 History');
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/history');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should apply compact class when compact prop is true', () => {
      const { container } = render(
        <WeeklyChart data={mockData} compact={true} />
      );

      const chartContainer = container.querySelector(
        '[class*="weekly-chart-container"]'
      );
      expect(chartContainer.className).toContain('compact');
    });

    it('should not apply compact class when compact prop is false', () => {
      const { container } = render(
        <WeeklyChart data={mockData} compact={false} />
      );

      const chartContainer = container.querySelector(
        '[class*="weekly-chart-container"]'
      );
      expect(chartContainer.className).not.toContain('compact');
    });
  });

  describe('Legend', () => {
    it('should render all legend items', () => {
      render(<WeeklyChart data={mockData} />);

      expect(screen.getByText('Healthy (>61.4)')).toBeTruthy();
      expect(screen.getByText('Average (28.6-61.4)')).toBeTruthy();
      expect(screen.getByText('Not Healthy (12-28.6)')).toBeTruthy();
      expect(screen.getByText('Dangerous (≤12)')).toBeTruthy();
      expect(screen.getByText('No data')).toBeTruthy();
    });

    it('should render legend with threshold values', () => {
      render(<WeeklyChart data={mockData} />);

      expect(screen.getByText('Healthy (>61.4)')).toBeTruthy();
      expect(screen.getByText('Average (28.6-61.4)')).toBeTruthy();
      expect(screen.getByText('Not Healthy (12-28.6)')).toBeTruthy();
    });
  });

  describe('Data Visualization', () => {
    it('should pass data to BarChart', () => {
      render(<WeeklyChart data={mockData} />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));

      expect(chartData.length).toBe(mockData.length);
      expect(chartData[0].day).toBe('Mon');
    });

    it('should use custom dataKey prop', () => {
      render(<WeeklyChart data={mockData} dataKey="customValue" />);

      const bar = screen.getByTestId('bar');
      expect(bar.getAttribute('data-key')).toBe('customValue');
    });

    it('should use default dataKey "value" when not provided', () => {
      render(<WeeklyChart data={mockData} />);

      const bar = screen.getByTestId('bar');
      expect(bar.getAttribute('data-key')).toBe('value');
    });

    it('should handle entries with hasData=false', () => {
      const dataWithNoData = [
        { day: 'Mon', date: '2024-01-01', value: 75, hasData: true },
        { day: 'Tue', date: '2024-01-02', value: 0, hasData: false },
      ];

      render(<WeeklyChart data={dataWithNoData} />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));

      // Entry with hasData=false should have value set to 5
      expect(chartData[1].value).toBe(5);
      expect(chartData[1].hasData).toBe(false);
    });

    it('should preserve original value for entries with data', () => {
      const dataWithNoData = [
        { day: 'Mon', date: '2024-01-01', value: 75, hasData: true },
        { day: 'Tue', date: '2024-01-02', value: 0, hasData: false },
      ];

      render(<WeeklyChart data={dataWithNoData} />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));

      // Entry with data should keep original value
      expect(chartData[0].value).toBe(75);
    });
  });

  describe('Chart Info', () => {
    it('should display "Last 7 days data" info', () => {
      render(<WeeklyChart data={mockData} />);

      expect(screen.getByText('Last 7 days data')).toBeTruthy();
    });

    it('should render info icon', () => {
      render(<WeeklyChart data={mockData} />);

      expect(screen.getByText('ℹ️')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single data point', () => {
      const singleData = [{ day: 'Mon', date: '2024-01-01', value: 50 }];

      render(<WeeklyChart data={singleData} />);

      expect(screen.getByTestId('bar-chart')).toBeTruthy();
    });

    it('should handle data with very high values', () => {
      const highValueData = [{ day: 'Mon', date: '2024-01-01', value: 100 }];

      render(<WeeklyChart data={highValueData} />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));

      expect(chartData[0].value).toBe(100);
    });

    it('should handle data with zero values', () => {
      const zeroData = [{ day: 'Mon', date: '2024-01-01', value: 0 }];

      render(<WeeklyChart data={zeroData} />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));

      expect(chartData[0].value).toBe(0);
    });

    it('should handle empty string title', () => {
      render(<WeeklyChart data={mockData} title="" />);

      expect(screen.queryByText('Weekly Activity')).toBeNull();
    });

    it('should handle all entries with hasData=false', () => {
      const allNoData = [
        { day: 'Mon', date: '2024-01-01', value: 0, hasData: false },
        { day: 'Tue', date: '2024-01-02', value: 0, hasData: false },
      ];

      render(<WeeklyChart data={allNoData} />);

      const barChart = screen.getByTestId('bar-chart');
      const chartData = JSON.parse(barChart.getAttribute('data-chart-data'));

      chartData.forEach((entry) => {
        expect(entry.value).toBe(5);
        expect(entry.hasData).toBe(false);
      });
    });
  });

  describe('Reference Lines', () => {
    it('should render reference lines for thresholds', () => {
      render(<WeeklyChart data={mockData} />);

      const referenceLines = screen.getAllByTestId('reference-line');

      expect(referenceLines.length).toBe(3);
    });

    it('should render reference lines with correct threshold values', () => {
      render(<WeeklyChart data={mockData} />);

      const referenceLines = screen.getAllByTestId('reference-line');
      const yValues = referenceLines.map((line) => line.getAttribute('data-y'));

      expect(yValues).toContain('12'); // DANGEROUS
      expect(yValues).toContain('28.6'); // NOT_HEALTHY
      expect(yValues).toContain('61.4'); // AVERAGE
    });
  });
});

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import styles from './WeeklyChart.module.css';
import Card from '../Card';
import Button from '../Button';
import Dropdown from '../Dropdown';

// Category thresholds from Flask model (model.py categorize_mental_health_score)
const THRESHOLDS = { DANGEROUS: 12, NOT_HEALTHY: 28.6, AVERAGE: 61.4 };

// Gray color for days without data
const NO_DATA_COLOR = '#D0D0D0';

// Color constants using CSS variables
const COLORS = {
  HEALTHY: '#10b981', // var(--color-green)
  AVERAGE: '#f59e0b', // var(--color-yellow)
  NOT_HEALTHY: '#f97316', // var(--color-orange)
  DANGEROUS: '#ef4444', // var(--color-red)
};

// Metric mappings to friendly names
const METRIC_LABELS = {
  mental_health_index: 'Mental Health Index',
  screen_time: 'Screen Time (hours)',
  sleep_duration: 'Sleep Duration (hours)',
  sleep_quality: 'Sleep Quality (1-5)',
  stress_level: 'Stress Level (0-10)',
  productivity: 'Productivity (0-100)',
  exercise_duration: 'Exercise (min/week)',
  social_activity: 'Social Activity (hrs/week)',
};

// Get bar color based on model category
const getBarColor = (value) => {
  if (value > THRESHOLDS.AVERAGE) return COLORS.HEALTHY; // Healthy - Green
  if (value > THRESHOLDS.NOT_HEALTHY) return COLORS.AVERAGE; // Average - Yellow
  if (value > THRESHOLDS.DANGEROUS) return COLORS.NOT_HEALTHY; // Not Healthy - Orange
  return COLORS.DANGEROUS; // Dangerous - Red
};

// Get health status label
const getHealthStatus = (value) => {
  if (value > THRESHOLDS.AVERAGE) return 'Healthy';
  if (value > THRESHOLDS.NOT_HEALTHY) return 'Average';
  if (value > THRESHOLDS.DANGEROUS) return 'Not Healthy';
  return 'Dangerous';
};

// Custom X-axis tick that styles days with no data differently
const CustomXAxisTick = ({ x, y, payload, data }) => {
  const dayData = data.find((d) => d.label === payload.value);
  const hasData = dayData?.has_data !== false;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill={hasData ? '#666' : '#9d9586'}
        fontSize={16}
        fontWeight={hasData ? 500 : 400}
        opacity={hasData ? 1 : 0.6}
      >
        {payload.value}
      </text>
    </g>
  );
};

// Custom Tooltip with mental health status
const CustomTooltip = ({ active, payload, selectedMetric }) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    const value = payload[0].value;
    const hasData = entry.has_data !== false;

    return (
      <div className={styles['custom-tooltip']}>
        <p className={styles['tooltip-day']}>{entry.label}</p>
        <p className={styles['tooltip-date']}>{entry.date}</p>
        {hasData ? (
          <>
            <p className={styles['tooltip-value']}>
              <span className={styles['value-number']}>
                {selectedMetric === 'mental_health_index'
                  ? value
                  : value.toFixed(1)}
              </span>
              {selectedMetric === 'mental_health_index' && '/100'}
            </p>
            {selectedMetric === 'mental_health_index' && (
              <p
                className={styles['tooltip-status']}
                style={{ color: getBarColor(value) }}
              >
                {getHealthStatus(value)}
              </p>
            )}
          </>
        ) : (
          <p className={styles['tooltip-no-data']}>No data</p>
        )}
      </div>
    );
  }
  return null;
};

/**
 * WeeklyChart Component
 * Displays a bar chart of user's mental health scores for the last 7 days
 *
 * Props:
 * - data: Array of objects with format from /chart/weekly API:
 *   { date, label, has_data, mental_health_index, screen_time, sleep_duration, etc. }
 * - title: Chart title (optional)
 * - compact: Compact layout (optional)
 * - minimal: Minimal variant without title and button (optional)
 */
export default function WeeklyChart({
  data = [],
  title = 'Weekly Chart',
  compact = false,
  minimal = false,
  style = {},
  ...rest
}) {
  const hasData = data && data.length > 0;

  // Create dropdown options from metric labels
  const metricOptions = Object.entries(METRIC_LABELS).map(([key, label]) => ({
    value: key,
    label: label,
  }));

  // State for selected metric - store the full option object for Dropdown
  const [selectedMetricOption, setSelectedMetricOption] = useState(
    metricOptions[0]
  );

  // Extract the actual metric key for data access
  const selectedMetric = selectedMetricOption?.value || 'mental_health_index';

  // Get max value for Y-axis based on selected metric
  const getYAxisDomain = () => {
    if (
      selectedMetric === 'mental_health_index' ||
      selectedMetric === 'productivity'
    ) {
      return [0, 100];
    }
    if (
      selectedMetric === 'screen_time' ||
      selectedMetric === 'sleep_duration'
    ) {
      return [0, 12];
    }
    if (selectedMetric === 'sleep_quality') {
      return [0, 5];
    }
    if (selectedMetric === 'stress_level') {
      return [0, 10];
    }
    if (selectedMetric === 'exercise_duration') {
      return [0, 300];
    }
    if (selectedMetric === 'social_activity') {
      return [0, 10];
    }
    return [0, 100];
  };

  return (
    <Card style={style} clipOverflow={false} {...rest}>
      <div
        className={`${styles['weekly-chart-container']} ${compact ? styles['compact'] : ''} ${minimal ? styles['minimal'] : ''}`}
      >
        {!minimal && (
          <div className={styles['chart-header']}>
            <h2>{title}</h2>
            <Button
              iconOnly
              icon={<span style={{ fontSize: '1.25rem' }}>↗</span>}
              href="/history"
            />
          </div>
        )}

        {/* Metric selector dropdown - always shown */}
        <div className={styles['metric-selector']}>
          <Dropdown
            label="Select Metric"
            options={metricOptions}
            value={selectedMetricOption}
            onChange={setSelectedMetricOption}
            fullWidth
            floatingLabel={false}
            variant="surface"
          />
        </div>

        {!hasData ? (
          <div className={styles['no-data']}>
            <div className={styles['no-data-icon']}>📊</div>
            <p>No data to display yet</p>
            <span className={styles['no-data-hint']}>
              Data will appear after completing a screening
            </span>
          </div>
        ) : (
          <div className={styles['chart-wrapper']}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e0e0e0"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="label"
                  tick={<CustomXAxisTick data={data} />}
                  tickLine={false}
                  axisLine={{ stroke: '#e0e0e0' }}
                  interval={0}
                />
                <YAxis
                  domain={getYAxisDomain()}
                  tick={{ fill: '#9d9586', fontSize: 16 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e0e0e0' }}
                  width={35}
                />
                <Tooltip
                  content={<CustomTooltip selectedMetric={selectedMetric} />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)', radius: 8 }}
                />
                {selectedMetric === 'mental_health_index' && (
                  <>
                    <ReferenceLine
                      y={THRESHOLDS.DANGEROUS}
                      stroke={COLORS.DANGEROUS}
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                    />
                    <ReferenceLine
                      y={THRESHOLDS.NOT_HEALTHY}
                      stroke={COLORS.NOT_HEALTHY}
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                    />
                    <ReferenceLine
                      y={THRESHOLDS.AVERAGE}
                      stroke={COLORS.HEALTHY}
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                    />
                  </>
                )}
                <Bar
                  dataKey={selectedMetric}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={50}
                  isAnimationActive={true}
                  animationDuration={800}
                >
                  {Array.isArray(data) &&
                    data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.has_data === false
                            ? NO_DATA_COLOR
                            : selectedMetric === 'mental_health_index'
                              ? getBarColor(entry[selectedMetric])
                              : COLORS.HEALTHY
                        }
                        fillOpacity={entry.has_data === false ? 0.5 : 1}
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  );
}

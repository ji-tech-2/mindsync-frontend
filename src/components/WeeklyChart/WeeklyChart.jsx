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

// Custom Tooltip with mental health status
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    const value = payload[0].value;
    const hasData = entry.hasData !== false;

    return (
      <div className={styles['custom-tooltip']}>
        <p className={styles['tooltip-day']}>{entry.day}</p>
        <p className={styles['tooltip-date']}>{entry.date}</p>
        {hasData ? (
          <>
            <p className={styles['tooltip-value']}>
              <span className={styles['value-number']}>{value}</span>/100
            </p>
            <p
              className={styles['tooltip-status']}
              style={{ color: getBarColor(value) }}
            >
              {getHealthStatus(value)}
            </p>
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
 * - data: Array of objects with format { day: string, date: string, value: number }
 * - title: Chart title (optional)
 * - dataKey: Key for data value (default: 'value')
 * - navigate: Navigation function (optional)
 * - compact: Compact layout (optional)
 * - minimal: Minimal variant without title and button (optional)
 */
export default function WeeklyChart({
  data = [],
  title = 'Weekly Chart',
  dataKey = 'value',
  navigate = null,
  compact = false,
  minimal = false,
  style = {},
  ...rest
}) {
  const hasData = data && data.length > 0;

  return (
    <Card style={style} {...rest}>
      <div
        className={`${styles['weekly-chart-container']} ${compact ? styles['compact'] : ''} ${minimal ? styles['minimal'] : ''}`}
      >
        {!minimal && (
          <div className={styles['chart-header']}>
            <h2>{title}</h2>
            {navigate && (
              <Button iconOnly icon="↗" onClick={() => navigate('/history')} />
            )}
          </div>
        )}

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
                data={data.map((entry) =>
                  entry.hasData === false ? { ...entry, [dataKey]: 5 } : entry
                )}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e0e0e0"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e0e0e0' }}
                  interval={0}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#666', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e0e0e0' }}
                  width={35}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)', radius: 8 }}
                />
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
                <Bar
                  dataKey={dataKey}
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
                          entry.hasData === false
                            ? NO_DATA_COLOR
                            : getBarColor(entry[dataKey])
                        }
                        fillOpacity={entry.hasData === false ? 0.5 : 1}
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

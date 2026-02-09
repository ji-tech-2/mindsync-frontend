import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import styles from './WeeklyChart.module.css';

/**
 * WeeklyChart Component
 * Displays a bar chart of user's mental health scores for the last 7 days
 * 
 * Props:
 * - data: Array of objects with format { day: string, date: string, value: number }
 * - title: Chart title (optional)
 * - dataKey: Key for data value (default: 'value')
 * - navigate: Navigation function (optional)
 */
export default function WeeklyChart({ 
  data = [], 
  title = "Weekly Activity",
  dataKey = "value",
  navigate = null,
  compact = false
}) {
  
  // Category thresholds from Flask model (model.py categorize_mental_health_score)
  const THRESHOLDS = { DANGEROUS: 12, NOT_HEALTHY: 28.6, AVERAGE: 61.4 };

  // Get bar color based on model category
  const getBarColor = (value) => {
    if (value > THRESHOLDS.AVERAGE) return '#4CAF50';    // Healthy - Green
    if (value > THRESHOLDS.NOT_HEALTHY) return '#FFC107'; // Average - Yellow
    if (value > THRESHOLDS.DANGEROUS) return '#FF9800';   // Not Healthy - Orange
    return '#F44336';                                     // Dangerous - Red
  };

  // Get health status label
  const getHealthStatus = (value) => {
    if (value > THRESHOLDS.AVERAGE) return 'Healthy';
    if (value > THRESHOLDS.NOT_HEALTHY) return 'Average';
    if (value > THRESHOLDS.DANGEROUS) return 'Not Healthy';
    return 'Dangerous';
  };
  
  // Gray color for days without data
  const NO_DATA_COLOR = '#D0D0D0';

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
              <p className={styles['tooltip-status']} style={{ color: getBarColor(value) }}>
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
  
  // If no data available, show message
  if (!data || data.length === 0) {
    return (
      <div className={styles['weekly-chart-container']}>
        <div className={styles['chart-header']}>
          <h3>{title}</h3>
          {navigate && (
            <button 
              className={styles['history-button']}
              onClick={() => navigate('/history')}
            >
              📜 History
            </button>
          )}
        </div>
        <div className={styles['no-data']}>
          <div className={styles['no-data-icon']}>📊</div>
          <p>No data to display yet</p>
          <span className={styles['no-data-hint']}>Data will appear after completing a screening</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['weekly-chart-container']} ${compact ? styles['compact'] : ''}`}>
      <div className={styles['chart-header']}>
        <h3>{title}</h3>
        {navigate && (
          <button 
            className={styles['history-button']}
            onClick={() => navigate('/history')}
          >
            📜 History
          </button>
        )}
      </div>
      
      {/* Legend */}
      <div className={styles['chart-legend']}>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ background: '#4CAF50' }}></span>
          <span>Healthy (&gt;61.4)</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ background: '#FFC107' }}></span>
          <span>Average (28.6-61.4)</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ background: '#FF9800' }}></span>
          <span>Not Healthy (12-28.6)</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ background: '#F44336' }}></span>
          <span>Dangerous (≤12)</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ background: '#D0D0D0' }}></span>
          <span>No data</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: compact ? 160 : 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.map(entry =>
            entry.hasData === false ? { ...entry, [dataKey]: 5 } : entry
          )}
          margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
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
          <ReferenceLine y={THRESHOLDS.DANGEROUS} stroke="#F44336" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={THRESHOLDS.NOT_HEALTHY} stroke="#FF9800" strokeDasharray="4 4" strokeOpacity={0.6} />
          <ReferenceLine y={THRESHOLDS.AVERAGE} stroke="#4CAF50" strokeDasharray="4 4" strokeOpacity={0.6} />
          <Bar 
            dataKey={dataKey} 
            radius={[8, 8, 0, 0]}
            maxBarSize={50}
            isAnimationActive={true}
            animationDuration={800}
          >
            {Array.isArray(data) && data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.hasData === false ? NO_DATA_COLOR : getBarColor(entry[dataKey])}
                fillOpacity={entry.hasData === false ? 0.5 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
      <div className={styles['chart-footer']}>
        <div className={styles['chart-info']}>
          <span className={styles['info-icon']}>ℹ️</span>
          <span className={styles['info-text']}>Last 7 days data</span>
        </div>
      </div>
    </div>
  );
}

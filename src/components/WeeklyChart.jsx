import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import styles from './WeeklyChart.module.css';

/**
 * WeeklyChart Component
 * Menampilkan bar chart nilai mental health user dalam 1 minggu terakhir
 * 
 * Props:
 * - data: Array of objects dengan format { day: string, date: string, value: number }
 * - title: Judul chart (optional)
 * - dataKey: Key untuk nilai data (default: 'value')
 * - navigate: Function untuk navigasi (optional)
 */
export default function WeeklyChart({ 
  data = [], 
  title = "Aktivitas Mingguan",
  dataKey = "value",
  navigate = null
}) {
  
  // Batas kategori dari model Flask (model.py categorize_mental_health_score)
  const THRESHOLDS = { DANGEROUS: 12, NOT_HEALTHY: 28.6, AVERAGE: 61.4 };

  // Fungsi untuk menentukan warna berdasarkan kategori model
  const getBarColor = (value) => {
    if (value > THRESHOLDS.AVERAGE) return '#4CAF50';    // Healthy - Hijau
    if (value > THRESHOLDS.NOT_HEALTHY) return '#FFC107'; // Average - Kuning
    if (value > THRESHOLDS.DANGEROUS) return '#FF9800';   // Not Healthy - Oranye
    return '#F44336';                                     // Dangerous - Merah
  };

  // Fungsi untuk menentukan status
  const getHealthStatus = (value) => {
    if (value > THRESHOLDS.AVERAGE) return 'Healthy';
    if (value > THRESHOLDS.NOT_HEALTHY) return 'Average';
    if (value > THRESHOLDS.DANGEROUS) return 'Not Healthy';
    return 'Dangerous';
  };
  
  // Custom Tooltip dengan status mental health
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const status = getHealthStatus(value);
      const color = getBarColor(value);
      
      return (
        <div className={styles['custom-tooltip']}>
          <p className={styles['tooltip-day']}>{payload[0].payload.day}</p>
          <p className={styles['tooltip-date']}>{payload[0].payload.date}</p>
          <p className={styles['tooltip-value']}>
            <span className={styles['value-number']}>{value}</span>/100
          </p>
          <p className={styles['tooltip-status']} style={{ color }}>
            {status}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Jika tidak ada data, tampilkan pesan
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
          <p>Belum ada data untuk ditampilkan</p>
          <span className={styles['no-data-hint']}>Data akan muncul setelah mengambil tes</span>
        </div>
      </div>
    );
  }

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
      </div>

      <ResponsiveContainer width="100%" height={280} minHeight={200}>
        <BarChart
          data={data}
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
              <Cell key={`cell-${index}`} fill={getBarColor(entry[dataKey])} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className={styles['chart-footer']}>
        <div className={styles['chart-info']}>
          <span className={styles['info-icon']}>ℹ️</span>
          <span className={styles['info-text']}>Data 7 hari terakhir</span>
        </div>
      </div>
    </div>
  );
}

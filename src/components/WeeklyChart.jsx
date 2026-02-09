import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
  
  // Fungsi untuk menentukan warna berdasarkan nilai mental health
  const getBarColor = (value) => {
    if (value >= 70) return '#4CAF50'; // Healthy - Hijau
    if (value >= 40) return '#FFC107'; // Average - Kuning
    return '#F44336'; // Unhealthy - Merah
  };

  // Fungsi untuk menentukan status
  const getHealthStatus = (value) => {
    if (value >= 70) return 'Healthy';
    if (value >= 40) return 'Average';
    return 'Perlu Perhatian';
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
          <span>Healthy (70-100)</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ background: '#FFC107' }}></span>
          <span>Average (40-69)</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ background: '#F44336' }}></span>
          <span>Perlu Perhatian (0-39)</span>
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

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Dropdown, WeeklyChart } from '@/components';
import PageLayout from '@/layouts/PageLayout';
import { HistoryItem } from '../components';
import { getScreeningHistory, getWeeklyChart } from '@/services';
import {
  generateMonthOptions,
  filterHistoryByMonth,
  transformHistoryData,
} from '../utils/historyHelpers';
import styles from './History.module.css';

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Generate month options from history data
  const monthOptions = useMemo(
    () => generateMonthOptions(historyData),
    [historyData]
  );

  // Set default selected month when options are available
  useEffect(() => {
    if (monthOptions.length > 0 && !selectedMonth) {
      setSelectedMonth(monthOptions[0]);
    }
  }, [monthOptions, selectedMonth]);

  // Filter history data by selected month
  const filteredHistoryData = useMemo(
    () => filterHistoryByMonth(historyData, selectedMonth),
    [historyData, selectedMonth]
  );

  // Check if user is logged in and fetch data
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);

      try {
        const response = await getScreeningHistory();

        if (response.status === 'success' && response.data) {
          console.log('✅ Screening history loaded:', response.data);
          const transformedData = transformHistoryData(response.data);
          setHistoryData(transformedData);
        } else {
          console.warn('⚠️ History API not available:', response.error);
          setHistoryData([]);
        }
      } catch (error) {
        console.warn(
          '⚠️ History API error (Kong Gateway not configured?):',
          error.message
        );
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchWeeklyChart = async () => {
      try {
        const response = await getWeeklyChart();
        if (response.status === 'success' && response.data) {
          console.log('✅ Weekly chart loaded:', response.data);
          setWeeklyData(response.data);
        } else {
          console.warn('⚠️ Weekly chart API not available:', response.error);
          setWeeklyData([]);
        }
      } catch (error) {
        console.warn('⚠️ Weekly chart API error:', error.message);
        setWeeklyData([]);
      }
    };

    fetchHistory().catch((err) => {
      console.warn('⚠️ History loading failed:', err);
      setIsLoading(false);
    });

    fetchWeeklyChart().catch((err) => {
      console.warn('⚠️ Weekly chart loading failed:', err);
    });
  }, [user, navigate]);

  return (
    <PageLayout
      title="History"
      headerRight={
        monthOptions.length > 0 && (
          <div className={styles.monthDropdown}>
            <Dropdown
              options={monthOptions}
              value={selectedMonth}
              onChange={setSelectedMonth}
              fullWidth
              floatingLabel={false}
            />
          </div>
        )
      }
    >
      {/* Main Content */}
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading history...</p>
        </div>
      ) : historyData.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <h3>No History Yet</h3>
          <p>
            You haven't taken any screenings yet. Start now to see your history.
          </p>
        </div>
      ) : (
        <div className={styles.content}>
          {/* Left Column - History Items */}
          <div className={styles.historyList}>
            {filteredHistoryData.map((item) => (
              <HistoryItem
                key={item.id}
                date={item.date}
                score={item.score}
                category={item.category}
                onClick={() => navigate(`/result/${item.predictionId}`)}
              />
            ))}
          </div>

          {/* Right Column - Chart */}
          <div className={styles.chartSection}>
            <WeeklyChart
              data={weeklyData}
              minimal
              style={{ height: '100%', flex: 1 }}
            />
          </div>
        </div>
      )}
    </PageLayout>
  );
}

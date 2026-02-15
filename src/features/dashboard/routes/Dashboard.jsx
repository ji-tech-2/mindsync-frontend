import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { WeeklyChart, Card, Button } from '@/components';
import {
  getScreeningHistory,
  getWeeklyCriticalFactors,
  getDailySuggestion,
  getStreak,
} from '@/services';
import { buildWeeklyChartFromHistory } from '@/utils/chartHelpers';
import { useAuth } from '@/features/auth';
import CriticalFactorCard from '../components/CriticalFactorCard';
import DashboardSuggestion from '../components/DashboardSuggestion';
import StreakCard from '@/features/screening/components/StreakCard';

// Mapping untuk nama faktor yang lebih bersahabat
const FACTOR_MAP = {
  'num__sleep_quality_1_5^2': 'Sleep Quality',
  num__productivity_0_100: 'Productivity Score',
  'num__age sleep_hours': 'Sleep Duration',
  num__physical_activity: 'Physical Activity',
  num__stress_level: 'Stress Level',
  num__social_interaction: 'Social Interaction',
  'num__stress_level_0_10^2': 'Stress Level',
};

// Fungsi helper untuk membersihkan nama jika tidak ada di mapping
const formatDisplayName = (rawName) => {
  if (FACTOR_MAP[rawName]) return FACTOR_MAP[rawName];

  // Jika tidak ada di map, bersihkan otomatis:
  // hapus 'num__', ganti '_' dengan spasi, dan kapitalisasi
  return rawName
    .replace(/^num__/, '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function untuk icon berdasarkan factor name
const getIconForFactor = (factorName) => {
  const lowerName = factorName.toLowerCase();
  if (lowerName.includes('sleep') || lowerName.includes('tidur')) return '🛏️';
  if (
    lowerName.includes('exercise') ||
    lowerName.includes('aktivitas') ||
    lowerName.includes('olahraga')
  )
    return '🏃';
  if (lowerName.includes('screen') || lowerName.includes('layar')) return '📱';
  if (lowerName.includes('social') || lowerName.includes('sosial')) return '👥';
  if (lowerName.includes('stress') || lowerName.includes('stres')) return '😰';
  if (lowerName.includes('productivity') || lowerName.includes('produktivitas'))
    return '💼';
  return '💡';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name || 'User';
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const loadWeeklyData = async () => {
      const currentUserId = user?.userId || user?.id || user?.user_id;
      if (!currentUserId) return;
      try {
        const response = await getScreeningHistory(currentUserId);
        if (response.status === 'success' && response.data) {
          setWeeklyData(buildWeeklyChartFromHistory(response.data));
        }
      } catch (err) {
        console.error('Failed to fetch weekly chart:', err);
      }
    };
    loadWeeklyData();
  }, [user]);

  const userId = user?.userId || user?.id || null;

  // State untuk API data
  const [factors, setFactors] = useState([]);
  const [dailySuggestion, setDailySuggestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);
  const [streakData, setStreakData] = useState(null);
  const [loadingStreak, setLoadingStreak] = useState(true);
  const [errorStreak, setErrorStreak] = useState(null);

  // Fetch critical factors dari API
  useEffect(() => {
    if (userId) {
      getWeeklyCriticalFactors(userId)
        .then((data) => {
          if (data.status === 'success') {
            const factorsWithDesc = data.top_critical_factors.map((factor) => {
              const factorAdvice = data.advice?.factors?.[factor.factor_name];
              const advices = factorAdvice?.advices || [];
              const references = factorAdvice?.references || [];
              const description =
                advices.length > 0
                  ? advices.join(' ')
                  : 'No suggestions available.';

              return {
                factor_name: formatDisplayName(factor.factor_name),
                raw_name: factor.factor_name,
                description: description,
                references: references,
                count: factor.count,
                avg_impact_score: factor.avg_impact_score,
                icon: getIconForFactor(factor.factor_name),
              };
            });

            setFactors(factorsWithDesc);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('❌ Error fetching factors:', err);
          setLoading(false);
        });
    }
  }, [userId]);

  // Fetch daily suggestion dari API
  useEffect(() => {
    if (userId) {
      getDailySuggestion(userId)
        .then((data) => {
          console.log('💡 Daily suggestion response:', data);

          if (data.status === 'success') {
            setDailySuggestion(data.suggestion);
          }
          setLoadingSuggestion(false);
        })
        .catch((err) => {
          console.error('❌ Error fetching daily suggestion:', err);
          setLoadingSuggestion(false);
        });
    }
  }, [userId]);

  // fetch streak data dari API
  useEffect(() => {
    if (userId) {
      getStreak(userId)
        .then((data) => {
          console.log('🔥 Streak response data:', data);
          if (data.status === 'success') {
            setStreakData(data.data);
          } else {
            setErrorStreak(data.message || 'Failed to fetch streak data');
          }
          setLoadingStreak(false);
        })
        .catch((err) => {
          console.error('❌ Error fetching streak:', err);
          setErrorStreak(err.message || 'Network error');
          setLoadingStreak(false);
        });
    }
  }, [userId]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.greeting}>Hello, {userName}!</h1>
          <p className={styles.subtitle}>How are you feeling today?</p>
          <Button
            variant="filled"
            size="lg"
            icon="←"
            onClick={() => navigate('/screening')}
          >
            Take Screening Now
          </Button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.upperSection}>
          <div className={styles.leftColumn}>
            <StreakCard
              data={streakData}
              loading={loadingStreak}
              error={errorStreak}
            />

            <Card>
              <DashboardSuggestion
                data={dailySuggestion}
                loading={loadingSuggestion}
              />
            </Card>
          </div>

          <Card>
            <WeeklyChart
              data={weeklyData}
              title="Last 7 Days Trend"
              navigate={navigate}
              compact
            />
          </Card>
        </div>

        <h2 className={styles.sectionTitle}>Critical Factors</h2>
        <div className={styles.criticalFactorsGrid}>
          {[0, 1, 2].map((index) => (
            <CriticalFactorCard
              key={index}
              data={factors[index]}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

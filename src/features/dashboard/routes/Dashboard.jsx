import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { WeeklyChart, Card, Button } from '@/components';
import {
  getWeeklyChart,
  getWeeklyCriticalFactors,
  getDailySuggestion,
  getStreak,
} from '@/services';
import { getFeatureDisplayName, getFeatureIcon } from '@/utils/featureNames';
import { useAuth } from '@/features/auth';
import CriticalFactorCard from '../components/CriticalFactorCard';
import DashboardSuggestion from '../components/DashboardSuggestion';
import StreakCard from '../components/StreakCard';

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
        const response = await getWeeklyChart(currentUserId);
        if (response.status === 'success' && response.data) {
          setWeeklyData(response.data);
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

              const displayName = getFeatureDisplayName(factor.factor_name);
              return {
                factor_name: displayName,
                raw_name: factor.factor_name,
                description: description,
                references: references,
                count: factor.count,
                avg_impact_score: factor.avg_impact_score,
                icon: getFeatureIcon(displayName),
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

          <WeeklyChart
            data={weeklyData}
            title="Weekly Chart"
            navigate={navigate}
            compact
          />
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

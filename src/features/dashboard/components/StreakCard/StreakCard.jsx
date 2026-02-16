import React, { useState } from 'react';
import styles from './StreakCard.module.css';
import Card from '@/components/Card';
import SegmentedControl from '@/components/SegmentedControl';

/**
 * Get current streak value based on view type.
 * @param {Object} data - Streak data from API
 * @param {string} viewType - 'daily' or 'weekly'
 * @returns {Object} Current streak count and unit
 */
function getStreakData(data, viewType) {
  const currentStreak =
    viewType === 'daily'
      ? data?.current_streak?.daily || 0
      : data?.current_streak?.weekly || 0;
  const unit = viewType === 'daily' ? 'days' : 'weeks';
  return { currentStreak, unit };
}

export default function StreakCard({ data, loading, error }) {
  const [viewType, setViewType] = useState('daily');

  // Loading state
  if (loading) {
    return (
      <Card>
        <div className={styles.loading}>
          <div className={styles.loadingContent}>
            <span className={styles.icon}>🔥</span>
            <p>Loading Streak...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <div className={styles.error}>
          <div className={styles.errorContent}>
            <span className={styles.icon}>❌</span>
            <p>Failed to load streak data</p>
            <small>{error}</small>
          </div>
        </div>
      </Card>
    );
  }

  const { currentStreak, unit } = getStreakData(data, viewType);

  // Get the appropriate data array based on view type
  const periodData =
    viewType === 'daily' ? data?.daily || [] : data?.weekly || [];

  const segmentOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
  ];

  return (
    <Card>
      <div className={styles.header}>
        <div className={styles.streakInfo}>
          <span className={styles.icon}>🔥</span>
          <div>
            <h2 className={styles.number}>
              {currentStreak} <span className={styles.unit}>{unit}</span>
            </h2>
            <p className={styles.label}>Screening Streak</p>
          </div>
        </div>

        <SegmentedControl
          options={segmentOptions}
          value={viewType}
          onChange={setViewType}
          size="sm"
        />
      </div>

      <div className={styles.daysRow}>
        {periodData.map((item) => (
          <div key={item.date || item.week_start} className={styles.dayItem}>
            <div
              className={`${styles.dayCircle} ${item.has_screening ? styles.completed : ''}`}
            >
              {item.has_screening ? '✓' : ''}
            </div>
            <span className={styles.dayName}>
              {viewType === 'weekly'
                ? item.label.split('-')[0].trim()
                : item.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

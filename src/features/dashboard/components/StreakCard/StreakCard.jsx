import React, { useState } from 'react';
import styles from './StreakCard.module.css';
import Card from '@/components/Card';
import SegmentedControl from '@/components/SegmentedControl';

/**
 * Check if a specific day of the week has been completed.
 * @param {number} index - Day index (0=Mon, 6=Sun)
 * @param {Array} completedDays - Array of date strings (YYYY-MM-DD)
 * @returns {boolean}
 */
function isDayCompleted(index, completedDays) {
  if (!completedDays || completedDays.length === 0) return false;

  const now = new Date();

  // Calculate start of current week (Monday)
  const startOfWeek = new Date(now);
  const currentDay = now.getDay();
  const diff = (currentDay === 0 ? -6 : 1) - currentDay;
  startOfWeek.setDate(now.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Build date for the day being checked
  const checkDate = new Date(startOfWeek);
  checkDate.setDate(startOfWeek.getDate() + index);

  const checkDateStr = checkDate.toISOString().split('T')[0];
  return completedDays.includes(checkDateStr);
}

/**
 * Get current streak value and display unit based on view type.
 */
function getStreakData(data, viewType) {
  const currentStreak =
    viewType === 'daily'
      ? data?.daily?.current || 0
      : data?.weekly?.current || 0;
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
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const completedDays = data.completed_days_this_week || [];

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
        {days.map((day, index) => (
          <div key={day} className={styles.dayItem}>
            <div
              className={`${styles.dayCircle} ${isDayCompleted(index, completedDays) ? styles.completed : ''}`}
            >
              {isDayCompleted(index, completedDays) ? '✓' : ''}
            </div>
            <span className={styles.dayName}>{day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

import React, { useState } from 'react';
import styles from './StreakCard.module.css';

export default function StreakCard({ data, loading, error }) {
  const [viewType, setViewType] = useState('daily');

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.container} ${styles.loading}`}>
        <div className={styles.loadingContent}>
          <span className={styles.icon}>🔥</span>
          <p>Loading Streak...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${styles.container} ${styles.error}`}>
        <div className={styles.errorContent}>
          <span className={styles.icon}>❌</span>
          <p>Failed to load streak data</p>
          <small>{error}</small>
        </div>
      </div>
    );
  }

  // Empty state - no data available
  if (!data || (!data.daily && !data.weekly)) {
    return (
      <div className={`${styles.container} ${styles.empty}`}>
        <div className={styles.emptyContent}>
          <span className={styles.icon}>🔥</span>
          <div>
            <h2 className={styles.number}>
              0 <span className={styles.unit}>days</span>
            </h2>
            <p className={styles.label}>Start your first screening!</p>
          </div>
        </div>
      </div>
    );
  }

  // Data dari backend (predict.py)
  const currentStreak =
    viewType === 'daily'
      ? data?.daily?.current || 0
      : data?.weekly?.current || 0;

  const unit = viewType === 'daily' ? 'days' : 'weeks';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Logika untuk menentukan hari yang sudah "checked" di minggu ini
  const isDayCompleted = (index) => {
    // Gunakan data completed_days_this_week dari backend
    const completedDays = data?.completed_days_this_week || [];

    if (completedDays.length === 0) return false;

    const now = new Date();

    // Hitung awal minggu ini (Senin)
    const startOfWeek = new Date(now);
    const currentDay = now.getDay();
    const diff = (currentDay === 0 ? -6 : 1) - currentDay; // Senin sebagai hari pertama
    startOfWeek.setDate(now.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Buat tanggal untuk hari yang sedang dicek
    const checkDate = new Date(startOfWeek);
    checkDate.setDate(startOfWeek.getDate() + index);

    // Format tanggal sebagai YYYY-MM-DD untuk dibandingkan dengan data backend
    const checkDateStr = checkDate.toISOString().split('T')[0];

    // Check apakah tanggal ini ada dalam completed_days
    return completedDays.includes(checkDateStr);
  };

  return (
    <div className={styles.container}>
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

        <div className={styles.toggleContainer}>
          <button
            className={`${styles.toggleBtn} ${viewType === 'daily' ? styles.activeToggle : ''}`}
            onClick={() => setViewType('daily')}
          >
            Daily
          </button>
          <button
            className={`${styles.toggleBtn} ${viewType === 'weekly' ? styles.activeToggle : ''}`}
            onClick={() => setViewType('weekly')}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className={styles.daysRow}>
        {days.map((day, index) => (
          <div key={day} className={styles.dayItem}>
            <div
              className={`${styles.dayCircle} ${isDayCompleted(index) ? styles.completed : ''}`}
            >
              {isDayCompleted(index) ? '✓' : ''}
            </div>
            <span className={styles.dayName}>{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

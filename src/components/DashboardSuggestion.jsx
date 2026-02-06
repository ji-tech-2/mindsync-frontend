import React from 'react';
import styles from './DashboardSuggestion.module.css';

const DashboardSuggestion = ({ data, loading }) => {
  if (loading) {
    return (
      <div className={styles.suggestionContainer}>
        <p className={styles.text}>Memuat saran harian...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.suggestionContainer}>
        <p className={styles.text}>
          Tidak ada saran tersedia. Lakukan screening untuk mendapatkan saran personal!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.suggestionContainer}>
      <p className={styles.text}>
        <span className={styles.highlight}>Saran MindSync:</span> {data}
      </p>
    </div>
  );
};

export default DashboardSuggestion;
import React from 'react';
import { getFeatureIcon } from '@/utils/featureNames';
import styles from './DashboardSuggestion.module.css';

const DashboardSuggestion = ({ data, loading }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Daily Suggestion</h3>
        <div className={styles.loadingState}>
          <p>Loading daily suggestions...</p>
        </div>
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Daily Suggestion</h3>
        <div className={styles.emptyState}>
          <p>No suggestion available at the moment.</p>
        </div>
      </div>
    );
  }

  // Cek apakah data berupa Array (Poin-poin)
  const isArray = Array.isArray(data);
  const isObject = typeof data === 'object' && data !== null && !isArray;

  // Convert to array if needed
  let suggestions = [];
  if (isArray) {
    suggestions = data;
  } else if (isObject) {
    suggestions = Object.values(data);
  } else {
    suggestions = [data];
  }

  return (
    <div className={styles.container}>
      <h2>Daily Suggestion</h2>
      <ul className={styles.suggestionList}>
        {suggestions.map((item, index) => (
          <li key={index} className={styles.suggestionItem}>
            <span className={styles.icon}>
              {getFeatureIcon(typeof item === 'string' ? item : String(item))}
            </span>
            <span className={styles.text}>
              {typeof item === 'string' ? item : String(item)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardSuggestion;

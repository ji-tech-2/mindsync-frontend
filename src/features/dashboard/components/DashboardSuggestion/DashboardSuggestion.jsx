import React from 'react';
import styles from './DashboardSuggestion.module.css';

/**
 * Get icon based on suggestion content
 */
const getIconForSuggestion = (text, index) => {
  const lowerText = text.toLowerCase();

  // Check for keywords to determine icon
  if (
    lowerText.includes('sleep') ||
    lowerText.includes('rest') ||
    lowerText.includes('tidur')
  ) {
    return '🛏️';
  }
  if (
    lowerText.includes('exercise') ||
    lowerText.includes('physical') ||
    lowerText.includes('activity') ||
    lowerText.includes('walk') ||
    lowerText.includes('move') ||
    lowerText.includes('olahraga')
  ) {
    return '🏃';
  }
  if (
    lowerText.includes('screen') ||
    lowerText.includes('device') ||
    lowerText.includes('phone') ||
    lowerText.includes('digital') ||
    lowerText.includes('layar')
  ) {
    return '📱';
  }
  if (
    lowerText.includes('social') ||
    lowerText.includes('friend') ||
    lowerText.includes('family') ||
    lowerText.includes('people') ||
    lowerText.includes('connect') ||
    lowerText.includes('sosial')
  ) {
    return '👥';
  }

  // Default icons based on index
  const defaultIcons = ['🛏️', '🏃', '📱', '👥'];
  return defaultIcons[index % defaultIcons.length];
};

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
              {getIconForSuggestion(item, index)}
            </span>
            <span className={styles.text}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardSuggestion;

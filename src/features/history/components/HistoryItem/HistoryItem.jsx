import PropTypes from 'prop-types';
import styles from './HistoryItem.module.css';
import { getCategoryLabel } from '@/utils';

/**
 * Format date to display format
 */
const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Get CSS class for category
 */
const getCategoryClass = (cat, styles) => {
  if (!cat) return styles.unknown;
  switch (cat.toLowerCase()) {
    case 'healthy':
      return styles.healthy;
    case 'above average':
      return styles.aboveAverage;
    case 'average':
      return styles.average;
    case 'not healthy':
      return styles.notHealthy;
    case 'dangerous':
      return styles.dangerous;
    default:
      return styles.unknown;
  }
};

/**
 * HistoryItem Component
 * Displays a single history entry with date, score, and status badge
 * @param {Object} props
 * @param {string} props.date - ISO date string
 * @param {number} props.score - Mental health score (0-100)
 * @param {string} props.category - Health category (healthy, average, not healthy, dangerous)
 * @param {Function} props.onClick - Click handler for navigation
 */
export default function HistoryItem({ date, score, category, onClick }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') onClick();
  };

  return (
    <div
      className={styles.historyItem}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={handleKeyPress}
    >
      <div className={styles.content}>
        <div className={styles.date}>{formatDate(date)}</div>
        <div className={styles.scoreRow}>
          <span className={styles.score}>{score}</span>
          <span className={styles.scoreMax}>/100</span>
        </div>
      </div>
      <div className={styles.actions}>
        <span
          className={`${styles.badge} ${getCategoryClass(category, styles)}`}
        >
          {getCategoryLabel(category)}
        </span>
        <svg
          className={styles.arrow}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </div>
  );
}

HistoryItem.propTypes = {
  date: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

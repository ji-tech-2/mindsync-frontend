import styles from './ScoreDisplay.module.css';
import { getCategoryColor } from '@/utils';

// Alias for local readability
const getScoreColor = (category) => getCategoryColor(category);

/**
 * ScoreDisplay Component
 * Displays the mental health score in a circular design with semantic colors
 *
 * @param {Object} props
 * @param {number} props.score - The mental health score (0-100)
 * @param {string} props.category - Health category ('healthy', 'average', 'not healthy', 'dangerous')
 * @param {string} props.className - Additional CSS classes
 */
function ScoreDisplay({ score, category, className = '' }) {
  const color = getScoreColor(category);

  return (
    <div className={`${styles.scoreSection} ${className}`}>
      <div
        className={styles.scoreCircle}
        style={{ borderColor: color, color: color }}
      >
        <div className={styles.scoreValue}>{Math.round(score)}</div>
        <div className={styles.scoreMax}>/ 100</div>
      </div>
    </div>
  );
}

export default ScoreDisplay;

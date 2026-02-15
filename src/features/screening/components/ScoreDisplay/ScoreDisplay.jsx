import styles from './ScoreDisplay.module.css';

// Health thresholds matching the model (same as WeeklyChart)
const THRESHOLDS = {
  DANGEROUS: 12,
  NOT_HEALTHY: 28.6,
  AVERAGE: 61.4,
};

/**
 * Get color based on score thresholds
 * @param {string} category - Health category from API
 * @returns {string} CSS variable color
 */
const getScoreColor = (category) => {
  if (category === 'dangerous') return 'var(--color-red)';
  if (category === 'not healthy') return 'var(--color-orange)';
  if (category === 'average') return 'var(--color-yellow)';
  return 'var(--color-green)'; // healthy
};

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
        <div className={styles.scoreMax}>/100</div>
      </div>
    </div>
  );
}

export default ScoreDisplay;

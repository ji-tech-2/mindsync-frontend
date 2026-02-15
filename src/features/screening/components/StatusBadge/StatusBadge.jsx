import styles from './StatusBadge.module.css';

/**
 * Get color based on health category
 * @param {string} category - Health category from API
 * @returns {string} CSS variable color
 */
const getStatusColor = (category) => {
  if (category === 'dangerous') return 'var(--color-red)';
  if (category === 'not healthy') return 'var(--color-orange)';
  if (category === 'average') return 'var(--color-yellow)';
  return 'var(--color-green)'; // healthy
};

/**
 * Get formatted label for health category
 * @param {string} category - Health category from API
 * @returns {string} Formatted label
 */
const getCategoryLabel = (category) => {
  if (category === 'dangerous') return 'DANGEROUS';
  if (category === 'not healthy') return 'NOT HEALTHY';
  if (category === 'average') return 'AVERAGE';
  return 'HEALTHY';
};

/**
 * StatusBadge Component
 * Displays the health status as a colored badge
 *
 * @param {Object} props
 * @param {string} props.category - Health category ('healthy', 'average', 'not healthy', 'dangerous')
 * @param {string} props.className - Additional CSS classes
 */
function StatusBadge({ category, className = '' }) {
  const color = getStatusColor(category);
  const label = getCategoryLabel(category);

  return (
    <div
      className={`${styles.statusBadge} ${className}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </div>
  );
}

export default StatusBadge;

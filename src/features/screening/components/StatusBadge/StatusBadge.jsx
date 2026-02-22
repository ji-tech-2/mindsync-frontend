import styles from './StatusBadge.module.css';
import {
  getCategoryColor,
  getCategoryLabel as getCategoryLabelBase,
} from '@/utils';

// Alias so the badge always shows uppercase text
const getStatusColor = (category) => getCategoryColor(category);
const getCategoryLabel = (category) => {
  const label = getCategoryLabelBase(category);
  // If the base function returned the raw input (unknown category), default to Healthy
  // to stay consistent with the colour which also defaults to healthy.
  if (category && label === category) return 'HEALTHY';
  return label.toUpperCase();
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

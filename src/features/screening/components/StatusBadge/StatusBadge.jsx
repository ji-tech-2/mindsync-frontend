import styles from './StatusBadge.module.css';
import {
  getCategoryColor,
  getCategoryLabel as getCategoryLabelBase,
} from '@/utils';

// Alias so the badge always shows uppercase text
const getStatusColor = (category) => getCategoryColor(category);
const getCategoryLabel = (category) =>
  getCategoryLabelBase(category).toUpperCase();

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

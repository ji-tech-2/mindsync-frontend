import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Card from '../Card';
import styles from './CollapsibleCard.module.css';

/**
 * CollapsibleCard Component
 * A card with a clickable header that expands/collapses content
 *
 * @param {Object} props
 * @param {string} props.title - The header title
 * @param {React.ReactNode} props.children - Content to show when expanded
 * @param {boolean} props.defaultExpanded - Initial expanded state (default: false)
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onToggle - Callback when toggle state changes
 */
function CollapsibleCard({
  title,
  icon,
  children,
  defaultExpanded = false,
  className = '',
  onToggle,
  ...rest
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <Card
      padded={false}
      className={`${styles.collapsibleCard} ${className}`}
      {...rest}
    >
      <button
        className={styles.header}
        onClick={handleToggle}
        aria-expanded={isExpanded}
        type="button"
      >
        <h3 className={styles.title}>
          {icon && (
            <FontAwesomeIcon
              icon={icon}
              className={styles.titleIcon}
              aria-hidden="true"
            />
          )}
          {title}
        </h3>
        <svg
          className={`${styles.icon} ${isExpanded ? styles.iconExpanded : ''}`}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && <div className={styles.content}>{children}</div>}
    </Card>
  );
}

export default CollapsibleCard;

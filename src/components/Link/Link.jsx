import { Link as RouterLink } from 'react-router-dom';
import styles from './Link.module.css';

/**
 * TextLink Component
 * Styled text link that inherits size from parent.
 * Uses React Router for navigation with primary color styling.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Link text/content
 * @param {string} props.href - URL/path to navigate to (maps to React Router 'to')
 * @param {Function} props.onClick - Click handler (custom action)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Disabled state (default: false)
 * @param {string} props.target - Link target (e.g., '_blank')
 * @param {string} props.title - Link title/tooltip
 */
function Link({
  children,
  href = '#',
  onClick,
  className = '',
  disabled = false,
  target,
  title,
  ...rest
}) {
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // Render as span when disabled to prevent navigation
  if (disabled) {
    return (
      <span
        onClick={handleClick}
        className={`${styles.link} ${styles.disabled} ${className}`}
        title={title}
        {...rest}
      >
        {children}
      </span>
    );
  }

  // Use React Router Link for navigation when enabled
  return (
    <RouterLink
      to={href}
      onClick={handleClick}
      className={`${styles.link} ${className}`}
      target={target}
      title={title}
      {...rest}
    >
      {children}
    </RouterLink>
  );
}

export default Link;

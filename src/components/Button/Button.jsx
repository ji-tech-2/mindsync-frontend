import styles from './Button.module.css';

/**
 * Button Component (renders as <button> or <a> tag)
 * @param {Object} props
 * @param {string} props.variant - 'outlined', 'filled', 'light', 'ghost' (default: 'outlined')
 * @param {string} props.size - 'lg' for large (default: normal)
 * @param {boolean} props.fullWidth - Fill container width (default: false)
 * @param {boolean} props.bold - Use bold font weight (default: false)
 * @param {React.ReactNode} props.children - Button content/text
 * @param {React.ReactNode} props.icon - Icon element
 * @param {string} props.iconPosition - 'left' or 'right' (default: 'left')
 * @param {boolean} props.iconOnly - Icon-only button (no text)
 * @param {string} props.align - 'center' or 'left' (default: 'center')
 * @param {string} props.href - If provided, renders as <a> tag instead of <button>
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type: 'button', 'submit', 'reset' (only for button)
 */
function Button({
  variant = 'outlined',
  size = '',
  fullWidth = false,
  bold = false,
  children,
  icon,
  iconPosition = 'left',
  iconOnly = false,
  align = 'center',
  href,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...rest
}) {
  const buttonClass = [
    styles.button,
    styles[variant],
    size && styles[size],
    fullWidth && styles.fullWidth,
    bold && styles.bold,
    disabled && styles.disabled,
    icon && styles.hasIcon,
    iconPosition === 'right' && styles.iconRight,
    iconOnly && styles.iconOnly,
    align === 'left' && styles.alignLeft,
    align === 'left' && iconPosition === 'right' && styles.spaceBetween,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {iconPosition === 'left' && icon && (
        <span className={styles.icon}>{icon}</span>
      )}
      {!iconOnly && children}
      {iconPosition === 'right' && icon && (
        <span className={styles.icon}>{icon}</span>
      )}
    </>
  );

  // Handle disabled link clicks
  const handleClick = (e) => {
    if (disabled && href) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // Render as anchor tag if href is provided
  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        className={buttonClass}
        onClick={handleClick}
        {...rest}
      >
        {content}
      </a>
    );
  }

  // Default: render as button
  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {content}
    </button>
  );
}

export default Button;

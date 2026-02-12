import { forwardRef } from 'react';
import styles from './TextField.module.css';

/**
 * TextField Component with floating label
 * @param {Object} props
 * @param {string} props.label - Label text (acts as placeholder)
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.type - Input type (default: 'text')
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.error - Show error state styling (default: false)
 * @param {boolean} props.fullWidth - Fill container width (default: false)
 */
const TextField = forwardRef(function TextField(
  {
    label,
    value = '',
    onChange,
    type = 'text',
    disabled = false,
    className = '',
    error = false,
    fullWidth = false,
    ...rest
  },
  ref
) {
  const wrapperClass = [
    styles.wrapper,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerClass = [
    styles.container,
    disabled && styles.disabled,
    error && styles.error,
    fullWidth && styles.fullWidth,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      <div className={containerClass}>
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={styles.input}
          placeholder=" "
          {...rest}
        />
        {label && <label className={styles.label}>{label}</label>}
      </div>
    </div>
  );
});

export default TextField;

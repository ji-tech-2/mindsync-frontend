import { useState, useEffect, forwardRef } from 'react';
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
 * @param {string} props.error - Error message
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
    error = '',
    fullWidth = false,
    ...rest
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isAutofilled, setIsAutofilled] = useState(false);
  const hasValue = value && value.length > 0;
  const isActive = isFocused || hasValue || isAutofilled;

  useEffect(() => {
    // Check for autofill on mount and when value changes
    const checkAutofill = () => {
      const input = ref?.current || document.activeElement;
      if (input && input.matches) {
        try {
          const autofilled =
            input.matches(':-webkit-autofill') || input.matches(':autofill');
          setIsAutofilled(autofilled);
        } catch {
          // Browser doesn't support autofill detection
        }
      }
    };

    checkAutofill();
    // Also check periodically as autofill can happen asynchronously
    const interval = setInterval(checkAutofill, 100);
    const timeout = setTimeout(() => clearInterval(interval), 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [ref, value]);

  const wrapperClass = [
    styles.wrapper,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerClass = [
    styles.container,
    isFocused && styles.focused,
    disabled && styles.disabled,
    error && styles.error,
    fullWidth && styles.fullWidth,
  ]
    .filter(Boolean)
    .join(' ');

  const handleFocus = (e) => {
    setIsFocused(true);
    if (rest.onFocus) rest.onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (rest.onBlur) rest.onBlur(e);
  };

  return (
    <div className={wrapperClass}>
      <div className={containerClass}>
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={styles.input}
          {...rest}
        />
        {label && (
          <label
            className={`${styles.label} ${isActive ? styles.labelActive : ''}`}
          >
            {label}
          </label>
        )}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

export default TextField;

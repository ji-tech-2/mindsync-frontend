import { Button } from '@/components';
import styles from './MultipleChoice.module.css';

/**
 * MultipleChoice Component
 * Multiple choice selection using Button components
 * Outline variant when not selected, filled variant when selected
 *
 * @param {Object} props
 * @param {Array} props.options - Array of option values
 * @param {*} props.value - Currently selected value
 * @param {Function} props.onChange - Selection handler (receives selected value)
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.error - Error state
 * @param {string} props.className - Additional CSS classes
 */
function MultipleChoice({
  options = [],
  value,
  onChange,
  disabled = false,
  error = false,
  className = '',
}) {
  const handleSelect = (option) => {
    if (!disabled) {
      onChange?.(option);
    }
  };

  const containerClass = [
    styles.container,
    disabled && styles.disabled,
    error && styles.error,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      <div className={containerClass}>
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <Button
              key={option}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => handleSelect(option)}
              disabled={disabled}
              fullWidth
              className={styles.option}
            >
              {option}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default MultipleChoice;

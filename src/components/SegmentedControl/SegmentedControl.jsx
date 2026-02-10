import React from 'react';
import styles from './SegmentedControl.module.css';

/**
 * SegmentedControl component for switching between multiple options.
 *
 * @param {Object} props
 * @param {Array<{label: string, value: any}>} props.options - Array of options
 * @param {any} props.value - Current selected value
 * @param {Function} props.onChange - Callback function when value changes
 * @param {boolean} props.fullWidth - Whether to take full width of container
 * @param {string} props.size - Size variant of the control ('sm' or default)
 * @param {string} props.className - Additional class names
 */
const SegmentedControl = ({
  options = [],
  value,
  onChange,
  fullWidth = false,
  size = '',
  className = '',
}) => {
  const containerClasses = [
    styles.container,
    fullWidth && styles.fullWidth,
    size && styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} role="tablist">
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            className={[styles.segment, isActive && styles.active]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange?.(option.value)}
            type="button"
            role="tab"
            aria-selected={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;

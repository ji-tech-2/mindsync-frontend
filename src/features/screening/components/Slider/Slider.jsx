import styles from './Slider.module.css';

/**
 * Slider Component
 * Slider input that snaps to specific values
 *
 * @param {Object} props
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} props.step - Step interval (default: 1)
 * @param {number} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.showValue - Show current value above slider (default: true)
 * @param {boolean} props.showLabels - Show min/max labels (default: true)
 * @param {string} props.minLabel - Custom label for min value
 * @param {string} props.maxLabel - Custom label for max value
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.error - Error state
 * @param {string} props.className - Additional CSS classes
 */
function Slider({
  min = 0,
  max = 10,
  step = 1,
  value = 0,
  onChange,
  showValue = true,
  showLabels = true,
  minLabel,
  maxLabel,
  disabled = false,
  error = false,
  className = '',
}) {
  // Calculate percentage for visual feedback
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
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
    <div className={containerClass}>
      {showValue && <div className={styles.valueDisplay}>{value}</div>}

      <div className={styles.sliderWrapper}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={styles.slider}
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-primary-light) ${percentage}%, var(--color-primary-light) 100%)`,
          }}
        />

        {showLabels && (
          <div className={styles.labels}>
            <span className={styles.label}>
              {minLabel !== undefined ? minLabel : min}
            </span>
            <span className={styles.label}>
              {maxLabel !== undefined ? maxLabel : max}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Slider;

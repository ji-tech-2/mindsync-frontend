import styles from './Slider.module.css';

/**
 * Build container CSS class names
 */
const buildContainerClass = (disabled, error, className) => {
  const classes = [styles.container];
  if (disabled) classes.push(styles.disabled);
  if (error) classes.push(styles.error);
  if (className) classes.push(className);
  return classes.filter(Boolean).join(' ');
};

/**
 * Get label text for min/max
 */
const getLabelText = (value, customLabel) => {
  return customLabel !== undefined ? customLabel : value;
};

/**
 * Calculate percentage for slider fill
 */
const calculatePercentage = (value, min, max) => {
  return ((value - min) / (max - min)) * 100;
};

/**
 * Build slider background style
 */
const buildSliderBackground = (percentage) => {
  return `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-primary-light) ${percentage}%, var(--color-primary-light) 100%)`;
};

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
  const percentage = calculatePercentage(value, min, max);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  };

  return (
    <div className={buildContainerClass(disabled, error, className)}>
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
          style={{ background: buildSliderBackground(percentage) }}
        />

        {showLabels && (
          <div className={styles.labels}>
            <span className={styles.label}>{getLabelText(min, minLabel)}</span>
            <span className={styles.label}>{getLabelText(max, maxLabel)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Slider;

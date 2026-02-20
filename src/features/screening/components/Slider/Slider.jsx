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
 * Build track gradient style for the custom track overlay
 */
const buildTrackGradient = (percentage) => {
  return `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-text-muted) ${percentage}%, var(--color-text-muted) 100%)`;
};

/**
 * Build ticks array for each valid step position
 */
const buildTicks = (min, max, step) => {
  const ticks = [];
  for (let v = min; v <= max + step * 0.001; v += step) {
    ticks.push(parseFloat(v.toFixed(10)));
  }
  // Ensure max is always included
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return ticks;
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
  const ticks = buildTicks(min, max, step);
  const showTicks = ticks.length <= 11;
  const showTickLabels = showLabels && ticks.length <= 5;

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  };

  return (
    <div className={buildContainerClass(disabled, error, className)}>
      {showValue && <div className={styles.valueDisplay}>{value}</div>}

      <div className={styles.sliderWrapper}>
        <div className={styles.sliderTrackWrapper}>
          {/* Custom track + tick dots (inset by thumbSize/2 — matches thumb travel range) */}
          <div
            className={styles.trackOverlay}
            style={{ background: buildTrackGradient(percentage) }}
          >
            {showTicks && (
              <div className={styles.ticksContainer}>
                {ticks.map((tick) => {
                  const pct = calculatePercentage(tick, min, max);
                  const isFilled = tick <= value;
                  return (
                    <div
                      key={tick}
                      className={`${styles.tick} ${isFilled ? styles.tickFilled : styles.tickEmpty}`}
                      style={{ left: `${pct}%` }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Native input — transparent track, thumb only */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={styles.slider}
          />
        </div>

        {showTickLabels ? (
          <div className={styles.tickLabels}>
            {ticks.map((tick, i) => {
              const pct = calculatePercentage(tick, min, max);
              const label =
                tick === min && minLabel !== undefined
                  ? minLabel
                  : tick === max && maxLabel !== undefined
                    ? maxLabel
                    : tick;
              // Edge labels: anchor to the dot without centering so they don't overflow
              const isFirst = i === 0;
              const isLast = i === ticks.length - 1;
              const edgeStyle = isFirst
                ? { left: 0 }
                : isLast
                  ? { right: 0 }
                  : { left: `${pct}%`, transform: 'translateX(-50%)' };
              return (
                <span key={tick} className={styles.tickLabel} style={edgeStyle}>
                  {label}
                </span>
              );
            })}
          </div>
        ) : (
          showLabels && (
            <div className={styles.labels}>
              <span className={styles.label}>
                {getLabelText(min, minLabel)}
              </span>
              <span className={styles.label}>
                {getLabelText(max, maxLabel)}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Slider;

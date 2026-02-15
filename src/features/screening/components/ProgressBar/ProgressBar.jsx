import styles from './ProgressBar.module.css';

/**
 * ProgressBar Component
 * Animated progress bar for multi-step forms
 *
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {string} props.className - Additional CSS classes
 */
function ProgressBar({ progress = 0, className = '' }) {
  return (
    <div className={`${styles.progressBarContainer} ${className}`}>
      <div
        className={styles.progressBar}
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
}

export default ProgressBar;

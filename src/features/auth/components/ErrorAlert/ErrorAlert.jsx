import styles from './ErrorAlert.module.css';

/**
 * ErrorAlert Component
 * Displays error messages at the bottom of forms
 *
 * @param {Object} props
 * @param {string} props.message - Error message text
 * @param {boolean} props.show - Whether to show the alert
 */
function ErrorAlert({ message, show = true }) {
  if (!show || !message) return null;

  return <p className={styles.errorMessage}>{message}</p>;
}

export default ErrorAlert;

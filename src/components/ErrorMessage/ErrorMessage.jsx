import styles from './ErrorMessage.module.css';

/**
 * ErrorMessage Component - displays validation error with fade animation
 * @param {Object} props
 * @param {string} props.message - Error message text to display
 */
const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return <div className={styles.errorMessage}>{message}</div>;
};

export default ErrorMessage;

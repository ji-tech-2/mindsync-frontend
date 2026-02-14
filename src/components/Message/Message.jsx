import styles from './Message.module.css';

/**
 * Message Component - displays messages with different types (error, success, info)
 * @param {Object} props
 * @param {string} props.message - Message text to display
 * @param {'error' | 'success' | 'info'} [props.type='info'] - Type of message (default: 'info')
 */
const Message = ({ message, type = 'info' }) => {
  if (!message) return null;

  return <div className={`${styles.message} ${styles[type]}`}>{message}</div>;
};

export default Message;

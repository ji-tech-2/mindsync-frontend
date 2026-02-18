import styles from './Message.module.css';

/**
 * Message Component - displays messages with different types (error, success, info)
 * @param {Object} props
 * @param {string} props.message - Message text to display (deprecated, use children)
 * @param {React.ReactNode} props.children - Message content to display
 * @param {'error' | 'success' | 'info'} [props.type='info'] - Type of message (default: 'info')
 * @param {string} props.className - Additional CSS classes
 */
const Message = ({
  message,
  children,
  type = 'info',
  className = '',
  ...props
}) => {
  const content = children || message;

  if (!content) return null;

  return (
    <div
      className={`${styles.message} ${styles[type]} ${className}`}
      {...props}
    >
      {content}
    </div>
  );
};

export default Message;

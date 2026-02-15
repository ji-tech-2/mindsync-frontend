import styles from './FormContainer.module.css';

/**
 * FormContainer Component
 * Wrapper for form with consistent spacing
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Form content
 * @param {Function} props.onSubmit - Form submit handler
 */
function FormContainer({ children, onSubmit, ...props }) {
  return (
    <form onSubmit={onSubmit} className={styles.form} {...props}>
      {children}
    </form>
  );
}

export default FormContainer;

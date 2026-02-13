import styles from './FormSection.module.css';

/**
 * FormSection Component
 * Wrapper for form sections with consistent spacing
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Form field and error content
 * @param {React.Ref} props.ref - Ref for scrolling to errors
 */
function FormSection({ children, ...props }) {
  return (
    <div className={styles.section} {...props}>
      {children}
    </div>
  );
}

export default FormSection;

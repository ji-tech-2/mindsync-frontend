import styles from './QuestionLayout.module.css';

/**
 * QuestionLayout Component
 * Layout wrapper for screening questions with title and input area
 *
 * @param {Object} props
 * @param {string} props.question - Question text
 * @param {React.ReactNode} props.children - Input component (TextField, Slider, MultipleChoice, etc.)
 * @param {string} props.className - Additional CSS classes
 */
function QuestionLayout({ question, children, className = '' }) {
  return (
    <div className={`${styles.container} ${className}`}>
      <h2 className={styles.question}>{question}</h2>
      <div className={styles.inputArea}>{children}</div>
    </div>
  );
}

export default QuestionLayout;

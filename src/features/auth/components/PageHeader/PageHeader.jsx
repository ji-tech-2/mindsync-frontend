import styles from './PageHeader.module.css';

/**
 * PageHeader Component
 * Displays page title and subtitle for authentication pages
 *
 * @param {Object} props
 * @param {string} props.title - Main title text
 * @param {string} props.subtitle - Subtitle text
 */
function PageHeader({ title, subtitle }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>
    </div>
  );
}

export default PageHeader;

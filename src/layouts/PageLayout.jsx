import styles from './PageLayout.module.css';

/**
 * PageLayout Component - Consistent layout wrapper for main pages
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {React.ReactNode} props.headerRight - Optional content on the right of the header
 * @param {React.ReactNode} props.children - Page content
 */
export default function PageLayout({ title, headerRight, children }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {headerRight && <div className={styles.headerRight}>{headerRight}</div>}
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

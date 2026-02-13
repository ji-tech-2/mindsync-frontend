import { Card } from '@/components';
import styles from './AuthPageLayout.module.css';

/**
 * AuthPageLayout Component
 * Provides consistent layout for authentication pages (Login, SignUp, etc.)
 * Handles wrapper, card, and page structure styling
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content to render inside the card
 * @param {string} props.className - Additional CSS classes
 */
function AuthPageLayout({ children }) {
  return (
    <div className={styles.wrapper}>
      <Card padded elevation="md" variant="light" className={styles.card}>
        {children}
      </Card>
    </div>
  );
}

export default AuthPageLayout;

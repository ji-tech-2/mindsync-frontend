import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ProfileDropdown } from '@/features/profile';
import { Button } from '@/components';
import logoPrimaryAlt from '@/assets/logo-primary-alt.svg';
import styles from './Navbar.module.css';

function Navbar() {
  const { user } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo/Branding */}
        <Link
          to={user ? '/dashboard' : '/'}
          className={styles.logoButton}
          aria-label="Home"
        >
          <img src={logoPrimaryAlt} alt="MindSync" className={styles.logo} />
        </Link>

        {/* Navigation Items */}
        <div className={styles.navActions}>
          {user ? (
            /* Authenticated User Navigation */
            <>
              <Link to="/dashboard" className={styles.navLink}>
                Dashboard
              </Link>
              <Link to="/history" className={styles.navLink}>
                History
              </Link>
              <Link to="/screening" className={styles.navLink}>
                Screening
              </Link>
              <div className={styles.profileSection}>
                <ProfileDropdown />
              </div>
            </>
          ) : (
            /* Unauthenticated Navigation */
            <>
              <Link to="/screening" className={styles.navLink}>
                Screening
              </Link>
              <Link to="/signIn" className={styles.navLink}>
                Log In
              </Link>
              <Link to="/register" className={styles.buttonLink}>
                <Button variant="light" bold>
                  Try for Free
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/features/auth';
import { ProfileDropdown, Button, ProfileAvatar } from '@/components';
import logoPrimaryAlt from '@/assets/logo-primary-alt.svg';
import styles from './Navbar.module.css';

function Navbar() {
  const { user, logoutWithTransition } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(`.${styles.hamburger}`)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    closeMobileMenu();
    logoutWithTransition();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          className={styles.hamburger}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>

        {/* Logo/Branding */}
        <Link
          to={user ? '/dashboard' : '/'}
          className={styles.logoButton}
          aria-label="Home"
        >
          <img src={logoPrimaryAlt} alt="MindSync" className={styles.logo} />
        </Link>

        {/* Desktop Navigation Items */}
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
              <Link to="/signin" className={styles.navLink}>
                Sign In
              </Link>
              <Link to="/signup" className={styles.buttonLink}>
                <Button variant="filled" theme="light" bold>
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''} ${!user ? styles.mobileMenuPaddedTop : ''}`}
      >
        <button
          className={`${styles.drawerClose}${user ? ` ${styles.drawerCloseDark}` : ''}`}
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {user && (
          <div className={styles.mobileProfileSection}>
            <ProfileAvatar name={user.name} size="medium" />
            <div className={styles.mobileProfileName}>{user.name}</div>
          </div>
        )}

        <div className={styles.mobileNavLinks}>
          {user ? (
            /* Authenticated User Mobile Navigation */
            <>
              <Link
                to="/dashboard"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                History
              </Link>
              <Link
                to="/screening"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                Screening
              </Link>
            </>
          ) : (
            /* Unauthenticated Mobile Navigation */
            <>
              <Link
                to="/screening"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                Screening
              </Link>
              <Link
                to="/signin"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {user && (
          <div className={styles.mobileMenuActions}>
            <Button variant="outlined" fullWidth href="/profile">
              Settings
            </Button>
            <Button variant="filled" fullWidth onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

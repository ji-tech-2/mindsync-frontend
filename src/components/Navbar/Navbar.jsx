import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ProfileDropdown, Button, ProfileAvatar } from '@/components';
import logoPrimaryAlt from '@/assets/logo-primary-alt.svg';
import styles from './Navbar.module.css';

function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();

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

  const handleEditProfile = () => {
    closeMobileMenu();
    navigate('/profile');
  };

  const handleLogout = () => {
    closeMobileMenu();
    logout();
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}
      >
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
                Log In
              </Link>
              <Link
                to="/register"
                className={styles.mobileNavLink}
                onClick={closeMobileMenu}
              >
                Try for Free
              </Link>
            </>
          )}
        </div>

        {user && (
          <div className={styles.mobileMenuActions}>
            <Button variant="outlined" fullWidth onClick={handleEditProfile}>
              Settings
            </Button>
            <Button variant="filled" fullWidth onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

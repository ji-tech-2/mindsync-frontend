import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileAvatar from './ProfileAvatar';
import styles from './Navbar.module.css';

function Navbar() {
  const { user } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.wordmark}>
          <Link to="/">MindSync</Link>
        </div>
        
        <div className={styles.navRight}>
          {user && (
            <>
              <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
              <Link to="/history" className={styles.navLink}>History</Link>
            </>
          )}
          <Link to="/screening" className={styles.navLink}>Screening</Link>
          {user && (
            <div className={styles.profileSection}>
              <ProfileAvatar name={user.name} />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

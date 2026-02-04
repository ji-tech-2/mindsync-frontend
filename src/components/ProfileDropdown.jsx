import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LogoutButton from './LogoutButton';
import styles from './ProfileDropdown.module.css';

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  if (!user) return null;

  const initial = (user.name || '').trim().charAt(0).toUpperCase();

  return (
    <div className={styles.profileDropdown} ref={dropdownRef}>
      <button 
        className={styles.avatarButton} 
        onClick={toggleDropdown}
        aria-label="Profile menu"
      >
        <div className="avatar-circle">
          {initial}
        </div>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.email}>{user.email}</div>
          </div>

          <div className={styles.dropdownBody}>
            <div className={styles.avatarLarge}>
              {initial}
            </div>
            <div className={styles.greeting}>Hello, {user.name}!</div>
          </div>

          <div className={styles.dropdownActions}>
            <Link 
              to="/profile" 
              className={styles.actionButton}
              onClick={closeDropdown}
            >
              Edit Profile
            </Link>
            <div className={styles.logoutWrapper}>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileDropdown;

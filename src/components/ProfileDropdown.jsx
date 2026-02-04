import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileAvatar from './ProfileAvatar';
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

  return (
    <div className={styles.profileDropdown} ref={dropdownRef}>
      <button 
        className={styles.avatarButton} 
        onClick={toggleDropdown}
        aria-label="Profile menu"
      >
        <ProfileAvatar name={user.name} size="small" isHoverable={true} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.email}>{user.email}</div>
          </div>

          <div className={styles.dropdownBody}>
            <ProfileAvatar name={user.name} size="medium" isHoverable={false} />
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

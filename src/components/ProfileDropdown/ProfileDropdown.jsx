import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import Card from '../Card';
import Button from '../Button';
import ProfileAvatar from '../ProfileAvatar';
import styles from './ProfileDropdown.module.css';

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  const handleEditProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  if (!user) return null;

  return (
    <div className={styles.profileDropdown} ref={dropdownRef}>
      <button
        className={styles.avatarButton}
        onClick={toggleDropdown}
        aria-label="Profile menu"
      >
        <ProfileAvatar name={user.name} size="small" />
      </button>

      {isOpen && (
        <Card className={styles.dropdown} padded={false}>
          <div className={styles.dropdownContent}>
            {/* Avatar and Greeting */}
            <div className={styles.header}>
              <ProfileAvatar name={user.name} size="medium" />
              <div className={styles.greeting}>Hi, {user.name}!</div>
            </div>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Action Buttons */}
            <div className={styles.actions}>
              <Button variant="outlined" fullWidth onClick={handleEditProfile}>
                Edit Profile
              </Button>
              <Button variant="filled" fullWidth onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default ProfileDropdown;

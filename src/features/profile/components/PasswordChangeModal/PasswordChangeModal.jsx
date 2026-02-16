import { useState } from 'react';
import { PasswordField, Button, Message, Link } from '@/components';
import { getPasswordError } from '@/utils/passwordValidation';
import styles from './PasswordChangeModal.module.css';

/**
 * PasswordChangeModal Component - Modal for changing user password
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSubmit - Function to submit password change (receives {oldPassword, newPassword})
 * @param {boolean} props.loading - Whether the form is submitting
 */
export default function PasswordChangeModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    verifyPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Old password is required';
    }

    const newPasswordError = getPasswordError(formData.newPassword);
    if (newPasswordError) {
      newErrors.newPassword = newPasswordError;
    }

    if (!formData.verifyPassword) {
      newErrors.verifyPassword = 'Please verify your password';
    } else if (formData.newPassword !== formData.verifyPassword) {
      newErrors.verifyPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      // Success message will be handled by parent component
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          oldPassword: '',
          newPassword: '',
          verifyPassword: '',
        });
        setErrors({});
      }, 100);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to change password',
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        oldPassword: '',
        newPassword: '',
        verifyPassword: '',
      });
      setErrors({});
      setMessage({ type: '', text: '' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Change Password</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={loading}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <PasswordField
              label="Current Password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              error={!!errors.oldPassword}
              disabled={loading}
              fullWidth
            />
            {errors.oldPassword && (
              <Message type="error">{errors.oldPassword}</Message>
            )}
            <div className={styles.forgotPasswordLink}>
              <Link href="/forgot-password">Forgot Password?</Link>
            </div>
          </div>

          <div className={styles.field}>
            <PasswordField
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={!!errors.newPassword}
              disabled={loading}
              fullWidth
            />
            {errors.newPassword && (
              <Message type="error">{errors.newPassword}</Message>
            )}
          </div>

          <div className={styles.field}>
            <PasswordField
              label="Confirm New Password"
              name="verifyPassword"
              value={formData.verifyPassword}
              onChange={handleChange}
              error={!!errors.verifyPassword}
              disabled={loading}
              fullWidth
            />
            {errors.verifyPassword && (
              <Message type="error">{errors.verifyPassword}</Message>
            )}
          </div>

          {message.text && (
            <Message type={message.type}>{message.text}</Message>
          )}

          <div className={styles.actions}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              type="button"
            >
              Cancel
            </Button>
            <Button variant="filled" type="submit" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

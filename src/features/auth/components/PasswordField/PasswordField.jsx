import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { TextField } from '@/components';
import styles from './PasswordField.module.css';

/**
 * PasswordField Component
 * TextField with password visibility toggle and animated eye icon
 *
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {boolean} props.error - Error state
 * @param {boolean} props.fullWidth - Fill container width
 * @param {string} props.name - Input name attribute
 */
function PasswordField({
  label = 'Password',
  value = '',
  onChange,
  onBlur,
  error = false,
  fullWidth = false,
  name = 'password',
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container}>
      <TextField
        label={label}
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        fullWidth={fullWidth}
        {...rest}
      />
      <button
        type="button"
        onClick={handleTogglePassword}
        className={styles.eyeButton}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
      </button>
    </div>
  );
}

export default PasswordField;

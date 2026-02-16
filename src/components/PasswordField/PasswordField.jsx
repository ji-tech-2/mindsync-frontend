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
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.variant - TextField variant ('default', 'surface')
 */
function PasswordField({
  label = 'Password',
  value = '',
  onChange,
  onBlur,
  error = false,
  fullWidth = false,
  name = 'password',
  disabled = false,
  variant = 'default',
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const containerClass = [styles.container, fullWidth && styles.fullWidth]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      <TextField
        label={label}
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        fullWidth={fullWidth}
        disabled={disabled}
        variant={variant}
        {...rest}
      />
      {!disabled && (
        <button
          type="button"
          onClick={handleTogglePassword}
          className={styles.eyeButton}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
        </button>
      )}
    </div>
  );
}

export default PasswordField;

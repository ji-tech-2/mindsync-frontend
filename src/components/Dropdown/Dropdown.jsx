import { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';

/**
 * Dropdown Component
 * @param {Object} props
 * @param {string} props.label - Label for the dropdown
 * @param {Array} props.options - Array of option objects { label, value }
 * @param {Object} props.value - Selected option object
 * @param {Function} props.onChange - Selection handler
 * @param {boolean} props.fullWidth - Fill container width
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disabled state
 */
const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  fullWidth = false,
  placeholder = 'Select an option',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    if (onChange) onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`${styles.header} ${isOpen ? styles.headerOpen : styles.headerClosed} ${disabled ? styles.disabled : ''}`}
        onClick={toggleDropdown}
        disabled={disabled}
      >
        <span className={styles.label}>
          {value ? value.label : label || placeholder}
        </span>
        <svg
          className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.menu}>
          {options.map((option, index) => (
            <button
              key={index}
              className={styles.option}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

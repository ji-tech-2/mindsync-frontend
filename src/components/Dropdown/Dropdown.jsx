import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import styles from './Dropdown.module.css';

/**
 * Helper function to calculate minimum width based on content
 */
function calculateMinWidth(options, label) {
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.visibility = 'hidden';
  tempDiv.style.whiteSpace = 'nowrap';
  tempDiv.style.padding = 'var(--space-sm) var(--space-lg)';
  tempDiv.style.fontSize = 'var(--font-size-md)';
  tempDiv.style.fontFamily = 'var(--font-body)';
  tempDiv.style.fontWeight = 'var(--font-weight-medium)';
  document.body.appendChild(tempDiv);

  let maxWidth = 0;

  // Measure label
  if (label) {
    tempDiv.textContent = label;
    maxWidth = Math.max(maxWidth, tempDiv.offsetWidth);
  }

  // Measure all options
  options.forEach((option) => {
    tempDiv.textContent = option.label;
    maxWidth = Math.max(maxWidth, tempDiv.offsetWidth);
  });

  document.body.removeChild(tempDiv);

  // Add extra space for arrow icon and gaps
  return `${maxWidth + 60}px`; // padding + arrow + gap
}

/**
 * Build wrapper, header, and container CSS classes.
 */
function buildDropdownClasses({
  fullWidth,
  isOpen,
  disabled,
  floatingLabel,
  error,
}) {
  const wrapperClass = [styles.wrapper, fullWidth && styles.fullWidth]
    .filter(Boolean)
    .join(' ');

  const headerClass = [
    styles.header,
    isOpen ? styles.headerOpen : styles.headerClosed,
    disabled && styles.disabled,
    floatingLabel && styles.floatingLabel,
  ]
    .filter(Boolean)
    .join(' ');

  const containerClass = [styles.container, error && styles.error]
    .filter(Boolean)
    .join(' ');

  return { wrapperClass, headerClass, containerClass };
}

/**
 * Arrow SVG icon for the dropdown.
 */
function DropdownArrow({ isOpen }) {
  return (
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
  );
}

/**
 * Dropdown Component with floating label
 * @param {Object} props
 * @param {string} props.label - Label for the dropdown (acts as placeholder when floatingLabel is false)
 * @param {Array} props.options - Array of option objects { label, value }
 * @param {Object} props.value - Selected option object
 * @param {Function} props.onChange - Selection handler
 * @param {boolean} props.fullWidth - Fill container width
 * @param {boolean} props.error - Show error state styling (default: false)
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.floatingLabel - Enable floating label (default: true)
 * @param {Function} props.onBlur - Blur handler
 */
const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  fullWidth = false,
  error = false,
  disabled = false,
  floatingLabel = true,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const measureRef = useRef(null);
  const minWidthRef = useRef('auto');
  const hasValue = value && value.label;

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
        const wasOpen = isOpen;
        setIsOpen(false);
        // Trigger onBlur when closing the dropdown by clicking outside
        if (wasOpen && onBlur) {
          onBlur();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onBlur]);

  // Calculate minimum width based on content
  useLayoutEffect(() => {
    if (fullWidth || !measureRef.current) return;

    minWidthRef.current = calculateMinWidth(options, label);

    if (dropdownRef.current) {
      dropdownRef.current.style.minWidth = minWidthRef.current;
    }
  }, [options, label, fullWidth]);

  const { wrapperClass, headerClass, containerClass } = buildDropdownClasses({
    fullWidth,
    isOpen,
    disabled,
    floatingLabel,
    error,
  });

  return (
    <div className={wrapperClass} ref={dropdownRef}>
      <span ref={measureRef} style={{ display: 'none' }} />
      {floatingLabel ? (
        <div
          className={containerClass}
          data-has-value={hasValue ? 'true' : 'false'}
        >
          <button
            type="button"
            className={headerClass}
            onClick={toggleDropdown}
            disabled={disabled}
          >
            <span className={styles.buttonLabel}>
              {value ? value.label : ''}
            </span>
            <DropdownArrow isOpen={isOpen} />
          </button>
          {label && <label className={styles.label}>{label}</label>}
        </div>
      ) : (
        <button
          type="button"
          className={headerClass}
          onClick={toggleDropdown}
          disabled={disabled}
        >
          <span className={styles.buttonLabel}>
            {value ? value.label : label}
          </span>
          <DropdownArrow isOpen={isOpen} />
        </button>
      )}

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

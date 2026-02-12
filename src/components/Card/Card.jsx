import React from 'react';
import styles from './Card.module.css';

/**
 * Card Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {boolean} props.padded - Whether the card has padding (default: true)
 * @param {string} props.elevation - Shadow elevation level: 'md' (default), 'lg', or 'none' for no shadow
 * @param {string} props.variant - Background color variant: 'surface' (default), 'light', or 'dark'
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({
  children,
  padded = true,
  elevation = 'md',
  variant = 'surface',
  className = '',
  ...rest
}) => {
  const cardClass = [
    styles.card,
    padded && styles.padded,
    elevation &&
      styles[
        `elevation${elevation.charAt(0).toUpperCase() + elevation.slice(1)}`
      ],
    variant &&
      styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClass} {...rest}>
      {children}
    </div>
  );
};

export default Card;

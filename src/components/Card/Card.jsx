import React from 'react';
import styles from './Card.module.css';

/**
 * Card Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {boolean} props.padded - Whether the card has padding (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({ children, padded = true, className = '', ...rest }) => {
  const cardClass = [styles.card, padded && styles.padded, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClass} {...rest}>
      {children}
    </div>
  );
};

export default Card;

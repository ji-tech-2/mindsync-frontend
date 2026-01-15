import React, { useState } from 'react';
import styles from './AdviceFactor.module.css'; 

const AdviceFactor = ({ factorKey, factorData }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTitle = (key) => {
    return key
      .replace('num__', '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('0 100', '')
      .replace('1 5^2', '');
  };

  return (
    <div className={styles.card}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className={styles.title}>{formatTitle(factorKey)}</h3>
        <span className={styles.icon}>{isExpanded ? '−' : '+'}</span>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          <ul className={styles.list}>
            {factorData.advices.map((item, index) => (
              <li key={index} className={styles.listItem}>{item}</li>
            ))}
          </ul>

          <div className={styles.refSection}>
            <p className={styles.refTitle}>Sources & References</p>
            {factorData.references.map((ref, index) => (
              <a 
                key={index} 
                href={ref} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.refLink}
              >
                Resource {index + 1}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdviceFactor;
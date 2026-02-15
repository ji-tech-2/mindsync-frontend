import React from 'react';
import AdviceFactor from '../AdviceFactor';
import styles from './Advice.module.css';

const Advice = ({ adviceData, isLoading }) => {
  if (isLoading) {
    return (
      <div className={styles.adviceSection}>
        <p className={styles.loadingMessage}>Loading personalized advice...</p>
      </div>
    );
  }

  if (!adviceData) {
    return (
      <div className={styles.adviceSection}>
        <p className={styles.emptyMessage}>
          Advice will appear once analysis is complete...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.adviceSection}>
      <p className={styles.description}>{adviceData.description}</p>
      <div className={styles.adviceFactors}>
        {Object.entries(adviceData.factors || {}).map(([key, value]) => (
          <AdviceFactor key={key} factorKey={key} factorData={value} />
        ))}
      </div>
    </div>
  );
};

export default Advice;

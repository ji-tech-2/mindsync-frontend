import React from 'react';
import AdviceFactor from './AdviceFactor';
import styles from './Advice.module.css';

const Advice = ({ adviceData, isLoading }) => {
  if (isLoading) {
    return (
      <div className={styles.adviceSection}>
        <h2>Advice</h2>
        <p>Loading personalized advice...</p>
      </div>
    );
  }

  return (
    <div className={styles.adviceSection}>
      <h2>Advice</h2>
      {adviceData ? (
        <>
          <p>
            {adviceData.description}
          </p>
          <div className={styles.adviceFactors}>
            {Object.entries(adviceData.factors || {}).map(([key, value]) => (
              <AdviceFactor key={key} factorKey={key} factorData={value} />
            ))}
          </div>
        </>
      ) : (
        <p>Advice will appear once analysis is complete...</p>
      )}
    </div>
  );
};

export default Advice;

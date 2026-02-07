import React from 'react';
import styles from './DashboardSuggestion.module.css';

const DashboardSuggestion = ({ data, loading }) => {
  if (loading) {
    return (
      <div className={styles.suggestionContainer}>
        <p className={styles.text}>Loading daily suggestions...</p>
      </div>
    );
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className={styles.suggestionContainer}>
        <p className={styles.text}>No suggestion available at the moment.</p>
      </div>
    );
  }

  // Cek apakah data berupa Array (Poin-poin)
  const isArray = Array.isArray(data);

  return (
    <div className={styles.suggestionContainer}>
      {isArray ? (
        <ul className={styles.suggestionList}>
          {data.map((item, index) => (
            <li key={index} className={styles.suggestionItem}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.text}>{data}</p>
      )}
    </div>
  );
};

export default DashboardSuggestion;
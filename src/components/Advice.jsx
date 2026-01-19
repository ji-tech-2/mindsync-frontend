import React, { useState, useEffect } from 'react';
import AdviceFactor from './AdviceFactor';
import { API_URLS } from '../config/api.js';
import styles from './Advice.module.css';

const Advice = ({ resultData }) => {
  const [adviceData, setAdviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvice = async () => {
      if (!resultData) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const requestData = {
          prediction_score: [resultData.mentalWellnessScore],
          mental_health_category: resultData.category,
          wellness_analysis: resultData.wellnessAnalysis
        };
        
        const response = await fetch(API_URLS.advice, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAdviceData(data.ai_advice);
        setError(null);
      } catch (err) {
        console.error('Error fetching advice:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, [resultData]);

  if (loading) {
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
      {error && (
        <p style={{ color: '#FFA502' }}>{error}</p>
      )}
      {adviceData && (
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
      )}
    </div>
  );
};

export default Advice;

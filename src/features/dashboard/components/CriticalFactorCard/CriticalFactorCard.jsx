import React from 'react';
import styles from './CriticalFactorCard.module.css';
import Card from '@/components/Card';

const CriticalFactorCard = ({ data, loading }) => {
  const getFactorImage = (rawName) => {
    // ini hanya contoh sementara
    const images = {
      'num__sleep_quality_1_5^2': '/assets/factors/sleep.png',
      num__stress_level: '/assets/factors/stress.png',
      num__productivity_0_100: '/assets/factors/productivity.png',
    };
    return images[rawName] || '/assets/factors/default-factor.png';
  };

  // 1. Cek loading dulu
  if (loading) {
    return (
      <Card>
        <div className={styles.loadingState}>Menganalisis Faktor Kritis...</div>
      </Card>
    );
  }

  // 2. Cek apakah data ada
  if (!data) {
    return (
      <Card padded={false}>
        <div className={styles.imageHeader}>
          <div className={styles.placeholderImg}></div>
        </div>
        <div className={styles.content}>
          <div className={styles.headerInfo}>
            <h3 className={styles.factorName}>No Analysis Yet</h3>
          </div>
          <p className={styles.description}>
            Please take the assessment first to discover and analyze your
            critical wellness factors.
          </p>
        </div>
      </Card>
    );
  }

  // 3. Jika data ada, baru jalankan return ini
  return (
    <Card padded={false}>
      <div className={styles.imageHeader}>
        <img
          src={getFactorImage(data.raw_name)}
          alt={data.factor_name}
          className={styles.factorImg}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.headerInfo}>
          <h3 className={styles.factorName}>{data.factor_name}</h3>
        </div>

        {data.description ? (
          <p className={styles.description}>{data.description}</p>
        ) : (
          <p className={styles.noSuggestions}>No suggestions available.</p>
        )}

        {data.references && data.references.length > 0 && (
          <div className={styles.referenceSection}>
            <h4 className={styles.refTitle}>Sources & Resources:</h4>
            <ul className={styles.refList}>
              {data.references.map((ref, idx) => (
                <li key={idx} className={styles.refItem}>
                  <a
                    href={typeof ref === 'object' ? ref.url : ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.refLink}
                  >
                    Resource {idx + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CriticalFactorCard;

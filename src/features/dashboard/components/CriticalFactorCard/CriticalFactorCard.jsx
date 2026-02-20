import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import styles from './CriticalFactorCard.module.css';
import Card from '@/components/Card';
import { getFeatureImage } from '@/utils/featureNames';

const CriticalFactorCard = ({ data, loading }) => {
  // 1. Cek loading dulu
  if (loading) {
    return (
      <Card>
        <div className={styles.loadingState}>Analyzing Critical Factors...</div>
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
          src={getFeatureImage(data.factor_name)}
          alt={data.factor_name}
          className={styles.factorImg}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.headerInfo}>
          <h3 className={styles.factorName}>
            {data.icon && (
              <FontAwesomeIcon
                icon={data.icon}
                className={styles.factorIcon}
                aria-hidden="true"
              />
            )}
            {data.factor_name}
          </h3>
        </div>

        {data.description ? (
          <p className={styles.description}>{data.description}</p>
        ) : (
          <p className={styles.noSuggestions}>No suggestions available.</p>
        )}

        {data.references && data.references.length > 0 && (
          <div className={styles.referenceSection}>
            <h4 className={styles.refTitle}>References:</h4>
            <ul className={styles.refList}>
              {data.references.map((ref, idx) => {
                const href = typeof ref === 'object' ? ref.url : ref;
                let label;
                try {
                  label = new URL(href).hostname.replace(/^www\./, '');
                } catch {
                  label = `Resource ${idx + 1}`;
                }
                return (
                  <li key={idx} className={styles.refItem}>
                    <FontAwesomeIcon
                      icon={faLink}
                      className={styles.refIcon}
                      aria-hidden="true"
                    />
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.refLink}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CriticalFactorCard;

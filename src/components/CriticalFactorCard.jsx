import React, {useState} from 'react';
import styles from './CriticalFactorCard.module.css'; 

const CriticalFactorCard = ({ data, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) return <div className={styles.loadingState}>Menganalisis...</div>;
  if (!data) return <div className={`${styles.cardContainer} ${styles.emptyCard}`}>No Data</div>;

  const getFactorImage = (rawName) => {
    const images = {
      "num__sleep_quality_1_5^2": "/assets/factors/sleep.png",
      "num__stress_level": "/assets/factors/stress.png",
      "num__productivity_0_100": "/assets/factors/productivity.png",
    };
    return images[rawName] || "/assets/factors/default-factor.png";
  };
  if (loading) {
    return <div className={styles.loadingState}>Menganalisis Faktor Kritis...</div>;
  }

  if (!data) {
    return (
      <div className={`${styles.cardContainer} ${styles.emptyCard}`}>
        <p>Data belum tersedia untuk periode ini.</p>
      </div>
    );
  }
return (
    <div className={`${styles.cardContainer} ${isExpanded ? styles.expanded : ''}`}>
      {/* Header: Selalu Terlihat */}
      <div className={styles.imageHeader}>
        <img src={getFactorImage(data.raw_name)} alt={data.factor_name} className={styles.factorImg} />
      </div>

      <div className={styles.headerInfo} onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className={styles.factorName}>{data.factor_name}</h3>
        {/* Ikon Panah Dropdown */}
        <span className={`${styles.arrowIcon} ${isExpanded ? styles.rotate : ''}`}>▼</span>
      </div>

      {/* Konten Dropdown: Tersembunyi/Terlihat */}
      <div className={`${styles.collapsibleContent} ${isExpanded ? styles.show : ''}`}>
        <div className={styles.innerContent}>
          <p className={styles.description}>{data.description}</p>
          
          {data.references && data.references.length > 0 && (
            <div className={styles.referenceSection}>
              <h4 className={styles.refTitle}>Sources & Resources:</h4>
              <ul className={styles.refList}>
                {data.references.map((ref, idx) => (
                  <li key={idx} className={styles.refItem}>
                    <a href={typeof ref === 'object' ? ref.url : ref} target="_blank" rel="noopener noreferrer" className={styles.refLink}>
                      Resource {idx + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CriticalFactorCard;
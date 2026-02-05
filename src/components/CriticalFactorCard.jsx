import React from 'react';
import styles from './CriticalFactorCard.module.css'; 

const CriticalFactorCard = ({ data, loading }) => {
  if (loading) {
    return <div className={styles.cardContainer}>Menganalisis...</div>;
  }

  if (!data) {
    return (
      <div className={`${styles.cardContainer} ${styles.emptyCard}`}>
        <p>Data belum tersedia</p>
      </div>
    );
  }

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.factorName}>{data.factor_name}</h3>
      <p className={styles.description}>{data.description}</p>
    </div>
  );
};

export default CriticalFactorCard;

// import React from 'react';
// import styles from './CriticalFactorCard.module.css'; 

// // Komponen sekarang menerima prop 'data'
// const CriticalFactorCard = ({ data }) => {
//   if (!data) return <div className={styles.cardContainer}>No Data</div>;

//   return (
//     <div className={styles.cardContainer}>
//       <h3 className={styles.title}>{data.factor_name}</h3>
//       <div className={styles.factorValue}>
//         <span className={styles.countNumber}>{data.count}</span>
//         <span className={styles.countText}> Kali Terdeteksi</span>
//       </div>
//       <p className={styles.footerNote}>Analisis Mingguan</p>
//     </div>
//   );
// };

// export default CriticalFactorCard;
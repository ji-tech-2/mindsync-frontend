import React, { useState, useEffect } from 'react';
import styles from './CriticalFactorCard.module.css'; 

const CriticalFactorCard = () => {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);

  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

  useEffect(() => {
    if (userId) {
      // Mengambil data faktor kritis mingguan dari Flask
      fetch(`http://localhost:5000/weekly-critical-factors?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success" && data.top_critical_factors) {
            // Kita ambil top 3 faktor dari backend
            setFactors(data.top_critical_factors);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching weekly factors:", err);
          setLoading(false);
        });
    }
  }, [userId]);

  if (loading) return <div className={styles.cardContainer}>Menganalisis data mingguan...</div>;
  
  // Jika belum ada data tes sama sekali dalam seminggu
  if (factors.length === 0) return null;

  return (
    <div className={styles.cardContainer}>
      <h3 className={styles.title}>Faktor Kritis Minggu Ini</h3>
      <p className={styles.subtitle}>Faktor yang paling sering muncul dalam tes kamu:</p>
      
      <ul className={styles.factorList}>
        {factors.map((f, index) => (
          <li key={index} className={styles.factorItem}>
            <span className={styles.factorName}>{f.factor_name}</span>
            {/* Kita tampilkan berapa kali faktor ini muncul sebagai masalah */}
            <span className={styles.factorImpact}>
              {f.count}x Terdeteksi
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CriticalFactorCard;
import React,{ useState , useEffect } from 'react';
import styles from './DashboardSuggestion.module.css';

const DashboardSuggestion = () => {
  const [aiAdvice, setAiAdvice] = useState("Memuat Saran...");

  // Ambil user_id dari localStorage (pastikan formatnya UUID)
  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData?.id;

  useEffect(() => {
    if (userId) {
      // Panggil endpoint daily-suggestion
      fetch(`http://localhost:5000/daily-suggestion?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            setAiAdvice(data.suggestion); // Ambil field 'suggestion' dari JSON Flask
          } else {
            setAiAdvice(data.message || "Belum ada data check-in hari ini.");
          }
        })
        .catch(err => {
          console.error("Error fetching advice:", err);
          setAiAdvice("Gagal terhubung ke server MindSync.");
        });
    }
  }, [userId]);

  return (
    <div className={styles.suggestionContainer}>
      <p className={styles.text}>
        <span className={styles.highlight}>Saran MindSync:</span> {aiAdvice}
      </p>
    </div>
  );
};

export default DashboardSuggestion;
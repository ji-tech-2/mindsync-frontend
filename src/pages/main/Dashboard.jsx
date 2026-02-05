// 1. Tambahkan useState dan useEffect di baris paling atas
import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/api";
import CriticalFactorCard from "../../components/CriticalFactorCard"; // Pastikan path benar
import "../css/dashboard.css"; 

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const userName = user?.name || "Pengguna";
  const userId = user?.userId || user?.id || JSON.parse(localStorage.getItem("user") || "{}")?.userId;

  // State untuk API data
  const [factors, setFactors] = useState([]);
  const [dailySuggestion, setDailySuggestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);

  // Fetch critical factors dari API (7 hari terakhir)
  useEffect(() => {
    if (userId) {
      setLoading(true);
      const url = `${API_CONFIG.BASE_URL}/v0-1/weekly-critical-factors?user_id=${userId}&days=7`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          console.log("📦 Critical factors response:", data);
          
          if (data.status === "success") {
            // Format factors dengan description dari AI advice
            const factorsWithDesc = data.top_critical_factors.map(factor => {
              const factorAdvice = data.advice?.factors?.[factor.factor_name];
              const advices = factorAdvice?.advices || [];
              const description = advices.length > 0 ? advices.join(" ") : "Tidak ada saran tersedia.";
              
              return {
                factor_name: factor.factor_name,
                description: description,
                count: factor.count,
                avg_impact_score: factor.avg_impact_score
              };
            });
            
            setFactors(factorsWithDesc);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("❌ Error fetching factors:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId]);

  // Fetch daily suggestion dari API
  useEffect(() => {
    if (userId) {
      setLoadingSuggestion(true);
      const url = `${API_CONFIG.BASE_URL}/v0-1/daily-suggestion?user_id=${userId}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          console.log("💡 Daily suggestion response:", data);
          
          if (data.status === "success") {
            setDailySuggestion(data.suggestion);
          }
          setLoadingSuggestion(false);
        })
        .catch(err => {
          console.error("❌ Error fetching daily suggestion:", err);
          setLoadingSuggestion(false);
        });
    } else {
      setLoadingSuggestion(false);
    }
  }, [userId]);

  // Helper function untuk icon berdasarkan factor name
  const getIconForFactor = (factorName) => {
    const lowerName = factorName.toLowerCase();
    if (lowerName.includes('sleep') || lowerName.includes('tidur')) return '🛏️';
    if (lowerName.includes('exercise') || lowerName.includes('aktivitas') || lowerName.includes('olahraga')) return '🏃';
    if (lowerName.includes('screen') || lowerName.includes('layar')) return '📱';
    if (lowerName.includes('social') || lowerName.includes('sosial')) return '👥';
    if (lowerName.includes('stress') || lowerName.includes('stres')) return '😰';
    if (lowerName.includes('productivity') || lowerName.includes('produktivitas')) return '💼';
    return '💡';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-full">
        <div className="header-content">
          <h1 className="dashboard-greeting">Hello, {userName}!</h1>
          <p className="dashboard-subtitle">How are you feeling today?</p>
          <button
            className="cta-screening-btn" 
            onClick={() => navigate("/screening")}
          >
            Take Screening Now
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="cards-upper-section">
          <div className="cards-left-column">
            <div className="card card-small">Card 1</div>
            
            {/* Card 2 - Daily Suggestion */}
            <div className="card card-small daily-suggestion-card">
              <h3 className="daily-suggestion-title">Daily Suggestion</h3>
              {loadingSuggestion ? (
                <p>Memuat saran harian...</p>
              ) : dailySuggestion ? (
                <div className="daily-suggestion-content">
                  <p className="suggestion-text">{dailySuggestion}</p>
                </div>
              ) : (
                <p>Tidak ada saran tersedia. Lakukan screening untuk mendapatkan saran personal!</p>
              )}
            </div>
          </div>
          <div className="card card-large">Card 3</div>
        </div>

        <h2 className="section-title">Critical Factors</h2>
        <div className="cards-lower-section">
          {/* Mapping 3 slot agar layout tetap rapi */}
          {[0, 1, 2].map((index) => (
            <CriticalFactorCard 
              key={index} 
              data={factors[index]} 
              loading={loading} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}


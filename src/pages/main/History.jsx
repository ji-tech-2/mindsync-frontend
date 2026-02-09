import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WeeklyChart from "../../components/WeeklyChart";
import { fetchScreeningHistory, buildWeeklyChartFromHistory } from "../../config/api";
import "../css/history.css";

export default function History() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get user ID safely from different possible field names
  const getUserId = (user) => {
    return user?.userId || user?.id || user?.user_id || null;
  };

  // Check if user is logged in and fetch data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user_data"));
    
    if (!user) {
      navigate("/signIn");
      return;
    }

    const fetchHistory = async () => {
      const userId = getUserId(user);
      
      if (!userId) {
        console.warn("No user ID found in user object:", user);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const response = await fetchScreeningHistory(userId, 50, 0);
        
        if (response.success && response.data) {
          console.log("✅ Screening history loaded:", response.data);
          
          // Transform API data to match frontend format
          const transformedData = response.data.map(item => {
            // Normalize score to 0-100 range
            // Assuming prediction_score can be negative, we need to map it to 0-100
            let normalizedScore = item.prediction_score;
            
            // If score is already in 0-100 range, use it directly
            // Otherwise, normalize from possible negative values
            if (normalizedScore < 0) {
              normalizedScore = 0;
            } else if (normalizedScore > 100) {
              normalizedScore = 100;
            }
            
            return {
              id: item.prediction_id,
              predictionId: item.prediction_id,
              date: item.created_at,
              score: Math.round(normalizedScore), // Round to integer, clamped to 0-100
              category: item.health_level, // 'healthy', 'average', 'not healthy', 'dangerous'
              advice: item.advice,
              wellness_analysis: item.wellness_analysis
            };
          });
          
          setHistoryData(transformedData);
          
          // Build weekly chart from history data
          // Clamps each score to 0 before averaging (fixes negative raw scores)
          const chartData = buildWeeklyChartFromHistory(response.data);
          setWeeklyData(chartData);
        } else {
          console.warn("⚠️ History API not available:", response.error);
          setHistoryData([]);
        }
      } catch (error) {
        console.warn("⚠️ History API error (Kong Gateway not configured?):", error.message);
        setHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory().catch(err => {
      console.warn("⚠️ History loading failed:", err);
      setIsLoading(false);
    });
  }, [navigate]); // ✅ Hanya depend on navigate, bukan user object

  const getCategoryColor = (category) => {
    if(category == null) return '#718096'; // Default gray for null/undefined
    switch (category.toLowerCase()) {
      case 'healthy':
        return '#4CAF50';
      case 'average':
        return '#FFC107';
      case 'not healthy':
        return '#FF9800';
      case 'dangerous':
        return '#F44336';
      default:
        return '#718096';
    }
  };

  const getCategoryLabel = (category) => {
    if (!category) return 'Unknown';
    switch (category.toLowerCase()) {
      case 'healthy':
        return 'Sehat';
      case 'average':
        return 'Rata-rata';
      case 'not healthy':
        return 'Perlu Perhatian';
      case 'dangerous':
        return 'Berbahaya';
      default:
        return category;
    }
  };

  return (
    <div className="history-page">
      {/* Header */}
      <header className="history-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            ← Kembali ke Dashboard
          </button>
          <div className="header-title">
            <h1>Riwayat Screening</h1>
            <p>Lihat semua hasil tes kesehatan mental Anda</p>
          </div>
        </div>
      </header>

      <div className="history-container">
        {/* Left Side - Chart */}
        <div className="history-chart-section">
          <div className="chart-card">
            <WeeklyChart 
              data={weeklyData}
              title="📊 Tren 7 Hari Terakhir"
              dataKey="value"
              navigate={null} // Remove history button on this page
            />
          </div>

          {/* Summary Stats */}
          <div className="summary-stats">
            <h3>Ringkasan</h3>
            <div className="stat-item">
              <span className="stat-label">Total Tes:</span>
              <span className="stat-value">{historyData.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rata-rata Score:</span>
              <span className="stat-value">
                {historyData.length > 0 
                  ? Math.round(historyData.reduce((sum, item) => sum + Math.max(0, item.score), 0) / historyData.length)
                  : 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tes Terakhir:</span>
              <span className="stat-value">
                {historyData.length > 0 ? new Date(historyData[0].date).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - History List */}
        <div className="history-list-section">
          <div className="list-header">
            <h2>Semua Riwayat Screening</h2>
            <span className="result-count">{historyData.length} hasil</span>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Memuat riwayat...</p>
            </div>
          ) : historyData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Belum Ada Riwayat</h3>
              <p>Anda belum melakukan screening. Mulai sekarang untuk melihat riwayat Anda.</p>
              <button className="start-screening-btn" onClick={() => navigate("/screening")}>
                Mulai Screening
              </button>
            </div>
          ) : (
            <div className="history-items">
              {historyData.map((item) => (
                <div 
                  key={item.id} 
                  className="history-item"
                  onClick={() => navigate(`/result/${item.predictionId}`)}
                >
                  <div className="item-date">
                    <span className="date-icon">📅</span>
                    <span>{new Date(item.date).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Jakarta'
                    })}</span>
                  </div>
                  <div className="item-score-badge">
                    <span className="score-label">Score:</span>
                    <span className="score-number" style={{ color: getCategoryColor(item.category) }}>
                      {item.score}
                    </span>
                    <span className="score-max">/100</span>
                  </div>
                  <div className="item-category-badge" style={{ 
                    background: getCategoryColor(item.category),
                    color: 'white'
                  }}>
                    {getCategoryLabel(item.category)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WeeklyChart from "../../components/WeeklyChart";
import { fetchScreeningHistory, fetchWeeklyChart } from "../../config/api";
import "../css/history.css";

export default function History() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [historyData, setHistoryData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);

  // Get user ID safely from different possible field names
  const getUserId = (user) => {
    return user?.userId || user?.id || user?.user_id || null;
  };

  // Fetch weekly chart data
  useEffect(() => {
    const loadWeeklyChart = async () => {
      const userId = getUserId(user);
      
      if (!userId) {
        console.warn("No user ID found in user object:", user);
        setWeeklyData([]);
        setIsLoadingChart(false);
        return;
      }

      setIsLoadingChart(true);
      
      try {
        const response = await fetchWeeklyChart(userId, 7);
        
        if (response.success && response.data) {
          console.log("✅ Weekly chart data loaded:", response.data);
          setWeeklyData(response.data);
        } else {
          console.warn("⚠️ Chart API not available:", response.error);
          setWeeklyData([]);
        }
      } catch (error) {
        console.warn("⚠️ Chart API error (Kong Gateway not configured?):", error.message);
        setWeeklyData([]);
      } finally {
        setIsLoadingChart(false);
      }
    };

    loadWeeklyChart().catch(err => {
      console.warn("⚠️ Chart loading failed:", err);
      setIsLoadingChart(false);
    });
  }, [user]);

  // Fetch screening history from backend
  useEffect(() => {
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
          setHistoryData(response.data);
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
  }, [user]);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/signIn");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const getCategoryColor = (category) => {
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
                  ? Math.round(historyData.reduce((sum, item) => sum + item.score, 0) / historyData.length)
                  : 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tes Terakhir:</span>
              <span className="stat-value">
                {historyData.length > 0 ? new Date(historyData[0].date).toLocaleDateString('id-ID') : '-'}
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
                      minute: '2-digit'
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
                    {item.category}
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

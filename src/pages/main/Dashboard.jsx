import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/dashboard.css";
import WeeklyChart from "../../components/WeeklyChart";
import { fetchWeeklyChart } from "../../config/api"; 

export default function Dashboard({ isProtected }) { 
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));  
  
  useEffect(() => {
    if (isProtected && !user) {
      navigate("/signIn"); 
    } else if (!isProtected && user) {
      navigate("/dashboard");
    }
  }, [isProtected, user, navigate]);

  if (isProtected && !user) {
    return null; 
  }
  
  if (isProtected && user) {
      return <DashboardLoggedIn user={user} navigate={navigate} />;
  }
  
  if (!isProtected && user) {
      return null;
  }
  
  return <DashboardLoggedOut navigate={navigate} />;
}

// Tampilan Pengguna BELUM LOGIN 
function DashboardLoggedOut({ navigate }) {
  return (
    <div className="dashboard-container">
      
      <header className="dashboard-header logged-out-header">
        <div className="welcome-section">
          <h1>Selamat Datang</h1>
          <p>Mental Wellness Advisor</p>
          <p>Mulai perjalanan kesehatan mental Anda hari ini.</p>
        </div>
      </header>

      <div className="quick-actions logged-out-actions">
        <h2>Pilih Aksi Berikut</h2>
        <div className="actions-grid two-columns">
          
          <div className="action-card" onClick={() => navigate("/screening")}>
              <div className="action-icon" style={{ background: '#7da87b' }}>📝</div>
              <h3>Ambil Tes Kesehatan Mental</h3>
              <p>Mulai evaluasi kondisi mental Anda tanpa perlu akun.</p>
          </div>
          
          <div className="action-card" onClick={() => navigate("/signIn")}>
              <div className="action-icon" style={{ background: '#c9b896' }}>🔒</div>
              <h3>Sign In / Daftar</h3>
              <p>Masuk untuk menyimpan hasil dan riwayat Anda.</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}


// Tampilan Pengguna SUDAH LOGIN (Penuh)
function DashboardLoggedIn({ user, navigate }) {
    const [weeklyData, setWeeklyData] = useState([]);
    const [isLoadingChart, setIsLoadingChart] = useState(true);

    // Get user ID safely from different possible field names
    const getUserId = (user) => {
        return user?.userId || user?.id || user?.user_id || null;
    };

    // Fetch weekly chart data from backend
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

    return (
        <div className="dashboard-container">
            
            <header className="dashboard-header">
                <div className="welcome-section">
                    <h1>Dashboard</h1>
                    <p>Halo, <span>{user.username}</span>!</p>
                    <p>Selamat datang kembali di Mental Wellness Advisor.</p>
                </div>
                <button
                    className="logout-btn" 
                    onClick={() => {
                        localStorage.removeItem("user");
                        navigate("/"); 
                    }}
                >
                    Logout
                </button>
            </header>

            {/* Weekly Mental Health Chart Section */}
            <div className="chart-section">
                <WeeklyChart 
                    data={weeklyData}
                    title="📊 Nilai Mental Health 7 Hari Terakhir"
                    dataKey="value"
                    navigate={navigate}
                />
            </div>

            <div className="quick-actions">
                <h2>Mulai Aktivitas Cepat</h2>
                <div className="actions-grid">
                    <div className="action-card" onClick={() => navigate("/screening")}>
                        <div className="action-icon" style={{ background: '#7da87b' }}>📝</div>
                        <h3>Ambil Tes Kesehatan Mental</h3>
                        <p>Mulai evaluasi kondisi mental Anda saat ini.</p>
                    </div>
                    <div className="action-card" onClick={() => navigate("/profile")}>
                        <div className="action-icon" style={{ background: '#a67c52' }}>👤</div>
                        <h3>Lihat Profil Saya</h3>
                        <p>Lihat hasil, riwayat, dan informasi akun.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

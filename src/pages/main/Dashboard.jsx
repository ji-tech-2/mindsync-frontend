import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/dashboard.css";
import WeeklyChart from "../../components/WeeklyChart"; 

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
              <div className="action-icon" style={{ background: '#7953c9' }}>📝</div>
              <h3>Ambil Tes Kesehatan Mental</h3>
              <p>Mulai evaluasi kondisi mental Anda tanpa perlu akun.</p>
          </div>
          
          <div className="action-card" onClick={() => navigate("/signIn")}>
              <div className="action-icon" style={{ background: '#59c2e0' }}>🔒</div>
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
    // Generate 7 hari terakhir dari hari ini
    const generateLast7Days = () => {
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const result = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            result.unshift({
                day: days[date.getDay()],
                date: `${date.getDate()} ${months[date.getMonth()]}`,
                value: Math.floor(Math.random() * 100) // Random 0-100 (dummy data)
            });
        }
        
        return result;
    };

    // Mock data untuk testing - Nanti diganti dengan data dari API
    const [weeklyData, setWeeklyData] = useState(generateLast7Days());

    // TODO: Fetch data dari API
    // useEffect(() => {
    //   const fetchWeeklyData = async () => {
    //     try {
    //       const response = await fetch(`${API_CONFIG.BASE_URL}/user-mental-health/${user.id}`);
    //       const data = await response.json();
    //       setWeeklyData(data);
    //     } catch (error) {
    //       console.error('Error fetching weekly data:', error);
    //     }
    //   };
    //   fetchWeeklyData();
    // }, [user.id]);

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
                        <div className="action-icon" style={{ background: '#7953c9' }}>📝</div>
                        <h3>Ambil Tes Kesehatan Mental</h3>
                        <p>Mulai evaluasi kondisi mental Anda saat ini.</p>
                    </div>
                    <div className="action-card" onClick={() => navigate("/profile")}>
                        <div className="action-icon" style={{ background: '#59c2e0' }}>👤</div>
                        <h3>Lihat Profil Saya</h3>
                        <p>Lihat hasil, riwayat, dan informasi akun.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

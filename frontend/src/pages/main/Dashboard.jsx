import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../css/Dashboard.css"; 

export default function Dashboard({ isProtected }) { 
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));  
  useEffect(() => {
    if (isProtected && !user) {
      navigate("/signIn"); 
    }
  }, [isProtected, user, navigate]);

  if (isProtected && !user) {
    return null; 
  }
  
  if (isProtected && user) {
      return <DashboardLoggedIn user={user} navigate={navigate} />;
  }
  
  if (user) {
      navigate("/dashboard");
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
          
          <div className="action-card" onClick={() => navigate("/take-test")}>
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

            <div className="quick-actions">
                <h2>Mulai Aktivitas Cepat</h2>
                <div className="actions-grid">
                    <div className="action-card" onClick={() => navigate("/take-test")}>
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

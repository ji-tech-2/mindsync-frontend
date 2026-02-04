import { useNavigate } from "react-router-dom";
import "../css/dashboard.css"; 

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user_data"))?.name || "Pengguna";

  return (
    <div className="dashboard-container">
      
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Dashboard</h1>
          <p>Halo, <span>{user}</span>!</p>
          <p>Selamat datang kembali di Mental Wellness Advisor.</p>
        </div>
        <button
          className="logout-btn" 
          onClick={() => {
            localStorage.removeItem("user_data");
            navigate("/"); 
          }}
        >
          Logout
        </button>
      </header>

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

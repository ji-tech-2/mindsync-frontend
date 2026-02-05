import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "../css/dashboard.css"; 

export default function Home() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Show nothing while checking auth status
  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }
  
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

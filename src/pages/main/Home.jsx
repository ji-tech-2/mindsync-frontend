import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import "../css/dashboard.css"; 

export default function Home() {
  const navigate = useNavigate();
  const { user, isLoading, isLoggingOut } = useAuth();

  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (!isLoading && user && !isLoggingOut) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, isLoggingOut, navigate]);

  // Show nothing while checking auth status
  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }
  
  return (
    <div className="dashboard-container">
      
      <header className="dashboard-header logged-out-header">
        <div className="welcome-section">
          <h1>Welcome</h1>
          <p>Mental Wellness Advisor</p>
          <p>Start your mental health journey today.</p>
        </div>
      </header>

      <div className="quick-actions logged-out-actions">
        <h2>Choose an Action</h2>
        <div className="actions-grid two-columns">
          
          <div className="action-card" onClick={() => navigate("/screening")}>
              <div className="action-icon" style={{ background: '#7953c9' }}>📝</div>
              <h3>Take Mental Health Test</h3>
              <p>Start evaluating your mental condition without an account.</p>
          </div>
          
          <div className="action-card" onClick={() => navigate("/signIn")}>
              <div className="action-icon" style={{ background: '#59c2e0' }}>🔒</div>
              <h3>Sign In / Register</h3>
              <p>Sign in to save your results and history.</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/dashboard.css";
import WeeklyChart from "../../components/WeeklyChart";
import { fetchWeeklyChart } from "../../config/api"; 

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name || "Pengguna";

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
        {/* Upper Section: 2 cards left, 1 large card right */}
        <div className="cards-upper-section">
          <div className="cards-left-column">
            <div className="card card-small">Card 1</div>
            <div className="card card-small">Card 2</div>
          </div>
          <div className="card card-large">Card 3</div>
        </div>

        {/* Lower Section: 3 cards horizontal */}
        <h2 className="section-title">Critical Factors</h2>
        <div className="cards-lower-section">
          <div className="card">Card 4</div>
          <div className="card">Card 5</div>
          <div className="card">Card 6</div>
        </div>
      </div>

    </div>
  );
}

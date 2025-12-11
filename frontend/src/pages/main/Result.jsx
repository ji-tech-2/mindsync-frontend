import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/result.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    // Check if user is logged in (dari localStorage atau context)
    const userToken = localStorage.getItem('userToken');
    setIsLoggedIn(!!userToken);

    // Ambil screening data dari location state (dari screening page)
    const screeningData = location.state?.screeningData;
    
    if (screeningData) {
      // Simulasi call ke Flask ML endpoint
      fetchMLPrediction(screeningData);
    }
  }, [location]);

  const fetchMLPrediction = async (screeningData) => {
    try {
      // TODO: Replace dengan actual Flask endpoint
      // const response = await fetch('http://localhost:5000/api/predict', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(screeningData)
      // });
      // const data = await response.json();

      // Dummy data sesuai cluster (Cluster 9 - Dangerous)
      const dummyResult = {
        mentalWellnessScore: 2.24, // dari avg score
        category: 'Dangerous',
        clusterNumber: 9,
        topNegativeFactors: [
          {
            factor: 'Stress Level',
            value: 9.81,
            impact: 'Very High',
            description: 'Stress level ekstrem (9.8/10) adalah faktor utama penurunan kesehatan mental'
          },
          {
            factor: 'Screen Time',
            value: 10.62,
            impact: 'High',
            description: 'Penggunaan screen 10.6 jam/hari berkontribusi pada kelelahan dan stress'
          },
          {
            factor: 'Sleep Quality',
            value: 1.0,
            impact: 'Very Poor',
            description: 'Kualitas tidur sangat rendah (1/5) memperburuk kondisi mental'
          }
        ],
        rawMetrics: {
          screenTime: 10.62,
          workScreenHours: 2.22,
          leisureScreenHours: 8.39,
          sleepHours: 6.17,
          sleepQuality: 1.0,
          stressLevel: 9.81,
          productivity: 42.05,
          exerciseMinutes: 82.58,
          socialHours: 13.08
        }
      };

      setResultData(dummyResult);
    } catch (error) {
      console.error('Error fetching prediction:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score <= 12) return '#FF4757'; // Dangerous
    if (score <= 28.6) return '#FFA502'; // Not Healthy
    if (score <= 61.4) return '#FFD93D'; // Average
    return '#6BCB77'; // Healthy
  };

  const getCategoryLabel = (score) => {
    if (score <= 12) return 'Dangerous';
    if (score <= 28.6) return 'Not Healthy';
    if (score <= 61.4) return 'Average';
    return 'Healthy';
  };

  const handleLoginRedirect = () => {
     navigate('/signIn', { state: { from: '/result' } });
  };

  if (!resultData) {
    return <div className="result-loading">Loading prediction...</div>;
  }

  const score = resultData.mentalWellnessScore;
  const scoreColor = getScoreColor(score);

  return (
    <div className="result-container">
      {/* Header */}
      <div className="result-header">
        <h1>Your Mental Wellness Score</h1>
        <p>Based on your screening responses</p>
      </div>

      {/* Score Circle - Always Shown */}
      <div className="score-section">
        <div className="score-circle" style={{ borderColor: scoreColor }}>
          <div className="score-value">{score.toFixed(2)}</div>
          <div className="score-max">/100</div>
        </div>
        <div className="score-category" style={{ color: scoreColor }}>
          {getCategoryLabel(score)}
        </div>
      </div>

      {/* Content berdasarkan login status */}
      {!isLoggedIn ? (
        // NOT LOGGED IN - Minimal Info
        <div className="not-logged-section">
          <div className="alert-box">
            <h2>🔐 Want to see detailed insights?</h2>
            <p>
              Your mental wellness score is <strong>{score.toFixed(2)}/100</strong>
            </p>
            <p>
              To unlock personalized recommendations, top factors analysis, and professional advice tailored to your condition, 
              please log in or create an account.
            </p>
            <div className="button-group">
              <button className="btn btn-primary" onClick={handleLoginRedirect}>
                Login / Register
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>
          </div>

          {/* Teaser Info */}
          <div className="teaser-box">
            <h3>📊 What you'll discover with an account:</h3>
            <ul>
              <li>✓ Detailed analysis of top 3 factors affecting your mental health</li>
              <li>✓ Personalized advice and recommendations from experts</li>
              <li>✓ Progress tracking over time</li>
              <li>✓ Access to mental wellness resources</li>
              <li>✓ Connect with mental health professionals</li>
            </ul>
          </div>
        </div>
      ) : (
        // LOGGED IN - Full Details
        <div className="logged-section">
          {/* Top Negative Factors */}
          <div className="factors-section">
            <h2>🎯 Top 3 Factors Impacting Your Mental Health</h2>
            <div className="factors-grid">
              {resultData.topNegativeFactors.map((factor, index) => (
                <div key={index} className="factor-card">
                  <div className="factor-rank">#{index + 1}</div>
                  <h3>{factor.factor}</h3>
                  <div className="factor-value">{typeof factor.value === 'number' ? factor.value.toFixed(2) : factor.value}</div>
                  <span className="factor-impact" style={{ 
                    backgroundColor: factor.impact.includes('Very') || factor.impact.includes('High') ? '#FFE5E5' : '#FFF3CD',
                    color: factor.impact.includes('Very') || factor.impact.includes('High') ? '#C53030' : '#856404'
                  }}>
                    {factor.impact}
                  </span>
                  <p className="factor-description">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Advice Section */}
          <div className="advice-section">
            <h2>💡 Personalized Advice</h2>
            <div className="advice-cards">
              <div className="advice-card">
                <div className="advice-icon">😴</div>
                <h3>Sleep & Rest</h3>
                <p>
                  Your sleep quality needs immediate attention. Aim for 7-8 hours of quality sleep. 
                  Try establishing a consistent sleep schedule and reducing screen time 1 hour before bed.
                </p>
                <a href="#resources" className="advice-link">Learn more →</a>
              </div>

              <div className="advice-card">
                <div className="advice-icon">📱</div>
                <h3>Screen Time Management</h3>
                <p>
                  Consider reducing daily screen exposure. Follow the 20-20-20 rule: every 20 minutes, 
                  look at something 20 feet away for 20 seconds. Set boundaries for leisure screen usage.
                </p>
                <a href="#resources" className="advice-link">Learn more →</a>
              </div>

              <div className="advice-card">
                <div className="advice-icon">🧘</div>
                <h3>Stress Management</h3>
                <p>
                  Your stress levels are critical. Incorporate daily meditation, breathing exercises, 
                  or yoga. Consider speaking with a mental health professional for coping strategies.
                </p>
                <a href="#resources" className="advice-link">Learn more →</a>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="metrics-section">
            <h2>📈 Your Detailed Metrics</h2>
            <div className="metrics-grid">
              {Object.entries(resultData.rawMetrics).map(([key, value]) => {
                const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                const unit = getMetricUnit(key);
                return (
                  <div key={key} className="metric-item">
                    <span className="metric-label">{label}</span>
                    <span className="metric-value">{typeof value === 'number' ? value.toFixed(2) : value} {unit}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA untuk professional */}
          <div className="professional-section">
            <h3>Need Professional Support?</h3>
            <p>Consider scheduling a consultation with a mental health professional for personalized guidance.</p>
            <button className="btn btn-primary" onClick={() => navigate('/professionals')}>
              Find Mental Health Professional
            </button>
          </div>
        </div>
      )}

      {/* Footer Action */}
      <div className="result-footer">
        <button className="btn btn-outline" onClick={() => navigate('/screening')}>
          Take Assessment Again
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

const getMetricUnit = (metricKey) => {
  const units = {
    screenTime: 'hrs/day',
    workScreenHours: 'hrs/day',
    leisureScreenHours: 'hrs/day',
    sleepHours: 'hrs/night',
    sleepQuality: '/5',
    stressLevel: '/10',
    productivity: '/100',
    exerciseMinutes: 'mins/week',
    socialHours: 'hrs/week'
  };
  return units[metricKey] || '';
};

export default ResultPage;
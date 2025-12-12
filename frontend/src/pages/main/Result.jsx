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
        <div className="score-category" style={{ backgroundColor: scoreColor }}>
          {getCategoryLabel(score)}
        </div>
      </div>

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
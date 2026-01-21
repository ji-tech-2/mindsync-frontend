import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pollPredictionResult } from '../utils/pollingHelper.js';
import { API_CONFIG } from '../../config/api.js';
import Advice from '../../components/Advice';
import '../css/result.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const { predictionId } = useParams();
  const [resultData, setResultData] = useState(null);
  const [adviceData, setAdviceData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [pollingError, setPollingError] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      if (!predictionId) {
        alert("Data tidak ditemukan. Silakan lakukan screening ulang.");
        navigate('/screening');
        return;
      }

      setIsPolling(true);
      setPollingError(null);

      try {
        const pollResult = await pollPredictionResult(
          predictionId,
          API_CONFIG.BASE_URL,
          API_CONFIG.RESULT_ENDPOINT,
          API_CONFIG.POLLING.MAX_ATTEMPTS,
          API_CONFIG.POLLING.INTERVAL_MS
        );
        
        if (pollResult.success) {
          const prediction = pollResult.data;
          
          // Set prediction data (always available)
          setResultData({
            mentalWellnessScore: Math.max(0, parseFloat(prediction.prediction_score)),
            category: prediction.health_level,
            wellnessAnalysis: prediction.wellness_analysis
          });
          
          // If partial, show results but continue polling for advice
          if (pollResult.status === "partial") {
            console.log("📊 Showing partial results, continuing to poll for advice...");
            setIsPolling(false);
            setIsLoadingAdvice(true);
            
            // Continue polling for full result with advice
            pollForAdvice(predictionId);
          } 
          // If ready, set advice data
          else if (pollResult.status === "ready") {
            console.log("✅ Full results with advice ready");
            if (prediction.advice) {
              setAdviceData(prediction.advice);
            }
            setIsPolling(false);
            setIsLoadingAdvice(false);
          }
        }
      } catch (error) {
        console.error("❌ Polling error:", error);
        setPollingError(error.message);
        setIsPolling(false);
        setIsLoadingAdvice(false);
      }
    };

    // Function to continue polling for advice
    const pollForAdvice = async (predictionId) => {
      try {
        const pollResult = await pollPredictionResult(
          predictionId,
          API_CONFIG.BASE_URL,
          API_CONFIG.RESULT_ENDPOINT,
          API_CONFIG.POLLING.MAX_ATTEMPTS,
          API_CONFIG.POLLING.INTERVAL_MS
        );
        
        if (pollResult.success && pollResult.status === "ready") {
          const prediction = pollResult.data;
          if (prediction.advice) {
            console.log("✅ Advice data received:", prediction.advice);
            setAdviceData(prediction.advice);
          }
          setIsLoadingAdvice(false);
        }
      } catch (error) {
        console.error("⚠️ Failed to load advice:", error);
        setIsLoadingAdvice(false);
      }
    };

    loadResult();
  }, [predictionId, navigate]);

  const getScoreColor = (category) => {
    if (category === 'dangerous') return '#FF4757';
    if (category === 'not healthy') return '#FFA502';
    if (category === 'average') return '#FFD93D';
    return '#6BCB77';
  };

  const getCategoryLabel = (category) => {
    if (category === 'dangerous') return 'Dangerous';
    if (category === 'not healthy') return 'Not Healthy';
    if (category === 'average') return 'Average';
    return 'Healthy';
  };

  // Tampilkan Loading jika data belum siap atau sedang polling
  if (isPolling) {
    return (
      <div className="result-container">
        <div className="result-loading">
          <div className="loading-spinner"></div>
          <h2>Menganalisis Data Anda...</h2>
          <p>Mohon tunggu sebentar, kami sedang memproses hasil screening Anda</p>
          <div className="loading-dots">
            <span>.</span><span>.</span><span>.</span>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan Error jika polling gagal
  if (pollingError) {
    return (
      <div className="result-container">
        <div className="result-error">
          <h2>⚠️ Terjadi Kesalahan</h2>
          <p>{pollingError}</p>
          <div className="result-footer">
            <button className="btn btn-primary" onClick={() => navigate('/screening')}>
              Coba Lagi
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/')}>
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan Loading jika data belum siap
  if (!resultData) {
    return <div className="result-loading">Memuat hasil analisis...</div>;
  }

  const score = resultData.mentalWellnessScore;
  const scoreColor = getScoreColor(resultData.category);

  return (
    <div className="result-container">
      {/* Header */}
      <div className="result-header">
        <h1>Skor Kesehatan Mental Anda</h1>
        <p>Berdasarkan jawaban screening Anda</p>
      </div>

      {/* Score Circle - Always Shown */}
      <div className="score-section">
        <div className="score-circle" style={{ borderColor: scoreColor, color: scoreColor }}>
          <div className="score-value">{score.toFixed(1)}</div>
          <div className="score-max">/100</div>
        </div>
        <div className="score-category" style={{ backgroundColor: scoreColor }}>
          {getCategoryLabel(resultData.category)}
        </div>
      </div>

      {/* Advice Section */}
      <Advice resultData={resultData} adviceData={adviceData} isLoading={isLoadingAdvice} />
 
      {/* Footer Action */}
      <div className="result-footer">
        <button className="btn btn-primary" onClick={() => navigate('/screening')}>
          Ambil Tes Lagi
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
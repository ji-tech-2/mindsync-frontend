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
  const [isPolling, setIsPolling] = useState(false);
  const [pollingError, setPollingError] = useState(null);
  const [loadingStage, setLoadingStage] = useState(1); // 1: processing, 2: numeric ready, 3: complete
  const [hasPartialResult, setHasPartialResult] = useState(false);

  useEffect(() => {
    const loadResult = async () => {
      if (!predictionId) {
        alert("Data tidak ditemukan. Silakan lakukan screening ulang.");
        navigate('/screening');
        return;
      }

      setIsPolling(true);
      setPollingError(null);
      setLoadingStage(1);

      try {
        // Callback for partial results (Stage 1: Numeric model ready)
        const handlePartialResult = (partialData) => {
          console.log("📊 Partial result received:", partialData);
          setLoadingStage(2);
          setHasPartialResult(true);
          
          // Display numeric results immediately
          setResultData({
            mentalWellnessScore: Math.max(0, parseFloat(partialData.data.prediction_score)),
            category: partialData.data.health_level,
            wellnessAnalysis: null, // Advisory model still processing
            isPartial: true
          });
        };

        // Start polling with partial result callback
        const pollResult = await pollPredictionResult(
          predictionId,
          API_CONFIG.BASE_URL,
          API_CONFIG.RESULT_ENDPOINT,
          API_CONFIG.POLLING.MAX_ATTEMPTS,
          API_CONFIG.POLLING.INTERVAL_MS,
          handlePartialResult
        );
        
        if (pollResult.success) {
          console.log("✅ Complete result received:", pollResult);
          setLoadingStage(3);
          
          const prediction = pollResult.data;
          
          // Update with complete results (numeric + advisory)
          setResultData({
            mentalWellnessScore: Math.max(0, parseFloat(prediction.prediction_score)),
            category: prediction.health_level,
            wellnessAnalysis: prediction.wellness_analysis,
            isPartial: false
          });
          
          setIsPolling(false);
        }
      } catch (error) {
        console.error("❌ Polling error:", error);
        setPollingError(error.message);
        setIsPolling(false);
        setLoadingStage(1);
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
  if (isPolling && loadingStage === 1) {
    return (
      <div className="result-container">
        <div className="result-loading">
          <div className="loading-spinner"></div>
          <h2>Menganalisis Data Anda...</h2>
          <p>Mohon tunggu sebentar, kami sedang memproses hasil screening Anda</p>
          <div className="loading-progress">
            <div className="progress-step active">
              <span className="step-number">1</span>
              <span className="step-label">Menghitung Skor Mental</span>
            </div>
            <div className="progress-step">
              <span className="step-number">2</span>
              <span className="step-label">Menganalisis Hasil</span>
            </div>
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
      {resultData.isPartial ? (
        <div className="advice-loading-section">
          <div className="advice-loading-header">
            <div className="loading-spinner small"></div>
            <h3>Sedang Menganalisis Rekomendasi...</h3>
          </div>
          <p>AI kami sedang menyiapkan saran kesehatan mental yang dipersonalisasi untuk Anda</p>
          <div className="loading-progress">
            <div className="progress-step completed">
              <span className="step-number">✓</span>
              <span className="step-label">Skor Mental Selesai</span>
            </div>
            <div className="progress-step active">
              <span className="step-number">2</span>
              <span className="step-label">Menghasilkan Rekomendasi</span>
            </div>
          </div>
        </div>
      ) : (
        <Advice resultData={resultData} />
      )}
 
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
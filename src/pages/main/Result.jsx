import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { pollPredictionResult } from '../helpers/pollingHelper.js';
import { API_CONFIG } from '../../config/api.js';
import Advice from '../../components/Advice';
import '../css/result.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const { predictionId } = useParams();
  const { isAuthenticated } = useAuth();
  const [resultData, setResultData] = useState(null);
  const [adviceData, setAdviceData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [pollingError, setPollingError] = useState(null);
  const [loadingStage, setLoadingStage] = useState(1); // 1: processing, 2: numeric ready, 3: complete
  const [setHasPartialResult] = useState(false);

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
          
          // Set prediction data (always available)
          setResultData({
            mentalWellnessScore: Math.max(0, parseFloat(prediction.prediction_score)),
            category: prediction.health_level,
            wellnessAnalysis: prediction.wellness_analysis,
            isPartial: false
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
      let adviceAttempts = 0;
      const maxAdviceAttempts = API_CONFIG.POLLING.MAX_ATTEMPTS;
      const pollInterval = API_CONFIG.POLLING.INTERVAL_MS;

      const pollUntilReady = async () => {
        adviceAttempts++;
        console.log(`🔄 Polling for advice attempt ${adviceAttempts}/${maxAdviceAttempts}`);

        try {
          const pollResult = await pollPredictionResult(
            predictionId,
            API_CONFIG.BASE_URL,
            API_CONFIG.RESULT_ENDPOINT,
            1, // Only 1 attempt per call, we handle retries here
            pollInterval
          );
          
          if (pollResult.success && pollResult.status === "ready") {
            const prediction = pollResult.data;
            if (prediction.advice) {
              console.log("✅ Advice data received:", prediction.advice);
              setAdviceData(prediction.advice);
            }
            setIsLoadingAdvice(false);
            return;
          }

          // Still partial or processing, continue polling
          if (pollResult.status === "partial" || pollResult.status === "processing") {
            if (adviceAttempts >= maxAdviceAttempts) {
              console.warn("⚠️ Timeout waiting for advice");
              setIsLoadingAdvice(false);
              return;
            }
            
            // Wait and poll again
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            return pollUntilReady();
          }
        } catch (error) {
          console.error("⚠️ Failed to load advice:", error);
          setIsLoadingAdvice(false);
        }
      };

      pollUntilReady();
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

      {/* Advice Section - Only for authenticated users */}
      {isAuthenticated ? (
        <Advice resultData={resultData} adviceData={adviceData} isLoading={isLoadingAdvice} />
      ) : (
        <div className="advice-locked">
          <h3>🔒 Saran Personal Terkunci</h3>
          <p>Masuk atau daftar untuk melihat saran kesehatan mental yang dipersonalisasi berdasarkan hasil Anda.</p>
          <div className="auth-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/signIn')}>
              Masuk
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/register')}>
              Daftar
            </button>
          </div>
        </div>
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
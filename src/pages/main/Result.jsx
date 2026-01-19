import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
// Pastikan path ini sesuai dengan lokasi file helper Anda
// Jika belum buat file helper, scroll ke bawah untuk lihat caranya
import { getFromSession } from '../utils/sessionHelper.js'; 
import { pollPredictionResult } from '../utils/pollingHelper.js';
import { API_CONFIG } from '../../config/api.js';
import Advice from '../../components/Advice';
import '../css/result.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { predictionId } = useParams();
  const [resultData, setResultData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingError, setPollingError] = useState(null);

  const processData = (incomingData) => {
    // incomingData strukturnya: { raw: {...}, transformed: {...}, prediction: {...} }
    const prediction = incomingData.prediction;

    // Siapkan data untuk State React
    // Pastikan score tidak kurang dari 0 (tidak minus)
    const formattedResult = {
      mentalWellnessScore: Math.max(0, parseFloat(prediction.prediction_score)),
      category: prediction.health_level,
      wellnessAnalysis: prediction.wellness_analysis
    };

    setResultData(formattedResult);
  };

  useEffect(() => {
    const loadResult = async () => {
      // 1. Coba ambil data dari navigasi (state)
      let data = location.state;

      // 2. Jika tidak ada di state (misal karena refresh), ambil dari Session Storage
      if (!data) {
        console.log("State kosong, mengambil dari Session Storage...");
        data = getFromSession("screeningData");
      }

      // 3. Jika tidak ada data sama sekali, redirect ke screening
      if (!data) {
        alert("Data tidak ditemukan. Silakan lakukan screening ulang.");
        navigate('/screening');
        return;
      }

      // 4. Check if we need to poll for results (has predictionId)
      // Priority: URL params > state > session storage
      const activePredictionId = predictionId || data?.predictionId;
      
      if (activePredictionId) {
        console.log("🔄 Starting polling for prediction:", activePredictionId);
        setIsPolling(true);
        setPollingError(null);

        try {
          // Poll the result endpoint
          const pollResult = await pollPredictionResult(
            activePredictionId,
            API_CONFIG.BASE_URL,
            API_CONFIG.RESULT_ENDPOINT,
            API_CONFIG.POLLING.MAX_ATTEMPTS,
            API_CONFIG.POLLING.INTERVAL_MS
          );
          
          if (pollResult.success) {
            console.log("✅ Polling complete, result received:", pollResult.data);
            
            // Process and display the result
            processData({
              raw: data.raw || data.inputData,
              transformed: data.transformed || data.transformedData,
              prediction: pollResult.data
            });
            
            // Update session with final result
            getFromSession("screeningData").prediction = pollResult.data;
            
            setIsPolling(false);
          }
        } catch (error) {
          console.error("❌ Polling error:", error);
          setPollingError(error.message);
          setIsPolling(false);
        }
      } else if (data.prediction) {
        // 5. Direct result (no polling needed)
        console.log("✅ Direct result available");
        processData(data);
      } else {
        // 6. Invalid data structure
        alert("Format data tidak valid. Silakan lakukan screening ulang.");
        navigate('/screening');
      }
    };

    loadResult();
  }, [location, navigate]);

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
      <Advice resultData={resultData} />
 
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
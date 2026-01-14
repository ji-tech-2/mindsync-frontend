import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Pastikan path ini sesuai dengan lokasi file helper Anda
// Jika belum buat file helper, scroll ke bawah untuk lihat caranya
import { getFromSession } from '../utils/sessionHelper.js'; 
import Advice from '../../components/Advice';
import '../css/result.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    // 1. Coba ambil data dari navigasi (state)
    let data = location.state;

    // 2. Jika tidak ada di state (misal karena refresh), ambil dari Session Storage
    if (!data) {
      console.log("State kosong, mengambil dari Session Storage...");
      data = getFromSession("screeningData");
    }

    // 3. Jika data ditemukan, proses untuk ditampilkan
    if (data) {
      processData(data);
    } else {
      // 4. Jika benar-benar tidak ada data, kembalikan ke halaman screening
      alert("Data tidak ditemukan. Silakan lakukan screening ulang.");
      navigate('/screening');
    }
  }, [location, navigate]);

  const processData = (incomingData) => {
    // incomingData strukturnya: { raw: {...}, transformed: {...}, prediction: {...} }
    
    // Ambil score dari response Flask dengan beberapa fallback key
    const prediction = incomingData.prediction;
    const predictionScore = prediction?.mental_wellness_index ||
                            prediction?.mental_wellness_index_0_100 ||
                            prediction?.score ||
                            prediction?.result ||
                            prediction?.prediction ||
                            (typeof prediction === 'number' ? prediction : 0);

    // Siapkan data untuk State React
    // Pastikan score tidak kurang dari 0 (tidak minus)
    const formattedResult = {
      mentalWellnessScore: Math.max(0, parseFloat(predictionScore)),
      category: getCategoryLabel(Math.max(0, predictionScore)),
      // Bisa dari raw (session) atau inputData (state navigate)
      rawInput: incomingData.raw || incomingData.inputData
    };

    setResultData(formattedResult);
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

  // Tampilkan Loading jika data belum siap
  if (!resultData) {
    return <div className="result-loading">Memuat hasil analisis...</div>;
  }

  const score = resultData.mentalWellnessScore;
  const scoreColor = getScoreColor(score);

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
          {resultData.category}
        </div>
      </div>

      {/* Advice Section */}
      <Advice />
 
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
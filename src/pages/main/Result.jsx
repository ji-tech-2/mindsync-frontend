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

  const processData = (incomingData) => {
    // incomingData strukturnya: { raw: {...}, transformed: {...}, prediction: {...} }
    const prediction = incomingData.prediction;

    // Siapkan data untuk State React
    // Pastikan score tidak kurang dari 0 (tidak minus)
    const formattedResult = {
      mentalWellnessScore: Math.max(0, parseFloat(prediction.prediction[0])),
      category: prediction.mental_health_category,
      wellnessAnalysis: prediction.wellness_analysis
    };

    setResultData(formattedResult);
  };

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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/screening.css";

// ============= FUNGSI TRANSFORM & KIRIM =============

function transformToJSON(screeningData) {
  const genderMap = {
    "Male": "Male",
    "Female": "Female",
    "Other": "Non-binary/Other"
  };

  const occupationMap = {
    "Employed": "Employed",
    "Unemployed": "Unemployed",
    "Student": "Student",
    "Freelancer": "Self-employed",
    "Other": "Self-employed"
  };

  const workModeMap = {
    "Remote": "Remote",
    "Hybrid": "Hybrid",
    "On-site": "In-person"
  };

  return {
    age: parseInt(screeningData.age),
    gender: genderMap[screeningData.gender] || screeningData.gender,
    occupation: occupationMap[screeningData.occupation] || screeningData.occupation,
    work_mode: workModeMap[screeningData.work_mode] || screeningData.work_mode,
    screen_time_hours: parseFloat(screeningData.screen_time_hours),
    work_screen_hours: parseFloat(screeningData.work_screen_hours),
    leisure_screen_hours: parseFloat(screeningData.leisure_screen_hours),
    sleep_hours: parseFloat(screeningData.sleep_hours),
    sleep_quality_1_5: parseInt(screeningData.sleep_quality_1_5),
    stress_level_0_10: parseFloat(screeningData.stress_level_0_10),
    productivity_0_100: parseFloat(screeningData.productivity_0_100),
    exercise_minutes_per_week: parseInt(screeningData.exercise_minutes_per_week),
    social_hours_per_week: parseFloat(screeningData.social_hours_per_week),
    mental_wellness_index_0_100: null
  };
}

async function sendToFlask(data, flaskURL = "http://localhost:5000/predict") {
  try {
      console.log(flaskURL)
    const response = await fetch(flaskURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };

  } catch (error) {
    console.error("Error sending to Flask:", error);
    return { success: false, error: error.message };
  }
}

// ============= FUNGSI SESSION STORAGE =============

// Simpan data ke session
function saveToSession(key, data) {
  try {
    const sessionData = {
      ...data,
      timestamp: new Date().toISOString(),
      session_id: generateSessionId()
    };

    // Simpan sebagai JSON string
    const dataString = JSON.stringify(sessionData);

    // Gunakan in-memory storage (bukan sessionStorage karena tidak didukung)
    window._appSession = window._appSession || {};
    window._appSession[key] = dataString;

    console.log("✅ Data saved to session:", key);
    return true;
  } catch (error) {
    console.error("❌ Error saving to session:", error);
    return false;
  }
}

// Generate unique session ID
function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============= COMPONENT =============

export default function Screening() {
  const navigate = useNavigate();

  const questions = [
    {
      key: "age",
      question: "Berapa usia Anda?",
      type: "number",
      placeholder: "Masukkan usia Anda",
      min: 16,
      max: 100
    },
    {
      key: "gender",
      question: "Apa jenis kelamin Anda?",
      type: "select",
      options: ["Male", "Female"]
    },
    {
      key: "occupation",
      question: "Apa status pekerjaan Anda saat ini?",
      type: "select",
      options: ["Employed", "Unemployed", "Student", "Freelancer", "Other"]
    },
    {
      key: "work_mode",
      question: "Bagaimana mode kerja Anda?",
      type: "select",
      options: ["Remote", "Hybrid", "On-site", "Unemployed"]
    },
    {
      key: "screen_time_hours",
      question: "Berapa total waktu screen time Anda per hari (dalam jam)?",
      type: "number",
      placeholder: "Contoh: 8",
      min: 0,
      max: 24
    },
    {
      key: "work_screen_hours",
      question: "Berapa jam screen time Anda untuk keperluan pekerjaan?",
      type: "number",
      placeholder: "Contoh: 6",
      min: 0,
      max: 24
    },
    {
      key: "leisure_screen_hours",
      question: "Berapa jam screen time Anda untuk hiburan?",
      type: "number",
      placeholder: "Contoh: 2",
      min: 0,
      max: 24
    },
    {
      key: "sleep_hours",
      question: "Berapa jam rata-rata waktu tidur Anda setiap hari?",
      type: "number",
      placeholder: "Contoh: 7",
      min: 0,
      max: 24
    },
    {
      key: "sleep_quality_1_5",
      question: "Bagaimana kualitas tidur Anda (skala 1–5)?",
      type: "select",
      options: [1, 2, 3, 4, 5]
    },
    {
      key: "stress_level_0_10",
      question: "Seberapa tinggi tingkat stres Anda (skala 0–10)?",
      type: "number",
      placeholder: "0 = tidak stres, 10 = sangat stres",
      min: 0,
      max: 10
    },
    {
      key: "productivity_0_100",
      question: "Bagaimana tingkat produktivitas Anda (0–100)?",
      type: "number",
      placeholder: "Contoh: 75",
      min: 0,
      max: 100
    },
    {
      key: "exercise_minutes_per_week",
      question: "Berapa menit Anda berolahraga per minggu?",
      type: "number",
      placeholder: "Contoh: 150",
      min: 0,
      max: 10080
    },
    {
      key: "social_hours_per_week",
      question: "Berapa jam Anda bersosialisasi per minggu?",
      type: "number",
      placeholder: "Contoh: 10",
      min: 0,
      max: 168
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allAnswers, setAllAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const validateInput = (value, question) => {
    if (!value) {
      return "Jawaban tidak boleh kosong!";
    }

    if (question.type === "number") {
      const num = Number(value);

      if (question.min !== undefined && num < question.min) {
        return `Nilai minimal adalah ${question.min}`;
      }

      if (question.max !== undefined && num > question.max) {
        return `Nilai maksimal adalah ${question.max}`;
      }
    }

    return "";
  };

  const onInputChange = (e) => {
    setCurrentAnswer(e.target.value);
    setErrorMsg("");
  };

  const onNext = async () => {
    const error = validateInput(currentAnswer, currentQ);

    if (error) {
      setErrorMsg(error);
      return;
    }

    const updatedAnswers = {
      ...allAnswers,
      [currentQ.key]: currentAnswer
    };
    setAllAnswers(updatedAnswers);

    if (isLastQuestion) {
      setIsLoading(true);

      try {
        // 1. Transform data
        const transformedData = transformToJSON(updatedAnswers);
        console.log("📤 Data yang dikirim ke Flask:", transformedData);

        // 2. Kirim ke Flask API
        const result = await sendToFlask(transformedData, "http://139.59.109.5:8000/v0-1/model-predict");

        if (result.success) {
          console.log("✅ Response dari Flask:", result.data);
          saveToSession("screeningData", {
              raw: updatedAnswers,
              transformed: transformedData,
              prediction: result.data
          });


          // 3. Navigate ke Result page dengan response dari Flask
          navigate("/result", {
            state: {
              prediction: result.data,
              inputData: updatedAnswers,
              transformedData: transformedData
            }
          });
        } else {
          // Gagal kirim ke Flask
          setErrorMsg("Gagal mengirim data ke server: " + result.error);
          setIsLoading(false);
        }

      } catch (error) {
        console.error("Error:", error);
        setErrorMsg("Terjadi kesalahan: " + error.message);
        setIsLoading(false);
      }

    } else {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer("");
    }
  };

  const onBack = () => {
    setErrorMsg("");
    const prevIndex = currentIndex - 1;
    const prevKey = questions[prevIndex].key;

    setCurrentIndex(prevIndex);
    setCurrentAnswer(allAnswers[prevKey] || "");
  };

  return (
    <div className="screening-wrapper">
      <div className="screening-container">

        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="question-counter">
          Pertanyaan {currentIndex + 1} dari {questions.length}
        </div>

        <h2>{currentQ.question}</h2>

        <div className="input-container">

          {currentQ.type === "number" && (
            <input
              type="number"
              value={currentAnswer}
              onChange={onInputChange}
              placeholder={currentQ.placeholder}
              min={currentQ.min}
              max={currentQ.max}
              className={errorMsg ? "input-error" : ""}
              disabled={isLoading}
            />
          )}

          {currentQ.type === "select" && (
            <select
              value={currentAnswer}
              onChange={onInputChange}
              className={errorMsg ? "input-error" : ""}
              disabled={isLoading}
            >
              <option value="">-- Pilih salah satu --</option>
              {currentQ.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {errorMsg && (
            <div className="error-message">{errorMsg}</div>
          )}

        </div>

        <div className="button-container">
          {currentIndex > 0 && !isLoading && (
            <button className="btn-back" onClick={onBack}>
              Kembali
            </button>
          )}

          <button
            className={`btn-next ${currentIndex === 0 ? 'single-button' : ''}`}
            onClick={onNext}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : (isLastQuestion ? 'Selesai' : 'Lanjut')}
          </button>
        </div>
        
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/screening.css";
import { API_CONFIG, API_URLS } from "../../config/api";

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
    "Retired": "Unemployed",
    "Other": "Self-employed"
  };

  const workModeMap = {
    "Remote": "Remote",
    "Hybrid": "Hybrid",
    "On-site": "In-person",
    "Unemployed": "Unemployed"
  };

  return {
    age: parseInt(screeningData.age),
    gender: genderMap[screeningData.gender] || screeningData.gender,
    occupation: occupationMap[screeningData.occupation] || screeningData.occupation,
    work_mode: workModeMap[screeningData.work_mode] || screeningData.work_mode,
    // screen_time_hours: parseFloat(screeningData.screen_time_hours),
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

// function saveToSession(key, data) {
//   try {
//     const sessionData = {
//       ...data,
//       timestamp: new Date().toISOString(),
//       session_id: generateSessionId()
//     };

//     // Simpan sebagai JSON string
//     const dataString = JSON.stringify(sessionData);

//     // Gunakan in-memory storage (bukan sessionStorage karena tidak didukung)
//     window._appSession = window._appSession || {};
//     window._appSession[key] = dataString;

//     console.log("✅ Data saved to session:", key);
//     return true;
//   } catch (error) {
//     console.error("❌ Error saving to session:", error);
//     return false;
//   }
// }

// // Generate unique session ID
// function generateSessionId() {
//   return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
// }

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
      options: ["Employed", "Unemployed", "Student", "Freelancer", "Retired"]
    },
    {
      key: "work_mode",
      question: "Bagaimana mode kerja Anda?",
      type: "select",
      options: ["Remote", "Hybrid", "On-site", "Unemployed"]
    },
    // {
    //   key: "screen_time_hours",
    //   question: "Berapa total waktu screen time Anda per hari (dalam jam)?",
    //   type: "number",
    //   placeholder: "Contoh: 8",
    //   min: 0,
    //   max: 24
    // },
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

  // Helper function to check if a question should be skipped
  const shouldSkipQuestion = (questionIndex, answers) => {
    const question = questions[questionIndex];
    
    // Include current answer if checking current or future questions
    const answersToCheck = {
      ...answers,
      ...(currentAnswer && currentQ ? { [currentQ.key]: currentAnswer } : {})
    };
    
    // Skip work_mode and work_screen_hours if occupation is Unemployed or Retired
    if ((question.key === "work_mode" || question.key === "work_screen_hours") && 
        (answersToCheck.occupation === "Unemployed" || answersToCheck.occupation === "Retired")) {
      return true;
    }
    
    return false;
  };

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

  // Find next non-skipped question index
  const findNextQuestionIndex = (fromIndex, answers) => {
    let nextIndex = fromIndex + 1;
    while (nextIndex < questions.length && shouldSkipQuestion(nextIndex, answers)) {
      nextIndex++;
    }
    return nextIndex;
  };

  // Find previous non-skipped question index
  const findPreviousQuestionIndex = (fromIndex, answers) => {
    let prevIndex = fromIndex - 1;
    while (prevIndex >= 0 && shouldSkipQuestion(prevIndex, answers)) {
      prevIndex--;
    }
    return prevIndex;
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

    // Auto-set work_mode and work_screen_hours if occupation is Unemployed or Retired
    if (currentQ.key === "occupation" && (currentAnswer === "Unemployed" || currentAnswer === "Retired")) {
      updatedAnswers.work_mode = "Unemployed";
      updatedAnswers.work_screen_hours = "0";
    }

    setAllAnswers(updatedAnswers);

    if (isLastQuestion) {
      setIsLoading(true);

      try {
        // 1. Transform data
        const transformedData = transformToJSON(updatedAnswers);
        console.log("📤 Data yang dikirim ke Flask:", transformedData);

        // 2. Kirim ke Flask API
        const result = await sendToFlask(transformedData, API_URLS.predict);

        if (result.success) {
          navigate(`/result/${result.data.prediction_id}`);
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
      const nextIndex = findNextQuestionIndex(currentIndex, updatedAnswers);
      setCurrentIndex(nextIndex);
      setCurrentAnswer("");
    }
  };

  const onBack = () => {
    setErrorMsg("");
    const prevIndex = findPreviousQuestionIndex(currentIndex, allAnswers);
    
    // Safety check to prevent going below 0
    if (prevIndex < 0) return;
    
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
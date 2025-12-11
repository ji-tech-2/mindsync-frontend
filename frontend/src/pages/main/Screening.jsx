import { useState } from "react";
import "../css/screening.css";

export default function Screening() {
  // Data pertanyaan dengan validasi
  const questions = [
    {
      key: "age",
      question: "Berapa usia Anda?",
      type: "number",
      placeholder: "Masukkan usia Anda",
      min: 13,
      max: 100
    },
    {
      key: "gender",
      question: "Apa jenis kelamin Anda?",
      type: "select",
      options: ["Male", "Female", "Other"]
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
      options: ["Remote", "Hybrid", "On-site"]
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

  // State management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allAnswers, setAllAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Validasi input
  const validateInput = (value, question) => {
    // Cek kosong
    if (!value) {
      return "Jawaban tidak boleh kosong!";
    }

    // Validasi untuk number type
    if (question.type === "number") {
      const num = Number(value);
      
      if (question.min !== undefined && num < question.min) {
        return `Nilai minimal adalah ${question.min}`;
      }
      
      if (question.max !== undefined && num > question.max) {
        return `Nilai maksimal adalah ${question.max}`;
      }
    }

    return ""; // Valid
  };

  // Handler ketika user input berubah
  const onInputChange = (e) => {
    setCurrentAnswer(e.target.value);
    setErrorMsg(""); // Hapus error saat user mulai ketik
  };

  // Handler tombol Next/Selesai
  const onNext = () => {
    const error = validateInput(currentAnswer, currentQ);
    
    if (error) {
      setErrorMsg(error);
      return;
    }

    // Simpan jawaban
    const updatedAnswers = {
      ...allAnswers,
      [currentQ.key]: currentAnswer
    };
    setAllAnswers(updatedAnswers);

    // Pindah ke pertanyaan berikutnya atau selesai
    if (isLastQuestion) {
      console.log("Hasil Akhir:", updatedAnswers);
      alert("Terima kasih! Data Anda telah tersimpan.");
      
      // Reset ke awal
      setCurrentIndex(0);
      setAllAnswers({});
      setCurrentAnswer("");
    } else {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer("");
    }
  };

  // Handler tombol Back
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
        
        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        
        {/* Counter */}
        <div className="question-counter">
          Pertanyaan {currentIndex + 1} dari {questions.length}
        </div>

        {/* Pertanyaan */}
        <h2>{currentQ.question}</h2>
        
        {/* Input Field */}
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
            />
          )}

          {currentQ.type === "select" && (
            <select
              value={currentAnswer}
              onChange={onInputChange}
              className={errorMsg ? "input-error" : ""}
            >
              <option value="">-- Pilih salah satu --</option>
              {currentQ.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
          
          {/* Pesan Error */}
          {errorMsg && (
            <div className="error-message">{errorMsg}</div>
          )}
          
        </div>

        {/* Tombol Navigasi */}
        <div className="button-container">
          {currentIndex > 0 && (
            <button className="btn-back" onClick={onBack}>
              Kembali
            </button>
          )}
          
          <button 
            className={`btn-next ${currentIndex === 0 ? 'single-button' : ''}`}
            onClick={onNext}
          >
            {isLastQuestion ? 'Selesai' : 'Lanjut'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
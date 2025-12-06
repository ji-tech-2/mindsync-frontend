import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/register.css";

export default function Register() {
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
    dob: "",
    gender: "",
    occupation: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Tambahkan state loading

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); // Mulai loading
    setMessage("Processing registration...");

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();
      setLoading(false); // Hentikan loading setelah respons

      if (res.ok) {
        setMessage("Registration successful! Welcome aboard.");
        // Note: Sebaiknya simpan token/data user yang relevan, bukan objek result penuh jika tidak diperlukan.
        localStorage.setItem("user", JSON.stringify(result)); 
        setIsRegistered(true);
      } else {
        setMessage(result.message || "Registration failed. Please check your form data.");
        setIsRegistered(false);
      }
    } catch (err) {
      setLoading(false); // Hentikan loading jika ada error
      setMessage("Error connecting to server. Please ensure your backend is running.");
      setIsRegistered(false);
    }
  }

  const handleContinue = () => {
    navigate("/dashboard");
  };

  // Fungsi baru untuk navigasi ke Login
  const handleLoginClick = () => {
    navigate("/signIn");
  };

  // RENDER HALAMAN SUKSES
  if (isRegistered) {
    return (
      <div className="register-container success-screen">
        <h2>✅ Registrasi Berhasil!</h2>

        <p className="register-message success-message-box">{message}</p>

        <p>
          Akun Anda telah berhasil dibuat. Silakan lanjutkan ke dashboard untuk memulai perjalanan
          kesehatan mental Anda.
        </p>

        <button type="button" className="register-btn" onClick={handleContinue}>
          Lanjut ke Dashboard
        </button>
      </div>
    );
  }

  // Tentukan class untuk error message
  const messageClass =
    message && (message.includes("failed") || message.includes("error") || message.includes("Error"))
      ? "register-message error" // Ubah ke 'error' untuk konsistensi CSS
      : "register-message success"; // Default ke 'success' atau netral

  // RENDER FORM REGISTER
  return (
    <div className="register-container">
      <h2>Register</h2>

      <form onSubmit={handleSubmit} className="register-form">
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          required
        />

        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="" disabled>Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          name="occupation"
          placeholder="Occupation"
          value={form.occupation}
          onChange={handleChange}
          required
        />

        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Processing..." : "Register"}
        </button>
      </form>

      {message && (
        <div className="register-message-wrapper">
          <p className={messageClass}>{message}</p>
        </div>
      )}

      {/* Opsi Navigasi ke Login */}
      <div className="login-link-container">
        <p>Sudah punya akun?</p>
        <button type="button" onClick={handleLoginClick} className="login-link-btn">
          Masuk di sini.
        </button>
      </div>
    </div>
  );
}
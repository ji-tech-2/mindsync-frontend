// login
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState(""); // untuk tampilkan pesan
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    fetch("http://localhost:5000/signIn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);

        if (data.success) {
          setMessage("Login berhasil!");

          localStorage.setItem("user", JSON.stringify(data.data));

          navigate("/dashboard");
        } else {
          setMessage(data.message || "Login gagal");
        }
      })
      .catch((err) => {
        setLoading(false);
        setMessage("Terjadi kesalahan server");
        console.error(err);
      });
  };

  // Fungsi untuk mengarahkan ke halaman register
  const handleRegisterClick = () => {
    navigate("/register"); // Ganti dengan path halaman register Anda
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>

      {message && (
        <p className={`login-message ${message.includes('berhasil') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      <div className="register-link-container">
        <p>Belum punya akun?</p>
        <button type="button" onClick={handleRegisterClick} className="register-link-btn">
          Daftar di sini.
        </button>
      </div>
    </div>
  );
}
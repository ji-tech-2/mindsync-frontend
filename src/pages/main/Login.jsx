// login
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState(""); // untuk tampilkan pesan
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (username.length > 20) {
      newErrors.username = "Username must not exceed 20 characters";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");
    setErrors({});

    fetch("http://139.59.109.5:8000/v0-1/auth-login", {
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
        <div className="form-field">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors({ ...errors, username: "" });
            }}
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && <span className="error-text">{errors.username}</span>}
        </div>

        <div className="form-field">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

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
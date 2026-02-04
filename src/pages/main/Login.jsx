// login
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import apiClient, { API_CONFIG } from "../../config/api";
import "../css/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState(""); // untuk tampilkan pesan
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the page they were trying to visit, or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");
    setErrors({});

    // Backend response: { success: true, token: "jwt_token", type: "Bearer", user: { email, name, userId } }
    try {
      const response = await apiClient.post(API_CONFIG.AUTH_LOGIN, {
        email,
        password,
      });

      const data = response.data;
      setLoading(false);

      if (data.success && data.token) {
        setMessage("Login berhasil!");

        // Use AuthContext login to update global auth state
        login(data.token, data.user);
        
        // Redirect to the page they were trying to visit, or dashboard
        navigate(from, { replace: true });
      } else {
        setMessage(data.message || "Login gagal");
      }
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || "Terjadi kesalahan server";
      setMessage(errorMessage);
      console.error("Login error:", err);
    }
  };

  // Fungsi untuk mengarahkan ke halaman register
  const handleRegisterClick = () => {
    navigate("/register"); // Ganti dengan path halaman register Anda
  };

  return (
    <div className="login-wrapper">
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-field">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
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
    </div>
  );
}
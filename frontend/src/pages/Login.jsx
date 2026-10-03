import { useState } from "react";
import axios from "axios";
import "../App.css";

const API_BASE_URL = "http://172.20.245.27:5001";

function Login({ setPage, goBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // =========================================================
  // FORM VALIDATION
  // =========================================================
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // LOGIN
  // =========================================================
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          email: email.trim(),
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      console.log("Login success:", response.data);

      // Store token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Store user information
      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // Open dashboard
      setPage("dashboard");
    } catch (error) {
      console.error("Login error:", error);

      if (
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED"
      ) {
        alert(
          `Cannot connect to the HR Dashboard backend.\n\n` +
          `Please make sure the backend is running at:\n` +
          `${API_BASE_URL}`
        );

        return;
      }

      if (error.response?.status === 401) {
        alert(
          error.response?.data?.message ||
            "Invalid email address or password."
        );

        return;
      }

      if (error.response?.status === 403) {
        alert(
          error.response?.data?.message ||
            "Your account is not authorized to access this system."
        );

        return;
      }

      if (error.response?.status >= 500) {
        alert(
          error.response?.data?.message ||
            "Server error. Please try again later."
        );

        return;
      }

      alert(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EMAIL CHANGE
  // =========================================================
  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    if (errors.email) {
      setErrors((previous) => ({
        ...previous,
        email: "",
      }));
    }
  };

  // =========================================================
  // PASSWORD CHANGE
  // =========================================================
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);

    if (errors.password) {
      setErrors((previous) => ({
        ...previous,
        password: "",
      }));
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>HR IQ & EQ Dashboard</h1>

        <p className="login-subtitle">
          Sign in to review candidate IQ & EQ results
        </p>

        <form onSubmit={handleLogin} noValidate>
          {/* EMAIL */}
          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
              disabled={loading}
              className={errors.email ? "input-error" : ""}
            />

            {errors.email && (
              <span className="error-text">
                {errors.email}
              </span>
            )}
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              disabled={loading}
              className={errors.password ? "input-error" : ""}
            />

            {errors.password && (
              <span className="error-text">
                {errors.password}
              </span>
            )}
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* BACK BUTTON */}
        <button
          type="button"
          className="back-btn"
          onClick={goBack}
          disabled={loading}
        >
          ← Back
        </button>

        {/* SIGN UP */}
        <p className="link-text">
          New user?{" "}
          <span
            onClick={() => {
              if (!loading) {
                setPage("signup");
              }
            }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
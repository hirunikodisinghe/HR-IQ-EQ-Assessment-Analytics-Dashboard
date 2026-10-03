import { useState } from "react";
import axios from "axios";
import "../App.css";

const API_BASE_URL = "http://172.20.245.27:5001";

function Signup({ setPage, goBack }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !role || !password.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        password: password.trim(),
      });

      alert("Account created successfully");
      setPage("login");
    } catch (error) {
      console.error("Signup error:", error);

      if (error.code === "ERR_NETWORK") {
        alert(
          "Cannot connect to backend. Make sure backend is running on http://172.20.245.27:5000"
        );
        return;
      }

      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Create Account</h1>
        <p>Register a new HR Dashboard user</p>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <select
  value={role}
  onChange={(e) => setRole(e.target.value)}
  className={role === "" ? "placeholder-select" : "selected-select"}
>
  <option value="" disabled>
    Select Role
  </option>
  <option value="Admin">Admin</option>
  <option value="HR">HR</option>
</select>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSignup}>Create Account</button>

        <button className="back-btn" onClick={goBack}>
          ← Back
        </button>

        <p className="link-text" onClick={() => setPage("login")}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

export default Signup;
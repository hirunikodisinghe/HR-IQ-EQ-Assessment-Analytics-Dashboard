import { useState } from "react";
import axios from "axios";
import "../App.css";

const API_BASE_URL = "http://172.20.245.27:5001";

function ChangePassword({ goBack }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Password changed successfully");
      goBack();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card password-card">
        <button type="button" className="back-btn" onClick={goBack}>
          ← Back
        </button>

        <h1>Change Password</h1>
        <p className="auth-subtitle">
          Update your account password securely.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Current Password
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>

          <label>
            New Password
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Confirm New Password
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="primary-btn">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecoveryFrame } from "./ForgotPassword";
import "../auth-theme.css";
import "./ForgotPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 8)         { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    navigate("/signin");
  };

  return (
    <RecoveryFrame title="New Password" showFooter={false}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="rp-new">New Password</label>
          <input id="rp-new" className="auth-input" type="password"
            placeholder="At least 8 characters" value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }} />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="rp-confirm">Confirm Password</label>
          <input id="rp-confirm" className="auth-input" type="password"
            placeholder="••••••••" value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }} />
        </div>

        {error && <p className="auth-error-text" style={{ marginBottom: 12 }}>{error}</p>}

        <button type="submit" className="auth-btn-primary" style={{ marginTop: 4 }}>
          Reset Password
        </button>
      </form>
    </RecoveryFrame>
  );
}

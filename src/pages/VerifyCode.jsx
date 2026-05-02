import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecoveryFrame } from "./ForgotPassword";
import "../auth-theme.css";
import "./ForgotPassword.css";

export default function VerifyCode() {
  const navigate   = useNavigate();
  const inputsRef  = useRef([]);
  const [code, setCode]       = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...code];
    next[index] = digit;
    setCode(next);
    setMessage("");
    if (digit && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.some((d) => !d)) { setMessage("Enter the 4-digit verification code"); return; }
    navigate("/reset-password");
  };

  const isSent = message.includes("sent");

  return (
    <RecoveryFrame title="Verification">
      <form onSubmit={handleSubmit} noValidate>
        <p className="auth-label" style={{ marginBottom: 12, textAlign: "center" }}>
          Enter Verification Code
        </p>

        <div className="auth-code-grid" aria-label="Verification code">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(node) => { inputsRef.current[i] = node; }}
              className="auth-code-input"
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        <p className="auth-resend-row" style={{ marginTop: 14 }}>
          Didn't receive a code?{" "}
          <button type="button" className="auth-btn-ghost"
            onClick={() => setMessage("A new verification code has been sent.")}>
            Resend
          </button>
        </p>

        {message && (
          <p className={isSent ? "auth-success-text" : "auth-error-text"}
             style={{ marginBottom: 12, textAlign: "center" }}>
            {message}
          </p>
        )}

        <button type="submit" className="auth-btn-primary" style={{ marginTop: 6 }}>
          Verify
        </button>
      </form>
    </RecoveryFrame>
  );
}
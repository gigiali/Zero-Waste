import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecoveryFrame } from "./ForgotPassword";
import "../auth-theme.css";
import "./ForgotPassword.css";

export default function VerifyCode() {
  const navigate  = useNavigate();
  const inputsRef = useRef([]);
  const [code, setCode]         = useState(["", "", "", "", "", ""]);
  const [message, setMessage]   = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleResend = async () => {
    const email = sessionStorage.getItem("passwordResetEmail");
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setMessage("A new verification code has been sent.");
      } else {
        setMessage("Failed to resend code. Please try again.");
      }
    } catch {
      setMessage("Network error. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.some((d) => !d)) { setMessage("Enter the 6-digit verification code"); return; }

    setIsLoading(true);
    try {
      const email = sessionStorage.getItem("passwordResetEmail");
      const phone = sessionStorage.getItem("passwordResetPhone");
      const verificationCode = code.join("");

      const response = await fetch("/api/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          code: verificationCode,
          ...(email ? { email } : { phone }),
        }),
      });
      const data = await response.json();

      if (response.ok) {
        navigate("/reset-password");
      } else {
        setMessage(data.message || "Invalid verification code");
      }
    } catch (err) {
      console.error("Verify code error:", err);
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          <button type="button" className="auth-btn-ghost" onClick={handleResend}>
            Resend
          </button>
        </p>

        {message && (
          <p
            className={isSent ? "auth-success-text" : "auth-error-text"}
            style={{ marginBottom: 12, textAlign: "center" }}
          >
            {message}
          </p>
        )}

        <button type="submit" className="auth-btn-primary" style={{ marginTop: 6 }} disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </RecoveryFrame>
  );
}

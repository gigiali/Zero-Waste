import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RecoveryFrame } from "./ForgotPassword";
import "../auth-theme.css";
import "./ForgotPassword.css";

export default function VerifyCode() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputsRef = useRef([]);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
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
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setMessage(t("auth.codeResent"));
      } else {
        setMessage(t("auth.failedResendCode"));
      }
    } catch {
      setMessage(t("auth.networkError"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.some((d) => !d)) {
      setMessage(t("auth.enterVerificationCodeError"));
      return;
    }

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const email = sessionStorage.getItem("passwordResetEmail");
      const verificationCode = code.join("");

      const response = await fetch("/api/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          reset_code: verificationCode,
          email: email,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        navigate("/reset-password");
      } else {
        setMessage(data.message || t("auth.invalidVerificationCode"));
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setMessage(t("auth.requestTimeout"));
      } else {
        setMessage(t("auth.networkError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isSent = message.includes("sent");

  return (
    <RecoveryFrame title={t("auth.verification")}>
      <form onSubmit={handleSubmit} noValidate>
        <p className="auth-label vc-instruction">
          {t("auth.enterVerificationCode")}
        </p>

        <div className="auth-code-grid" aria-label="Verification code">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(node) => {
                inputsRef.current[i] = node;
              }}
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

        <p className="auth-resend-row vc-resend">
          {t("auth.didntReceiveCode")}{" "}
          <button
            type="button"
            className="auth-btn-ghost"
            onClick={handleResend}
          >
            {t("auth.resendCode")}
          </button>
        </p>

        {message && (
          <p className={`vc-message ${isSent ? "auth-success-text" : "auth-error-text"}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          className="auth-btn-primary vc-submit"
          disabled={isLoading}
        >
          {isLoading ? t("auth.verifying") : t("auth.verify")}
        </button>
      </form>
    </RecoveryFrame>
  );
}

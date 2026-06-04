import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RecoveryFrame } from "./ForgotPassword";
import "../auth-theme.css";
import "./ForgotPassword.css";

const API_URL = "https://zero-waste-production.up.railway.app/api";
export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError(t("auth.passwordMinLength"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const email = sessionStorage.getItem("passwordResetEmail");

      // ✅ غيّر هنا
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          password,
          password_confirmation: confirmPassword,
          email,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        sessionStorage.removeItem("passwordResetEmail");
        navigate("/signin");
      } else {
        setError(data.message || t("auth.failedResetPassword"));
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setError(t("auth.requestTimeout"));
      } else {
        setError(t("auth.networkError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RecoveryFrame title={t("auth.newPassword")} showFooter={false}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="rp-new">
            {t("auth.newPassword")}
          </label>
          <input
            id="rp-new"
            className="auth-input"
            type="password"
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="rp-confirm">
            {t("auth.confirmPassword")}
          </label>
          <input
            id="rp-confirm"
            className="auth-input"
            type="password"
            placeholder={t("auth.confirmPasswordPlaceholder")}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
          />
        </div>

        {error && <p className="auth-error-text rp-error">{error}</p>}

        <button
          type="submit"
          className="auth-btn-primary rp-submit"
          disabled={isLoading}
        >
          {isLoading ? t("auth.resetting") : t("auth.resetPassword")}
        </button>
      </form>
    </RecoveryFrame>
  );
}

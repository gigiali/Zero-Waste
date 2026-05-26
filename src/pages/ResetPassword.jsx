import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RecoveryFrame } from "./ForgotPassword";
import "../auth-theme.css";
import "./ForgotPassword.css";

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
    try {
      const email = sessionStorage.getItem("passwordResetEmail");
      const phone = sessionStorage.getItem("passwordResetPhone");

      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          password,
          password_confirmation: confirmPassword,
          ...(email ? { email } : { phone }),
        }),
      });
      const data = await response.json();

      if (response.ok) {
        // Clear sessionStorage
        sessionStorage.removeItem("passwordResetEmail");
        sessionStorage.removeItem("passwordResetPhone");
        navigate("/signin");
      } else {
        setError(data.message || t("auth.failedResetPassword"));
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(t("auth.networkError"));
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

        {error && (
          <p className="auth-error-text" style={{ marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="auth-btn-primary"
          style={{ marginTop: 4 }}
          disabled={isLoading}
        >
          {isLoading ? t("auth.resetting") : t("auth.resetPassword")}
        </button>
      </form>
    </RecoveryFrame>
  );
}

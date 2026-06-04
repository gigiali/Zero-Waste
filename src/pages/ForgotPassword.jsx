import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../auth-theme.css";
import "./ForgotPassword.css";

const API_URL = "https://zero-waste-production.up.railway.app/api";
function RecoveryFrame({ title, children, showFooter = true }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label={title}>
        <div className="auth-card-body">
          <div className="auth-top-row">
            <button
              type="button"
              className="auth-back-btn"
              onClick={() => navigate(-1)}
              aria-label={t("auth.goBack")}
            >
              ‹
            </button>
            <h1>{title}</h1>
            <span aria-hidden="true" />
          </div>

          {children}

          {showFooter && (
            <div className="auth-footer">
              {t("auth.dontHaveAccount")}{" "}
              <button type="button" onClick={() => navigate("/signup")}>
                {t("auth.signUp")}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("auth.invalidEmail"));
      return;
    }

    sessionStorage.setItem("passwordResetEmail", email);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // ✅ غيّر هنا
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        navigate("/verify-code");
      } else {
        setError(data.message || t("auth.failedSendCode"));
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
    <RecoveryFrame title={t("auth.forgotPassword")}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="fp-email">
            {t("auth.emailAddress")}
          </label>
          <input
            id="fp-email"
            className="auth-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </div>

        {error && <p className="auth-error-text fp-error">{error}</p>}

        <button
          type="submit"
          className="auth-btn-primary fp-submit"
          disabled={isLoading}
        >
          {isLoading ? t("auth.sending") : t("auth.sendRecoveryCode")}
        </button>

        <div className="fp-back-row">
          <button
            type="button"
            className="auth-btn-ghost"
            onClick={() => navigate("/signin")}
          >
            {t("auth.backToSignIn")}
          </button>
        </div>
      </form>
    </RecoveryFrame>
  );
}

export { RecoveryFrame };

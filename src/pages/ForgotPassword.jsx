import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../auth-theme.css";
import "./ForgotPassword.css";

/* ─────────────────────────────────────────────────────────────────────────
   RecoveryFrame  —  shared shell for ForgotPassword / VerifyCode / ResetPassword
   ───────────────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────
   ForgotPassword
   ───────────────────────────────────────────────────────────────────────── */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mode, setMode] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Enter a valid email address");
        return;
      }
      sessionStorage.setItem("passwordResetEmail", email);
    } else {
      if (!/^\+?[0-9\s\-().]{7,20}$/.test(phone)) {
        setError("Enter a valid phone number");
        return;
      }
      sessionStorage.setItem("passwordResetPhone", phone);
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(mode === "email" ? { email } : { phone }),
      });
      const data = await response.json();

      if (response.ok) {
        navigate("/verify-code");
      } else {
        setError(data.message || "Failed to send verification code");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setEmail("");
    setPhone("");
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
          {isLoading ? t("auth.sendRecoveryCode") : t("auth.sendRecoveryCode")}
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../auth-theme.css";
import "./ForgotPassword.css";

/* ─────────────────────────────────────────────────────────────────────────
   RecoveryFrame  —  shared shell for ForgotPassword / VerifyCode / ResetPassword
   ───────────────────────────────────────────────────────────────────────── */
function RecoveryFrame({ title, children, showFooter = true }) {
  const navigate = useNavigate();

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label={title}>
        <div className="auth-card-body">
          <div className="auth-top-row">
            <button
              type="button"
              className="auth-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              ‹
            </button>
            <h1>{title}</h1>
            <span aria-hidden="true" />
          </div>

          {children}

          {showFooter && (
            <div className="auth-footer">
              Don't have an account?{" "}
              <button type="button" onClick={() => navigate("/signup")}>
                Sign up
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
  const [mode, setMode]   = useState("email");
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
        headers: { "Content-Type": "application/json", Accept: "application/json" },
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

  const switchMode = (m) => { setMode(m); setError(""); setEmail(""); setPhone(""); };

  return (
    <RecoveryFrame title="Forgot Password">
      <div className="auth-tabs" role="tablist" aria-label="Recovery method">
        <button type="button" role="tab" aria-selected={mode === "email"}
          className={`auth-tab ${mode === "email" ? "auth-tab--active" : ""}`}
          onClick={() => switchMode("email")}>
          Email
        </button>
        <button type="button" role="tab" aria-selected={mode === "phone"}
          className={`auth-tab ${mode === "phone" ? "auth-tab--active" : ""}`}
          onClick={() => switchMode("phone")}>
          Phone Number
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {mode === "email" ? (
          <div className="auth-field">
            <label className="auth-label" htmlFor="fp-email">Email Address</label>
            <input id="fp-email" className="auth-input" type="email"
              placeholder="you@example.com" value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }} />
          </div>
        ) : (
          <div className="auth-field">
            <label className="auth-label" htmlFor="fp-phone">Phone Number</label>
            <input id="fp-phone" className="auth-input" type="tel"
              placeholder="+20 10 1234 5678" value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(""); }} />
            <span className="auth-hint">We'll send a verification code to this number</span>
          </div>
        )}

        {error && <p className="auth-error-text fp-error">{error}</p>}

        <button type="submit" className="auth-btn-primary fp-submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Recovery Code"}
        </button>

        <div className="fp-back-row">
          <button type="button" className="auth-btn-ghost" onClick={() => navigate("/signin")}>
            Back to Sign In
          </button>
        </div>
      </form>
    </RecoveryFrame>
  );
}

export { RecoveryFrame };

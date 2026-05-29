import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useTranslation } from "react-i18next";
import Button from "../Components/Button";
import "../auth-theme.css";
import "./SignIn.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

function SkeletonSignIn() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="si-skeleton si-skeleton--title" />
          <div className="si-skeleton si-skeleton--subtitle" />
        </div>
        <div className="auth-card-body">
          <div className="si-skeleton-field">
            <div className="si-skeleton si-skeleton--label" />
            <div className="si-skeleton si-skeleton--input" />
          </div>
          <div className="si-skeleton-field">
            <div className="si-skeleton si-skeleton--label" />
            <div className="si-skeleton si-skeleton--input" />
          </div>
          <div className="si-skeleton si-skeleton--options" />
          <div className="si-skeleton si-skeleton--btn" />
        </div>
      </div>
    </main>
  );
}

function SignIn() {
  const { login } = useAuth();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors]         = useState({});
  const [isLoading, setIsLoading]   = useState(false);
  const [slowWarning, setSlowWarning] = useState(false);
  const [pageReady, setPageReady]   = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("rememberMe") === "true";
    if (saved) {
      setRememberMe(true);
      setEmail(localStorage.getItem("rememberedEmail") || "");
      setPassword(localStorage.getItem("rememberedPassword") || "");
    }
  }, []);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email)                     newErrors.email    = "Email is required";
    else if (!validateEmail(email)) newErrors.email    = "Enter a valid email address";
    if (!password)                  newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsLoading(true);
    setSlowWarning(false);
    timeoutRef.current = setTimeout(() => setSlowWarning(true), 10000);

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token, rememberMe);

        const userRole = data.user?.role_type || data.user?.role || "customer";

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
          localStorage.setItem("auth_token", data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userRole", userRole);
          sessionStorage.removeItem("auth_token");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("userRole");
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
          sessionStorage.setItem("auth_token", data.token);
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
          sessionStorage.setItem("userRole", userRole);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userRole");
        }

        if (userRole === "vendor") {
          navigate("/business/profile");
        } else if (userRole === "super_admin" || userRole === "manager" || userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        setErrors({
          general:
            response.status === 401 ? "Invalid email or password. Please try again." :
            response.status === 403 ? "Access denied. Please contact support." :
            data.message || "Login failed. Please try again.",
        });
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrors({ general: "Login failed. Please check your connection and try again." });
    } finally {
      clearTimeout(timeoutRef.current);
      setIsLoading(false);
      setSlowWarning(false);
    }
  };

  if (!pageReady) return <SkeletonSignIn />;

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue your journey</p>
        </div>

        <div className="auth-card-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="si-email">Email</label>
              <input
                id="si-email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
              />
              {errors.email && <span className="auth-error-text">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="si-password">Password</label>
              <input
                id="si-password"
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
              />
              {errors.password && <span className="auth-error-text">{errors.password}</span>}
            </div>

            <div className="si-options">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className="auth-btn-ghost si-forgot">
                Forgot password?
              </a>
            </div>

            {slowWarning && isLoading && (
              <div className="si-timeout-banner">
                ⏱ This is taking longer than expected — please wait or check your connection.
              </div>
            )}

            {errors.general && <div className="auth-error-box">{errors.general}</div>}

            <button type="submit" className="auth-btn-primary" disabled={isLoading}>
              {isLoading ? "Signing In…" : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <a href="/signup">Sign up</a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SignIn;
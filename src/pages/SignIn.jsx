import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import "../auth-theme.css";
import "./SignIn.css";

function SignIn() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors]       = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    if (!email)                  newErrors.email    = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Enter a valid email address";
    if (!password)               newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: new URLSearchParams({ email, password }).toString(),
      });
      const data = await response.json();

      if (response.ok) {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
          localStorage.setItem("auth_token", data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userRole", data.user.role);
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
          sessionStorage.setItem("userRole", data.user.role);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("userRole");
        }
        if (data.user.role === "vendor")      navigate("/business/profile");
        else if (data.user.role === "admin")  navigate("/admin");
        else                                  navigate("/home");
      } else {
        setErrors({
          general:
            response.status === 401 ? "Invalid email or password. Please try again." :
            response.status === 403 ? "Access denied. Please contact support." :
            data.message || "Login failed. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "Login failed. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        {/* ── header band ── */}
        <div className="auth-card-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue your journey</p>
        </div>

        {/* ── form body ── */}
        <div className="auth-card-body">
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="si-email">Email</label>
              <input id="si-email" className="auth-input" type="email"
                placeholder="you@example.com" value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} />
              {errors.email && <span className="auth-error-text">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="si-password">Password</label>
              <input id="si-password" className="auth-input" type="password"
                placeholder="••••••••" value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }} />
              {errors.password && <span className="auth-error-text">{errors.password}</span>}
            </div>

            {/* Options row */}
            <div className="si-options">
              <label className="auth-checkbox-label">
                <input type="checkbox" checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)} />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className="auth-btn-ghost si-forgot">
                Forgot password?
              </a>
            </div>

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

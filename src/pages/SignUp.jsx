import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../Components/Button";
import { useAuth } from "../Context/AuthContext";
import "../auth-theme.css";
import "./SignUp.css";

function SignUp() {
  const [activeRole, setActiveRole] = useState("customer");
  const navigate = useNavigate();
const { setBusinessStatus, login } = useAuth();  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    accepted_terms: false,
    role: "customer",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v) => /^[0-9]+$/.test(v) && v.length >= 10;

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = t("auth.nameRequired");
    if (!formData.email.trim()) e.email = t("auth.emailRequired");
    else if (!validateEmail(formData.email)) e.email = t("auth.invalidEmail");
    if (!formData.password.trim()) e.password = t("auth.passwordRequired");
else if (formData.password.length < 8)
  e.password = t("auth.passwordMinLength");
    if (!formData.phone.trim()) e.phone = t("auth.phoneRequired");
    else if (!validatePhone(formData.phone)) e.phone = t("auth.invalidPhone");
    if (!formData.address.trim()) e.address = t("auth.addressRequired");
    if (!formData.accepted_terms) e.accepted_terms = t("auth.termsRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        accepted_terms: formData.accepted_terms,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const apiUrl = import.meta.env.VITE_API_URL || "";
const response = await fetch(`${apiUrl}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(submitData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        if (data.token && data.user) {
  login(data.user, data.token);
  localStorage.setItem("userRole", data.user.role || formData.role);
}
        if (formData.role === "vendor") {
          navigate("/business-setup");
        } else {
          navigate("/home");
        }
      } else {
        if (response.status === 422 && data.errors) {
          const newErrors = {};
          Object.keys(data.errors).forEach((f) => {
            newErrors[f] = Array.isArray(data.errors[f])
              ? data.errors[f][0]
              : data.errors[f];
          });
          setErrors(newErrors);
        } else if (response.status === 409) {
          setErrors({
            general:
              "This email is already registered. Please sign in instead.",
          });
        } else if (response.status === 500) {
          setErrors({ general: "Server error. Please try again later." });
        } else {
          setErrors({
            general:
              data.message ||
              data.error ||
              "Registration failed. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.name === "AbortError") {
        setErrors({
          general:
            "Request timed out. Please check your connection and try again.",
        });
      } else if (
        error.message?.includes("fetch") ||
        error.message?.includes("network")
      ) {
        setErrors({
          general: "Network error. Please check your internet connection.",
        });
      } else {
        setErrors({ general: "Registration failed. Please try again later." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setFormData((p) => ({
      ...p,
      role: role === "business" ? "vendor" : "customer",
    }));
  };

  return (
    <main className="auth-page">
      <div className="auth-card su-card">
        <div className="auth-card-header">
          <h2>{t("auth.createAccount")}</h2>
          <p>
            {activeRole === "business"
              ? t("auth.listBusiness")
              : t("auth.joinCommunity")}
          </p>
        </div>

        <div className="auth-card-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="su-name">
                {t("auth.fullName")}
              </label>
              <input
                id="su-name"
                className="auth-input"
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              {errors.name && (
                <span className="auth-error-text">{errors.name}</span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="su-email">
                {t("auth.emailAddress")}
              </label>
              <input
                id="su-email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              {errors.email && (
                <span className="auth-error-text">{errors.email}</span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="su-password">
                {t("auth.password")}
              </label>
              <input
                id="su-password"
                className="auth-input"
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              {errors.password && (
                <span className="auth-error-text">{errors.password}</span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="su-address">
                {t("auth.address")}
              </label>
              <input
                id="su-address"
                className="auth-input"
                type="text"
                placeholder="123 Green St, Cairo"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
              {errors.address && (
                <span className="auth-error-text">{errors.address}</span>
              )}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="su-phone">
                {t("auth.phoneNumber")}
              </label>
              <input
                id="su-phone"
                className="auth-input"
                type="tel"
                placeholder="01012345678"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
              {errors.phone && (
                <span className="auth-error-text">{errors.phone}</span>
              )}
            </div>

            <div className="su-role-section">
              <p className="auth-label su-role-label">{t("auth.iAm")}</p>
              <div className="auth-role-switcher">
                <button
                  type="button"
                  className={`auth-role-btn ${activeRole === "customer" ? "auth-role-btn--active" : ""}`}
                  onClick={() => handleRoleChange("customer")}
                >
                  {t("auth.customer")}
                </button>
                <button
                  type="button"
                  className={`auth-role-btn ${activeRole === "business" ? "auth-role-btn--active" : ""}`}
                  onClick={() => handleRoleChange("business")}
                >
                  {t("auth.business")}
                </button>
              </div>
            </div>

            <div className="auth-field su-terms">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.accepted_terms}
                  onChange={(e) =>
                    handleInputChange("accepted_terms", e.target.checked)
                  }
                />
                <span>
                  {t("auth.termsAgreement")}{" "}
                  <a href="/terms" className="su-link">
                    Terms of Service
                  </a>{" "}
                  {t("common.and")}{" "}
                  <a href="/privacy" className="su-link">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.accepted_terms && (
                <span className="auth-error-text">{errors.accepted_terms}</span>
              )}
            </div>

            {errors.general && (
              <div className="auth-error-box">{errors.general}</div>
            )}

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? `${t("auth.createAccount")}…` : t("auth.register")}
            </button>
          </form>

          <div className="auth-footer">
            {t("auth.alreadyHaveAccount")}{" "}
            <a href="/signin">{t("auth.signIn")}</a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SignUp;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import "../auth-theme.css";
import "./SignUp.css";

function SignUp() {
  const [activeRole, setActiveRole] = useState("customer");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", address: "",
    accepted_terms: false, role: "customer",
  });
  const [errors, setErrors]     = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v) => /^[0-9]+$/.test(v) && v.length >= 10;

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim())                    e.name     = "Full name is required";
    if (!formData.email.trim())                   e.email    = "Email is required";
    else if (!validateEmail(formData.email))       e.email    = "Enter a valid email address";
    if (!formData.password.trim())                e.password = "Password is required";
    else if (formData.password.length < 6)         e.password = "Password must be at least 6 characters";
    if (!formData.phone.trim())                   e.phone    = "Phone number is required";
    else if (!validatePhone(formData.phone))       e.phone    = "Enter a valid phone number";
    if (!formData.address.trim())                 e.address  = "Address is required";
    if (!formData.accepted_terms)                 e.accepted_terms = "You must agree to the Terms and Privacy Policy";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const submitData = {
        name: formData.name, email: formData.email,
        password: formData.password, password_confirmation: formData.password,
        address: formData.address, phone: formData.phone,
        role: formData.role, accepted_terms: formData.accepted_terms,
      };
      const response = await fetch("https://stagnate-deferred-pork.ngrok-free.dev/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(submitData),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.token)  localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("userRole", data.user.role);
        }
        formData.role === "vendor" ? navigate("/business-setup") : navigate("/home");
      } else {
        if (response.status === 422 && data.errors) {
          const newErrors = {};
          Object.keys(data.errors).forEach((f) => { newErrors[f] = data.errors[f][0]; });
          setErrors(newErrors);
        } else {
          setErrors({ general: data.message || "Registration failed. Please try again." });
        }
      }
    } catch {
      setErrors({ general: "Registration failed. Please check your connection and try again." });
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
    setFormData((p) => ({ ...p, role: role === "business" ? "vendor" : "customer" }));
  };

  return (
    <main className="auth-page">
      <div className="auth-card su-card">
        {/* ── header band ── */}
        <div className="auth-card-header">
          <h2>Create Account</h2>
          <p>
            {activeRole === "business"
              ? "List your business and connect with customers"
              : "Join our community today"}
          </p>
        </div>

        {/* ── form body ── */}
        <div className="auth-card-body">
          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="su-name">Full Name</label>
              <input id="su-name" className="auth-input" type="text"
                placeholder="Jane Doe" value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)} />
              {errors.name && <span className="auth-error-text">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="su-email">Email</label>
              <input id="su-email" className="auth-input" type="email"
                placeholder="you@example.com" value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)} />
              {errors.email && <span className="auth-error-text">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="su-password">Password</label>
              <input id="su-password" className="auth-input" type="password"
                placeholder="At least 6 characters" value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)} />
              {errors.password && <span className="auth-error-text">{errors.password}</span>}
            </div>

            {/* Address */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="su-address">Address</label>
              <input id="su-address" className="auth-input" type="text"
                placeholder="123 Green St, Cairo" value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)} />
              {errors.address && <span className="auth-error-text">{errors.address}</span>}
            </div>

            {/* Phone */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="su-phone">Phone Number</label>
              <input id="su-phone" className="auth-input" type="tel"
                placeholder="01012345678" value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)} />
              {errors.phone && <span className="auth-error-text">{errors.phone}</span>}
            </div>

            {/* Role switcher */}
            <div className="su-role-section">
              <p className="auth-label su-role-label">I am a</p>
              <div className="auth-role-switcher">
                <button type="button"
                  className={`auth-role-btn ${activeRole === "customer" ? "auth-role-btn--active" : ""}`}
                  onClick={() => handleRoleChange("customer")}>
                  Customer
                </button>
                <button type="button"
                  className={`auth-role-btn ${activeRole === "business" ? "auth-role-btn--active" : ""}`}
                  onClick={() => handleRoleChange("business")}>
                  Business
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="auth-field su-terms">
              <label className="auth-checkbox-label">
                <input type="checkbox" checked={formData.accepted_terms}
                  onChange={(e) => handleInputChange("accepted_terms", e.target.checked)} />
                <span>
                  I agree to the{" "}
                  <a href="/terms" className="su-link">Terms of Service</a> and{" "}
                  <a href="/privacy" className="su-link">Privacy Policy</a>
                </span>
              </label>
              {errors.accepted_terms && (
                <span className="auth-error-text">{errors.accepted_terms}</span>
              )}
            </div>

            {errors.general && <div className="auth-error-box">{errors.general}</div>}

            <button type="submit" className="auth-btn-primary" disabled={isLoading}>
              {isLoading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <a href="/signin">Sign In</a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default SignUp;

import React, { useState } from "react";
import Button from "../Components/Button";
import "./SignUp.css";

function SignUp() {
  const [activeRole, setActiveRole] = useState("customer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    address: "",
    businessName: "",
    businessType: "",
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (activeRole === "customer" && !formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (activeRole === "business" && !formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (activeRole === "business" && !formData.businessType) {
      newErrors.businessType = "Business type is required";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Sign up successful", { ...formData, role: activeRole });
      // Handle sign up logic here
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Title */}
        <div className="signup-header">
          <h2>Create Account</h2>
          <p>{activeRole === "business" ? "List your business and connect with customers" : "Join our community today"}</p>
        </div>

        {/* Business/Customer Switcher */}
        <div className="role-switcher">
          <button 
            className={`role-btn ${activeRole === "customer" ? "active" : ""}`}
            onClick={() => setActiveRole("customer")}
          >
            Customer
          </button>
          <button 
            className={`role-btn ${activeRole === "business" ? "active" : ""}`}
            onClick={() => setActiveRole("business")}
          >
            Business
          </button>
        </div>

        {/* Form */}
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              className="form-input"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {activeRole === "customer" && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                className="form-input"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
          )}

          {activeRole === "customer" && (
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                placeholder="Enter your address"
                className="form-input"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          )}

          {activeRole === "business" && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                className="form-input"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
          )}

          {activeRole === "business" && (
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                placeholder="Enter your business name"
                className="form-input"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
              />
              {errors.businessName && <span className="error-text">{errors.businessName}</span>}
            </div>
          )}

          {activeRole === "business" && (
            <div className="form-group">
              <label>Business Type</label>
              <select 
                className="form-input"
                value={formData.businessType}
                onChange={(e) => handleInputChange("businessType", e.target.value)}
              >
                <option value="">Select business type</option>
                <option value="restaurant">Restaurant</option>
                <option value="supermarket">Supermarket</option>
                <option value="coffee-shop">Coffee Shop</option>
                <option value="hotel">Hotel</option>
                <option value="bakery">Bakery</option>
                <option value="dessert-shop">Dessert Shop</option>
              </select>
              {errors.businessType && <span className="error-text">{errors.businessType}</span>}
            </div>
          )}

          <div className="form-options">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
              />
              <span>
                I agree to the <a href="/terms" className="terms-link">Terms of Service</a> and <a href="/privacy" className="privacy-link">Privacy Policy</a>
              </span>
            </label>
          </div>
          {errors.agreeToTerms && <span className="error-text">{errors.agreeToTerms}</span>}

          <Button text="Create Account" variant="success" className="signup-btn" />

        </form>

        <div className="signin-prompt">
          Already have an account? <a href="/signin">Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
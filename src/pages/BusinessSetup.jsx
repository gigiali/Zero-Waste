import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import "../auth-theme.css";
import "./BusinessSetup.css";

function BusinessSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    taxNumber: "",
    commercialRegister: null,
    taxCard: null,
    logo: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.businessName.trim())
      newErrors.businessName = "Business name is required";
    if (!formData.businessType)
      newErrors.businessType = "Business type is required";
    if (!formData.taxNumber.trim())
      newErrors.taxNumber = "Tax number is required";
    if (!formData.commercialRegister)
      newErrors.commercialRegister = "Commercial register document is required";
    if (!formData.taxCard)
      newErrors.taxCard = "Tax card document is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitMessage("");
      try {
        const submitData = new FormData();
        submitData.append("business_name", formData.businessName.trim());
        submitData.append("vendor_type", formData.businessType);
        submitData.append("tax_number", formData.taxNumber.trim());
        submitData.append("commercial_register", formData.commercialRegister);
        submitData.append("tax_card", formData.taxCard);
        if (formData.logo)
          submitData.append("logo", formData.logo);

        const token = localStorage.getItem("auth_token");
        if (!token) {
          setSubmitMessage("Please login to continue");
          setIsSubmitting(false);
          return;
        }

        const response = await fetch(
          "/api/vendor/complete-setup",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: submitData,
          }
        );

        const responseData = await response.json();

        if (response.ok) {
          setSubmitMessage("Vendor setup completed successfully!");
          setTimeout(() => navigate("/signin"), 2000);
        } else {
          if (response.status === 401) {
            setSubmitMessage("Please login to continue");
          } else if (response.status === 403) {
            setSubmitMessage(
              responseData.message ||
                "Access denied. Your account may be pending or rejected."
            );
          } else if (response.status === 422) {
            if (responseData.errors) {
              const newErrors = {};
              Object.keys(responseData.errors).forEach((field) => {
                newErrors[field] = responseData.errors[field][0];
              });
              setErrors(newErrors);
            }
            setSubmitMessage(
              responseData.message || "Please fix the errors below"
            );
          } else {
            setSubmitMessage(
              responseData.message || "An error occurred. Please try again."
            );
          }
        }
      } catch (error) {
        console.error("Submit error:", error);
        setSubmitMessage(
          "Network error. Please check your connection and try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }));
      if (errors[field])
        setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="business-setup-page">
      <div className="business-setup-container">
        <div className="business-setup-header">
          <h2>Complete your business profile</h2>
          <p>Tell us about your business to get started</p>
        </div>

        <div className="business-setup-form-section">
          <form className="business-setup-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  placeholder="Enter your business name"
                  className="form-input"
                  value={formData.businessName}
                  onChange={(e) =>
                    handleInputChange("businessName", e.target.value)
                  }
                />
                {errors.businessName && (
                  <span className="error-text">{errors.businessName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Business Type</label>
                <select
                  className="form-input"
                  value={formData.businessType}
                  onChange={(e) =>
                    handleInputChange("businessType", e.target.value)
                  }
                >
                  <option value="">Select business type</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="coffee-shop">Coffee Shop</option>
                  <option value="hotel">Hotel</option>
                  <option value="bakery">Bakery</option>
                  <option value="dessert-shop">Dessert Shop</option>
                </select>
                {errors.businessType && (
                  <span className="error-text">{errors.businessType}</span>
                )}
              </div>

              <div className="form-group">
                <label>Tax Number <span style={{color: "#ef4444"}}>*</span></label>
                <input
                  type="text"
                  placeholder="Enter your tax number"
                  className="form-input"
                  value={formData.taxNumber}
                  onChange={(e) =>
                    handleInputChange("taxNumber", e.target.value)
                  }
                />
                {errors.taxNumber && (
                  <span className="error-text">{errors.taxNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label>Commercial Register <span style={{color: "#ef4444"}}>*</span></label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("commercialRegister", e)}
                    className="file-input"
                  />
                  <div className="file-upload-label">
                    {formData.commercialRegister
                      ? formData.commercialRegister.name
                      : "Upload PDF, JPG or PNG"}
                  </div>
                </div>
                {errors.commercialRegister && (
                  <span className="error-text">{errors.commercialRegister}</span>
                )}
                <small style={{color: "#6b7280", fontSize: "0.8rem"}}>Required: PDF, JPG or PNG (max 4MB)</small>
              </div>

              <div className="form-group">
                <label>Tax Card <span style={{color: "#ef4444"}}>*</span></label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("taxCard", e)}
                    className="file-input"
                  />
                  <div className="file-upload-label">
                    {formData.taxCard
                      ? formData.taxCard.name
                      : "Upload PDF, JPG or PNG"}
                  </div>
                </div>
                {errors.taxCard && (
                  <span className="error-text">{errors.taxCard}</span>
                )}
                <small style={{color: "#6b7280", fontSize: "0.8rem"}}>Required: PDF, JPG or PNG (max 4MB)</small>
              </div>

              <div className="form-group">
                <label>Business Logo <span style={{color: "#6b7280"}}>(Optional)</span></label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => handleFileUpload("logo", e)}
                    className="file-input"
                  />
                  <div className="file-upload-label">
                    {formData.logo
                      ? formData.logo.name
                      : "Choose logo file (Optional)"}
                  </div>
                </div>
                <small style={{color: "#6b7280", fontSize: "0.8rem"}}>Optional: JPEG, PNG or JPG (max 2MB)</small>
              </div>
            </div>

            {submitMessage && (
              <div
                className={`submit-message ${
                  submitMessage.includes("successfully")
                    ? "success"
                    : submitMessage.includes("error") ||
                      submitMessage.includes("failed")
                    ? "error"
                    : "warning"
                }`}
              >
                {submitMessage}
              </div>
            )}

            <Button
              text={isSubmitting ? "Submitting..." : "Complete Setup"}
              variant="success"
              className="complete-setup-btn"
              disabled={isSubmitting}
            />
          </form>

          <div className="back-prompt">
            <a href="/signup">← Back to Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessSetup;
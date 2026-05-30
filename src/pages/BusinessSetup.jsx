import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../Components/Button";
import "../auth-theme.css";
import "./BusinessSetup.css";

function BusinessSetup() {
  const { t } = useTranslation();
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
    // Vendor fields validation
    if (!formData.businessName.trim())
      newErrors.businessName = t("businessSetup.errors.businessNameRequired");
    if (!formData.businessType)
      newErrors.businessType = t("businessSetup.errors.businessTypeRequired");
    if (!formData.taxNumber.trim())
      newErrors.taxNumber = t("businessSetup.errors.taxNumberRequired");
    if (!formData.commercialRegister)
      newErrors.commercialRegister = t("businessSetup.errors.commercialRegisterRequired");
    if (!formData.taxCard)
      newErrors.taxCard = t("businessSetup.errors.taxCardRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getToken = () =>
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage("");

    const token = getToken();
    if (!token) {
      setSubmitMessage(t("businessSetup.errors.loginToContinue"));
      setIsSubmitting(false);
      return;
    }

    try {
      // ── Step 1: vendor complete-setup ──
      const vendorData = new FormData();
      vendorData.append("business_name", formData.businessName.trim());
      vendorData.append("vendor_type", formData.businessType);
      vendorData.append("tax_number", formData.taxNumber.trim());
      vendorData.append("commercial_register", formData.commercialRegister);
      vendorData.append("tax_card", formData.taxCard);
      if (formData.logo) vendorData.append("logo", formData.logo);

      const vendorRes = await fetch("/api/vendor/complete-setup", {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: vendorData,
      });
      const vendorJson = await vendorRes.json();

      if (!vendorRes.ok) {
        if (vendorRes.status === 422 && vendorJson.errors) {
          const newErrors = {};
          Object.keys(vendorJson.errors).forEach((f) => {
            newErrors[f] = vendorJson.errors[f][0];
          });
          setErrors(newErrors);
        }
        const msg = vendorJson.message || "";
        if (msg.toLowerCase().includes("review") || msg.toLowerCase().includes("resubmit")) {
          return;
        }
        setSubmitMessage(msg || t("businessSetup.errors.genericError"));
        return;
      }

      // ── Success: Redirect to add branch page ──
      setSubmitMessage("✓ Business setup completed!");
      setTimeout(() => {
        navigate("/business/profile");
      }, 1500);

    } catch (error) {
      console.error("Submit error:", error);
      setSubmitMessage(t("businessSetup.errors.networkError"));
    } finally {
      setIsSubmitting(false);
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
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="business-setup-page">
      <div className="business-setup-container">
        <div className="business-setup-header">
          <h2>{t("businessSetup.title")}</h2>
          <p>{t("businessSetup.subtitle")}</p>
        </div>

        <div className="business-setup-form-section">
          <form className="business-setup-form" onSubmit={handleSubmit}>

            {/* ── Business Info Only ── */}
            <div className="form-section">
              <h3>Business Information</h3>

              <div className="form-group">
                <label>{t("businessSetup.businessName")}</label>
                <input type="text" placeholder={t("businessSetup.businessNamePlaceholder")}
                  className="form-input" value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)} />
                {errors.businessName && <span className="error-text">{errors.businessName}</span>}
              </div>

              <div className="form-group">
                <label>{t("businessSetup.businessType")}</label>
                <select className="form-input" value={formData.businessType}
                  onChange={(e) => handleInputChange("businessType", e.target.value)}>
                  <option value="">{t("businessSetup.selectBusinessType")}</option>
                  <option value="restaurant">{t("businessSetup.type.restaurant")}</option>
                  <option value="supermarket">{t("businessSetup.type.supermarket")}</option>
                  <option value="coffee-shop">{t("businessSetup.type.coffeeShop")}</option>
                  <option value="hotel">{t("businessSetup.type.hotel")}</option>
                  <option value="bakery">{t("businessSetup.type.bakery")}</option>
                  <option value="dessert-shop">{t("businessSetup.type.dessertShop")}</option>
                </select>
                {errors.businessType && <span className="error-text">{errors.businessType}</span>}
              </div>

              <div className="form-group">
                <label>{t("businessSetup.taxNumber")} <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" placeholder={t("businessSetup.taxNumberPlaceholder")}
                  className="form-input" value={formData.taxNumber}
                  onChange={(e) => handleInputChange("taxNumber", e.target.value)} />
                {errors.taxNumber && <span className="error-text">{errors.taxNumber}</span>}
              </div>

              <div className="form-group">
                <label>{t("businessSetup.commercialRegister")} <span style={{ color: "#ef4444" }}>*</span></label>
                <div className="file-upload">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" id="commercialRegister"
                    onChange={(e) => handleFileUpload("commercialRegister", e)} className="file-input" />
                  <label htmlFor="commercialRegister" className="file-upload-label">
                    {formData.commercialRegister ? formData.commercialRegister.name : t("businessSetup.uploadDocumentPlaceholder")}
                  </label>
                </div>
                {errors.commercialRegister && <span className="error-text">{errors.commercialRegister}</span>}
                <small style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: "0.4rem" }}>Required: PDF, JPG or PNG (max 4MB)</small>
              </div>

              <div className="form-group">
                <label>{t("businessSetup.taxCard")} <span style={{ color: "#ef4444" }}>*</span></label>
                <div className="file-upload">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" id="taxCard"
                    onChange={(e) => handleFileUpload("taxCard", e)} className="file-input" />
                  <label htmlFor="taxCard" className="file-upload-label">
                    {formData.taxCard ? formData.taxCard.name : t("businessSetup.uploadDocumentPlaceholder")}
                  </label>
                </div>
                {errors.taxCard && <span className="error-text">{errors.taxCard}</span>}
                <small style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: "0.4rem" }}>Required: PDF, JPG or PNG (max 4MB)</small>
              </div>

              <div className="form-group">
                <label>{t("businessSetup.businessLogo")} <span style={{ color: "#6b7280" }}>{t("businessSetup.optional")}</span></label>
                <div className="file-upload">
                  <input type="file" accept="image/jpeg,image/png,image/jpg" id="logo"
                    onChange={(e) => handleFileUpload("logo", e)} className="file-input" />
                  <label htmlFor="logo" className="file-upload-label">
                    {formData.logo ? formData.logo.name : t("businessSetup.chooseLogoPlaceholder")}
                  </label>
                </div>
                <small style={{ color: "#6b7280", fontSize: "0.8rem", marginTop: "0.4rem" }}>{t("businessSetup.logoOptionalHint")}</small>
              </div>
            </div>

            {submitMessage && (
              <div className={`submit-message ${submitMessage.includes("✓") ? "success" : submitMessage.includes("error") || submitMessage.includes("failed") ? "error" : "warning"}`}>
                {submitMessage}
              </div>
            )}

            <Button
              text={isSubmitting ? t("businessSetup.submitting") : t("businessSetup.completeSetup")}
              variant="success"
              className="complete-setup-btn"
              disabled={isSubmitting}
            />
          </form>

          <div className="back-prompt">
            <a href="/signup">← {t("businessSetup.backToSignUp")}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessSetup;

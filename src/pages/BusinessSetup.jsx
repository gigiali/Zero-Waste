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
    // Branch fields
    branchName: "",
    openingHours: "",
    storeAddress: "",
    contactEmail: "",
    contactPhone: "",
    lat: "",
    long: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};
    // Vendor fields
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
    // Branch fields
    if (!formData.branchName.trim())
      newErrors.branchName = "Branch name is required";
    if (!formData.openingHours.trim())
      newErrors.openingHours = "Opening hours are required";
    if (!formData.storeAddress.trim())
      newErrors.storeAddress = "Store address is required";
    if (!formData.contactEmail.trim())
      newErrors.contactEmail = "Contact email is required";
    if (!formData.contactPhone.trim())
      newErrors.contactPhone = "Contact phone is required";
    if (!formData.lat.toString().trim())
      newErrors.lat = "Latitude is required";
    if (!formData.long.toString().trim())
      newErrors.long = "Longitude is required";

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
        setSubmitMessage(vendorJson.message || t("businessSetup.errors.genericError"));
        return;
      }

      // ── Step 2: add branch ──
      const branchData = new FormData();
      branchData.append("branch_name",   formData.branchName.trim());
      branchData.append("opening_hours", formData.openingHours.trim());
      branchData.append("store_address", formData.storeAddress.trim());
      branchData.append("contact_email", formData.contactEmail.trim());
      branchData.append("contact_phone", formData.contactPhone.trim());
      branchData.append("lat",           formData.lat.toString().trim());
      branchData.append("long",          formData.long.toString().trim());

      const branchRes = await fetch("/api/branches", {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: branchData,
      });
      const branchJson = await branchRes.json();

      if (!branchRes.ok) {
        if (branchRes.status === 422 && branchJson.errors) {
          const newErrors = {};
          Object.keys(branchJson.errors).forEach((f) => {
            newErrors[f] = branchJson.errors[f][0];
          });
          setErrors(newErrors);
        }
        setSubmitMessage(branchJson.message || "Failed to create branch. Please try again.");
        return;
      }

      // ── Both succeeded ──
      navigate("/business/profile");

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

  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleInputChange("lat",  pos.coords.latitude.toString());
        handleInputChange("long", pos.coords.longitude.toString());
      },
      () => alert("Unable to get location. Please enter manually.")
    );
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

            {/* ── Business Info ── */}
            <div className="form-section">
              <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#374151" }}>
                Business Information
              </h3>

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
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("commercialRegister", e)} className="file-input" />
                  <div className="file-upload-label">
                    {formData.commercialRegister ? formData.commercialRegister.name : t("businessSetup.uploadDocumentPlaceholder")}
                  </div>
                </div>
                {errors.commercialRegister && <span className="error-text">{errors.commercialRegister}</span>}
                <small style={{ color: "#6b7280", fontSize: "0.8rem" }}>Required: PDF, JPG or PNG (max 4MB)</small>
              </div>

              <div className="form-group">
                <label>{t("businessSetup.taxCard")} <span style={{ color: "#ef4444" }}>*</span></label>
                <div className="file-upload">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("taxCard", e)} className="file-input" />
                  <div className="file-upload-label">
                    {formData.taxCard ? formData.taxCard.name : t("businessSetup.uploadDocumentPlaceholder")}
                  </div>
                </div>
                {errors.taxCard && <span className="error-text">{errors.taxCard}</span>}
                <small style={{ color: "#6b7280", fontSize: "0.8rem" }}>Required: PDF, JPG or PNG (max 4MB)</small>
              </div>

              <div className="form-group">
                <label>{t("businessSetup.businessLogo")} <span style={{ color: "#6b7280" }}>{t("businessSetup.optional")}</span></label>
                <div className="file-upload">
                  <input type="file" accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => handleFileUpload("logo", e)} className="file-input" />
                  <div className="file-upload-label">
                    {formData.logo ? formData.logo.name : t("businessSetup.chooseLogoPlaceholder")}
                  </div>
                </div>
                <small style={{ color: "#6b7280", fontSize: "0.8rem" }}>{t("businessSetup.logoOptionalHint")}</small>
              </div>
            </div>

            {/* ── Branch Info ── */}
            <div className="form-section" style={{ marginTop: "2rem" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: "#374151" }}>
                Branch Information
              </h3>

              <div className="form-group">
                <label>Branch Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" placeholder="e.g. Main Branch" className="form-input"
                  value={formData.branchName}
                  onChange={(e) => handleInputChange("branchName", e.target.value)} />
                {errors.branchName && <span className="error-text">{errors.branchName}</span>}
              </div>

              <div className="form-group">
                <label>Opening Hours <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" placeholder="e.g. 9:00 AM - 10:00 PM" className="form-input"
                  value={formData.openingHours}
                  onChange={(e) => handleInputChange("openingHours", e.target.value)} />
                {errors.openingHours && <span className="error-text">{errors.openingHours}</span>}
              </div>

              <div className="form-group">
                <label>Store Address <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" placeholder="e.g. 123 Main St, Cairo" className="form-input"
                  value={formData.storeAddress}
                  onChange={(e) => handleInputChange("storeAddress", e.target.value)} />
                {errors.storeAddress && <span className="error-text">{errors.storeAddress}</span>}
              </div>

              <div className="form-group">
                <label>Contact Email <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="email" placeholder="branch@example.com" className="form-input"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)} />
                {errors.contactEmail && <span className="error-text">{errors.contactEmail}</span>}
              </div>

              <div className="form-group">
                <label>Contact Phone <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="tel" placeholder="01012345678" className="form-input"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)} />
                {errors.contactPhone && <span className="error-text">{errors.contactPhone}</span>}
              </div>

              <div className="form-group">
                <label>Branch Location <span style={{ color: "#ef4444" }}>*</span></label>
                <button type="button" onClick={handleGetLocation}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", color: "#16a34a", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem", marginBottom: "8px" }}>
                  📍 Use My Current Location
                </button>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <input type="number" step="any" placeholder="Latitude" className="form-input"
                      value={formData.lat}
                      onChange={(e) => handleInputChange("lat", e.target.value)} />
                    {errors.lat && <span className="error-text">{errors.lat}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="number" step="any" placeholder="Longitude" className="form-input"
                      value={formData.long}
                      onChange={(e) => handleInputChange("long", e.target.value)} />
                    {errors.long && <span className="error-text">{errors.long}</span>}
                  </div>
                </div>
              </div>
            </div>

            {submitMessage && (
              <div className={`submit-message ${submitMessage.includes("successfully") ? "success" : submitMessage.includes("error") || submitMessage.includes("failed") ? "error" : "warning"}`}>
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

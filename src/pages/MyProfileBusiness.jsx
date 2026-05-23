import { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import {
  Edit2,
  LogOut,
  Trash2,
  ChevronRight,
  KeyRound,
  Building2,
  Hash,
  Image,
  FileText,
  Upload,
  X,
} from "lucide-react";

import "./MyProfileAdmin.css";

import { useAuth } from "../Context/AuthContext";

// ── ChangePassword (unchanged) ─────────────────────────────────────────────

function ChangePassword({ onCancel }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });

  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = async () => {
    const e = {};

    if (!form.current) e.current_password = "Current password is required";

    if (!form.next) e.new_password = "New password is required";
    else if (form.next.length < 6)
      e.new_password = "Password must be at least 6 characters";

    if (!form.confirm)
      e.new_password_confirmation = "Please confirm your password";
    else if (form.next !== form.confirm)
      e.new_password_confirmation = "Passwords do not match";

    setErrors(e);

    if (Object.keys(e).length > 0) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token") || sessionStorage.getItem("auth_token") || sessionStorage.getItem("token");
      console.log("Changing password with token:", token ? token.substring(0, 20) + "..." : "No token");

      const controller = new AbortController();

      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Try different endpoints for password change
      const endpoints = [
        "/api/vendor/change-password",
        "/api/profile/change-password",
        "/api/user/change-password",
      ];

      let success = false;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              current_password: form.current,
              new_password: form.next,
              new_password_confirmation: form.confirm,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          const data = await response.json();

          console.log(`Response from ${endpoint}:`, response.status, data);

          if (response.ok) {
            console.log("Password changed successfully");
            setSuccessMessage("Password changed successfully!");
            success = true;
            setTimeout(() => {
              onCancel();
            }, 2000);
            break;
          } else {
            lastError = data;
            console.log(`Failed with ${endpoint}:`, data);
            console.log(`Status: ${response.status}`);
            console.log(`Errors:`, data.errors);
            console.log(`Message:`, data.message);
          }
        } catch (err) {
          console.error(`Error with ${endpoint}:`, err);
        }
      }

      if (!success) {
        if (lastError) {
          if (lastError.errors) {
            const newErrors = {};
            Object.keys(lastError.errors).forEach((f) => {
              newErrors[f] = Array.isArray(lastError.errors[f])
                ? lastError.errors[f][0]
                : lastError.errors[f];
            });
            setErrors(newErrors);
          } else {
            setErrors({
              general: lastError.message || "Failed to change password. Please try again.",
            });
          }
        } else {
          setErrors({ general: "Failed to change password. Please try again." });
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setErrors({ general: "Request timed out. Please try again." });
      } else {
        setErrors({ general: "Network error. Please check your connection." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">Change Password</h1>
            <p className="hero-subtitle">Update your password</p>
          </div>

          <button className="hero-edit-btn" onClick={onCancel}>
            ← Back
          </button>
        </div>
      </div>

      <div className="profile-body">
        <div className="profile-card">
          <h2 className="card-title">New Password</h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {[
              ["current", "current_password", "Current password"],

              ["next", "new_password", "New password"],

              ["confirm", "new_password_confirmation", "Confirm new password"],
            ].map(([formKey, errorKey, ph]) => (
              <div key={formKey}>
                <input
                  type="password"
                  placeholder={ph}
                  value={form[formKey]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [formKey]: e.target.value }))
                  }
                  style={{
                    padding: "0.75rem 1rem",

                    border: errors[errorKey]
                      ? "1.5px solid #ef4444"
                      : "1.5px solid #e5e7eb",

                    borderRadius: "8px",

                    fontSize: "0.95rem",

                    outline: "none",

                    width: "100%",
                  }}
                />

                {errors[errorKey] && (
                  <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                    {errors[errorKey]}
                  </span>
                )}
              </div>
            ))}

            {errors.general && (
              <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                {errors.general}
              </span>
            )}

            {successMessage && (
              <span style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: 600 }}>
                {successMessage}
              </span>
            )}

            <button
              onClick={handleChange}
              disabled={isLoading}
              style={{
                padding: "0.75rem",

                background: isLoading ? "#9ca3af" : "#10b981",

                color: "white",

                border: "none",

                borderRadius: "8px",

                fontWeight: 700,

                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Changing..." : "Save Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NotificationSettings (unchanged) ─────────────────────────────────────────

function NotificationSettings({ onCancel }) {
  const [prefs, setPrefs] = useState({
    orders: true,
    offers: true,
    payments: true,
    news: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState("");

  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const labels = {
    orders: "Order updates",

    offers: "New offers nearby",

    payments: "Payment confirmations",

    news: "News & promotions",
  };

  const handleSave = async () => {
    setIsLoading(true);

    setMessage("");

    try {
      
      const token = localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token") ||
      sessionStorage.getItem("token");
      const controller = new AbortController();

      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/notification-preferences", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Accept: "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(prefs),

        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        setMessage("Preferences saved successfully!");

        setTimeout(() => onCancel(), 1000);
      } else {
        setMessage(
          data.message || "Failed to save preferences. Please try again.",
        );
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setMessage("Request timed out. Please try again.");
      } else {
        setMessage("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">Notification Settings</h1>
            <p className="hero-subtitle">Control what you hear about</p>
          </div>

          <button className="hero-edit-btn" onClick={onCancel}>
            ← Back
          </button>
        </div>
      </div>

      <div className="profile-body">
        <div className="profile-card">
          <h2 className="card-title">Preferences</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {Object.entries(prefs).map(([k, v]) => (
              <div
                key={k}
                onClick={() => toggle(k)}
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  padding: "1rem 0",

                  borderBottom: "1px solid #f3f4f6",

                  cursor: "pointer",
                }}
              >
                <span style={{ color: "#374151", fontSize: "0.95rem" }}>
                  {labels[k]}
                </span>

                <div
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    background: v ? "#10b981" : "#d1d5db",
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: v ? "23px" : "3px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {message && (
            <span
              style={{
                color: message.includes("success") ? "#10b981" : "#ef4444",
                fontSize: "0.85rem",
                marginTop: "1rem",
                display: "block",
              }}
            >
              {message}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              marginTop: "1.5rem",

              padding: "0.75rem",

              width: "100%",

              background: isLoading ? "#9ca3af" : "#10b981",

              color: "white",

              border: "none",

              borderRadius: "8px",

              fontWeight: 700,

              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── File Upload Field ─────────────────────────────────────────────────────────

function FileUploadField({
  label,
  icon,
  accept,
  file,
  previewUrl,
  onChange,
  onClear,
  error,
  hint,
}) {
  const inputRef = useRef();

  return (
    <div className="info-row" style={{ alignItems: "flex-start" }}>
      <span className="info-icon" style={{ marginTop: "2px" }}>
        {icon}
      </span>

      <div className="info-text" style={{ flex: 1 }}>
        <span className="info-label">{label}</span>

        <span
          style={{
            fontSize: "0.78rem",
            color: "var(--pg-label)",
            marginBottom: "6px",
          }}
        >
          {hint}
        </span>

        {/* Preview */}

        {previewUrl && (
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: "8px",
            }}
          >
            {file?.type?.startsWith("image/") ||
            (!file && previewUrl?.match(/\.(jpg|jpeg|png)$/i)) ? (
              <img
                src={previewUrl}
                alt={label}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1.5px solid var(--pg-border)",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  background: "var(--pg-input-bg)",
                  border: "1.5px solid var(--pg-border)",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  color: "var(--pg-value)",
                }}
              >
                <FileText size={16} />

                <span>{file?.name || "Uploaded file"}</span>
              </div>
            )}

            <button
              onClick={onClear}
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                background: "#ef4444",
                border: "none",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <X size={11} color="white" />
            </button>
          </div>
        )}

        {/* Upload button */}

        <button
          onClick={() => inputRef.current.click()}
          style={{
            display: "flex",

            alignItems: "center",

            gap: "6px",

            padding: "7px 14px",

            background: "var(--pg-input-bg)",

            border: `1.5px solid ${error ? "#ef4444" : "var(--pg-input-border)"}`,

            borderRadius: "8px",

            fontSize: "0.88rem",

            color: "var(--pg-value)",

            cursor: "pointer",

            width: "fit-content",
          }}
        >
          <Upload size={14} />

          {previewUrl ? "Change file" : "Upload file"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={onChange}
        />

        {error && (
          <span
            style={{ color: "#ef4444", fontSize: "0.82rem", marginTop: "4px" }}
          >
            {error}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Business Profile (Main) ───────────────────────────────────────────────────

export default function MyProfileBusiness() {
  const navigate = useNavigate();

  const { logout, businessStatus, user } = useAuth();

  const [view, setView] = useState("main");

  const [isEditing, setIsEditing] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [showPendingModal, setShowPendingModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({});

  // Get signup data from localStorage or sessionStorage

  const [signupData] = useState(() => {
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }

    return null;
  });

  // Text fields from backend

  const [vendorData, setVendorData] = useState({
    business_name: "",

    tax_number: "",
  });

  const [editData, setEditData] = useState({ ...vendorData });

  // File fields — store the File object + a local preview URL

  const [logoFile, setLogoFile] = useState(null);

  const [logoPreview, setLogoPreview] = useState(""); // existing URL from server

  const [commercialFile, setCommercialFile] = useState(null);

  const [commercialPreview, setCommercialPreview] = useState("");

  const [taxCardFile, setTaxCardFile] = useState(null);

  const [taxCardPreview, setTaxCardPreview] = useState("");

  // ── Fetch vendor profile ──────────────────────────────────────────────────

  const fetchVendorData = async () => {
    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("auth_token") ||
        sessionStorage.getItem("token");

      if (!token) {
        return;
      }

      const controller = new AbortController();

      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/vendor/profile", {
        method: "GET",

        headers: {
          Accept: "application/json",

          Authorization: `Bearer ${token}`,
        },

        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.vendor) {
        const v = data.vendor;

        setVendorData({
          business_name: v.business_name || "",

          tax_number: v.tax_number || "",
        });

        setEditData({
          business_name: v.business_name || "",

          tax_number: v.tax_number || "",
        });

        if (v.logo) setLogoPreview(v.logo);

        if (v.commercial_register) setCommercialPreview(v.commercial_register);

        if (v.tax_card) setTaxCardPreview(v.tax_card);
      } else {
        console.error("Failed to fetch vendor profile:", data);
      }
    } catch (error) {
      console.error("Fetch vendor data error:", error);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, [navigate]);

  // ── File helpers ──────────────────────────────────────────────────────────

  const handleFileChange = (setter, previewSetter) => (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setter(file);

    previewSetter(URL.createObjectURL(file));

    e.target.value = "";
  };

  const clearFile = (setter, previewSetter) => () => {
    setter(null);

    previewSetter("");
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const e = {};

    if (!editData.business_name.trim())
      e.business_name = "Business name is required";

    setErrors(e);

    if (Object.keys(e).length > 0) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth_token");

      const controller = new AbortController();

      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Use FormData because we may be uploading files

      const formData = new FormData();

      formData.append("business_name", editData.business_name.trim());

      if (editData.tax_number.trim())
        formData.append("tax_number", editData.tax_number.trim());

      if (logoFile) formData.append("logo", logoFile);

      if (commercialFile)
        formData.append("commercial_register", commercialFile);

      if (taxCardFile) formData.append("tax_card", taxCardFile);

      // Laravel requires _method spoofing when sending FormData with PUT

      formData.append("_method", "PUT");

      const response = await fetch("/api/vendor/profile", {
        method: "POST", // POST + _method=PUT for FormData

        headers: {
          Accept: "application/json",

          Authorization: `Bearer ${token}`,

          // Do NOT set Content-Type — browser sets it with boundary for FormData
        },

        body: formData,

        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        setVendorData({ ...editData });

        // Update previews with fresh server URLs if returned

        if (data.vendor?.logo) setLogoPreview(data.vendor.logo);

        if (data.vendor?.commercial_register)
          setCommercialPreview(data.vendor.commercial_register);

        if (data.vendor?.tax_card) setTaxCardPreview(data.vendor.tax_card);

        // Clear staged file objects

        setLogoFile(null);

        setCommercialFile(null);

        setTaxCardFile(null);

        setIsEditing(false);

        alert("Business profile updated successfully!");
      } else {
        if (response.status === 422 && data.errors) {
          const newErrors = {};

          Object.keys(data.errors).forEach((f) => {
            newErrors[f] = Array.isArray(data.errors[f])
              ? data.errors[f][0]
              : data.errors[f];
          });

          setErrors(newErrors);
        } else {
          setErrors({
            general:
              data.message || "Failed to update profile. Please try again.",
          });
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setErrors({ general: "Request timed out. Please try again." });
      } else {
        setErrors({ general: "Network error. Please check your connection." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...vendorData });

    setLogoFile(null);

    setCommercialFile(null);

    setTaxCardFile(null);

    // Restore previews from server URLs (re-fetch to be safe)

    fetchVendorData();

    setErrors({});

    setIsEditing(false);
  };
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/vendor/delete-account", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        logout();
        navigate("/home");
      }
    } catch (err) {
      console.error("Delete account error:", err);
    }
  };

  const handleLogout = () => {
    logout();

    setShowLogoutConfirm(false);

    navigate("/home");
  };

  if (view === "password")
    return <ChangePassword onCancel={() => setView("main")} />;

  if (view === "notifications")
    return <NotificationSettings onCancel={() => setView("main")} />;

  return (
    <>
      <div className="profile-page">
        {/* Hero */}

        <div className="profile-hero">
          <div className="hero-inner">
            <div>
              <h1 className="hero-title">Business Profile</h1>

              <p className="hero-subtitle">Manage your business information</p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="hero-edit-btn"
                onClick={() => {
                  if (isEditing) handleCancel();
                  else setIsEditing(true);
                }}
              >
                <Edit2 size={16} /> {isEditing ? "Cancel Editing" : "Edit"}
              </button>

              <button
                className="hero-edit-btn"
                onClick={() => setShowPendingModal(true)}
              >
                Back to Business Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="profile-body">
          {/* ── Business Information Card ── */}

          <div className="profile-card">
            <h2 className="card-title">Business Information</h2>

            <div className="info-list">
              {/* Owner Name */}

              <div className="info-row">
                <span className="info-icon">
                  <Building2 size={20} />
                </span>

                <div className="info-text">
                  <span className="info-label">Owner Name</span>

                  <span className="info-value">
                    {signupData?.name || user?.name || "—"}
                  </span>
                </div>
              </div>

              {/* Email */}

              <div className="info-row">
                <span className="info-icon">
                  <Building2 size={20} />
                </span>

                <div className="info-text">
                  <span className="info-label">Email</span>

                  <span className="info-value">
                    {signupData?.email || user?.email || "—"}
                  </span>
                </div>
              </div>

              {/* Phone */}

              <div className="info-row">
                <span className="info-icon">
                  <Building2 size={20} />
                </span>

                <div className="info-text">
                  <span className="info-label">Phone</span>

                  <span className="info-value">
                    {signupData?.phone || user?.phone || "—"}
                  </span>
                </div>
              </div>

              {/* Address */}

              <div className="info-row">
                <span className="info-icon">
                  <Building2 size={20} />
                </span>

                <div className="info-text">
                  <span className="info-label">Address</span>

                  <span className="info-value">
                    {signupData?.address || user?.address || "—"}
                  </span>
                </div>
              </div>

              {/* Business Name */}

              <div className="info-row">
                <span className="info-icon">
                  <Building2 size={20} />
                </span>

                <div className="info-text">
                  <span className="info-label">Business Name</span>

                  {isEditing ? (
                    <div>
                      <input
                        className="info-input"
                        type="text"
                        value={editData.business_name}
                        onChange={(e) => {
                          setEditData({
                            ...editData,
                            business_name: e.target.value,
                          });

                          if (errors.business_name)
                            setErrors((p) => ({ ...p, business_name: "" }));
                        }}
                        style={{
                          border: errors.business_name
                            ? "1.5px solid #ef4444"
                            : undefined,
                        }}
                      />

                      {errors.business_name && (
                        <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                          {errors.business_name}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="info-value">
                      {vendorData.business_name || "—"}
                    </span>
                  )}
                </div>
              </div>

              {/* Tax Number */}

              <div className="info-row">
                <span className="info-icon">
                  <Hash size={20} />
                </span>

                <div className="info-text">
                  <span className="info-label">Tax Number</span>

                  {isEditing ? (
                    <div>
                      <input
                        className="info-input"
                        type="text"
                        value={editData.tax_number}
                        onChange={(e) => {
                          setEditData({
                            ...editData,
                            tax_number: e.target.value,
                          });

                          if (errors.tax_number)
                            setErrors((p) => ({ ...p, tax_number: "" }));
                        }}
                        style={{
                          border: errors.tax_number
                            ? "1.5px solid #ef4444"
                            : undefined,
                        }}
                        placeholder="Optional"
                      />

                      {errors.tax_number && (
                        <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                          {errors.tax_number}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="info-value">
                      {vendorData.tax_number || "—"}
                    </span>
                  )}
                </div>
              </div>

              {/* Logo — always show, editable when isEditing */}

              {isEditing ? (
                <FileUploadField
                  label="Business Logo"
                  icon={<Image size={20} />}
                  accept="image/jpeg,image/png,image/jpg"
                  file={logoFile}
                  previewUrl={
                    logoFile ? URL.createObjectURL(logoFile) : logoPreview
                  }
                  onChange={handleFileChange(setLogoFile, setLogoPreview)}
                  onClear={clearFile(setLogoFile, setLogoPreview)}
                  error={errors.logo}
                  hint="JPEG or PNG · max 2 MB"
                />
              ) : (
                <div className="info-row">
                  <span className="info-icon">
                    <Image size={20} />
                  </span>

                  <div className="info-text">
                    <span className="info-label">Business Logo</span>

                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        style={{
                          width: "64px",
                          height: "64px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1.5px solid var(--pg-border)",
                          marginTop: "4px",
                        }}
                      />
                    ) : (
                      <span className="info-value">—</span>
                    )}
                  </div>
                </div>
              )}

              {/* Commercial Register */}

              {isEditing ? (
                <FileUploadField
                  label="Commercial Register"
                  icon={<FileText size={20} />}
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  file={commercialFile}
                  previewUrl={
                    commercialFile
                      ? URL.createObjectURL(commercialFile)
                      : commercialPreview
                  }
                  onChange={handleFileChange(
                    setCommercialFile,
                    setCommercialPreview,
                  )}
                  onClear={clearFile(setCommercialFile, setCommercialPreview)}
                  error={errors.commercial_register}
                  hint="PDF, JPG or PNG · max 5 MB"
                />
              ) : (
                <div className="info-row">
                  <span className="info-icon">
                    <FileText size={20} />
                  </span>

                  <div className="info-text">
                    <span className="info-label">Commercial Register</span>

                    {commercialPreview ? (
                      <a
                        href={commercialPreview}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#10b981",
                          fontSize: "0.9rem",
                          marginTop: "2px",
                        }}
                      >
                        View document ↗
                      </a>
                    ) : (
                      <span className="info-value">—</span>
                    )}
                  </div>
                </div>
              )}

              {/* Tax Card */}

              {isEditing ? (
                <FileUploadField
                  label="Tax Card"
                  icon={<FileText size={20} />}
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  file={taxCardFile}
                  previewUrl={
                    taxCardFile
                      ? URL.createObjectURL(taxCardFile)
                      : taxCardPreview
                  }
                  onChange={handleFileChange(setTaxCardFile, setTaxCardPreview)}
                  onClear={clearFile(setTaxCardFile, setTaxCardPreview)}
                  error={errors.tax_card}
                  hint="PDF, JPG or PNG · max 5 MB"
                />
              ) : (
                <div className="info-row">
                  <span className="info-icon">
                    <FileText size={20} />
                  </span>

                  <div className="info-text">
                    <span className="info-label">Tax Card</span>

                    {taxCardPreview ? (
                      <a
                        href={taxCardPreview}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#10b981",
                          fontSize: "0.9rem",
                          marginTop: "2px",
                        }}
                      >
                        View document ↗
                      </a>
                    ) : (
                      <span className="info-value">—</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {errors.general && (
              <div
                style={{
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  marginTop: "0.5rem",
                }}
              >
                {errors.general}
              </div>
            )}

            {isEditing && (
              <div className="edit-actions">
                <button
                  className="btn-save"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  className="btn-cancel"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* ── Account Settings Card (unchanged) ── */}

          <div className="profile-card">
            <h2 className="card-title">Account Settings</h2>

            <div className="settings-list">
              <button
                className="setting-row"
                onClick={() => setView("password")}
              >
                <KeyRound size={18} />
                <span className="setting-label">Change Password</span>
                <ChevronRight size={18} className="chevron" />
              </button>

              <button
                className="setting-row setting-red"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut size={18} />
                <span className="setting-label">Log Out</span>
              </button>
              <button
                className="setting-row setting-red"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={18} />
                <span className="setting-label">Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout confirmation */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "2rem",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗑️</div>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", color: "#1f2937" }}>
              Delete Account?
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
              This action is permanent and cannot be undone. All your data will be deleted.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, padding: "0.65rem",
                  border: "1.5px solid #e5e7eb", borderRadius: "8px",
                  background: "white", color: "#374151",
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{
                  flex: 1, padding: "0.65rem",
                  border: "none", borderRadius: "8px",
                  background: "#ef4444", color: "white",
                  fontWeight: 600, cursor: "pointer",
                }}
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="logout-confirm-box">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
              👋
            </div>

            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem" }}>
              Log Out?
            </h3>

            <p
              style={{
                color: "var(--pg-subtitle)",
                fontSize: "0.9rem",
                margin: "0 0 1.5rem",
              }}
            >
              Are you sure you want to log out of your account?
            </p>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: "0.65rem",
                  border: "1.5px solid var(--pg-border)",
                  borderRadius: "8px",
                  background: "var(--pg-input-bg)",
                  color: "var(--pg-value)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: "0.65rem",
                  border: "none",
                  borderRadius: "8px",
                  background: "#ef4444",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending approval modal */}

      {showPendingModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "2rem",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>

            <h3
              style={{
                margin: "0 0 0.75rem",
                fontSize: "1.3rem",
                color: "#1f2937",
              }}
            >
              Waiting for Approval
            </h3>

            <p
              style={{
                color: "#6b7280",
                fontSize: "0.95rem",
                margin: "0 0 1.5rem",
                lineHeight: "1.5",
              }}
            >
              Your business account is currently under review.
              <br />
              You'll be able to access the Business Dashboard once approved.
            </p>

            <div
              style={{
                background: "#fef3c7",

                border: "1px solid #fcd34d",

                borderRadius: "8px",

                padding: "1rem",

                marginBottom: "1.5rem",

                fontSize: "0.9rem",

                color: "#92400e",
              }}
            >
              <strong>Status:</strong>{" "}
              {businessStatus === "pending"
                ? "Pending Approval"
                : "Under Review"}
            </div>

            <button
              onClick={() => setShowPendingModal(false)}
              style={{
                width: "100%",

                padding: "0.75rem",

                border: "1.5px solid #e5e7eb",

                borderRadius: "8px",

                background: "white",

                color: "#374151",

                fontWeight: 600,

                cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  LogOut,
  ChevronRight,
  KeyRound,
  Bell,
} from "lucide-react";
import "./MyProfileAdmin.css";
import { useAuth } from "../Context/AuthContext";

// ── Token helper ──────────────────────────────────────────────────────────────
// ── ChangePassword ────────────────────────────────────────────────────────────
function ChangePassword({ onCancel }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
      const token = localStorage.getItem("auth_token");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const endpoints = [
        "/api/profile/change-password",
        "/profile/change-password",
        "/api/change-password",
        "/change-password",
      ];

      let lastData = null;
      let response = null;
      let data = null;

      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
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

          try {
            data = await response.json();
          } catch {
            const text = await response.text();
            data = {
              message: text || `${response.status} ${response.statusText}`,
            };
          }

          if (response.ok) {
            alert("Password changed successfully!");
            onCancel();
            return;
          }

          lastData = data;
        } catch (requestError) {
          console.warn(
            `Password change request failed for ${endpoint}:`,
            requestError,
          );
          lastData = null;
          continue;
        }
      }

      if (lastData) {
        if (lastData.errors) {
          const newErrors = {};
          Object.keys(lastData.errors).forEach((f) => {
            newErrors[f] = Array.isArray(lastData.errors[f])
              ? lastData.errors[f][0]
              : lastData.errors[f];
          });
          setErrors(newErrors);
        } else {
          setErrors({
            general:
              lastData.message ||
              "Failed to change password. Please try again.",
          });
        }
      } else {
        setErrors({ general: "Network error. Please check your connection." });
      }
    } catch (error) {
      console.error("Password change error:", error);
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

// ── NotificationSettings ──────────────────────────────────────────────────────
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
      const token = localStorage.getItem("auth_token");
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UserProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [view, setView] = useState("main");
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editData, setEditData] = useState({ ...userData });

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (response.ok && data.user) {
        const u = {
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
        };
        setUserData(u);
        setEditData(u);
      }
    } catch (error) {
      console.error("Fetch user data error:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSave = async () => {
    const e = {};
    if (!editData.name.trim()) e.name = "Name is required";
    if (!editData.email.trim()) e.email = "Email is required";
    if (!editData.phone.trim()) e.phone = "Phone is required";
    if (!editData.address.trim()) e.address = "Address is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name.trim(),
          email: editData.email.trim(),
          phone: editData.phone.trim(),
          address: editData.address.trim(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (response.ok) {
        setUserData({ ...editData });
        setIsEditing(false);
        alert("Profile updated successfully!");
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
          setErrors({ general: "This email is already in use." });
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
    setEditData({ ...userData });
    setErrors({});
    setIsEditing(false);
  };
  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/home");
  };

  const infoFields = [
    { icon: <User size={20} />, label: "Full Name", key: "name", type: "text" },
    {
      icon: <Mail size={20} />,
      label: "Email Address",
      key: "email",
      type: "email",
    },
    {
      icon: <Phone size={20} />,
      label: "Phone Number",
      key: "phone",
      type: "tel",
    },
    {
      icon: <MapPin size={20} />,
      label: "Address",
      key: "address",
      type: "text",
    },
  ];

  if (view === "password")
    return <ChangePassword onCancel={() => setView("main")} />;
  if (view === "notifications")
    return <NotificationSettings onCancel={() => setView("main")} />;

  return (
    <>
      <div className="profile-page">
        <div className="profile-hero">
          <div className="hero-inner">
            <div>
              <h1 className="hero-title">My Profile</h1>
              <p className="hero-subtitle">Manage your account information</p>
            </div>
            <button
              className="hero-edit-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 size={16} /> {isEditing ? "Cancel Editing" : "Edit"}
            </button>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-card">
            <h2 className="card-title">Personal Information</h2>
            <div className="info-list">
              {infoFields.map(({ icon, label, key, type }) => (
                <div className="info-row" key={key}>
                  <span className="info-icon">{icon}</span>
                  <div className="info-text">
                    <span className="info-label">{label}</span>
                    {isEditing ? (
                      <div>
                        <input
                          className="info-input"
                          type={type}
                          value={editData[key]}
                          onChange={(e) => {
                            setEditData({ ...editData, [key]: e.target.value });
                            if (errors[key])
                              setErrors((p) => ({ ...p, [key]: "" }));
                          }}
                          style={{
                            border: errors[key]
                              ? "1.5px solid #ef4444"
                              : undefined,
                          }}
                        />
                        {errors[key] && (
                          <span
                            style={{ color: "#ef4444", fontSize: "0.85rem" }}
                          >
                            {errors[key]}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="info-value">{userData[key] || "—"}</span>
                    )}
                  </div>
                </div>
              ))}
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
                className="setting-row"
                onClick={() => setView("notifications")}
              >
                <Bell size={18} />
                <span className="setting-label">Notification Settings</span>
                <ChevronRight size={18} className="chevron" />
              </button>
              <button
                className="setting-row setting-red"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut size={18} />
                <span className="setting-label">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              padding: "2rem",
              maxWidth: "360px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
              👋
            </div>
            <h3
              style={{
                margin: "0 0 0.5rem",
                color: "#1f2937",
                fontSize: "1.2rem",
              }}
            >
              Log Out?
            </h3>
            <p
              style={{
                color: "#6b7280",
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
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "white",
                  color: "#374151",
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
    </>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  LogOut,
  Trash2,
  ChevronRight,
  KeyRound,
  LayoutDashboard,
} from "lucide-react";
import "./MyProfileAdmin.css";
import { useAuth } from "../Context/AuthContext";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

/* ─────────────────────────────────────────────
   Change Password sub-page
───────────────────────────────────────────── */
function ChangePassword({ onCancel, role, t }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const passwordRoute = `${BASE_URL}/admin/change-password`;

  const handleChange = async () => {
    const e = {};

if (!form.next) {
  e.password = t("adminProfile.newPasswordRequired");
} else if (form.next.length < 8) {
  e.password = t("adminProfile.passwordMin8Chars");
}

if (!form.confirm) {
  e.password_confirmation = t("adminProfile.confirmPassword");
} else if (form.next !== form.confirm) {
  e.password_confirmation = t("adminProfile.passwordsDoNotMatch");
}

setErrors(e);
if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(passwordRoute, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: form.current,
          password: form.next,
          password_confirmation: form.confirm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(t("adminProfile.passwordChangedSuccess"));
        setTimeout(() => onCancel(), 1500);
      } else if (data.errors) {
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
            data.message || t("adminProfile.failedChangePassword"),
        });
      }
    } catch (err) {
      setErrors({ general: t("adminProfile.networkError") });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div>
              <h1 className="hero-title">{t("adminProfile.changePasswordTitle")}</h1>
              <p className="hero-subtitle">{t("adminProfile.updateAccountPassword")}</p>
            </div>
          </div>
          <button className="hero-edit-btn" onClick={onCancel}>
            ← {t("adminProfile.back")}
          </button>
        </div>
      </div>

      <div className="profile-body">
        <div className="profile-card">
          <h2 className="card-title">{t("adminProfile.setNewPassword")}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
  ["current", "current_password", t("adminProfile.currentPassword")],
["next", "password", t("adminProfile.newPassword")],
["confirm", "password_confirmation", t("adminProfile.confirmNewPassword")],
].map(([formKey, errorKey, ph]) => (
              <div key={formKey} className="pw-input-wrap">
                <input
                  type="password"
                  placeholder={ph}
                  value={form[formKey]}
                  className={errors[errorKey] ? "has-error" : ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [formKey]: e.target.value }))
                  }
                />
                {errors[errorKey] && (
                  <span className="pw-error">{errors[errorKey]}</span>
                )}
              </div>
            ))}

            {errors.general && (
              <span className="pw-error">{errors.general}</span>
            )}
            {successMessage && (
              <span
                style={{ color: "#1a4a8a", fontSize: "0.88rem", fontWeight: 700 }}
              >
                {successMessage}
              </span>
            )}

            <button
              onClick={handleChange}
              disabled={isLoading}
              style={{
                padding: "0.8rem",
                background: isLoading ? "#94a3b8" : "#1a4a8a",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: "0.01em",
                transition: "background 0.15s",
              }}
            >
              {isLoading ? t("adminProfile.saving") : t("adminProfile.savePassword")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Profile Page
───────────────────────────────────────────── */
export default function UserProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, role, token: contextToken } = useAuth();
  const token =
    contextToken ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  useEffect(() => {
    if (role && role !== "super_admin" && role !== "manager") {
      if (role === "vendor") navigate("/business/profile");
      else navigate("/profile");
    }
  }, [role, navigate]);

  const [view, setView] = useState("main");
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      if (!token) return;
      const response = await fetch(`${BASE_URL}/myprofile`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      const user = data?.data || data;

      if (response.ok && user?.name) {
        const u = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
        };
        setUserData(u);
        setEditData(u);
      }
    } catch (error) {
      console.error("Fetch user data error:", error);
    }
  };

  useEffect(() => {
    if (token) fetchUserData();
  }, [token]);

  const handleSave = async () => {
    const e = {};
    if (!editData.name.trim()) e.name = t("adminProfile.nameRequired");
    if (!editData.email.trim()) e.email = t("adminProfile.emailRequired");
    if (!editData.phone.trim()) e.phone = t("adminProfile.phoneRequired");
    if (!editData.address.trim()) e.address = t("adminProfile.addressRequired");
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/profile`, {
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
      });
      const data = await response.json();

      if (response.ok) {
        setUserData({ ...editData });
        setIsEditing(false);
        await fetchUserData();
      } else if (response.status === 422 && data.errors) {
        const newErrors = {};
        Object.keys(data.errors).forEach((f) => {
          newErrors[f] = Array.isArray(data.errors[f])
            ? data.errors[f][0]
            : data.errors[f];
        });
        setErrors(newErrors);
      } else {
        setErrors({
          general: data.message || t("adminProfile.failedUpdateProfile"),
        });
      }
    } catch (error) {
      setErrors({ general: t("adminProfile.networkError") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setErrors({});
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${BASE_URL}/profile`, {
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

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (_) {
      // fail silently — still log out client
    } finally {
      logout();
      setShowLogoutConfirm(false);
      navigate("/home");
    }
  };

  const initials = userData.name
    ? userData.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const infoFields = [
    { icon: <User size={18} />, label: t("adminProfile.fullName"), key: "name", type: "text" },
    { icon: <Mail size={18} />, label: t("adminProfile.emailAddress"), key: "email", type: "email" },
    { icon: <Phone size={18} />, label: t("adminProfile.phoneNumber"), key: "phone", type: "tel" },
    { icon: <MapPin size={18} />, label: t("adminProfile.address"), key: "address", type: "text" },
  ];

  const settingItems = [
    {
      icon: <LayoutDashboard size={17} />,
      label: t("adminProfile.backToDashboard"),
      onClick: () => navigate("/admin"),
      red: false,
    },
    {
      icon: <KeyRound size={17} />,
      label: t("adminProfile.changePassword"),
      onClick: () => setView("password"),
      red: false,
    },
    {
      icon: <LogOut size={17} />,
      label: t("adminProfile.logOut"),
      onClick: () => setShowLogoutConfirm(true),
      red: true,
    },
    {
      icon: <Trash2 size={17} />,
      label: t("adminProfile.deleteAccount"),
      onClick: () => setShowDeleteConfirm(true),
      red: true,
    },
  ];

  if (view === "password")
    return <ChangePassword onCancel={() => setView("main")} role={role} t={t} />;

  const ConfirmModal = ({ emoji, title, message, onConfirm, onCancel, confirmLabel }) => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,45,94,0.45)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "2rem",
          maxWidth: "380px",
          width: "90%",
          boxShadow: "0 24px 60px rgba(15,45,94,0.2)",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{emoji}</div>
        <h3
          style={{
            margin: "0 0 0.5rem",
            fontSize: "1.15rem",
            color: "#0f2d5e",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: "#64748b",
            fontSize: "0.88rem",
            margin: "0 0 1.5rem",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "0.7rem",
              border: "1.5px solid #e2e8f0",
              borderRadius: "10px",
              background: "white",
              color: "#374151",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.88rem",
            }}
          >
            {t("adminProfile.cancel")}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "0.7rem",
              border: "none",
              borderRadius: "10px",
              background: "#ef4444",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.88rem",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="profile-page">
        <div className="profile-hero">
          <div className="hero-inner">
            <div className="hero-left">
              <div className="profile-avatar">{initials}</div>
              <div>
                <h1 className="hero-title">{userData.name || t("adminProfile.myProfile")}</h1>
                <p className="hero-subtitle">{t("adminProfile.manageAccountInfo")}</p>
              </div>
            </div>
            <button
              className="hero-edit-btn"
              onClick={() => {
                if (isEditing) handleCancel();
                else setIsEditing(true);
              }}
            >
              <Edit2 size={15} />
              {isEditing ? t("adminProfile.cancelEditing") : t("adminProfile.editProfile")}
            </button>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-card">
            <h2 className="card-title">{t("adminProfile.personalInformation")}</h2>
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
                          style={
                            errors[key]
                              ? { borderColor: "#ef4444" }
                              : undefined
                          }
                        />
                        {errors[key] && (
                          <span style={{ color: "#ef4444", fontSize: "0.82rem", fontWeight: 600 }}>
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
              <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "0.5rem", fontWeight: 600 }}>
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
                  {isLoading ? t("adminProfile.saving") : t("adminProfile.saveChanges")}
                </button>
                <button
                  className="btn-cancel"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  {t("adminProfile.cancel")}
                </button>
              </div>
            )}
          </div>

          <div className="profile-card">
            <h2 className="card-title">{t("adminProfile.accountSettings")}</h2>
            <div className="settings-list">
              {settingItems.map(({ icon, label, onClick, red }) => (
                <button
                  key={label}
                  className={`setting-row${red ? " setting-red" : ""}`}
                  onClick={onClick}
                >
                  <span className="setting-icon-wrap">{icon}</span>
                  <span className="setting-label">{label}</span>
                  {!red && <ChevronRight size={17} className="chevron" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          emoji="🗑️"
          title={t("adminProfile.deleteAccountTitle")}
          message={t("adminProfile.deleteAccountMessage")}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmLabel={t("adminProfile.yesDelete")}
        />
      )}

      {showLogoutConfirm && (
        <ConfirmModal
          emoji="👋"
          title={t("adminProfile.logOutTitle")}
          message={t("adminProfile.logOutMessage")}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
          confirmLabel={t("adminProfile.yesLogOut")}
        />
      )}
    </>
  );
}

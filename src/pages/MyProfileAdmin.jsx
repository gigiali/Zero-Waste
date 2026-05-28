import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import "./MyProfileAdmin.css";
import { useAuth } from "../Context/AuthContext";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

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
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/admin/change-password`, {
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
        setSuccessMessage("✅ Password changed successfully!");
        setTimeout(() => onCancel(), 1500);
      } else if (data.errors) {
        const newErrors = {};
        Object.keys(data.errors).forEach((f) => {
          newErrors[f] = Array.isArray(data.errors[f]) ? data.errors[f][0] : data.errors[f];
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: data.message || "Failed to change password. Please try again." });
      }
    } catch (err) {
      setErrors({ general: "Network error. Please check your connection." });
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
          <button className="hero-edit-btn" onClick={onCancel}>← Back</button>
        </div>
      </div>
      <div className="profile-body">
        <div className="profile-card">
          <h2 className="card-title">New Password</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                  onChange={(e) => setForm((p) => ({ ...p, [formKey]: e.target.value }))}
                  style={{ padding: "0.75rem 1rem", border: errors[errorKey] ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", outline: "none", width: "100%" }}
                />
                {errors[errorKey] && <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>{errors[errorKey]}</span>}
              </div>
            ))}
            {errors.general && <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>{errors.general}</span>}
            {successMessage && <span style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: 600 }}>{successMessage}</span>}
            <button onClick={handleChange} disabled={isLoading} style={{ padding: "0.75rem", background: isLoading ? "#9ca3af" : "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer" }}>
              {isLoading ? "Changing..." : "Save Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { logout, darkMode, toggleDarkMode, role, token: contextToken } = useAuth();
const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");
  useEffect(() => {
  if (role && role !== "super_admin" && role !== "manager") {
    if (role === "vendor") navigate("/business/profile");
    else navigate("/profile");
  }
}, [role]);

  const [view, setView] = useState("main");
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [userData, setUserData] = useState({ name: "", email: "", phone: "", address: "" });
  const [editData, setEditData] = useState({ ...userData });

  const fetchUserData = async () => {
    try {
      if (!token) return;
      const response = await fetch(`${BASE_URL}/myprofile`, {
        method: "GET",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log("🔍 Profile API response:", data);

      const user = data?.user ?? data?.data?.user ?? data?.data ?? data;

      if (response.ok && user?.name) {
        const u = { 
          name: user.name || "", 
          email: user.email || "", 
          phone: user.phone || "", 
          address: user.address || "" 
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
    if (!editData.name.trim()) e.name = "Name is required";
    if (!editData.email.trim()) e.email = "Email is required";
    if (!editData.phone.trim()) e.phone = "Phone is required";
    if (!editData.address.trim()) e.address = "Address is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editData.name.trim(), email: editData.email.trim(), phone: editData.phone.trim(), address: editData.address.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setUserData({ ...editData });
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else if (response.status === 422 && data.errors) {
        const newErrors = {};
        Object.keys(data.errors).forEach((f) => { newErrors[f] = Array.isArray(data.errors[f]) ? data.errors[f][0] : data.errors[f]; });
        setErrors(newErrors);
      } else {
        setErrors({ general: data.message || "Failed to update profile. Please try again." });
      }
    } catch (error) {
      setErrors({ general: "Network error. Please check your connection." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => { setEditData({ ...userData }); setErrors({}); setIsEditing(false); };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${BASE_URL}/profile`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (response.ok) { logout(); navigate("/home"); }
    } catch (err) {
      console.error("Delete account error:", err);
    }
  };

  const handleLogout = () => { logout(); setShowLogoutConfirm(false); navigate("/home"); };

  const infoFields = [
    { icon: <User size={20} />, label: "Full Name", key: "name", type: "text" },
    { icon: <Mail size={20} />, label: "Email Address", key: "email", type: "email" },
    { icon: <Phone size={20} />, label: "Phone Number", key: "phone", type: "tel" },
    { icon: <MapPin size={20} />, label: "Address", key: "address", type: "text" },
  ];

  if (view === "password") return <ChangePassword onCancel={() => setView("main")} />;

  return (
    <>
      <div className="profile-page">
        <div className="profile-hero">
          <div className="hero-inner">
            <div>
              <h1 className="hero-title">My Profile</h1>
              <p className="hero-subtitle">Manage your account information</p>
            </div>
            <button className="hero-edit-btn" onClick={() => setIsEditing(!isEditing)}>
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
                        <input className="info-input" type={type} value={editData[key]}
                          onChange={(e) => { setEditData({ ...editData, [key]: e.target.value }); if (errors[key]) setErrors((p) => ({ ...p, [key]: "" })); }}
                          style={{ border: errors[key] ? "1.5px solid #ef4444" : undefined }} />
                        {errors[key] && <span style={{ color: "#ef4444", fontSize: "0.85rem" }}>{errors[key]}</span>}
                      </div>
                    ) : (
                      <span className="info-value">{userData[key] || "—"}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.general && <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "0.5rem" }}>{errors.general}</div>}
            {isEditing && (
              <div className="edit-actions">
                <button className="btn-save" onClick={handleSave} disabled={isLoading}>{isLoading ? "Saving..." : "Save Changes"}</button>
                <button className="btn-cancel" onClick={handleCancel} disabled={isLoading}>Cancel</button>
              </div>
            )}
          </div>

          <div className="profile-card">
            <h2 className="card-title">Account Settings</h2>
            <div className="settings-list">
              <button className="setting-row" onClick={() => setView("password")}>
                <KeyRound size={18} />
                <span className="setting-label">Change Password</span>
                <ChevronRight size={18} className="chevron" />
              </button>
              <button className="setting-row" onClick={toggleDarkMode}>
                <span style={{ fontSize: 18 }}>{darkMode ? "☀️" : "🌙"}</span>
                <span className="setting-label">{darkMode ? "Light Mode" : "Dark Mode"}</span>
                <span className={`profile-switch ${darkMode ? "is-on" : ""}`}><span /></span>
              </button>
              <button className="setting-row setting-red" onClick={() => setShowLogoutConfirm(true)}>
                <LogOut size={18} />
                <span className="setting-label">Log Out</span>
              </button>
              <button className="setting-row setting-red" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={18} />
                <span className="setting-label">Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{ background: "white", borderRadius: "14px", padding: "2rem", maxWidth: "400px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗑️</div>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", color: "#1f2937" }}>Delete Account?</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>This action is permanent and cannot be undone. All your data will be deleted.</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleDeleteAccount} style={{ flex: 1, padding: "0.65rem", border: "none", borderRadius: "8px", background: "#ef4444", color: "white", fontWeight: 600, cursor: "pointer" }}>Yes, Delete My Account</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "14px", padding: "2rem", maxWidth: "360px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👋</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#1f2937", fontSize: "1.2rem" }}>Log Out?</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>Are you sure you want to log out of your account?</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleLogout} style={{ flex: 1, padding: "0.65rem", border: "none", borderRadius: "8px", background: "#ef4444", color: "white", fontWeight: 600, cursor: "pointer" }}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

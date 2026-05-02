import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, Calendar,
  Edit2, LogOut, ChevronRight, KeyRound, Bell, AtSign
} from "lucide-react";
import "./MyProfile.css";
import { useAuth } from "../Context/AuthContext";

// ── Inline placeholder sub-pages (replace with real imports once those files exist) ──

function ChangePassword({ onCancel }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="hero-inner">
          <div><h1 className="hero-title">Change Password</h1><p className="hero-subtitle">Update your password</p></div>
          <button className="hero-edit-btn" onClick={onCancel}>← Back</button>
        </div>
      </div>
      <div className="profile-body">
        <div className="profile-card">
          <h2 className="card-title">New Password</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[["current","Current password"],["next","New password"],["confirm","Confirm new password"]].map(([k, ph]) => (
              <input key={k} type="password" placeholder={ph} value={form[k]}
                onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                style={{ padding: "0.75rem 1rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }} />
            ))}
            <button onClick={() => { alert("Password changed!"); onCancel(); }}
              style={{ padding: "0.75rem", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
              Save Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ onCancel }) {
  const [prefs, setPrefs] = useState({ orders: true, offers: true, payments: true, news: false });
  const toggle = (k) => setPrefs(p => ({ ...p, [k]: !p[k] }));
  const labels = { orders: "Order updates", offers: "New offers nearby", payments: "Payment confirmations", news: "News & promotions" };
  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="hero-inner">
          <div><h1 className="hero-title">Notification Settings</h1><p className="hero-subtitle">Control what you hear about</p></div>
          <button className="hero-edit-btn" onClick={onCancel}>← Back</button>
        </div>
      </div>
      <div className="profile-body">
        <div className="profile-card">
          <h2 className="card-title">Preferences</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {Object.entries(prefs).map(([k, v]) => (
              <div key={k} onClick={() => toggle(k)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "1rem 0", borderBottom: "1px solid #f3f4f6", cursor: "pointer",
              }}>
                <span style={{ color: "#374151", fontSize: "0.95rem" }}>{labels[k]}</span>
                <div style={{
                  width: "44px", height: "24px", borderRadius: "12px",
                  background: v ? "#10b981" : "#d1d5db", position: "relative", transition: "background 0.2s",
                }}>
                  <div style={{
                    position: "absolute", top: "3px", left: v ? "23px" : "3px",
                    width: "18px", height: "18px", borderRadius: "50%", background: "white",
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={onCancel}
            style={{ marginTop: "1.5rem", padding: "0.75rem", width: "100%", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function ChangeEmail({ onCancel }) {
  const [step, setStep]       = useState(1);
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode]       = useState("");

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="hero-inner">
          <div><h1 className="hero-title">Change Email</h1><p className="hero-subtitle">Update your email address</p></div>
          <button className="hero-edit-btn" onClick={onCancel}>← Back</button>
        </div>
      </div>
      <div className="profile-body">
        <div className="profile-card">
          {step === 1 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 className="card-title">Enter New Email</h2>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>We'll send a verification code to your new email address.</p>
              <input type="email" placeholder="new@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                style={{ padding: "0.75rem 1rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }} />
              <button onClick={() => newEmail.includes("@") && setStep(2)}
                style={{ padding: "0.75rem", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
                Send Verification Code
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 className="card-title">Verify Your Email</h2>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>A code was sent to <strong>{newEmail}</strong>.</p>
              <input type="text" placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value)} maxLength={6}
                style={{ padding: "0.75rem 1rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "1.1rem", letterSpacing: "0.2em", textAlign: "center", outline: "none" }} />
              <button onClick={() => { alert("Email changed!"); onCancel(); }}
                style={{ padding: "0.75rem", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
                Confirm Change
              </button>
              <button onClick={() => setStep(1)}
                style={{ padding: "0.5rem", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.85rem" }}>
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Profile ──────────────────────────────────────────────────────────────
export default function MyProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [view, setView]                     = useState("main");
  const [isEditing, setIsEditing]           = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    address: "123 Main Street, City, Country",
    memberSince: "January 15, 2024",
  });
  const [editData, setEditData] = useState({ ...userData });

  const handleSave   = () => { setUserData({ ...editData }); setIsEditing(false); };
  const handleCancel = () => { setEditData({ ...userData }); setIsEditing(false); };
  const handleLogout = () => { logout(); setShowLogoutConfirm(false); navigate("/home"); };

  const infoFields = [
    { icon: <User size={20} />,     label: "Full Name",     key: "name",        type: "text"  },
    { icon: <Mail size={20} />,     label: "Email Address", key: "email",       type: "email" },
    { icon: <Phone size={20} />,    label: "Phone Number",  key: "phone",       type: "tel"   },
    { icon: <MapPin size={20} />,   label: "Address",       key: "address",     type: "text"  },
    { icon: <Calendar size={20} />, label: "Member Since",  key: "memberSince", type: "text",  readOnly: true },
  ];

  if (view === "password")      return <ChangePassword      onCancel={() => setView("main")} />;
  if (view === "notifications") return <NotificationSettings onCancel={() => setView("main")} />;
  if (view === "email")         return <ChangeEmail          onCancel={() => setView("main")} />;

  return (
    <>
      <div className="profile-page">
        {/* Hero */}
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

        {/* Body */}
        <div className="profile-body">
          {/* Personal Information */}
          <div className="profile-card">
            <h2 className="card-title">Personal Information</h2>
            <div className="info-list">
              {infoFields.map(({ icon, label, key, type, readOnly }) => (
                <div className="info-row" key={key}>
                  <span className="info-icon">{icon}</span>
                  <div className="info-text">
                    <span className="info-label">{label}</span>
                    {isEditing && !readOnly ? (
                      <input className="info-input" type={type} value={editData[key]}
                        onChange={(e) => setEditData({ ...editData, [key]: e.target.value })} />
                    ) : (
                      <span className="info-value">{userData[key]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {isEditing && (
              <div className="edit-actions">
                <button className="btn-save"   onClick={handleSave}>Save Changes</button>
                <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
              </div>
            )}
          </div>

          {/* Account Settings */}
          <div className="profile-card">
            <h2 className="card-title">Account Settings</h2>
            <div className="settings-list">
              <button className="setting-row" onClick={() => setView("password")}>
                <KeyRound size={18} /><span className="setting-label">Change Password</span><ChevronRight size={18} className="chevron" />
              </button>
              <button className="setting-row" onClick={() => setView("email")}>
                <AtSign size={18} /><span className="setting-label">Change Email</span><ChevronRight size={18} className="chevron" />
              </button>
              <button className="setting-row" onClick={() => setView("notifications")}>
                <Bell size={18} /><span className="setting-label">Notification Settings</span><ChevronRight size={18} className="chevron" />
              </button>
              <button className="setting-row setting-red" onClick={() => setShowLogoutConfirm(true)}>
                <LogOut size={18} /><span className="setting-label">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "14px", padding: "2rem", maxWidth: "360px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👋</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#1f2937", fontSize: "1.2rem" }}>Log Out?</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>Are you sure you want to log out of your account?</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleLogout}
                style={{ flex: 1, padding: "0.65rem", border: "none", borderRadius: "8px", background: "#ef4444", color: "white", fontWeight: 600, cursor: "pointer" }}>
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

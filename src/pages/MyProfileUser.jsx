import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, Edit2, LogOut, ChevronRight, KeyRound, Bell,
  Package, CalendarDays, CreditCard, ShoppingBag, Truck, X
} from "lucide-react";
import "./MyProfileAdmin.css";
import { useAuth } from "../Context/AuthContext";

function SettingsDrawer({ title, children, onClose }) {
  return (
    <div className="profile-drawer-overlay" onClick={onClose}>
      <aside className="profile-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="profile-drawer-header">
          <h2>{title}</h2>
          <button type="button" className="profile-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function ChangePassword({ onDone }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async () => {
    const e = {};
    if (!form.current) e.current_password = "Current password is required";
    if (!form.next) e.new_password = "New password is required";
    else if (form.next.length < 6) e.new_password = "Password must be at least 6 characters";
    if (!form.confirm) e.new_password_confirmation = "Please confirm your password";
    else if (form.next !== form.confirm) e.new_password_confirmation = "Passwords do not match";

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/change-password", {
        method: "POST",
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

      if (response.ok) {
        alert("Password changed successfully!");
        onDone();
      } else if (response.status === 422 && data.errors) {
        const newErrors = {};
        Object.keys(data.errors).forEach((f) => {
          newErrors[f] = Array.isArray(data.errors[f]) ? data.errors[f][0] : data.errors[f];
        });
        setErrors(newErrors);
      } else if (response.status === 401) {
        setErrors({ general: "Current password is incorrect." });
      } else {
        setErrors({ general: data.message || "Failed to change password. Please try again." });
      }
    } catch (error) {
      setErrors({
        general: error.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Network error. Please check your connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-drawer-body">
      {[
        ["current", "current_password", "Current password"],
        ["next", "new_password", "New password"],
        ["confirm", "new_password_confirmation", "Confirm new password"],
      ].map(([formKey, errorKey, placeholder]) => (
        <label className="profile-form-field" key={formKey}>
          <span>{placeholder}</span>
          <input
            type="password"
            value={form[formKey]}
            onChange={(e) => setForm((p) => ({ ...p, [formKey]: e.target.value }))}
            style={{ borderColor: errors[errorKey] ? "#ef4444" : undefined }}
          />
          {errors[errorKey] && <small className="profile-error">{errors[errorKey]}</small>}
        </label>
      ))}
      {errors.general && <small className="profile-error">{errors.general}</small>}
      <button type="button" className="btn-save profile-full-btn" onClick={handleChange} disabled={isLoading}>
        {isLoading ? "Changing..." : "Save Password"}
      </button>
    </div>
  );
}

function NotificationSettings({ onDone }) {
  const [prefs, setPrefs] = useState({ orders: true, offers: true, payments: true, news: false });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const labels = {
    orders: "Order updates",
    offers: "New offers nearby",
    payments: "Payment confirmations",
    news: "News and promotions",
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/notification-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(prefs),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Preferences saved successfully!");
        setTimeout(onDone, 700);
      } else {
        setMessage(data.message || "Failed to save preferences. Please try again.");
      }
    } catch {
      setMessage("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-drawer-body">
      {Object.entries(prefs).map(([key, value]) => (
        <button
          type="button"
          className="profile-toggle-row"
          key={key}
          onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
        >
          <span>{labels[key]}</span>
          <span className={`profile-switch ${value ? "is-on" : ""}`}>
            <span />
          </span>
        </button>
      ))}
      {message && <small className={message.includes("success") ? "profile-success" : "profile-error"}>{message}</small>}
      <button type="button" className="btn-save profile-full-btn" onClick={handleSave} disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}

function OrdersSection({ orders }) {
  return (
    <div className="profile-card">
      <div className="profile-section-head">
        <div>
          <h2 className="card-title">My Orders</h2>
          <p className="profile-muted">Every confirmed order will appear here with its full details.</p>
        </div>
        <span className="profile-count-badge">{orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className="profile-empty-state">
          <Package size={30} />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="profile-orders-list">
          {orders.map((order) => (
            <article className="profile-order-card" key={order.id || order.orderNumber}>
              <div className="profile-order-top">
                <div>
                  <strong>#{order.orderNumber || order.id}</strong>
                  <span>{order.status || "Confirmed"}</span>
                </div>
                <strong>EGP {Number(order.total || 0).toFixed(2)}</strong>
              </div>

              <div className="profile-order-meta">
                <span><MapPin size={14} /> {order.businessName || "Restaurant"}</span>
                <span><CalendarDays size={14} /> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Today"}</span>
                <span>
                  {order.deliveryMethod === "delivery" ? <Truck size={14} /> : <ShoppingBag size={14} />}
                  {order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
                </span>
                <span><CreditCard size={14} /> {order.paymentMethod || "Payment selected"}</span>
              </div>

              <div className="profile-order-items">
                {(order.items || []).map((item, idx) => (
                  <div className="profile-order-item" key={`${order.id}-${idx}`}>
                    <span>{item.quantity}x {item.title}</span>
                    <strong>EGP {Number(item.price || 0).toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <div className="profile-order-totals">
                <span>Subtotal: EGP {Number(order.subtotal || 0).toFixed(2)}</span>
                <span>Delivery: EGP {Number(order.deliveryFee || 0).toFixed(2)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activePanel, setActivePanel] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [orders, setOrders] = useState([]);

  const [userData, setUserData] = useState({ name: "", email: "", phone: "", address: "" });
  const [editData, setEditData] = useState({ ...userData });

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
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

  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch("/api/user/orders", {
        method: "GET",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Fetch user orders error:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchUserOrders();
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
      } else if (response.status === 422 && data.errors) {
        const newErrors = {};
        Object.keys(data.errors).forEach((f) => {
          newErrors[f] = Array.isArray(data.errors[f]) ? data.errors[f][0] : data.errors[f];
        });
        setErrors(newErrors);
      } else if (response.status === 409) {
        setErrors({ general: "This email is already in use." });
      } else {
        setErrors({ general: data.message || "Failed to update profile. Please try again." });
      }
    } catch (error) {
      setErrors({
        general: error.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Network error. Please check your connection.",
      });
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
    { icon: <Mail size={20} />, label: "Email Address", key: "email", type: "email" },
    { icon: <Phone size={20} />, label: "Phone Number", key: "phone", type: "tel" },
    { icon: <MapPin size={20} />, label: "Address", key: "address", type: "text" },
  ];

  const profileTabs = [
    { id: "profile", label: "My Profile", icon: <User size={17} /> },
    { id: "orders", label: "My Orders", icon: <Package size={17} /> },
    { id: "settings", label: "Account Settings", icon: <KeyRound size={17} /> },
  ];

  return (
    <>
      <div className="profile-page">
        <div className="profile-hero">
          <div className="hero-inner">
            <div>
              <h1 className="hero-title">My Profile</h1>
              <p className="hero-subtitle">Manage your account, orders, and settings</p>
            </div>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-tabs" role="tablist" aria-label="Profile sections">
            {profileTabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`profile-tab ${activeSection === tab.id ? "is-active" : ""}`}
                onClick={() => {
                  if (isEditing) handleCancel();
                  setActiveSection(tab.id);
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeSection === "profile" && (
            <div className="profile-card">
              <div className="profile-section-head">
                <h2 className="card-title">Personal Information</h2>
                <button className="hero-edit-btn profile-card-action" onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}>
                  <Edit2 size={16} /> {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>

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
                              if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
                            }}
                            style={{ borderColor: errors[key] ? "#ef4444" : undefined }}
                          />
                          {errors[key] && <span className="profile-error">{errors[key]}</span>}
                        </div>
                      ) : (
                        <span className="info-value">{userData[key] || "-"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.general && <div className="profile-error">{errors.general}</div>}
              {isEditing && (
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button className="btn-cancel" onClick={handleCancel} disabled={isLoading}>Cancel</button>
                </div>
              )}
            </div>
          )}

          {activeSection === "orders" && <OrdersSection orders={orders} />}

          {activeSection === "settings" && (
            <div className="profile-card">
              <h2 className="card-title">Account Settings</h2>
              <div className="settings-list">
                <button className="setting-row" onClick={() => setActivePanel("password")}>
                  <KeyRound size={18} /><span className="setting-label">Change Password</span><ChevronRight size={18} className="chevron" />
                </button>
                <button className="setting-row" onClick={() => setActivePanel("notifications")}>
                  <Bell size={18} /><span className="setting-label">Notification Settings</span><ChevronRight size={18} className="chevron" />
                </button>
                <button className="setting-row setting-red" onClick={() => setShowLogoutConfirm(true)}>
                  <LogOut size={18} /><span className="setting-label">Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {activePanel === "password" && (
        <SettingsDrawer title="Change Password" onClose={() => setActivePanel(null)}>
          <ChangePassword onDone={() => setActivePanel(null)} />
        </SettingsDrawer>
      )}

      {activePanel === "notifications" && (
        <SettingsDrawer title="Notification Settings" onClose={() => setActivePanel(null)}>
          <NotificationSettings onDone={() => setActivePanel(null)} />
        </SettingsDrawer>
      )}

      {showLogoutConfirm && (
        <div className="profile-drawer-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="profile-logout-icon"><LogOut size={28} /></div>
            <h3>Log Out?</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className="profile-confirm-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn-save profile-danger-btn" onClick={handleLogout}>Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

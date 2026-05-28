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
  Package,
  CalendarDays,
  CreditCard,
  ShoppingBag,
  Truck,
  X,
  Star,
} from "lucide-react";
import "./MyProfileAdmin.css";
import { useAuth } from "../Context/AuthContext";

function SettingsDrawer({ title, children, onClose }) {
  return (
    <div className="profile-drawer-overlay" onClick={onClose}>
      <aside className="profile-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="profile-drawer-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="profile-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
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
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("auth_token") ||
        sessionStorage.getItem("token");

      const response = await fetch("/api/profile/change-password", {
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
        setErrors({ general: "✅ Password changed successfully!" });
        setTimeout(() => onDone(), 1500);
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
          general: data.message || "Failed to change password. Please try again.",
        });
      }
    } catch (err) {
      setErrors({ general: "Network error. Please check your connection." });
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
            onChange={(e) =>
              setForm((p) => ({ ...p, [formKey]: e.target.value }))
            }
            style={{ borderColor: errors[errorKey] ? "#ef4444" : undefined }}
          />
          {errors[errorKey] && (
            <small className="profile-error">{errors[errorKey]}</small>
          )}
        </label>
      ))}
      {errors.general && (
        <small
          className={
            errors.general.includes("✅") ? "profile-success" : "profile-error"
          }
        >
          {errors.general}
        </small>
      )}
      <button
        type="button"
        className="btn-save profile-full-btn"
        onClick={handleChange}
        disabled={isLoading}
      >
        {isLoading ? "Changing..." : "Save Password"}
      </button>
    </div>
  );
}

function OrdersSection({ orders, isLoadingOrders }) {
  if (isLoadingOrders) {
    return (
      <div className="profile-card">
        <div className="profile-empty-state">
          <Package size={30} />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <div className="profile-section-head">
        <div>
          <h2 className="card-title">My Orders</h2>
          <p className="profile-muted">
            Every confirmed order will appear here with its full details.
          </p>
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
            <article
              className="profile-order-card"
              key={order.id || order.orderNumber}
            >
              <div className="profile-order-top">
                <div>
                  <strong>#{order.id || order.orderNumber}</strong>
                  <span>{order.status || order.order_status || "Confirmed"}</span>
                </div>
                <strong>
                  EGP {Number(order.total_amount || order.total || 0).toFixed(2)}
                </strong>
              </div>

              <div className="profile-order-meta">
                <span>
                  <MapPin size={14} />{" "}
                  {order.businessName || order.vendor_name || "Restaurant"}
                </span>
                <span>
                  <CalendarDays size={14} />{" "}
                  {order.created_at || order.createdAt
                    ? new Date(
                        order.created_at || order.createdAt
                      ).toLocaleString()
                    : "Today"}
                </span>
                <span>
                  {order.delivery_type === "delivery" ||
                  order.deliveryMethod === "delivery" ? (
                    <Truck size={14} />
                  ) : (
                    <ShoppingBag size={14} />
                  )}
                  {order.delivery_type === "delivery" ||
                  order.deliveryMethod === "delivery"
                    ? "Delivery"
                    : "Pickup"}
                </span>
                <span>
                  <CreditCard size={14} />{" "}
                  {order.payment_method || order.paymentMethod || "Payment selected"}
                </span>
              </div>

              <div className="profile-order-items">
                {(order.items || order.order_items || []).map((item, idx) => (
                  <div
                    className="profile-order-item"
                    key={`${order.id}-${idx}`}
                  >
                    <span>
                      {item.quantity || item.quality}x{" "}
                      {item.title || item.offer?.title || item.name}
                    </span>
                    <strong>
                      EGP{" "}
                      {Number(
                        item.price || item.offer?.discount_price || 0
                      ).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="profile-order-totals">
                <span>
                  Subtotal: EGP{" "}
                  {Number(order.subtotal || order.total_amount || 0).toFixed(2)}
                </span>
                <span>
                  Delivery: EGP{" "}
                  {Number(order.delivery_fees || order.deliveryFee || 0).toFixed(2)}
                </span>
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
  const { logout, darkMode, toggleDarkMode } = useAuth();
  const { role } = useAuth();

  useEffect(() => {
    if (role && role !== "customer") {
      if (role === "super_admin" || role === "manager")
        navigate("/admin/profile");
      else if (role === "vendor") navigate("/business/profile");
    }
  }, [role]);

  const [activePanel, setActivePanel] = useState(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteReviewConfirm, setShowDeleteReviewConfirm] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [errors, setErrors] = useState({});
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [editData, setEditData] = useState({ ...userData });

  const getAuthToken = () => {
    return localStorage.getItem("auth_token") || 
           localStorage.getItem("token") || 
           sessionStorage.getItem("auth_token") || 
           sessionStorage.getItem("token");
  };

  const fetchUserData = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/myprofile", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (response.ok) {
        const u = data.user || data.data || data; 
        
        const freshData = {
          name: u.name || u.full_name || u.username || "",
          email: u.email || "",
          phone: u.phone || u.phone_number || "",
          address: u.address || "",
        };

        setUserData(freshData);
        setEditData(freshData);
      } else {
        setErrors((prev) => ({ 
          ...prev, 
          general: data.message || "Failed to load profile settings." 
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.name === "AbortError" 
          ? "Request timed out. Please try again." 
          : "Network error. Please check your connection."
      }));
    }
  };

  const fetchUserOrders = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      setIsLoadingOrders(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/my-orders", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        setOrders(Array.isArray(data) ? data : data.orders || []);
      }
    } catch (error) {
      console.error("Fetch user orders error:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchUserReviews = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      setIsLoadingReviews(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/my-reviews", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        setReviews(Array.isArray(data) ? data : data.reviews || []);
      }
    } catch (error) {
      console.error("Fetch user reviews error:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setReviews((prev) => prev.filter((rev) => rev.id !== reviewId));
        setShowDeleteReviewConfirm(false);
        setSelectedReviewId(null);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete review.");
      }
    } catch (error) {
      console.error("Delete review error:", error);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchUserData();
      fetchUserOrders();
      fetchUserReviews();
    }
  }, [role]);

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
      const token = getAuthToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/customer/profile", {
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
          newErrors[f] = Array.isArray(data.errors[f])
            ? data.errors[f][0]
            : data.errors[f];
        });
        setErrors(newErrors);
      } else if (response.status === 409) {
        setErrors({ general: "This email is already in use." });
      } else {
        setErrors({
          general: data.message || "Failed to update profile. Please try again.",
        });
      }
    } catch (error) {
      setErrors({
        general:
          error.name === "AbortError"
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

  const handleDeleteAccount = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch("/api/customer/delete-profile", {
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

  const infoFields = [
    { icon: <User size={20} />, label: "Full Name", key: "name", type: "text" },
    { icon: <Mail size={20} />, label: "Email Address", key: "email", type: "email" },
    { icon: <Phone size={20} />, label: "Phone Number", key: "phone", type: "tel" },
    { icon: <MapPin size={20} />, label: "Address", key: "address", type: "text" },
  ];

  const profileTabs = [
    { id: "profile", label: "My Profile", icon: <User size={17} /> },
    { id: "orders", label: "My Orders", icon: <Package size={17} /> },
    { id: "reviews", label: "My Reviews", icon: <Star size={17} /> },
    { id: "settings", label: "Account Settings", icon: <KeyRound size={17} /> },
  ];

  return (
    <>
      <div className="profile-page">
        <div className="profile-hero">
          <div className="hero-inner">
            <div>
              <h1 className="hero-title">My Profile</h1>
              <p className="hero-subtitle">
                Manage your account, orders, and settings
              </p>
            </div>
          </div>
        </div>

        <div className="profile-body">
          {/* تعديل مساحة توزيع الأزرار وإضافة حواف داخلية مريحة لتمنع التلاصق */}
          <div
            className="profile-tabs"
            role="tablist"
            aria-label="Profile sections"
            style={{ 
              display: "flex", 
              flexDirection: "row", 
              flexWrap: "nowrap", 
              justifyContent: "space-between", 
              alignItems: "center",
              gap: "20px",
              padding: "10px 15px",
              overflowX: "auto",
              width: "100%"
            }}
          >
            {profileTabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`profile-tab ${activeSection === tab.id ? "is-active" : ""}`}
                style={{ 
                  whiteSpace: "nowrap", 
                  flexShrink: 0,
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: activeSection === tab.id ? "transparent" : "none",
                  border: "none",
                  cursor: "pointer"
                }}
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
                <button
                  className="hero-edit-btn profile-card-action"
                  onClick={() =>
                    isEditing ? handleCancel() : setIsEditing(true)
                  }
                >
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
                              if (errors[key])
                                setErrors((p) => ({ ...p, [key]: "" }));
                            }}
                            style={{
                              borderColor: errors[key] ? "#ef4444" : undefined,
                            }}
                          />
                          {errors[key] && (
                            <span className="profile-error">{errors[key]}</span>
                          )}
                        </div>
                      ) : (
                        <span className="info-value">
                          {userData[key] || "-"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.general && (
                <div className="profile-error">{errors.general}</div>
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
          )}

          {activeSection === "orders" && (
            <OrdersSection orders={orders} isLoadingOrders={isLoadingOrders} />
          )}

          {activeSection === "reviews" && (
            <div className="profile-card">
              <div className="profile-section-head">
                <div>
                  <h2 className="card-title">My Reviews</h2>
                  <p className="profile-muted">
                    Manage and view all your submitted application reviews.
                  </p>
                </div>
                <span className="profile-count-badge">{reviews.length}</span>
              </div>

              {isLoadingReviews ? (
                <div className="profile-empty-state">
                  <p>Loading your reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="profile-empty-state">
                  <Star size={30} />
                  <p>You haven't posted any reviews yet.</p>
                </div>
              ) : (
                <div className="profile-orders-list">
                  {reviews.map((review) => (
                    <div 
                      key={review.id} 
                      className="profile-order-card"
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", gap: "2px", color: "#f59e0b" }}>
                          {Array.from({ length: review.rating || review.Rating || 5 }).map((_, i) => (
                            <Star key={i} size={16} fill="currentColor" />
                          ))}
                        </div>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>
                          {review.comment || review.Comment || "No comment content provided."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReviewId(review.id);
                          setShowDeleteReviewConfirm(true);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "8px",
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === "settings" && (
            <div className="profile-card">
              <h2 className="card-title">Account Settings</h2>
              <div className="settings-list">
                <button
                  className="setting-row"
                  onClick={() => setActivePanel("password")}
                >
                  <KeyRound size={18} />
                  <span className="setting-label">Change Password</span>
                  <ChevronRight size={18} className="chevron" />
                </button>
                <button className="setting-row" onClick={toggleDarkMode}>
                  <span style={{ fontSize: 18 }}>{darkMode ? "☀️" : "🌙"}</span>
                  <span className="setting-label">
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                  <span className={`profile-switch ${darkMode ? "is-on" : ""}`}>
                    <span />
                  </span>
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
          )}
        </div>
      </div>

      {activePanel === "password" && (
        <SettingsDrawer
          title="Change Password"
          onClose={() => setActivePanel(null)}
        >
          <ChangePassword onDone={() => setActivePanel(null)} />
        </SettingsDrawer>
      )}

      {showDeleteReviewConfirm && (
        <div className="profile-drawer-overlay" onClick={() => setShowDeleteReviewConfirm(false)}>
          <div className="logout-confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="profile-logout-icon" style={{ color: "#ef4444" }}>
              <Trash2 size={28} />
            </div>
            <h3>Delete Review?</h3>
            <p>Are you sure you want to delete this review from the system?</p>
            <div className="profile-confirm-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteReviewConfirm(false)}>Cancel</button>
              <button className="btn-save profile-danger-btn" onClick={() => handleDeleteReview(selectedReviewId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="profile-drawer-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="logout-confirm-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-logout-icon">
              <Trash2 size={28} />
            </div>
            <h3>Delete Account?</h3>
            <p>
              This action is permanent and cannot be undone. All your data will
              be deleted.
            </p>
            <div className="profile-confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save profile-danger-btn"
                onClick={handleDeleteAccount}
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div
          className="profile-drawer-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="logout-confirm-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-logout-icon">
              <LogOut size={28} />
            </div>
            <h3>Log Out?</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className="profile-confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-save profile-danger-btn"
                onClick={handleLogout}
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

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, Edit2, LogOut, Trash2,
  ChevronRight, KeyRound, Package, CalendarDays,
  CreditCard, ShoppingBag, Truck, Star, X,
} from "lucide-react";
import "./MyProfileUser.css";
import { useAuth } from "../Context/AuthContext";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const getToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  sessionStorage.getItem("token") ||
  "";

/* ─────────────────────────────────────────────
   Change Password Drawer
───────────────────────────────────────────── */
function ChangePasswordDrawer({ onClose }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = async () => {
    const e = {};
    if (!form.current) e.current_password = "Current password is required";
    if (!form.next) e.new_password = "New password is required";
    else if (form.next.length < 6) e.new_password = "At least 6 characters";
    if (!form.confirm) e.new_password_confirmation = "Please confirm password";
    else if (form.next !== form.confirm) e.new_password_confirmation = "Passwords do not match";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/profile/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          current_password: form.current,
          password: form.next,
          password_confirmation: form.confirm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("✅ Password changed successfully!");
        setTimeout(() => onClose(), 1500);
      } else if (data.errors) {
        const newErrors = {};
        Object.keys(data.errors).forEach((f) => {
          newErrors[f] = Array.isArray(data.errors[f]) ? data.errors[f][0] : data.errors[f];
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: data.message || "Failed to change password." });
      }
    } catch {
      setErrors({ general: "Network error. Please check your connection." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="usr-drawer-overlay" onClick={onClose}>
      <aside className="usr-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="usr-drawer-header">
          <h2>Change Password</h2>
          <button className="usr-drawer-close" onClick={onClose} type="button">
            <X size={17} />
          </button>
        </div>

        {[
          ["current", "current_password", "Current password"],
          ["next", "new_password", "New password"],
          ["confirm", "new_password_confirmation", "Confirm new password"],
        ].map(([fk, ek, ph]) => (
          <div key={fk} className="usr-pw-wrap">
            <input
              type="password"
              placeholder={ph}
              value={form[fk]}
              className={errors[ek] ? "has-error" : ""}
              onChange={(e) => setForm((p) => ({ ...p, [fk]: e.target.value }))}
            />
            {errors[ek] && <span className="usr-pw-error">{errors[ek]}</span>}
          </div>
        ))}

        {errors.general && <span className="usr-pw-error">{errors.general}</span>}
        {success && <span className="usr-pw-success">{success}</span>}

        <button
          className="usr-btn-save"
          onClick={handleChange}
          disabled={isLoading}
          style={{ width: "100%", marginTop: "4px" }}
        >
          {isLoading ? "Saving…" : "Save Password"}
        </button>
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Confirm Modal
───────────────────────────────────────────── */
function ConfirmModal({ emoji, title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="usr-overlay" onClick={onCancel}>
      <div className="usr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="usr-modal-emoji">{emoji}</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="usr-modal-actions">
          <button className="usr-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="usr-modal-confirm" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Review Modal — used inside OrdersTab
───────────────────────────────────────────── */
function ReviewModal({ order, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const offerId =
    order.offer_id ||
    order.order_items?.[0]?.offer_id ||
    order.items?.[0]?.offer_id ||
    order.order_items?.[0]?.offer?.id ||
    order.items?.[0]?.offer?.id;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setError("Please select JPG or PNG only.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB.");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a rating."); return; }
    if (!offerId) { setError("Cannot submit: missing offer ID."); return; }

    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("offer_id", offerId);
      formData.append("rating", rating);
      formData.append("comment", comment);
      formData.append("order_id", order.id);
      formData.append("delivery_method", order.delivery_type || order.delivery_method || "pickup");
      if (image) formData.append("image", image);

      const res = await fetch(`${BASE_URL}/reviews`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit review.");
      }

      const data = await res.json();
      // pass back the new review so it shows instantly under the order
      onSubmitted(order.id, data.review || data.data || { rating, comment, id: Date.now() });
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="usr-overlay" onClick={onClose}>
      <div
        className="usr-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "400px", width: "92%" }}
      >
        <button
          style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="usr-modal-emoji">🎉</div>
        <h3 style={{ marginBottom: "4px" }}>Leave a Review</h3>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
          {order.vendor_name || order.vendor?.name || "Your order"}
        </p>

        {/* Stars */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "16px" }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
            >
              <Star size={28} fill={s <= rating ? "#fbbf24" : "none"} color={s <= rating ? "#fbbf24" : "#d1d5db"} />
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          placeholder="Write your comment… (optional, max 500 chars)"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 500))}
          rows={3}
          style={{
            width: "100%",
            borderRadius: "8px",
            border: "1.5px solid #e5e7eb",
            padding: "8px 10px",
            fontSize: "13px",
            resize: "vertical",
            marginBottom: "12px",
            boxSizing: "border-box",
          }}
        />

        {/* Image upload */}
        {!imagePreview ? (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "13px",
              color: "#6b7280",
              marginBottom: "12px",
              border: "1.5px dashed #d1d5db",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleImageChange} style={{ display: "none" }} />
            📷 Add photo (optional · JPG/PNG · max 2MB)
          </label>
        ) : (
          <div style={{ position: "relative", marginBottom: "12px", display: "inline-block" }}>
            <img src={imagePreview} alt="Preview" style={{ height: "80px", borderRadius: "8px", objectFit: "cover" }} />
            <button
              onClick={removeImage}
              style={{ position: "absolute", top: "-6px", right: "-6px", background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px" }}>{error}</p>}

        <div className="usr-modal-actions">
          <button className="usr-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="usr-modal-confirm" onClick={handleSubmit} disabled={isLoading || rating === 0}>
            {isLoading ? "Submitting…" : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Orders Tab
───────────────────────────────────────────── */
function OrdersTab({ orders, isLoading, onReviewSubmitted }) {
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  // local map of orderId -> review (populated after submit)
  const [localReviews, setLocalReviews] = useState({});

  const handleReviewSubmitted = (orderId, review) => {
    setLocalReviews((prev) => ({ ...prev, [orderId]: review }));
    onReviewSubmitted(); // trigger refresh of Reviews tab
  };

  const reviewingOrder = orders.find((o) => o.id === reviewingOrderId);

  if (isLoading) {
    return (
      <div className="usr-card">
        <div className="usr-empty">
          <div className="orm-spinner" style={{ marginBottom: "10px" }} />
          <p>Loading your orders from database…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usr-card">
      <div className="usr-section-head">
        <div>
          <h2 className="usr-card-title">My Orders</h2>
          <p className="usr-muted">All your confirmed orders appear here live from server.</p>
        </div>
        <span className="usr-count-badge">{orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className="usr-empty">
          <Package size={28} />
          <p>No orders found yet.</p>
          <span style={{ fontSize: "11px", color: "#9ca3af", marginTop: "5px" }}>
            Check your browser console to see the backend response structure.
          </span>
        </div>
      ) : (
        <div className="usr-orders-list">
          {orders.map((order) => {
            const currentStatus = order.order_status || order.status || "pending";
            const normalizedStatus = currentStatus.toLowerCase();
            const isDelivered = normalizedStatus === "delivered" || normalizedStatus === "completed";
            const isCancelled = normalizedStatus === "cancelled" || normalizedStatus === "rejected" || normalizedStatus === "failed";
            const submittedReview = localReviews[order.id];

            return (
              <article className="usr-order-card" key={order.id}>
                <div className="usr-order-top">
                  <div className="usr-order-top-left">
                    <strong>Order #{order.id}</strong>
                    <span
                      className="usr-order-badge"
                      style={{
                        background: isDelivered ? "#f0fdf4" : isCancelled ? "#fef2f2" : "#eff6ff",
                        color: isDelivered ? "#10b981" : isCancelled ? "#ef4444" : "#3b82f6",
                      }}
                    >
                      {/* ── NEW: show "Order Cancelled" label for cancelled orders ── */}
                      {isCancelled ? "Order Cancelled" : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                    </span>
                  </div>
                  <strong>EGP {Number(order.total_amount || order.total || 0).toFixed(2)}</strong>
                </div>

                <div className="usr-order-meta">
                  <span><MapPin size={13} /> {order.vendor_name || order.vendor?.name || "Zero Waste Vendor"}</span>
                  <span>
                    <CalendarDays size={13} />
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Just now"}
                  </span>
                  <span>
                    {order.delivery_type === "delivery" || order.delivery_method === "delivery" ? <Truck size={13} /> : <ShoppingBag size={13} />}
                    {order.delivery_type === "delivery" || order.delivery_method === "delivery" ? "Delivery" : "Pickup"}
                  </span>
                  <span><CreditCard size={13} /> {order.payment_method || "Cash On Delivery"}</span>
                </div>

                <div className="usr-order-items">
                  {(order.order_items || order.items || []).map((item, idx) => (
                    <div className="usr-order-item" key={idx}>
                      <span>
                        {item.quantity || 1}× {item.offer?.title || item.meal?.name || item.title || item.name || "Meal Item"}
                      </span>
                      <strong>EGP {Number(item.price || item.offer?.discount_price || 0).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                <div className="usr-order-totals">
                  <span>Total Paid: EGP {Number(order.total_amount || order.total || 0).toFixed(2)}</span>
                  {Number(order.delivery_fees || order.delivery_fee || 0) > 0 && (
                    <span>Delivery: EGP {Number(order.delivery_fees || order.delivery_fee).toFixed(2)}</span>
                  )}
                </div>

                {/* ── NEW: Review section — only for delivered/completed ── */}
                {isDelivered && (
                  <div style={{ marginTop: "10px", borderTop: "1px solid #f3f4f6", paddingTop: "10px" }}>
                    {submittedReview ? (
                      /* show the submitted review inline */
                      <div style={{ background: "#fffbeb", borderRadius: "8px", padding: "10px 12px" }}>
                        <div style={{ display: "flex", gap: "3px", marginBottom: "4px" }}>
                          {Array.from({ length: submittedReview.rating || submittedReview.Rating || 5 }).map((_, i) => (
                            <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                          ))}
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                          {submittedReview.comment || submittedReview.Comment || "Review submitted."}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingOrderId(order.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#fffbeb",
                          border: "1.5px solid #fcd34d",
                          borderRadius: "8px",
                          padding: "6px 14px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#92400e",
                          cursor: "pointer",
                        }}
                      >
                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                        Leave a Review
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewingOrder && (
        <ReviewModal
          order={reviewingOrder}
          onClose={() => setReviewingOrderId(null)}
          onSubmitted={(orderId, review) => {
            setReviewingOrderId(null);
            handleReviewSubmitted(orderId, review);
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Reviews Tab
───────────────────────────────────────────── */
function ReviewsTab({ reviews, isLoading, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  if (isLoading) {
    return (
      <div className="usr-card">
        <div className="usr-empty"><Star size={28} /><p>Loading reviews…</p></div>
      </div>
    );
  }

  return (
    <div className="usr-card">
      <div className="usr-section-head">
        <div>
          <h2 className="usr-card-title">My Reviews</h2>
          <p className="usr-muted">Reviews you've submitted for offers.</p>
        </div>
        <span className="usr-count-badge">{reviews.length}</span>
      </div>

      {reviews.length === 0 ? (
        <div className="usr-empty"><Star size={28} /><p>No reviews yet</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {reviews.map((rev) => (
            <div className="usr-review-card" key={rev.id}>
              <div>
                <div className="usr-stars">
                  {Array.from({ length: rev.rating || rev.Rating || 5 }).map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="usr-review-comment">
                  {rev.comment || rev.Comment || "No comment provided."}
                </p>
              </div>
              <button
                className="usr-review-delete"
                onClick={() => setConfirmId(rev.id)}
                type="button"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmId && (
        <ConfirmModal
          emoji="🗑️"
          title="Delete Review?"
          message="Are you sure you want to delete this review?"
          confirmLabel="Delete"
          onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main User Profile Component
───────────────────────────────────────────── */
export default function MyProfileUser() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [userData, setUserData] = useState({ name: "", email: "", phone: "", address: "" });
  const [editData, setEditData] = useState({ ...userData });
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/myprofile`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        const u = data.user || data.data?.user || data.data || data;
        const fresh = {
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          address: u.address || "",
        };
        setUserData(fresh);
        setEditData(fresh);
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  };

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${BASE_URL}/my-orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const responseData = await res.json();
      if (res.ok && responseData) {
        let extracted = [];
        if (Array.isArray(responseData)) extracted = responseData;
        else if (responseData.orders && Array.isArray(responseData.orders)) extracted = responseData.orders;
        else if (responseData.data) extracted = Array.isArray(responseData.data) ? responseData.data : (responseData.data.data || []);
        setOrders(extracted);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${BASE_URL}/my-reviews`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) setReviews(Array.isArray(data) ? data : data.reviews || data.data || []);
    } catch (err) {
      console.error("Fetch reviews error:", err);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    const handleOrderPlaced = () => {
      setLoadingOrders(true);
      fetchOrders();
      if (activeTab !== "orders") setActiveTab("orders");
    };
    window.addEventListener("order-placed", handleOrderPlaced);
    return () => window.removeEventListener("order-placed", handleOrderPlaced);
  }, [activeTab, fetchOrders]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleTabChange = (tabId) => {
    if (isEditing) handleCancel();
    setActiveTab(tabId);
    if (tabId === "orders") fetchOrders();
    else if (tabId === "reviews") fetchReviews();
  };

  // ── NEW: called after a review is submitted from OrdersTab ──
  // refreshes the Reviews tab data so it's ready when the user navigates there
  const handleReviewSubmitted = () => {
    fetchReviews();
  };

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
      const res = await fetch(`${BASE_URL}/customer/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: editData.name.trim(),
          email: editData.email.trim(),
          phone: editData.phone.trim(),
          address: editData.address.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserData({ ...editData });
        setIsEditing(false);
        await fetchProfile();
      } else if (res.status === 422 && data.errors) {
        const newErrors = {};
        Object.keys(data.errors).forEach((f) => {
          newErrors[f] = Array.isArray(data.errors[f]) ? data.errors[f][0] : data.errors[f];
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: data.message || "Failed to update profile." });
      }
    } catch {
      setErrors({ general: "Network error. Please check your connection." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setErrors({});
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${BASE_URL}/customer/delete-profile`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) { logout(); navigate("/home"); }
    } catch (err) { console.error(err); }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
    } finally {
      logout();
      setShowLogout(false);
      navigate("/home");
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/reviews/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) { console.error(err); }
  };

  const initials = userData.name
    ? userData.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  const infoFields = [
    { icon: <User size={17} />, label: "Full Name", key: "name", type: "text" },
    { icon: <Mail size={17} />, label: "Email Address", key: "email", type: "email" },
    { icon: <Phone size={17} />, label: "Phone Number", key: "phone", type: "tel" },
    { icon: <MapPin size={17} />, label: "Address", key: "address", type: "text" },
  ];

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "orders", label: "Orders", icon: <Package size={16} /> },
    { id: "reviews", label: "Reviews", icon: <Star size={16} /> },
    { id: "settings", label: "Settings", icon: <KeyRound size={16} /> },
  ];

  return (
    <>
      <div className="usr-page">
        <div className="usr-hero">
          <div className="usr-hero-inner">
            <div className="usr-hero-left">
              <div className="usr-avatar">{initials}</div>
              <div>
                <h1 className="usr-hero-title">{userData.name || "My Profile"}</h1>
                <p className="usr-hero-sub">Manage your account, orders & reviews</p>
              </div>
            </div>
            {activeTab === "profile" && (
              <button
                className="usr-edit-btn"
                onClick={() => { if (isEditing) handleCancel(); else setIsEditing(true); }}
              >
                <Edit2 size={14} />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            )}
          </div>
        </div>

        <div className="usr-body">
          <div className="usr-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`usr-tab${activeTab === tab.id ? " is-active" : ""}`}
                onClick={() => handleTabChange(tab.id)}
                type="button"
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "profile" && (
            <div className="usr-card">
              <h2 className="usr-card-title">Personal Information</h2>
              <div className="usr-info-list">
                {infoFields.map(({ icon, label, key, type }) => (
                  <div className="usr-info-row" key={key}>
                    <span className="usr-info-icon">{icon}</span>
                    <div className="usr-info-text">
                      <span className="usr-info-label">{label}</span>
                      {isEditing ? (
                        <div>
                          <input
                            className={`usr-input${errors[key] ? " has-error" : ""}`}
                            type={type}
                            value={editData[key]}
                            onChange={(e) => {
                              setEditData({ ...editData, [key]: e.target.value });
                              if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
                            }}
                          />
                          {errors[key] && <span className="usr-input-error">{errors[key]}</span>}
                        </div>
                      ) : (
                        <span className="usr-info-value">{userData[key] || "—"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {errors.general && <div className="usr-general-error">{errors.general}</div>}

              {isEditing && (
                <div className="usr-edit-actions">
                  <button className="usr-btn-save" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Saving…" : "Save Changes"}
                  </button>
                  <button className="usr-btn-cancel" onClick={handleCancel} disabled={isLoading}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <OrdersTab
              orders={orders}
              isLoading={loadingOrders}
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}

          {activeTab === "reviews" && (
            <ReviewsTab reviews={reviews} isLoading={loadingReviews} onDelete={handleDeleteReview} />
          )}

          {activeTab === "settings" && (
            <div className="usr-card">
              <h2 className="usr-card-title">Account Settings</h2>
              <div className="usr-settings-list">
                {[
                  { icon: <KeyRound size={16} />, label: "Change Password", onClick: () => setShowPassword(true), red: false, chevron: true },
                  { icon: <LogOut size={16} />, label: "Log Out", onClick: () => setShowLogout(true), red: true, chevron: false },
                  { icon: <Trash2 size={16} />, label: "Delete Account", onClick: () => setShowDelete(true), red: true, chevron: false },
                ].map(({ icon, label, onClick, red, chevron }) => (
                  <button
                    key={label}
                    className={`usr-setting-row${red ? " usr-setting-red" : ""}`}
                    onClick={onClick}
                    type="button"
                  >
                    <span className="usr-setting-icon">{icon}</span>
                    <span className="usr-setting-label">{label}</span>
                    {chevron && <ChevronRight size={16} className="usr-chevron" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showPassword && <ChangePasswordDrawer onClose={() => setShowPassword(false)} />}

      {showLogout && (
        <ConfirmModal
          emoji="👋"
          title="Log Out?"
          message="Are you sure you want to log out of your account?"
          confirmLabel="Yes, Log Out"
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}

      {showDelete && (
        <ConfirmModal
          emoji="🗑️"
          title="Delete Account?"
          message="This is permanent and cannot be undone. All your data, orders, and reviews will be deleted."
          confirmLabel="Yes, Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}

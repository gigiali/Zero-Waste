import { useAuth } from "../Context/AuthContext";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./HomePage.css";
import {
  Search, ChevronDown, Clock, MapPin, AlertCircle, Package,
  Utensils, Coffee, ShoppingCart, Hotel, Store, CheckCircle, Truck, X, Star,
} from "lucide-react";
import { useCart } from "../Context/CartContext";
import { useLocationContext } from "../Context/LocationContext";
import Footer from "../Components/Footer";
import { useCustomAlert, AlertContainer } from "../Components/CustomAlert";

const BASE_URL = import.meta.env.VITE_API_URL || "https://zero-waste-production.up.railway.app";

function CountdownTimer({ pickupTime }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      if (!pickupTime) return { hours: 0, minutes: 0, seconds: 0 };
      const targetTime = new Date(pickupTime);
      const diff = targetTime - new Date();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setIsUrgent(h === 0 && m < 30);
      return { hours: h, minutes: m, seconds: s };
    };
    setTimeLeft(calculateTime());
    const interval = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(interval);
  }, [pickupTime]);

  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className={`countdown-timer ${isUrgent ? "urgent" : ""}`}>
      <Clock size={13} />
      <span className="countdown-text">{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
    </div>
  );
}

function OrderTrackingStrip({ order, onDismiss }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const handleCancelOrder = async () => {
    const token =
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token") ||
      sessionStorage.getItem("token");
    try {
      const orderId = order.orderNumber || order.id || order.reservationId;
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setIsCancelled(true);
        setTimeout(() => onDismiss(), 2000);
      } else {
        alert(data.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling order");
    }
  };

  const [reviewDismissed, setReviewDismissed] = useState(() => {
    return localStorage.getItem("review_dismissed_" + (order.orderNumber || order.reservationId)) === "true";
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(() => {
    return localStorage.getItem("review_submitted_" + (order.orderNumber || order.reservationId)) === "true";
  });
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const dismissReview = () => {
    setShowReview(false);
    setReviewDismissed(true);
    localStorage.setItem("review_dismissed_" + (order.orderNumber || order.reservationId), "true");
  };

  const statusToStep = (status, deliveryMethod) => {
    switch (status && status.toLowerCase()) {
      case "pending":    return 1;
      case "processing": return 2;
      case "completed":  return deliveryMethod === "delivery" ? 4 : 3;
      case "in_transit": return 3;
      case "delivered":  return 4;
      case "cancelled":  return 1;
      default:           return 1;
    }
  };

  const pickupSteps = [
    { id: 1, label: "Pending",    icon: <Clock size={14} /> },
    { id: 2, label: "Processing", icon: <Package size={14} /> },
    { id: 3, label: "Completed",  icon: <CheckCircle size={14} /> },
  ];

  const deliverySteps = [
    { id: 1, label: "Pending",    icon: <Clock size={14} /> },
    { id: 2, label: "Processing", icon: <Package size={14} /> },
    { id: 3, label: "On the Way", icon: <Truck size={14} /> },
    { id: 4, label: "Delivered",  icon: <CheckCircle size={14} /> },
  ];

  const steps = order.deliveryMethod === "delivery" ? deliverySteps : pickupSteps;

  // ✅ FIXED: Event listener with proper ID matching
  useEffect(() => {
    const handleVendorUpdate = (e) => {
      console.log("🎯 Event received from vendor:", e.detail);
      console.log("📋 Order comparison:", {
        eventReservationId: e.detail.reservationId,
        eventOrderId: e.detail.orderId,
        orderReservationId: order.reservationId,
        orderOrderNumber: order.orderNumber,
        orderId: order.id
      });
      
      // ✅ Check all ID formats: reservationId first, then database IDs
      const eventMatches = 
        (e.detail.reservationId && String(e.detail.reservationId) === String(order.reservationId)) ||
        (e.detail.orderId && String(e.detail.orderId) === String(order.id)) ||
        (e.detail.orderId && String(e.detail.orderId) === String(order.orderNumber));
      
      if (eventMatches) {
        console.log("✅ MATCH FOUND! Updating UI with status:", e.detail.newStatus);
        
        const newStep = statusToStep(e.detail.newStatus, order.deliveryMethod);
        setCurrentStep(newStep);
        
        // Update sessionStorage
        const updatedOrder = { ...order, status: e.detail.newStatus };
        sessionStorage.setItem("zw_active_order", JSON.stringify(updatedOrder));
        
        // Show review if completed
        if (e.detail.newStatus.toLowerCase() === "completed" && !reviewSubmitted && !reviewDismissed) {
          console.log("🎉 Order completed - showing review");
          setShowReview(true);
        }
        
        // If cancelled
        if (e.detail.newStatus.toLowerCase() === "cancelled") {
          console.log("❌ Order cancelled");
          setIsCancelled(true);
          setTimeout(() => onDismiss(), 3000);
        }
      } else {
        console.log("❌ No match - this event is for a different order");
      }
    };

    window.addEventListener("zw-vendor-order-updated", handleVendorUpdate);
    window.addEventListener("order-status-changed", handleVendorUpdate);
    
    return () => {
      window.removeEventListener("zw-vendor-order-updated", handleVendorUpdate);
      window.removeEventListener("order-status-changed", handleVendorUpdate);
    };
  }, [order.reservationId, order.orderNumber, order.id, order.deliveryMethod, reviewSubmitted, reviewDismissed]);

  // ✅ Polling backup
  useEffect(() => {
    const fetchOrderStatus = async () => {
      const token =
        localStorage.getItem("auth_token") || localStorage.getItem("token") ||
        sessionStorage.getItem("auth_token") || sessionStorage.getItem("token");
      if (!token || !order.orderNumber) return;
      try {
        const res = await fetch(BASE_URL + "/api/orders/" + order.orderNumber, {
          headers: { Accept: "application/json", Authorization: "Bearer " + token },
        });
        const data = await res.json();
        if (res.ok) {
          const status = (data.data && data.data.order_status) || (data.order && data.order.order_status) || data.order_status;
          const normalized = status && status.toLowerCase();
          if (normalized === "cancelled") {
            setIsCancelled(true);
            setTimeout(() => onDismiss(), 3000);
            return;
          }
          setCurrentStep(statusToStep(status, order.deliveryMethod));
          if (normalized === "completed" && !reviewSubmitted && !reviewDismissed) {
            setShowReview(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch order status:", err);
      }
    };
    fetchOrderStatus();
    const interval = setInterval(fetchOrderStatus, 10000);
    return () => clearInterval(interval);
  }, [order.orderNumber, order.deliveryMethod, reviewSubmitted, reviewDismissed]);

  const handleSubmitReview = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token") ||
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (!token) { alert("Please sign in to submit a review."); return; }
    let offerId = order.offerId || order.id;
    if (!offerId && order.items && order.items.length > 0) {
      offerId = order.items[0].offer_id || order.items[0].id;
    }
    if (!offerId) { alert("Cannot submit review: missing offer ID."); return; }
    const formData = new FormData();
    formData.append("offer_id", offerId);
    formData.append("rating", rating);
    formData.append("comment", reviewText);
    formData.append("order_id", order.orderNumber || order.id);
    formData.append("delivery_method", order.deliveryMethod);
    formData.append("offer_title", (order.items && order.items[0] && order.items[0].title) || order.title || "Food Item");
    if (reviewImage) formData.append("image", reviewImage);
    try {
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = "Bearer " + token;
      const response = await fetch(BASE_URL + "/api/reviews", { method: "POST", headers, body: formData });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || "Failed to submit review");
      setSubmitted(true);
      setReviewDismissed(true);
      setReviewSubmitted(true);
      localStorage.setItem("review_dismissed_" + (order.orderNumber || order.reservationId), "true");
      localStorage.setItem("review_submitted_" + (order.orderNumber || order.reservationId), "true");
      setTimeout(() => onDismiss(), 1500);
    } catch (error) {
      alert("Unable to submit your review. Please try again.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) { alert("Please select JPG, JPEG, or PNG image only"); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Image must be less than 2MB"); return; }
    setReviewImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setReviewImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  if (isCancelled) {
    return (
      <div className="order-strip" style={{ borderColor: "#fca5a5" }}>
        <div className="order-strip-header">
          <div className="order-strip-meta">
            <div className="order-strip-icon-wrap" style={{ background: "#fef2f2", color: "#ef4444" }}><X size={13} /></div>
            <span className="order-strip-number">#{order.orderNumber || order.reservationId}</span>
            <span className="order-strip-dot" />
            <span className="order-strip-method-badge" style={{ background: "#fef2f2", color: "#ef4444" }}>Order Cancelled</span>
          </div>
          <div className="order-strip-right">
            <span className="order-strip-total">EGP {Number(order.total || 0).toFixed(2)}</span>
            <button className="order-strip-dismiss" onClick={onDismiss} title="Dismiss"><X size={12} /></button>
          </div>
        </div>
        <p style={{ fontSize: "13px", color: "#ef4444", margin: "6px 0 4px", padding: "0 4px" }}>
          This order was cancelled by the vendor.
        </p>
      </div>
    );
  }

  return (
    <div className="order-strip">
      <div className="order-strip-header">
        <div className="order-strip-meta">
          <div className="order-strip-icon-wrap"><Package size={13} /></div>
          <span className="order-strip-number">#{order.orderNumber || order.reservationId}</span>
          <span className="order-strip-dot" />
          <span className="order-strip-method-badge">
            {order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
          </span>
        </div>
        <div className="order-strip-right">
          <span className="order-strip-total">EGP {Number(order.total || 0).toFixed(2)}</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <button
              className="order-strip-dismiss"
              onClick={(currentStep === 1 || currentStep === 2) ? handleCancelOrder : onDismiss}
              title={(currentStep === 1 || currentStep === 2) ? "Cancel Order" : "Dismiss"}
              style={{
                background: (currentStep === 1 || currentStep === 2) ? "#1f2937" : "rgba(255,255,255,0.15)",
                borderRadius: "50%",
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                color: "white",
                flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
            {(currentStep === 1 || currentStep === 2) && (
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.75)", fontWeight: 600, letterSpacing: "0.3px", whiteSpace: "nowrap" }}>
                Cancel
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="order-strip-track">
        {steps.map((step, idx) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          return (
            <React.Fragment key={step.id}>
              <div className={"ost-step " + (done ? "done" : active ? "active" : "pending")}>
                <div className="ost-node">{done ? <CheckCircle size={13} /> : step.icon}</div>
                <span className="ost-label">{step.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={"ost-line " + (done ? "done" : "")} />}
            </React.Fragment>
          );
        })}
      </div>
      {showReview && (
        <div className="review-overlay" onClick={dismissReview}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <button className="review-close" onClick={dismissReview}><X size={18} /></button>
            <div className="review-header">
              <div className="review-icon">🎉</div>
              <h3>Order Delivered!</h3>
              <p>How was your experience?</p>
            </div>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className={"review-star " + (star <= rating ? "filled" : "")} onClick={() => setRating(star)}>
                  <Star size={18} fill={star <= rating ? "#fbbf24" : "none"} />
                </button>
              ))}
            </div>
            <textarea className="review-textarea" placeholder="Write your comment... (optional, max 500 chars)"
              value={reviewText} onChange={(e) => setReviewText(e.target.value.slice(0, 500))} rows={2} />
            <div className="review-image-section">
              {!imagePreview ? (
                <label className="review-image-upload">
                  <input type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleImageChange} style={{ display: "none" }} />
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Add Photo (optional)</span>
                  <span className="upload-hint">JPG, PNG - Max 2MB</span>
                </label>
              ) : (
                <div className="review-image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button className="remove-image-btn" onClick={removeImage}><X size={16} /></button>
                </div>
              )}
            </div>
            <button className="review-submit-btn" onClick={handleSubmitReview} disabled={rating === 0 || submitted}>
              {submitted ? "✓ Submitted" : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendedCard({ offer, onNavigate, onAddToCart, isLoggedIn, locationName, showAlert }) {
  const discount = offer.original_price && offer.discount_price
    ? Math.round(((offer.original_price - offer.discount_price) / offer.original_price) * 100)
    : 0;

  const imageUrl = offer.image_url || (offer.image
    ? (offer.image.startsWith("http") ? offer.image : BASE_URL + "/" + offer.image.replace(/^\/+/, ""))
    : null);

  const pickupTime = offer.expiration_time || null;

  return (
    <div
      onClick={() => onNavigate("/offer/" + offer.id)}
      style={{ background: "white", borderRadius: "16px", overflow: "hidden", cursor: "pointer", border: "2px solid #d1fae5", boxShadow: "0 4px 16px rgba(16,185,129,0.12)", transition: "transform 0.2s, box-shadow 0.2s", minWidth: "220px", flex: "0 0 220px" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(16,185,129,0.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(16,185,129,0.12)"; }}
    >
      <div style={{ position: "relative", height: "140px", background: "#f3f4f6" }}>
        {imageUrl ? (
          <img src={imageUrl} alt={offer.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.onerror = null; e.target.src = "/assets/images/e.png"; }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>🍽️</div>
        )}
        {discount > 0 && (
          <div style={{ position: "absolute", top: "8px", right: "8px", background: "#ef4444", color: "white", borderRadius: "8px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700 }}>
            -{discount}%
          </div>
        )}
        <div style={{ position: "absolute", bottom: "8px", left: "8px" }}>
          <CountdownTimer pickupTime={pickupTime} />
        </div>
      </div>
      <div style={{ padding: "12px" }}>
        <h4 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {offer.title}
        </h4>
        {offer.average_rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "6px" }}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#92400e" }}>{Number(offer.average_rating).toFixed(1)}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#10b981" }}>EGP {offer.discount_price}</span>
            {offer.original_price && (
              <span style={{ fontSize: "0.75rem", color: "#9ca3af", textDecoration: "line-through", marginLeft: "6px" }}>EGP {offer.original_price}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!offer.id) return;
              const offerToAdd = {
                ...offer,
                id: String(offer.id),
                discountedPrice: offer.discount_price || offer.discountedPrice || 0,
                originalPrice: offer.original_price || offer.originalPrice || 0,
                stock: offer.quantity_available || offer.stock || offer.quantity || 999,
                quantity_available: offer.quantity_available || offer.quantity || 999,
                image: imageUrl,
                vendor_id: (offer.branch && offer.branch.vendor_id) || offer.vendor_id || null,
                branch_id: offer.branch_id || (offer.branch && offer.branch.id) || null,
                vendor_name: offer.vendor_name || (offer.branch && offer.branch.vendor && offer.branch.vendor.business_name) || offer.location || "Restaurant",
              };
              const result = onAddToCart(offerToAdd, 1, isLoggedIn, locationName);
              if (result && showAlert && result.message !== "conflict") {
                showAlert(result.message, result.success ? "success" : "error");
              }
            }}
            style={{ background: "#10b981", color: "white", border: "none", borderRadius: "8px", padding: "0.3rem 0.7rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}

function SustainabilitySection() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token =
          localStorage.getItem("auth_token") || localStorage.getItem("token") ||
          sessionStorage.getItem("auth_token") || sessionStorage.getItem("token");
        if (!token) return;
        const res = await fetch(BASE_URL + "/api/customer/sustainability/metrics", {
          headers: { Accept: "application/json", Authorization: "Bearer " + token },
        });
        const data = await res.json();
        if (res.ok && data.metrics) setMetrics(data.metrics);
      } catch (err) {
        console.error("Failed to fetch sustainability metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading || !metrics) return null;

  const cards = [
    { icon: "🍽️", value: metrics.meals_saved || 0,                label: "Meals Rescued", color: "#10b981", bg: "#f0fdf4" },
    { icon: "🌍", value: (metrics.co2_prevented_kg || 0) + " kg", label: "CO₂ Prevented", color: "#3b82f6", bg: "#eff6ff" },
    { icon: "💰", value: "EGP " + Number(metrics.total_money_saved || 0).toFixed(0), label: "Money Saved", color: "#f59e0b", bg: "#fffbeb" },
  ];

  return (
    <section style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", borderRadius: "20px", padding: "28px 32px", border: "1px solid #d1fae5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "10px", padding: "6px 8px", display: "flex" }}>
            <span style={{ fontSize: "1.1rem" }}>🌱</span>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#065f46" }}>Your Sustainability Impact</h2>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>Your contribution to reducing food waste</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
          {cards.map((card) => (
            <div key={card.label} style={{ background: card.bg, borderRadius: "14px", padding: "18px 20px", border: "1px solid " + card.color + "22", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{card.icon}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: card.color, marginBottom: "4px" }}>{card.value}</div>
              <div style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 500 }}>{card.label}</div>
            </div>
          ))}
        </div>
        {metrics.thank_you_message && (
          <p style={{ margin: "16px 0 0", fontSize: "0.85rem", color: "#065f46", textAlign: "center", fontStyle: "italic" }}>
            {metrics.thank_you_message}
          </p>
        )}
      </div>
    </section>
  );
}

const categoryIcons = {
  All: <Store size={16} />,
  Restaurant: <Utensils size={16} />,
  Bakery: <Coffee size={16} />,
  Cafe: <Coffee size={16} />,
  Supermarket: <ShoppingCart size={16} />,
  Hotel: <Hotel size={16} />,
  Others: <Store size={16} />,
};

const sortOptions = [
  { label: "Highest Discount", value: "highest_discount" },
  { label: "Distance",         value: "nearest" },
  { label: "Rating",           value: "rating" },
];

function calculateDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart, showSignInPopup, setShowSignInPopup, showLocationPopup, setShowLocationPopup } = useCart();
  const { userLat, userLng, locationName } = useLocationContext();
  const { isLoggedIn } = useAuth();
  const { alerts, showAlert, removeAlert } = useCustomAlert();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [offers, setOffers] = useState([]);
  const [recommendedOffers, setRecommendedOffers] = useState([]);
  const [hasOrders, setHasOrders] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("highest_discount");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  // ✅ FIXED: Properly handle reservation_id from PaymentMethodPage
  useEffect(() => {
    if (location.state && location.state.trackingActive) {
      const orderData = {
        ...location.state,
        orderNumber: location.state.reservationId || location.state.orderNumber || location.state.id,
        id: location.state.id || location.state.orderNumber || location.state.reservationId,
        reservationId: location.state.reservationId
      };
      
      console.log("📍 Setting active order:", orderData);
      setActiveOrder(orderData);
      sessionStorage.setItem("zw_active_order", JSON.stringify(orderData));
      window.history.replaceState({}, document.title);
    } else {
      const savedOrder = sessionStorage.getItem("zw_active_order");
      if (savedOrder) {
        try { 
          const parsed = JSON.parse(savedOrder);
          setActiveOrder(parsed); 
        }
        catch (err) { 
          console.error("Failed to parse saved order:", err); 
          sessionStorage.removeItem("zw_active_order"); 
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest(".dropdown-container")) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    const fetchRecommended = async () => {
      const token =
        localStorage.getItem("auth_token") || localStorage.getItem("token") ||
        sessionStorage.getItem("auth_token") || sessionStorage.getItem("token");
      if (!token) return;
      try {
        const ordersRes = await fetch(BASE_URL + "/api/my-orders", {
          headers: { Accept: "application/json", Authorization: "Bearer " + token },
        });
        const ordersData = await ordersRes.json();
        const orders = ordersData && ordersData.data ? ordersData.data : (ordersData && ordersData.orders ? ordersData.orders : (Array.isArray(ordersData) ? ordersData : []));
        if (!orders || orders.length === 0) return;
        setHasOrders(true);
        const res = await fetch(BASE_URL + "/api/offers/smart-recommendations", {
          headers: { Accept: "application/json", Authorization: "Bearer " + token },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.data)) setRecommendedOffers(data.data);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      }
    };
    fetchRecommended();
  }, [isLoggedIn]);

  const categories = ["All", "Restaurant", "Bakery", "Cafe", "Supermarket", "Hotel", "Others"];

  useEffect(() => {
    const fetchOffers = async () => {
      if (selectedCategory === "Others") { setOffers([]); setError(null); setLoading(false); return; }
      setLoading(true); setError(null);
      try {
        const token =
          localStorage.getItem("auth_token") || localStorage.getItem("token") ||
          sessionStorage.getItem("auth_token") || sessionStorage.getItem("token");
        const vendorType = selectedCategory === "All" ? "" : selectedCategory;
        const endpoint = BASE_URL + "/api/offers" + (vendorType ? "?vendor_type=" + vendorType : "");
        const headers = { Accept: "application/json" };
        if (token) headers["Authorization"] = "Bearer " + token;
        const response = await fetch(endpoint, { method: "GET", headers });
        const data = await response.json();

        if (response.ok && (data.data || data.offers)) {
          const offersData = data.data || data.offers;
          if (offersData.length > 0) {
            const transformedOffers = offersData.map((offer, idx) => {
              const source = offer;
              const safeId = offer.id !== undefined ? offer.id : idx;
              let imageUrl = null;
              if (source.image) {
                const raw = source.image.trim();
                imageUrl = raw.startsWith("http") ? raw : BASE_URL + "/" + raw.replace(/^\/+/, "");
              }
              const qty = source.quantity_available !== undefined && source.quantity_available !== null ? source.quantity_available : 0;
              return {
                id: safeId,
                hasId: true,
                title: source.title,
                description: source.description,
                image: imageUrl,
                discount: source.discount_price
                  ? Math.round(((source.original_price - source.discount_price) / source.original_price) * 100)
                  : 0,
                originalPrice: source.original_price || 0,
                discountedPrice: source.discount_price || 0,
                quantity: qty,
                stock: qty,
                quantity_available: qty,
                status: source.status || "active",
                pickupTime: source.expiration_time || null,
                location:
                  (source.branch && source.branch.branch_name) ||
                  (source.branch && source.branch.store_address) ||
                  (source.vendor && source.vendor.business_name) ||
                  "Unknown",
                branchLat: source.branch && source.branch.lat,
                branchLng: source.branch && source.branch.long,
                rating: source.average_rating !== undefined ? source.average_rating : (source.rating || 0),
                category: (source.branch && source.branch.vendor && source.branch.vendor.vendor_type) || (source.vendor && source.vendor.vendor_type) || "Others",
                vendor_id: (source.branch && source.branch.vendor_id) || (source.vendor && source.vendor.id) || null,
                branch_id: (source.branch && source.branch.id) || null,
                vendor_name:
                  (source.branch && source.branch.vendor && source.branch.vendor.business_name) ||
                  (source.vendor && source.vendor.business_name) ||
                  (source.branch && source.branch.branch_name) ||
                  "Restaurant",
              };
            });
            setOffers(transformedOffers);
          } else {
            setError("No offers available right now");
          }
        } else {
          setError("No offers available right now");
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
        setError("Failed to load offers. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
    const interval = setInterval(fetchOffers, 30000);
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const filteredOffers = offers
    .filter((offer) => {
      const matchesSearch =
        !searchQuery ||
        (offer.title && offer.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (offer.location && offer.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    })
    .map((offer) => ({
      ...offer,
      distance: calculateDistance(userLat, userLng, offer.branchLat, offer.branchLng),
    }))
    .sort((a, b) => {
      switch (sortOption) {
        case "highest_discount": return b.discount - a.discount;
        case "nearest":
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        case "rating": return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });

  const currentSortLabel = (sortOptions.find((o) => o.value === sortOption) || {}).label || "Sort";
  const showPersonalisedSections = isLoggedIn && hasOrders;

  return (
    <div className="homepage-container">
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" /><div className="shape shape-2" /><div className="shape shape-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">🌱 Zero Waste, Maximum Taste</div>
          <h1 className="hero-title">Save Food,<br /><span className="hero-title-accent">Save Money</span></h1>
          <p className="hero-subtitle">Discover amazing food deals from local restaurants and reduce food waste</p>
          <div className="search-wrapper">
            <div className="search-icon-left"><Search size={20} /></div>
            <input type="text" placeholder="Search food, restaurants, or deals..." className="search-input"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button className="search-btn">Search</button>
          </div>
          {activeOrder && (
            <OrderTrackingStrip
              order={activeOrder}
              onDismiss={() => { setActiveOrder(null); sessionStorage.removeItem("zw_active_order"); }}
            />
          )}
        </div>
      </section>

      {showPersonalisedSections && recommendedOffers.length > 0 && (
        <section style={{ padding: "32px 24px 0", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "10px", padding: "6px 8px", display: "flex" }}>
              <Star size={18} color="white" fill="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>Recommended For You ✨</h2>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>Based on your interests and previous orders</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "thin", scrollbarColor: "#10b981 #f3f4f6" }}>
            {recommendedOffers.map((offer) => (
              <RecommendedCard key={offer.id} offer={offer} onNavigate={navigate}
                onAddToCart={addToCart} isLoggedIn={isLoggedIn} locationName={locationName} showAlert={showAlert} />
            ))}
          </div>
        </section>
      )}

      <section className="filter-section" style={{ overflow: "visible" }}>
        <div className="filter-inner" style={{ overflow: "visible" }}>
          <div className="filter-left">
            <h2 className="filter-title">Filter :</h2>
            <div className="categories-container">
              {categories.map((category) => (
                <button key={category} className={"category-button " + (selectedCategory === category ? "active" : "")}
                  onClick={() => setSelectedCategory(category)}>
                  <span className="cat-icon">{categoryIcons[category]}</span>
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-right">
            <div className="sort-text">Sort by:</div>
            {sortOption === "nearest" && !userLat && (
              <div style={{ fontSize: "0.8rem", color: "#92400e", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "8px", padding: "4px 10px" }}>
                📍 Set your location first
              </div>
            )}
            <div className="dropdown-container">
              <button className="dropdown-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <span>{currentSortLabel}</span>
                <ChevronDown size={16} style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "0.2s" }} />
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {sortOptions.map((opt) => (
                    <div key={opt.value} className={"dropdown-item " + (sortOption === opt.value ? "dropdown-item-active" : "")}
                      onClick={() => { setSortOption(opt.value); setIsDropdownOpen(false); }}>
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="offers-section">
        <div className="offers-header">
          <h2 className="offers-title">{selectedCategory === "All" ? "All Offers" : selectedCategory + " Offers"}</h2>
          <span className="offers-count">{filteredOffers.length} available</span>
        </div>

        {loading && offers.length === 0 && (
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Loading offers...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-container">
            <AlertCircle size={48} className="error-icon" />
            <h3 className="error-title">Error Loading Offers</h3>
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {!loading && !error && filteredOffers.length === 0 && (
          <div className="empty-container">
            <Package size={64} className="empty-icon" />
            <h3 className="empty-title">No Offers Found</h3>
            <p className="empty-message">
              {searchQuery ? "Try a different search term."
                : selectedCategory === "Others" ? "No other type offers available right now."
                : selectedCategory !== "All" ? "No " + selectedCategory + " offers available right now."
                : "No offers available right now."}
            </p>
          </div>
        )}

        {filteredOffers.length > 0 && (
          <div className="offers-grid">
            {filteredOffers.map((offer) => {
              const currentRating = Number(offer.rating || 0);
              return (
                <div key={offer.id} className="offer-card" onClick={() => navigate("/offer/" + offer.id)} style={{ cursor: "pointer" }}>
                  <div className="offer-image-container">
                    {offer.image ? (
                      <img src={offer.image} alt={offer.title} className="offer-image"
                        onError={(e) => { e.target.onerror = null; e.target.src = "/assets/images/e.png"; }} />
                    ) : (
                      <div className="offer-image-placeholder">🍽️</div>
                    )}
                    {offer.discount > 0 && <div className="discount-badge">-{offer.discount}%</div>}
                    <div className="image-bottom-bar">
                      <CountdownTimer pickupTime={offer.pickupTime} />
                      {offer.quantity > 0 && (
                        <div className="quantity-badge"><Package size={12} /><span>{offer.quantity} left</span></div>
                      )}
                    </div>
                  </div>
                  <div className="offer-content">
                    <h3 className="offer-title">{offer.title || "Untitled Offer"}</h3>
                    {offer.location && (
                      <div className="offer-location">
                        <MapPin size={13} />
                        <span>{offer.location}</span>
                        {offer.distance !== null && offer.distance !== undefined && (
                          <span className="offer-distance">· {offer.distance} km</span>
                        )}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px", marginTop: "2px" }}>
                      <div style={{ display: "flex", color: "#f59e0b" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14}
                            fill={star <= currentRating ? "currentColor" : "none"}
                            stroke={star <= currentRating ? "currentColor" : "#d1d5db"} />
                        ))}
                      </div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: currentRating > 0 ? "#92400e" : "#9ca3af" }}>
                        {currentRating > 0 ? currentRating.toFixed(1) : "0.0"}
                      </span>
                    </div>
                    <p className="offer-description">{offer.description || "No description available"}</p>
                    <div className="offer-footer">
                      <div className="price-container">
                        <span className="discounted-price">EGP {offer.discountedPrice || offer.price}</span>
                        {offer.originalPrice > 0 && <span className="original-price">EGP {offer.originalPrice}</span>}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!offer.id) return;
const offerToAdd = {
  ...offer,
  id: String(offer.id),
  stock: offer.quantity_available || offer.stock || offer.quantity || 999,
  quantity_available: offer.quantity_available || offer.stock || offer.quantity || 999,
  discountedPrice: offer.discountedPrice || offer.discount_price || 0,
  originalPrice: offer.originalPrice || offer.original_price || 0,
};                          const result = addToCart(offerToAdd, 1, isLoggedIn, locationName);
                          if (result && result.message !== "conflict") {
                            showAlert(result.message, result.success ? "success" : "error");
                          }
                        }}
                        style={{ background: "#10b981", color: "white", border: "none", borderRadius: "8px", padding: "0.4rem 0.8rem", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showLocationPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowLocationPopup(false)}>
          <div style={{ background: "white", borderRadius: "14px", padding: "2rem", maxWidth: "360px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📍</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#1f2937" }}>Location Required</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>Please set your location first before adding items to your cart.</p>
            <button onClick={() => setShowLocationPopup(false)}
              style={{ width: "100%", padding: "0.65rem", border: "none", borderRadius: "8px", background: "#10b981", color: "white", fontWeight: 600, cursor: "pointer" }}>
              OK
            </button>
          </div>
        </div>
      )}

      {showSignInPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowSignInPopup(false)}>
          <div style={{ background: "white", borderRadius: "14px", padding: "2rem", maxWidth: "360px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🛒</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#1f2937" }}>Sign In Required</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>You need to sign in first to add items to your cart.</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setShowSignInPopup(false)}
                style={{ flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => { setShowSignInPopup(false); navigate("/signin"); }}
                style={{ flex: 1, padding: "0.65rem", border: "none", borderRadius: "8px", background: "#10b981", color: "white", fontWeight: 600, cursor: "pointer" }}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {showPersonalisedSections && <SustainabilitySection />}
      <AlertContainer alerts={alerts} removeAlert={removeAlert} />
      <Footer />
    </div>
  );
}

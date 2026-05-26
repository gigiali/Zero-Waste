import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./HomePage.css";
import {
  Search,
  ChevronDown,
  Clock,
  MapPin,
  AlertCircle,
  Package,
  Utensils,
  Coffee,
  ShoppingCart,
  Hotel,
  Store,
  CheckCircle,
  Truck,
  X,
  Star,
} from "lucide-react";
import { useCart } from "../Context/CartContext";

// ── Countdown Timer ───────────────────────────────────────────────────────────
function CountdownTimer({ pickupTime }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      let targetTime;
      if (pickupTime && pickupTime.includes(":")) {
        const now = new Date();
        const timePart = pickupTime.replace("Today ", "").replace("today ", "");
        const [time, period] = timePart.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        targetTime = new Date(now);
        targetTime.setHours(hours, minutes || 0, 0, 0);
        if (targetTime <= now) targetTime.setDate(targetTime.getDate() + 1);
      } else {
        targetTime = new Date(Date.now() + Math.random() * 18000000 + 3600000);
      }
      const diff = targetTime - new Date();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setIsUrgent(h === 0 && m < 60);
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
      <span className="countdown-text">
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    </div>
  );
}

// ── Order Tracking Strip ──────────────────────────────────────────────────────
function OrderTrackingStrip({ order, onDismiss }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 4) setCurrentStep((s) => s + 1);
    }, 4000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 4 && !submitted) {
      const timer = setTimeout(() => setShowReview(true), 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, submitted]);

  const pickupSteps = [
    { id: 1, label: "Confirmed", icon: <CheckCircle size={14} /> },
    { id: 2, label: "Preparing", icon: <Package size={14} /> },
    { id: 3, label: "Ready", icon: <CheckCircle size={14} /> },
    { id: 4, label: "Picked Up", icon: <CheckCircle size={14} /> },
  ];
  const deliverySteps = [
    { id: 1, label: "Confirmed", icon: <CheckCircle size={14} /> },
    { id: 2, label: "Preparing", icon: <Package size={14} /> },
    { id: 3, label: "On the Way", icon: <Truck size={14} /> },
    { id: 4, label: "Delivered", icon: <CheckCircle size={14} /> },
  ];

  const steps =
    order.deliveryMethod === "delivery" ? deliverySteps : pickupSteps;

  const handleSubmitReview = async () => {
    const token =
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token") ||
      sessionStorage.getItem("token");

    const formData = new FormData();
    formData.append("offer_id", order.offerId || 1);
    formData.append("rating", rating);
    formData.append("comment", reviewText);
    formData.append("order_id", order.orderNumber);
    formData.append("delivery_method", order.deliveryMethod);
    if (reviewImage) formData.append("image", reviewImage);

    try {
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to submit review");

      setSubmitted(true);
      setShowReview(false);
      removeImage();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Unable to submit your review. Please try again.");
    }
  };

  const handleStarClick = (star) => setRating(star);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Please select JPG, JPEG, or PNG image only");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }
    setReviewImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setReviewImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  return (
    <div className="order-strip">
      {/* Header row */}
      <div className="order-strip-header">
        <div className="order-strip-meta">
          <div className="order-strip-icon-wrap">
            <Package size={13} />
          </div>
          <span className="order-strip-number">#{order.orderNumber}</span>
          <span className="order-strip-dot" />
          <span className="order-strip-method-badge">
            {order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
          </span>
        </div>
        <div className="order-strip-right">
          <span className="order-strip-total">
            EGP {Number(order.total ?? 0).toFixed(2)}
          </span>
          <button
            className="order-strip-dismiss"
            onClick={onDismiss}
            title="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Progress track */}
      <div className="order-strip-track">
        {steps.map((step, idx) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          return (
            <React.Fragment key={step.id}>
              <div
                className={`ost-step ${done ? "done" : active ? "active" : "pending"}`}
              >
                <div className="ost-node">
                  {done ? <CheckCircle size={13} /> : step.icon}
                </div>
                <span className="ost-label">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`ost-line ${done ? "done" : ""}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="review-overlay" onClick={() => setShowReview(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="review-close"
              onClick={() => setShowReview(false)}
            >
              <X size={18} />
            </button>
            <div className="review-header">
              <div className="review-icon">🎉</div>
              <h3>Order Delivered!</h3>
              <p>How was your experience?</p>
            </div>
            <div className="review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`review-star ${star <= rating ? "filled" : ""}`}
                  onClick={() => handleStarClick(star)}
                >
                  <Star size={18} fill={star <= rating ? "#fbbf24" : "none"} />
                </button>
              ))}
            </div>
            <textarea
              className="review-textarea"
              placeholder="Write your comment... (optional, max 500 chars)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
              rows={2}
            />
            <div className="review-image-section">
              {!imagePreview ? (
                <label className="review-image-upload">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Add Photo (optional)</span>
                  <span className="upload-hint">JPG, PNG - Max 2MB</span>
                </label>
              ) : (
                <div className="review-image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button className="remove-image-btn" onClick={removeImage}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <button
              className="review-submit-btn"
              onClick={handleSubmitReview}
              disabled={rating === 0}
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
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
  { label: "Distance", value: "nearest" },
  { label: "Rating", value: "rating" },
];

// ── HomePage ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("highest_discount");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    if (location.state?.trackingActive) {
      setActiveOrder(location.state);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest(".dropdown-container"))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

const categories = ["All", "Restaurant", "Bakery", "Cafe", "Supermarket", "Hotel", "Others"];

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token =
          localStorage.getItem("auth_token") ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("auth_token") ||
          sessionStorage.getItem("token");

        // Try different endpoints for public offers
        const vendorType = selectedCategory === "All" ? "" : selectedCategory.toLowerCase();
const endpoints = [
  `/api/offers${vendorType ? `?vendor_type=${vendorType}` : ""}`,
];

        let offersData = null;

        for (const endpoint of endpoints) {
          try {
            const headers = { Accept: "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(endpoint, {
              method: "GET",
              headers,
            });
            const data = await response.json();
            console.log("RAW API DATA:", data);
            if (response.ok && (data.data || data.offers)) {
              const dataToCheck = data.data || data.offers;
              if (dataToCheck.length > 0) {
                offersData = dataToCheck;
                break;
              }
            }
          } catch {
            // Try the next supported offers endpoint.
          }
        }

        if (offersData && offersData.length > 0) {
          const transformedOffers = offersData.map((offer, idx) => {
            const source = offer;
            
const resolvedId = offer.id ?? idx;
const hasRealId = true;
const safeId = resolvedId;
            return {
              id: safeId,
              hasId: hasRealId,
              title: source.title,
              description: source.description,
              image: `https://zero-waste-production.up.railway.app/storage/${source.image}` || "/assets/images/e.png",
              discount: source.discount_price
                ? Math.round(
                    ((source.original_price - source.discount_price) /
                      source.original_price) *
                      100,
                  )
                : 0,
              originalPrice: source.original_price || 0,
              discountedPrice: source.discount_price || 0,
              quantity: source.quantity_available || 0,
              pickupTime: source.expiration_time ? new Date(source.expiration_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "Today",
              location:
              source.branch?.branch_name ||
              source.branch?.store_address ||
              source.vendor?.business_name || "Unknown",
              distance: 0,
              rating: 4.5,
              category: source.branch?.type ||
              source.branch?.vendor?.business_name || "Restaurant",
            };
          });

          setOffers(transformedOffers);
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
  }, [selectedCategory]);

  const filteredOffers = offers
    .filter((offer) => {
      const matchesSearch =
        !searchQuery ||
        offer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    
    .sort((a, b) => {
      switch (sortOption) {
        case "highest_discount":
          return b.discount - a.discount;
        case "nearest":
          return (a.distance || 0) - (b.distance || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  const currentSortLabel =
    sortOptions.find((o) => o.value === sortOption)?.label || "Sort";

  return (
    <div className="homepage-container">
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">🌱 Zero Waste, Maximum Taste</div>
          <h1 className="hero-title">
            Save Food,
            <br />
            <span className="hero-title-accent">Save Money</span>
          </h1>
          <p className="hero-subtitle">
            Discover amazing food deals from local restaurants and reduce food
            waste
          </p>
          <div className="search-wrapper">
            <div className="search-icon-left">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search food, restaurants, or deals..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">Search</button>
          </div>

          {activeOrder && (
            <OrderTrackingStrip
              order={activeOrder}
              onDismiss={() => setActiveOrder(null)}
            />
          )}
        </div>
      </section>

      {/* ── Filter bar ── */}
      <section className="filter-section" style={{ overflow: "visible" }}>
        <div className="filter-inner" style={{ overflow: "visible" }}>
          <div className="filter-left">
            <h2 className="filter-title">Filter :</h2>
            <div className="categories-container">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-button ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="cat-icon">{categoryIcons[category]}</span>
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-right">
            <div className="sort-text">Sort by:</div>
            <div className="dropdown-container">
              <button
                className="dropdown-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{currentSortLabel}</span>
                <ChevronDown
                  size={16}
                  style={{
                    transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)",
                    transition: "0.2s",
                  }}
                />
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {sortOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className={`dropdown-item ${sortOption === opt.value ? "dropdown-item-active" : ""}`}
                      onClick={() => {
                        setSortOption(opt.value);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Offers ── */}
      <section className="offers-section">
        <div className="offers-header">
          <h2 className="offers-title">
            {selectedCategory === "All"
              ? "All Offers"
              : selectedCategory + " Offers"}
          </h2>
          <span className="offers-count">
            {filteredOffers.length} available
          </span>
        </div>

        {loading && (
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
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredOffers.length === 0 && (
          <div className="empty-container">
            <Package size={64} className="empty-icon" />
            <h3 className="empty-title">No Offers Found</h3>
            <p className="empty-message">
              {searchQuery
                ? "Try a different search term."
                : "No offers available right now."}
            </p>
          </div>
        )}

        {!loading && !error && filteredOffers.length > 0 && (
          <div className="offers-grid">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="offer-card"
                onClick={() => navigate(`/offer/${offer.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="offer-image-container">
                  {offer.image ? (
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="offer-image"
                    />
                  ) : (
                    <div className="offer-image-placeholder">🍽️</div>
                  )}
                  {offer.discount > 0 && (
                    <div className="discount-badge">-{offer.discount}%</div>
                  )}
                  <div className="image-bottom-bar">
                    <CountdownTimer pickupTime={offer.pickupTime} />
                    {offer.quantity > 0 && (
                      <div className="quantity-badge">
                        <Package size={12} />
                        <span>{offer.quantity} left</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="offer-content">
                  <h3 className="offer-title">
                    {offer.title || "Untitled Offer"}
                  </h3>
                  {offer.location && (
                    <div className="offer-location">
                      <MapPin size={13} />
                      <span>{offer.location}</span>
                      {offer.distance > 0 && (
                        <span className="offer-distance">
                          · {offer.distance} km
                        </span>
                      )}
                    </div>
                  )}
                  <p className="offer-description">
                    {offer.description || "No description available"}
                  </p>
                  <div className="offer-footer">
                    <div className="price-container">
                      <span className="discounted-price">
                        EGP {offer.discountedPrice || offer.price}
                      </span>
                      {offer.originalPrice > 0 && (
                        <span className="original-price">
                          EGP {offer.originalPrice}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(offer, 1);
                      }}
                      style={{
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShoppingCart,
  Check,
  Star,
  Store,
  Package,
  Tag,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { useLocationContext } from "../Context/LocationContext";
import "./OfferDetail.css";

const normalizeOffer = (payload) => {
  const source = payload?.data || payload?.offer || payload;
  if (!source) return null;

  const originalPrice = Number(
    source.original_price ?? source.originalPrice ?? 0,
  );
  const discountedPrice = Number(
    source.discount_price ?? source.discountedPrice ?? 0,
  );
  const quantity = Number(source.quantity_available ?? source.quantity ?? 0);
  const discount =
    originalPrice > 0 && discountedPrice > 0
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : (source.discount ?? 0);

  const branch = source.branch || {};
  const vendor = branch.vendor || source.vendor || {};

  const expirationTime = source.expiration_time
    ? new Date(source.expiration_time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Today";

  return {
    id: source.id,
    title: source.title || "Untitled Offer",
    vendor_id: branch.vendor_id || vendor.id || null,
    branch_id: branch.id || null,
    vendor_name: vendor.business_name || branch.branch_name || "Restaurant",
    stock: Number(source.quantity_available ?? source.quantity ?? 99),
    quantity_available: Number(source.quantity_available ?? source.quantity ?? 99),
    description: source.description || "No description available",
    image: source.image_url || (source.image
      ? `https://zero-waste-production.up.railway.app/storage/${source.image}`
      : "/images/e.png"),
    discount,
    originalPrice,
    discountedPrice,
    quantity,
    pickupTime: expirationTime,
    expirationRaw: source.expiration_time,
    location:
      branch.branch_name ||
      branch.store_address ||
      vendor.business_name ||
      "Restaurant",
    distance: source.distance || "",
    category: vendor.vendor_type || branch.vendor_type || branch.type || source.category || "Restaurant",
    restaurantName: vendor.business_name || branch.branch_name || "Restaurant",
    restaurantRating: source.average_rating || vendor.rating || 0,
    restaurantHours: branch.opening_hours || "N/A",
    restaurantPhone: branch.contact_phone || vendor.phone || "N/A",
    restaurantEmail: branch.contact_email || vendor.email || "N/A",
    restaurantLogo: vendor.logo || null,
    branchAddress: branch.store_address || "",
  };
};

const getReviewerName = (review) => {
  return (
    review.customer?.user?.name ||
    review.customer?.name ||
    review.customer?.full_name ||
    review.user?.name ||
    review.user?.full_name ||
    review.reviewer_name ||
    review.author_name ||
    review.name ||
    "Anonymous"
  );
};

const getInitials = (name) => {
  if (!name || name === "Anonymous") return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
};

function CountdownTimer({ expirationRaw }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      if (!expirationRaw) return;
      const target = new Date(expirationRaw);
      const diff = target - new Date();
      if (diff <= 0) { setIsExpired(true); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setIsUrgent(h === 0 && m < 30);
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [expirationRaw]);

  const pad = (n) => String(n).padStart(2, "0");

  if (isExpired) return <span className="od-expired-badge">Expired</span>;

  return (
    <div className={`od-countdown ${isUrgent ? "urgent" : ""}`}>
      <Clock size={14} />
      <span>{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
      <span className="od-countdown-label">{isUrgent ? "Hurry!" : "remaining"}</span>
    </div>
  );
}

export default function OfferDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart, showSignInPopup, setShowSignInPopup, showLocationPopup, setShowLocationPopup } = useCart();
  const { isLoggedIn } = useAuth();
  const { locationName } = useLocationContext();
  const [offer, setOffer] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(true);
  const [offerReviews, setOfferReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token =
          localStorage.getItem("auth_token") || localStorage.getItem("token") ||
          sessionStorage.getItem("auth_token") || sessionStorage.getItem("token");
        const headers = { Accept: "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`/api/offers/${id}`, { headers });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setOffer(normalizeOffer(data));
        } else {
          setOffer(null);
        }
      } catch {
        setOffer(null);
      } finally {
        if (mounted) setLoadingOffer(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    setLoadingReviews(true);
    (async () => {
      try {
        const token =
          localStorage.getItem("auth_token") || localStorage.getItem("token") ||
          sessionStorage.getItem("auth_token") || sessionStorage.getItem("token");
        const headers = { Accept: "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`/api/offers/${id}/reviews`, { headers });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setOfferReviews(data.data || data.reviews || data || []);
        }
      } catch {
        setOfferReviews([]);
      } finally {
        if (mounted) setLoadingReviews(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleAddToCart = () => {
    if (!offer) return;
    if (!isLoggedIn) { setShowSignInPopup(true); return; }
    if (!locationName) { setShowLocationPopup(true); return; }
    addToCart(offer, qty, true, locationName);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const avgRating =
    offerReviews.length > 0
      ? (offerReviews.reduce((a, r) => a + (r.rating || 0), 0) / offerReviews.length).toFixed(1)
      : null;

  if (loadingOffer) {
    return (
      <div className="od-loading">
        <div className="od-spinner" />
        <p>{t("offerDetail.loadingOffer")}</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="od-not-found">
        <div className="od-not-found-icon">🔍</div>
        <h2>{t("offerDetail.notFoundTitle")}</h2>
        <p>{t("offerDetail.notFoundMessage")}</p>
        <button onClick={() => navigate("/")} className="od-back-home-btn">
          ← {t("offerDetail.backToHome")}
        </button>
      </div>
    );
  }

  return (
    <div className="od-container">
      {/* ── Top Bar ── */}
      <div className="od-topbar">
        <button onClick={() => navigate(-1)} className="od-back-btn">
          <ArrowLeft size={18} /> {t("offerDetail.back")}
        </button>
        <span className="od-topbar-title">{t("offerDetail.pageTitle")}</span>
      </div>

      {/* ── Hero Image ── */}
      <div className="od-hero">
        <img src={offer.image} alt={offer.title} className="od-hero-img"
          onError={(e) => { e.target.src = "/images/e.png"; }} />
        <div className="od-hero-overlay" />
        {offer.discount > 0 && <div className="od-discount-badge">-{offer.discount}%</div>}
        <CountdownTimer expirationRaw={offer.expirationRaw} />
        <div className="od-hero-bottom">
          <div className="od-restaurant-info">
            <div>
              <h2 className="od-restaurant-name">{offer.title}</h2>
              <div className="od-restaurant-meta">
                <MapPin size={13} />
                <span>{offer.location}</span>
                {offer.restaurantRating > 0 && (
                  <span className="od-rating-pill">⭐ {offer.restaurantRating}</span>
                )}
              </div>
            </div>
          </div>
          <button className="od-view-restaurant-btn" onClick={() => navigate(`/restaurant/${id}`)}>
            <Store size={16} /> {t("offerDetail.viewRestaurant")}
          </button>
        </div>
      </div>

      {/* ── Offer Title + Price ── */}
      <div className="od-offer-header">
        <div className="od-offer-title-row">
          <span className="od-quantity-badge">
            <Package size={14} /> {offer.quantity} left
          </span>
        </div>
        <div className="od-price-row">
          <span className="od-price-new">EGP {offer.discountedPrice}</span>
          {offer.originalPrice > 0 && <span className="od-price-old">EGP {offer.originalPrice}</span>}
          {offer.discount > 0 && (
            <span className="od-save-badge">
              <Tag size={12} /> Save EGP {(offer.originalPrice - offer.discountedPrice).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="od-tabs">
        {["details", "restaurant", "reviews"].map((tab) => (
          <button key={tab} className={`od-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}>
            {tab === "details" ? "Offer Details"
              : tab === "restaurant" ? "Restaurant Info"
              : `Reviews ${offerReviews.length > 0 ? `(${offerReviews.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="od-tab-content">

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="od-details-tab">
            <div className="od-section-card">
              <h3 className="od-section-title">{t("offerDetail.aboutOffer")}</h3>
              <p className="od-description">{offer.description}</p>
            </div>

            <div className="od-section-card">
              <h3 className="od-section-title">{t("offerDetail.offerInformation")}</h3>

              {/* ── New Info Pills Design ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>

                {/* Available */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                  border: "1.5px solid #bbf7d0", borderRadius: "14px", padding: "14px 16px",
                }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "12px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Package size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {t("offerDetail.available")}
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#065f46", marginTop: "2px" }}>
                      {offer.quantity} {t("offerDetail.portions")}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                  border: "1.5px solid #bfdbfe", borderRadius: "14px", padding: "14px 16px",
                }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "12px",
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <MapPin size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {t("offerDetail.location")}
                    </div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#1e3a5f", marginTop: "2px" }}>
                      {offer.branchAddress || offer.location}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: "linear-gradient(135deg, #fdf4ff, #fae8ff)",
                  border: "1.5px solid #e9d5ff", borderRadius: "14px", padding: "14px 16px",
                }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "12px",
                    background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Tag size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {t("offerDetail.category")}
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "#4c1d95", marginTop: "2px" }}>
                      {offer.category}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Qty Selector */}
            <div className="od-section-card od-qty-card">
              <h3 className="od-section-title">{t("offerDetail.selectQuantity")}</h3>
              <div className="od-qty-row">
                <button className="od-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="od-qty-value">{qty}</span>
                <button className="od-qty-btn" onClick={() => setQty((q) => Math.min(offer.quantity, q + 1))}>+</button>
                <div className="od-qty-total">
                  {t("offerDetail.total")}: <strong>EGP {(offer.discountedPrice * qty).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restaurant Tab */}
        {activeTab === "restaurant" && (
          <div className="od-restaurant-tab">
            <div className="od-section-card">
              <div className="od-restaurant-header">
                {offer.restaurantLogo && (
                  <img src={offer.restaurantLogo} alt={offer.restaurantName} className="od-rest-logo-lg"
                    onError={(e) => { e.target.style.display = "none"; }} />
                )}
                <div>
                  <h2 className="od-rest-name-lg">{offer.restaurantName}</h2>
                  {offer.restaurantRating > 0 && (
                    <div className="od-rest-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={16}
                          fill={s <= Math.round(offer.restaurantRating) ? "#fbbf24" : "none"}
                          color={s <= Math.round(offer.restaurantRating) ? "#fbbf24" : "#d1d5db"} />
                      ))}
                      <span>{offer.restaurantRating} / 5</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="od-rest-details">
                {[
                  { icon: <MapPin size={16} />, key: "address", label: t("offerDetail.address"), value: offer.branchAddress || offer.location },
                  { icon: <Clock size={16} />, key: "openingHours", label: t("offerDetail.openingHours"), value: offer.restaurantHours },
                  { icon: <Phone size={16} />, key: "phone", label: t("offerDetail.phone"), value: offer.restaurantPhone },
                  { icon: <Mail size={16} />, key: "email", label: t("offerDetail.email"), value: offer.restaurantEmail },
                ].map(({ icon, key, label, value }) => (
                  <div className="od-rest-row" key={key}>
                    <div className="od-rest-row-icon">{icon}</div>
                    <div>
                      <div className="od-rest-row-label">{label}</div>
                      <div className="od-rest-row-value">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="od-view-rest-full-btn" onClick={() => navigate(`/restaurant/${id}`)}>
                <Store size={16} /> {t("offerDetail.viewFullRestaurant")}
              </button>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="od-reviews-tab">
            {loadingReviews ? (
              <div className="od-section-card" style={{ textAlign: "center", padding: "2rem" }}>
                <div className="od-spinner" />
              </div>
            ) : offerReviews.length === 0 ? (
              <div className="od-section-card od-no-reviews">
                <div style={{ fontSize: "2.5rem" }}>💬</div>
                <h3>{t("offerDetail.noReviewsTitle")}</h3>
                <p>{t("offerDetail.noReviewsMessage")}</p>
              </div>
            ) : (
              <>
                <div className="od-section-card od-reviews-summary">
                  <div className="od-avg-score">{avgRating}</div>
                  <div>
                    <div className="od-avg-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={20}
                          fill={s <= Math.round(avgRating) ? "#fbbf24" : "none"}
                          color={s <= Math.round(avgRating) ? "#fbbf24" : "#d1d5db"} />
                      ))}
                    </div>
                    <p className="od-reviews-count">{t("offerDetail.reviewsCount", { count: offerReviews.length })}</p>
                  </div>
                </div>
                <div className="od-reviews-list">
                  {offerReviews.slice().reverse().map((review, idx) => {
                    const reviewerName = getReviewerName(review);
                    const initials = getInitials(reviewerName);
                    return (
                      <div key={idx} className="od-review-card">
                        <div className="od-review-top">
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                            <div style={{
                              width: "36px", height: "36px", borderRadius: "50%",
                              background: "linear-gradient(135deg, #10b981, #059669)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontWeight: 700, fontSize: "0.82rem", flexShrink: 0,
                            }}>
                              {initials === "?" ? <User size={16} color="white" /> : initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#111827" }}>{reviewerName}</div>
                              <div className="od-review-stars" style={{ marginTop: "2px" }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={12}
                                    fill={s <= review.rating ? "#fbbf24" : "none"}
                                    color={s <= review.rating ? "#fbbf24" : "#d1d5db"} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="od-review-date">
                            {review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}
                          </span>
                        </div>
                        {review.comment && <p className="od-review-comment">"{review.comment}"</p>}
                        {review.image_url && <img src={review.image_url} alt="Review" className="od-review-img" />}
                        <div className="od-review-footer">
                          <span className="od-review-method">
                            {review.delivery_method === "delivery"
                              ? t("offerDetail.reviewDelivery")
                              : t("offerDetail.reviewPickup")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Location Popup ── */}
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

      {/* ── Sign In Popup ── */}
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

      {/* ── Sticky Add to Cart ── */}
      <div className="od-sticky-bar">
        <div className="od-sticky-price">
          <span className="od-sticky-label">{t("offerDetail.total")}</span>
          <span className="od-sticky-total">EGP {(offer.discountedPrice * qty).toFixed(2)}</span>
        </div>
        <button className={`od-add-btn ${added ? "added" : ""}`} onClick={handleAddToCart}>
          {added ? (
            <><Check size={18} /> {t("offerDetail.addedToCart")}</>
          ) : (
            <><ShoppingCart size={18} /> {t("offerDetail.addToCart")}</>
          )}
        </button>
      </div>
    </div>
  );
}

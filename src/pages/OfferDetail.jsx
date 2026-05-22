import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Share2, Phone, Mail, ShoppingCart, Check, Star, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../Context/CartContext';
import './OfferDetail.css';

const normalizeOffer = (payload) => {
  const source = payload?.offer || payload?.data || payload;
  if (!source) return null;

  const originalPrice = Number(source.originalPrice ?? source.original_price ?? source.price ?? 0);
  const discountedPrice = Number(source.discountedPrice ?? source.discount_price ?? source.discountPrice ?? 0);
  const quantity = Number(source.quantity ?? source.quantity_available ?? 0);
  const discount = source.discount ?? (
    originalPrice > 0 && discountedPrice > 0
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : 0
  );
  const branch = source.branch || {};
  const vendor = source.vendor || branch.vendor || {};

  return {
    id: source.id,
    title: source.title || "Untitled Offer",
    description: source.description || "No description available",
    image: source.image_url || source.image || "/images/e.png",
    discount,
    originalPrice,
    discountedPrice,
    discountPrice: discountedPrice,
    quantity,
    pickupTime: source.pickupTime || source.expiration_time || "Today",
    location: branch.name || source.location || vendor.business_name || "Restaurant",
    distance: source.distance || "",
    category: branch.type || source.category || "Restaurant",
    restaurantName: vendor.business_name || source.restaurantName || branch.name || "Restaurant",
    restaurantRating: source.restaurantRating || vendor.rating || 4.5,
    restaurantHours: source.restaurantHours || branch.opening_hours || "N/A",
    restaurantPhone: source.restaurantPhone || branch.contact_phone || vendor.phone || "N/A",
    restaurantEmail: source.restaurantEmail || branch.contact_email || vendor.email || "N/A",
  };
};

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const [offer, setOffer] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(true);

  const [offerReviews, setOfferReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    fetch(`/api/offers/${id}`)
      .then(r => r.json())
      .then(data => {
        setOffer(normalizeOffer(data));
        setLoadingOffer(false);
      })
      .catch(() => setLoadingOffer(false));
  }, [id]);

  useEffect(() => {
    setLoadingReviews(true);
    fetch(`/api/offers/${id}/reviews`)
      .then(r => r.json())
      .then(data => {
        setOfferReviews(data.reviews || []);
        setLoadingReviews(false);
      })
      .catch(() => setLoadingReviews(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!offer) return;
    addToCart(offer, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loadingOffer) {
    return (
      <div className="offer-detail-container">
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="offer-detail-container">
        <div className="not-found">
          <h2>Offer not found</h2>
          <button onClick={() => navigate('/')} className="back-btn">← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="offer-detail-container">

      {/* ── Back Bar ── */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} />
          Back
        </button>
        <button className="share-btn">
          <Share2 size={18} />
        </button>
      </div>

      {/* ── Hero ── */}
      <div className="detail-hero">
        <img src={offer.image || "/images/e.png"} alt={offer.title} className="detail-hero-image" />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <div className="detail-hero-text">
            <h1>{offer.restaurantName}</h1>
            <div className="detail-hero-meta">
              <span><MapPin size={14} /> {offer.location} · {offer.distance}</span>
              <span className="hero-rating">⭐ {offer.restaurantRating}</span>
            </div>
          </div>

          <button
            onClick={() => navigate(`/restaurant/${id}`)}
            className="view-restaurant-btn"
            title="View restaurant details"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "0.5rem 1rem",
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              color: "white",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "all 0.25s",
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Store size={18} />
            View Restaurant
          </button>
        </div>
      </div>

      {/* ── Info Strip ── */}
      <div className="detail-info-strip">
        <div className="detail-info-strip-inner">
          <div className="info-strip-item">
            <div className="info-strip-icon"><Clock size={18} /></div>
            <div>
              <div className="info-strip-label">Open Hours</div>
              <div className="info-strip-value">{offer.restaurantHours}</div>
            </div>
          </div>
          <div className="info-strip-item">
            <div className="info-strip-icon"><Phone size={18} /></div>
            <div>
              <div className="info-strip-label">Phone</div>
              <div className="info-strip-value">{offer.restaurantPhone}</div>
            </div>
          </div>
          <div className="info-strip-item">
            <div className="info-strip-icon"><Mail size={18} /></div>
            <div>
              <div className="info-strip-label">Email</div>
              <div className="info-strip-value">{offer.restaurantEmail}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">

        {/* Left — Offers */}
        <div className="offers-section">
          <h2>Available Offers (1)</h2>

          <div className="offer-card">
            <img src={offer.image || "/images/e.png"} alt={offer.title} className="offer-card-image" />
            <div className="offer-card-body">
              <div className="offer-card-top">
                <span className="offer-card-title">{offer.title}</span>
                <span className="offer-badge">-{offer.discount}%</span>
              </div>
              <p className="offer-card-desc">{offer.description}</p>
              <div className="offer-card-pricing">
                <span className="price-new">EGP {offer.discountedPrice}</span>
                <span className="price-old">EGP {offer.originalPrice}</span>
              </div>
              <div className="offer-card-footer">
                <div className="offer-meta">
                  <span>📦 {offer.quantity} left in stock</span>
                  <span><Clock size={13} /> Pickup: {offer.pickupTime}</span>
                </div>
                <div className="offer-card-actions">
                  <select
                    className="qty-select"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  >
                    {[...Array(Math.max(1, Math.min(Number(offer.quantity || 0), 10)))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Qty: {i + 1}</option>
                    ))}
                  </select>
                  <button
                    className={`reserve-btn ${added ? 'reserve-btn-added' : ''}`}
                    onClick={handleAddToCart}
                  >
                    {added ? <><Check size={15} /> Added!</> : <><ShoppingCart size={15} /> Add to Cart</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Sidebar */}
        <div className="detail-sidebar">
          <div className="sidebar-card">
            <h3>Restaurant Info</h3>
            <div className="sidebar-row">
              <span className="sidebar-label">Name</span>
              <span className="sidebar-value">{offer.restaurantName}</span>
            </div>
            <div className="sidebar-row">
              <span className="sidebar-label">Category</span>
              <span className="sidebar-value">{offer.category}</span>
            </div>
            <div className="sidebar-row">
              <span className="sidebar-label">Rating</span>
              <span className="sidebar-value">⭐ {offer.restaurantRating} / 5.0</span>
            </div>
            <div className="sidebar-row">
              <span className="sidebar-label">Distance</span>
              <span className="sidebar-value">{offer.distance}</span>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="sidebar-card reviews-card">
            <h3>Customer Reviews</h3>
            {loadingReviews ? (
              <p className="no-reviews">Loading reviews...</p>
            ) : offerReviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to order and review!</p>
            ) : (
              <>
                <div className="reviews-summary">
                  <div className="avg-rating">
                    <span className="avg-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          fill={star <= Math.round(offerReviews.reduce((a, r) => a + r.rating, 0) / offerReviews.length) ? "#fbbf24" : "none"}
                          color={star <= Math.round(offerReviews.reduce((a, r) => a + r.rating, 0) / offerReviews.length) ? "#fbbf24" : "#d1d5db"}
                        />
                      ))}
                    </span>
                    <span className="avg-text">
                      {(offerReviews.reduce((a, r) => a + r.rating, 0) / offerReviews.length).toFixed(1)} / 5
                    </span>
                  </div>
                  <span className="reviews-count">{offerReviews.length} review{offerReviews.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="reviews-list">
                  {offerReviews.slice().reverse().map((review, idx) => (
                    <div key={idx} className="review-item">
                      <div className="review-header-row">
                        <span className="review-order-id">Order {review.order_id}</span>
                        <span className="review-date">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="review-stars-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= review.rating ? "#fbbf24" : "none"}
                            color={star <= review.rating ? "#fbbf24" : "#d1d5db"}
                          />
                        ))}
                      </div>
                      {review.comment && <p className="review-text">"{review.comment}"</p>}
                      {review.imageBase64 && (
                        <img src={review.imageBase64} alt="Review" className="review-image" />
                      )}
                      <span className="review-method">{review.delivery_method === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

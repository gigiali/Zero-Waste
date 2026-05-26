import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Mail, Star, Navigation as NavigationIcon, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import './RestaurantDetail.css';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [vendorOffers, setVendorOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem("auth_token") ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("auth_token") ||
          sessionStorage.getItem("token");
        const headers = { Accept: "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Fetch the offer to get vendor/branch info
        const res = await fetch(`/api/offers/${id}`, { headers });
        if (!mounted) return;
        if (!res.ok) { setLoading(false); return; }

        const data = await res.json();
        const source = data.data || data.offer || data;
        setOffer(source);

        // Fetch all offers to filter by same vendor
        const vendorId = source.branch?.vendor?.id;
        if (vendorId) {
          const allRes = await fetch(`/api/offers`, { headers });
          if (!mounted) return;
          if (allRes.ok) {
            const allData = await allRes.json();
            const all = allData.data || allData.offers || [];
            const filtered = all.filter(o => o.branch?.vendor?.id === vendorId);
            setVendorOffers(filtered);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="restaurant-detail-container">
        <div className="not-found">
          <div className="rd-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="restaurant-detail-container">
        <div className="not-found">
          <h2>Restaurant not found</h2>
          <button onClick={() => navigate('/')} className="back-btn">← Back to Home</button>
        </div>
      </div>
    );
  }

  const branch = offer.branch || {};
  const vendor = branch.vendor || {};
  const lat = branch.lat;
  const lng = branch.long;

  return (
    <div className="restaurant-detail-container">

      {/* ── Back Bar ── */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      {/* ── Hero ── */}
      <div className="detail-hero">
        <img
          src={vendor.logo || "/images/e.png"}
          alt={vendor.business_name}
          className="detail-hero-image"
          onError={(e) => { e.target.src = "/images/e.png"; }}
        />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <div className="detail-hero-text">
            <h1>{vendor.business_name || "Restaurant"}</h1>
            <div className="detail-hero-meta">
              <span><MapPin size={14} /> {branch.store_address || branch.branch_name}</span>
              {offer.average_rating > 0 && (
                <span className="hero-rating">⭐ {offer.average_rating}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Strip ── */}
      <div className="detail-info-strip">
        <div className="detail-info-strip-inner">
          <div className="info-strip-item">
            <div className="info-strip-icon"><Clock size={18} /></div>
            <div>
              <div className="info-strip-label">Open Hours</div>
              <div className="info-strip-value">{branch.opening_hours || "N/A"}</div>
            </div>
          </div>
          <div className="info-strip-item">
            <div className="info-strip-icon"><Phone size={18} /></div>
            <div>
              <div className="info-strip-label">Phone</div>
              <div className="info-strip-value">{branch.contact_phone || "N/A"}</div>
            </div>
          </div>
          <div className="info-strip-item">
            <div className="info-strip-icon"><Mail size={18} /></div>
            <div>
              <div className="info-strip-label">Email</div>
              <div className="info-strip-value">{branch.contact_email || "N/A"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">

        {/* Branch Info */}
        <div className="description-section">
          <h2>About {vendor.business_name}</h2>
          <p className="restaurant-description">
            {branch.branch_name} — {branch.store_address}
          </p>
        </div>

        {/* Offers */}
        <div className="offers-section">
          <h2>Available Offers ({vendorOffers.length})</h2>
          {vendorOffers.length === 0 ? (
            <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>
              No offers available right now.
            </p>
          ) : (
            vendorOffers.map((o) => {
              const discount = o.original_price && o.discount_price
                ? Math.round(((o.original_price - o.discount_price) / o.original_price) * 100)
                : 0;
              const expTime = o.expiration_time
                ? new Date(o.expiration_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
                : "Today";
              return (
                <div key={o.id} className="offer-card" onClick={() => navigate(`/offer/${o.id}`)}>
                  <img
                    src={`https://zero-waste-production.up.railway.app/storage/${o.image}` || "/images/e.png"}
                    alt={o.title}
                    className="offer-card-image"
                    onError={(e) => { e.target.src = "/images/e.png"; }}
                  />
                  <div className="offer-card-body">
                    <div className="offer-card-top">
                      <span className="offer-card-title">{o.title}</span>
                      {discount > 0 && <span className="offer-badge">-{discount}%</span>}
                    </div>
                    <p className="offer-card-desc">{o.description}</p>
                    <div className="offer-card-bottom">
                      <div className="offer-prices">
                        <span className="offer-original">EGP {o.original_price}</span>
                        <span className="offer-discounted">EGP {o.discount_price}</span>
                      </div>
                      <div className="offer-meta">
                        <span className="offer-quantity">
                          <Package size={12} /> {o.quantity_available} left
                        </span>
                        <span className="offer-time">
                          <Clock size={12} /> {expTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Directions */}
        {lat && lng && (
          <div className="navigation-section">
            <button
              className="navigate-btn"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')}
            >
              <NavigationIcon size={18} /> Get Directions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
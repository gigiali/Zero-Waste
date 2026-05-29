import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Mail, Navigation as NavigationIcon, Package, Heart } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import './RestaurantDetail.css';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer]               = useState(null);
  const [vendorOffers, setVendorOffers] = useState([]);
  const [branches, setBranches]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isFavorite, setIsFavorite]     = useState(false);
  const [favLoading, setFavLoading]     = useState(false);
  const [vendorId, setVendorId]         = useState(null);

  const getToken = () =>
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token")      ||
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("token");

  const getLat = () => parseFloat(localStorage.getItem("userLocationLat")) || 30.0444;
  const getLng = () => parseFloat(localStorage.getItem("userLocationLng")) || 31.2357;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token   = getToken();
        const headers = { Accept: "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/offers/${id}`, { headers });
        if (!mounted) return;
        if (!res.ok) { setLoading(false); return; }

        const data   = await res.json();
        const source = data.data || data.offer || data;
        setOffer(source);

        const currentVendorId = source.branch?.vendor?.id;
        setVendorId(currentVendorId);

        if (currentVendorId) {
          const vendorRes = await fetch(`/api/vendor/${currentVendorId}`, { headers });
          if (vendorRes.ok) {
            const vendorData = await vendorRes.json();
            const v = vendorData.data || vendorData.vendor || vendorData;
            setBranches(v.branches || []);
          }
        }

        // Check favorites from localStorage
        if (currentVendorId) {
          const savedFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
          setIsFavorite(savedFavs.includes(currentVendorId));
        }

        if (currentVendorId) {
          const allRes = await fetch(`/api/offers`, { headers });
          if (!mounted) return;
          if (allRes.ok) {
            const allData = await allRes.json();
            const all     = allData.data || allData.offers || [];
            setVendorOffers(all.filter(o => o.branch?.vendor?.id === currentVendorId));
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

  const handleFavoriteToggle = useCallback(async () => {
    const token = getToken();
    if (!token) { navigate('/signin'); return; }
    if (favLoading || !vendorId) return;

    const newState = !isFavorite;
    setIsFavorite(newState);
    setFavLoading(true);

    const savedFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (newState) {
      if (!savedFavs.includes(vendorId))
        localStorage.setItem("favorites", JSON.stringify([...savedFavs, vendorId]));
    } else {
      localStorage.setItem("favorites", JSON.stringify(savedFavs.filter(fid => fid !== vendorId)));
    }

    try {
      const res = await fetch(`/api/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendor_id: vendorId }),
      });

      if (!res.ok) {
        setIsFavorite(!newState);
        const reverted = JSON.parse(localStorage.getItem("favorites") || "[]");
        if (!newState) {
          localStorage.setItem("favorites", JSON.stringify([...reverted, vendorId]));
        } else {
          localStorage.setItem("favorites", JSON.stringify(reverted.filter(fid => fid !== vendorId)));
        }
      }
    } catch {
      setIsFavorite(!newState);
    } finally {
      setFavLoading(false);
    }
  }, [vendorId, isFavorite, favLoading, navigate]);

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
  const lat    = branch.lat;
  const lng    = branch.long;

  return (
    <div className="restaurant-detail-container">

      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <div className="detail-hero">
        <img
          src={vendor.logo || "/images/e.png"}
          alt={vendor.business_name}
          className="detail-hero-image"
          onError={(e) => { e.target.src = "/images/e.png"; }}
        />
        <div className="detail-hero-overlay" />

        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''} ${favLoading ? 'fav-loading' : ''}`}
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          disabled={favLoading}
        >
          <Heart
            size={22}
            fill={isFavorite ? '#ef4444' : 'none'}
            color={isFavorite ? '#ef4444' : '#ffffff'}
          />
        </button>

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

      <div className="detail-body">

        <div className="description-section">
          <h2>About {vendor.business_name}</h2>
          <p className="restaurant-description">
            {branch.branch_name} — {branch.store_address}
          </p>
        </div>

        {branches.length > 0 && (
          <div className="branches-section">
            <h2>Our Branches ({branches.length})</h2>
            <div className="branches-list">
              {branches.map((b) => (
                <div key={b.id} className="branch-card">
                  <div className="branch-card-header">
                    <MapPin size={16} />
                    <span className="branch-name">{b.branch_name}</span>
                    <span className={`branch-status ${b.status === 'active' ? 'active' : 'inactive'}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="branch-card-body">
                    <div className="branch-info-row">
                      <MapPin size={13} />
                      <span>{b.store_address}</span>
                    </div>
                    {b.opening_hours && (
                      <div className="branch-info-row">
                        <Clock size={13} />
                        <span>{b.opening_hours}</span>
                      </div>
                    )}
                    {b.contact_phone && (
                      <div className="branch-info-row">
                        <Phone size={13} />
                        <span>{b.contact_phone}</span>
                      </div>
                    )}
                  </div>
                  {b.lat && b.lng && (
                    <button
                      className="branch-directions-btn"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`, '_blank')}
                    >
                      <NavigationIcon size={14} /> Get Directions
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

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
                    src={(() => {
                      const BASE = "https://zero-waste-production.up.railway.app";
                      if (!o.image) return "/images/e.png";
                      const raw = o.image.trim();
                      if (raw.startsWith("http")) return raw.replace(`${BASE}/storage/`, `${BASE}/`);
                      return `${BASE}/${raw.replace(/^\/+/, "").replace(/^storage\//, "")}`;
                    })()}
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

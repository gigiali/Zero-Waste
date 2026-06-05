import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Mail, Navigation as NavigationIcon, Package, Heart } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import './RestaurantDetail.css';
const BASE_URL = import.meta.env.VITE_API_URL || "https://zero-waste-production.up.railway.app";
export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [offer, setOffer]               = useState(null);
  const [vendorOffers, setVendorOffers] = useState([]);
  const [branches, setBranches]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isFavorite, setIsFavorite]     = useState(false);
  const [favLoading, setFavLoading]     = useState(false);
  const [vendorId, setVendorId]         = useState(null);

  const getToken = () =>
    localStorage.getItem("auth_token") || localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") || sessionStorage.getItem("token");

  const getLat = () => parseFloat(localStorage.getItem("userLocationLat")) || 30.0444;
  const getLng = () => parseFloat(localStorage.getItem("userLocationLng")) || 31.2357;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token   = getToken();
        const headers = { Accept: "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${BASE_URL}/api/offers/${id}`, { headers });
        if (!mounted) return;
        if (!res.ok) { setLoading(false); return; }

        const data   = await res.json();
        const source = data.data || data.offer || data;
        setOffer(source);

        const currentVendorId = source.branch?.vendor?.id;
        setVendorId(currentVendorId);

        if (currentVendorId) {
          const vendorRes = await fetch(`${BASE_URL}/api/vendor/${currentVendorId}`, { headers });
          if (vendorRes.ok) {
            const vendorData = await vendorRes.json();
            const v = vendorData.data || vendorData.vendor || vendorData;
            setBranches(v.branches || []);
          }
        }

        if (currentVendorId && token) {
          try {
            const lat = getLat(); const lng = getLng();
            const favRes = await fetch(`${BASE_URL}/api/favorites?customer_lat=${lat}&customer_long=${lng}`,
              { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
            if (favRes.ok) {
              const favData = await favRes.json();
              const favList = favData.data || favData.favorites || favData || [];
              const ids = Array.isArray(favList) ? favList.map(f => f.id) : [];
              setIsFavorite(ids.includes(currentVendorId));
              localStorage.setItem("zw_favorites_count", ids.length);
              window.dispatchEvent(new Event("zw-favorites-updated"));
            }
          } catch {}
        }

        if (currentVendorId) {
          const allRes = await fetch(`${BASE_URL}/api/offers`, { headers });
          if (!mounted) return;
          if (allRes.ok) {
            const allData = await allRes.json();
            const all = allData.data || allData.offers || [];
setVendorOffers(all.filter(o => o.branch_id === source.branch_id));          }
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
    const currentCount = parseInt(localStorage.getItem("zw_favorites_count") || "0");
    const newCount = newState ? currentCount + 1 : Math.max(0, currentCount - 1);
    localStorage.setItem("zw_favorites_count", newCount);
    window.dispatchEvent(new Event("zw-favorites-updated"));
    try {
      const res = await fetch(`${BASE_URL}/api/favorites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vendor_id: vendorId }),
      });
      if (!res.ok) {
        setIsFavorite(!newState);
        localStorage.setItem("zw_favorites_count", currentCount);
        window.dispatchEvent(new Event("zw-favorites-updated"));
      }
    } catch {
      setIsFavorite(!newState);
      localStorage.setItem("zw_favorites_count", currentCount);
      window.dispatchEvent(new Event("zw-favorites-updated"));
    } finally {
      setFavLoading(false);
    }
  }, [vendorId, isFavorite, favLoading, navigate]);

  if (loading) {
    return (
      <div className="rd-container">
        <div className="rd-not-found">
          <div className="rd-spinner" />
          <p>{t("restaurantDetail.loading")}</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="rd-container">
        <div className="rd-not-found">
          <h2>{t("restaurantDetail.notFound")}</h2>
          <button onClick={() => navigate('/')} className="rd-back-btn">← {t("restaurantDetail.backToHome")}</button>
        </div>
      </div>
    );
  }

  const branch = offer.branch || {};
  const vendor = branch.vendor || {};
  const lat    = branch.lat;
  const lng    = branch.long;

  return (
    <div className="rd-container">

      {/* ── Top Bar ── */}
      <div className="rd-topbar">
        <button onClick={() => navigate(-1)} className="rd-back-btn">
          <ArrowLeft size={18} /> {t("restaurantDetail.back")}
        </button>
      </div>

      {/* ── Hero: small logo + name side by side ── */}
      <div className="rd-hero">
        {/* Background image blurred */}
        <div className="rd-hero-bg"
          style={{ backgroundImage: `url(${vendor.logo || "/images/e.png"})` }} />
        <div className="rd-hero-overlay" />

        <button
          className={`rd-fav-btn ${isFavorite ? 'active' : ''} ${favLoading ? 'loading' : ''}`}
          onClick={handleFavoriteToggle}
          disabled={favLoading}
        >
          <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} color={isFavorite ? '#ef4444' : '#fff'} />
        </button>

        <div className="rd-hero-content">
          <div className="rd-hero-logo-wrap">
            <img
              src={vendor.logo || "/images/e.png"}
              alt={vendor.business_name}
              className="rd-hero-logo"
              onError={(e) => { e.target.src = "/images/e.png"; }}
            />
          </div>
          <div className="rd-hero-info">
            <h1 className="rd-hero-name">{vendor.business_name || "Restaurant"}</h1>
            <div className="rd-hero-meta">
              <span className="rd-hero-meta-item"><MapPin size={13} /> {branch.store_address || branch.branch_name}</span>
              {offer.average_rating > 0 && (
                <span className="rd-hero-rating">⭐ {offer.average_rating}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Strip ── */}
      <div className="rd-info-strip">
        <div className="rd-info-item">
          <div className="rd-info-icon rd-info-icon--green"><Clock size={16} /></div>
          <div>
            <div className="rd-info-label">{t("restaurantDetail.openHours")}</div>
            <div className="rd-info-value">{branch.opening_hours || "N/A"}</div>
          </div>
        </div>
        <div className="rd-info-divider" />
        <div className="rd-info-item">
          <div className="rd-info-icon rd-info-icon--blue"><Phone size={16} /></div>
          <div>
            <div className="rd-info-label">{t("restaurantDetail.phone")}</div>
            <div className="rd-info-value">{branch.contact_phone || "N/A"}</div>
          </div>
        </div>
        <div className="rd-info-divider" />
        <div className="rd-info-item">
          <div className="rd-info-icon rd-info-icon--purple"><Mail size={16} /></div>
          <div>
            <div className="rd-info-label">{t("restaurantDetail.email")}</div>
            <div className="rd-info-value">{branch.contact_email || "N/A"}</div>
          </div>
        </div>
      </div>

      <div className="rd-body">

        {/* ── About ── */}
        <div className="rd-section">
          <h2 className="rd-section-title">{t("restaurantDetail.about", { name: vendor.business_name })}</h2>
          <div className="rd-about-card">
            <p>{branch.branch_name} — {branch.store_address}</p>
          </div>
        </div>

        {/* ── Offers ── */}
        <div className="rd-section">
          <h2 className="rd-section-title">{t("restaurantDetail.availableOffers", { count: vendorOffers.length })}</h2>
          {vendorOffers.length === 0 ? (
            <p className="rd-empty">{t("restaurantDetail.noOffers")}</p>
          ) : (
            <div className="rd-offers-grid">
              {vendorOffers.map((o) => {
console.log("offer data:", o);                const discount = o.original
                  ? Math.round(((o.original_price - o.discount_price) / o.original_price) * 100) : 0;
                const expTime = o.expiration_time
                  ? new Date(o.expiration_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
                  : "Today";
                const BASE = "https://zero-waste-production.up.railway.app";
                const imgSrc = !o.image ? "/images/e.png"
                  : o.image.trim().startsWith("http")
                    ? o.image.trim().replace(`${BASE}/storage/`, `${BASE}/`)
                    : `${BASE}/${o.image.trim().replace(/^\/+/, "").replace(/^storage\//, "")}`;
                return (
                  <div key={o.id} className="rd-offer-card" onClick={() => navigate(`/offer/${o.id}`)}>
                    <div className="rd-offer-img-wrap">
                      <img src={imgSrc} alt={o.title} className="rd-offer-img"
                        onError={(e) => { e.target.src = "/images/e.png"; }} />
                      {discount > 0 && <span className="rd-offer-badge">-{discount}%</span>}
                    </div>
                    <div className="rd-offer-body">
                      <span className="rd-offer-title">{o.title}</span>
                      <p className="rd-offer-desc">{o.description}</p>
                      <div className="rd-offer-footer">
                        <div className="rd-offer-prices">
                          <span className="rd-offer-old">EGP {o.original_price}</span>
                          <span className="rd-offer-new">EGP {o.discount_price}</span>
                        </div>
                        <div className="rd-offer-meta">
<span className="rd-offer-qty"><Package size={12} /> {t("restaurantDetail.left", { count: o.quantity_available })}</span>                          <span className="rd-offer-time"><Clock size={12} /> {expTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Branches ── */}
        {branches.length > 0 && (
          <div className="rd-section">
            <h2 className="rd-section-title">{t("restaurantDetail.branches", { count: branches.length })}</h2>

            {/* Current Branch */}
            <h3 className="rd-subsection-title">{t("restaurantDetail.currentBranch")}</h3>
            <div className="rd-branch-card rd-branch-card--current">
              <div className="rd-branch-header">
                <MapPin size={15} color="#10b981" />
                <span className="rd-branch-name">{branch.branch_name}</span>
              </div>
              <div className="rd-branch-rows">
                <div className="rd-branch-row"><MapPin size={13} /><span>{branch.store_address}</span></div>
                {branch.opening_hours && <div className="rd-branch-row"><Clock size={13} /><span>{branch.opening_hours}</span></div>}
                {branch.contact_phone && <div className="rd-branch-row"><Phone size={13} /><span>{branch.contact_phone}</span></div>}
              </div>
              <div className="rd-branch-footer">
                <span className={`rd-branch-status ${branch.status === 'active' ? 'active' : 'inactive'}`}>{branch.status}</span>
              </div>
            </div>

            {/* Other Branches */}
            {branches.length > 1 && (
              <>
                <h3 className="rd-subsection-title" style={{ marginTop: "20px" }}>{t("restaurantDetail.otherBranches", { count: branches.length - 1 })}</h3>
                <div className="rd-branches-scroll">
                  {branches.filter(b => b.id !== branch.id).map((b) => (
                    <div key={b.id} className="rd-branch-card rd-branch-card--other" onClick={() => navigate(`/branch/${b.id}`)}>
                      <div className="rd-branch-header">
                        <MapPin size={15} color="#10b981" />
                        <span className="rd-branch-name">{b.branch_name}</span>
                      </div>
                      <div className="rd-branch-rows">
                        <div className="rd-branch-row"><MapPin size={13} /><span>{b.store_address}</span></div>
                        {b.opening_hours && <div className="rd-branch-row"><Clock size={13} /><span>{b.opening_hours}</span></div>}
                        {b.contact_phone && <div className="rd-branch-row"><Phone size={13} /><span>{b.contact_phone}</span></div>}
                      </div>
                      <div className="rd-branch-footer">
                        <span className={`rd-branch-status ${b.status === 'active' ? 'active' : 'inactive'}`}>{b.status}</span>
                        {b.lat && b.long && (
                          <button className="rd-directions-btn"
                            onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.long}`, '_blank'); }}>
                            <NavigationIcon size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Directions ── */}
        {lat && lng && (
          <button className="rd-navigate-btn"
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')}>
            <NavigationIcon size={18} /> {t("restaurantDetail.getDirections")}
          </button>
        )}

      </div>
    </div>
  );
}
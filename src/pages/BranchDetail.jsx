import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Mail, Navigation as NavigationIcon, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import './BranchDetail.css';
const BASE_URL = import.meta.env.VITE_API_URL || "https://zero-waste-production.up.railway.app";
export default function BranchDetail() {
  const { id, vendorId } = useParams();
  const navigate = useNavigate();

  const [branch, setBranch] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [branchOffers, setBranchOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () =>
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("token");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = getToken();
        const headers = { Accept: "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const branchRes = await fetch(`${BASE_URL}/api/branches/${id}/details`, { headers });

        if (!mounted) return;

        if (!branchRes.ok) {
          setError('Failed to load branch details');
          setLoading(false);
          return;
        }

        const branchData = await branchRes.json();
        const branchDetails = branchData.data?.branch_details || branchData.data;

        if (!branchDetails) {
          setError('Branch details not found');
          setLoading(false);
          return;
        }

        setBranch(branchDetails);
        setBranchOffers(branchDetails.offers || []);

        const actualVendorId = vendorId || branchDetails.vendor_id;
        if (actualVendorId) {
          const vendorRes = await fetch(`${BASE_URL}/api/vendor/${actualVendorId}`, { headers });
          if (!mounted) return;
          if (vendorRes.ok) {
            const vendorDataResponse = await vendorRes.json();
            setVendor(vendorDataResponse.data || vendorDataResponse.vendor || vendorDataResponse);
          }
        }

      } catch (err) {
        console.error('❌ ERROR:', err);
        if (mounted) setError(err.message || 'An error occurred');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, vendorId]);

  if (loading) {
    return (
      <div className="branch-detail-container">
        <div className="not-found">
          <div className="rd-spinner" />
          <p>Loading branch details...</p>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="branch-detail-container">
        <div className="not-found">
          <h2>{error || 'Branch not found'}</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>
            The branch you're looking for doesn't exist or is not available.
          </p>
          <button onClick={() => navigate(-1)} className="back-btn" style={{ marginTop: '20px' }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const lat = branch.lat;
  const lng = branch.long || branch.lng;
  const vendorLogo = vendor?.logo || "/images/e.png";

  return (
    <div className="branch-detail-container">

      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <div className="branch-hero">
        <img
          src={vendorLogo}
          alt={branch.branch_name}
          className="branch-hero-image"
          onError={(e) => { e.target.src = "/images/e.png"; }}
        />
        <div className="branch-hero-overlay" />
        <div className="branch-hero-content">
          <div className="branch-hero-text">
            <h1>{branch.branch_name}</h1>
            <div className="branch-hero-meta">
              <span><MapPin size={14} /> {branch.store_address || "Address not available"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="branch-info-strip">
        <div className="branch-info-strip-inner">
          <div className="branch-info-item">
            <div className="branch-info-icon"><Clock size={18} /></div>
            <div>
              <div className="branch-info-label">Opening Hours</div>
              <div className="branch-info-value">{branch.opening_hours || "N/A"}</div>
            </div>
          </div>
          <div className="branch-info-item">
            <div className="branch-info-icon"><Phone size={18} /></div>
            <div>
              <div className="branch-info-label">Phone</div>
              <div className="branch-info-value">{branch.contact_phone || "N/A"}</div>
            </div>
          </div>
          <div className="branch-info-item">
            <div className="branch-info-icon"><Mail size={18} /></div>
            <div>
              <div className="branch-info-label">Email</div>
              <div className="branch-info-value">{branch.contact_email || "N/A"}</div>
            </div>
          </div>
        </div>
      </div>

      {vendor && (
        <div className="vendor-info-section">
          <h2>About {vendor.business_name}</h2>
          <p className="vendor-description">
            {vendor.vendor_type || "Restaurant"} • Located at {branch.store_address}
          </p>
        </div>
      )}

      <div className="branch-offers-section">
        <h2>Available Offers ({branchOffers.length})</h2>
        {branchOffers.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>
            No offers available at this branch right now.
          </p>
        ) : (
          <div className="offers-grid">
            {branchOffers.map((offer) => {
              const discount = offer.original_price && offer.discount_price
                ? Math.round(((offer.original_price - offer.discount_price) / offer.original_price) * 100)
                : 0;
              const expTime = offer.expiration_time
                ? new Date(offer.expiration_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
                : "Today";
              return (
                <div
                  key={offer.id}
                  className="branch-offer-card"
                  onClick={() => navigate(`/offer/${offer.id}`)}
                >
                  <img
                    src={(() => {
                      const BASE = "https://zero-waste-production.up.railway.app";
                      if (!offer.image) return "/images/e.png";
                      const raw = offer.image.trim();
                      if (raw.startsWith("http")) return raw.replace(`${BASE}/storage/`, `${BASE}/`);
                      return `${BASE}/${raw.replace(/^\/+/, "").replace(/^storage\//, "")}`;
                    })()}
                    alt={offer.title}
                    className="branch-offer-image"
                    onError={(e) => { e.target.src = "/images/e.png"; }}
                  />
                  <div className="branch-offer-body">
                    <div className="branch-offer-top">
                      <span className="branch-offer-title">{offer.title}</span>
                      {discount > 0 && <span className="branch-offer-badge">-{discount}%</span>}
                    </div>
                    <p className="branch-offer-desc">{offer.description}</p>
                    <div className="branch-offer-bottom">
                      <div className="branch-offer-prices">
                        <span className="branch-offer-original">EGP {offer.original_price}</span>
                        <span className="branch-offer-discounted">EGP {offer.discount_price}</span>
                      </div>
                      <div className="branch-offer-meta">
                        <span className="branch-offer-quantity">
                          <Package size={12} /> {offer.quantity_available} left
                        </span>
                        <span className="branch-offer-time">
                          <Clock size={12} /> {expTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lat && lng && (
        <div className="navigation-section">
          <button
            className="directions-btn"
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')}
          >
            <NavigationIcon size={18} /> Get Directions
          </button>
        </div>
      )}

    </div>
  );
}

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Mail, Navigation as NavigationIcon, Package, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import './BranchDetail.css';

export default function BranchDetail() {
  const { id, vendorId } = useParams();
  const navigate = useNavigate();

  const [branch, setBranch] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [branchOffers, setBranchOffers] = useState([]);
  const [branchOrders, setBranchOrders] = useState([]);
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

        console.log('🏬 Fetching branch details for branch ID:', id);

        // ✅ الاستدعاء الأول: جلب بيانات الفرع كاملة
        const branchRes = await fetch(`/api/branches/${id}`, { headers });

        if (!mounted) return;

        if (!branchRes.ok) {
          console.error('❌ Branch fetch failed:', branchRes.status);
          setError('Failed to load branch details');
          setLoading(false);
          return;
        }

        const branchData = await branchRes.json();
        console.log('✅ Branch data received:', branchData);

        // ======= استخراج البيانات =======
        const branchDetails = branchData.data?.branch_details || branchData.data;
        const stats = branchData.data?.stats || {};

        if (!branchDetails) {
          console.error('❌ Branch details not found in response');
          setError('Branch details not found');
          setLoading(false);
          return;
        }

        console.log('🏪 Branch name:', branchDetails.branch_name);
        console.log('📦 Total offers:', stats.total_offers);
        console.log('🛒 Total orders:', stats.total_orders);

        // ✅ اضبط الـ state بـ branch details
        setBranch(branchDetails);

        // ✅ استخراج الـ offers من الـ branch details
        const offers = branchDetails.offers || [];
        setBranchOffers(offers);
        console.log('📋 Offers loaded:', offers.length);

        // ✅ استخراج الـ orders من الـ branch details
        const orders = branchDetails.orders || [];
        setBranchOrders(orders);
        console.log('📦 Orders loaded:', orders.length);

        // ======= الاستدعاء الثاني: معلومات الـ vendor =======
        
        // ✨ الحل الصحيح: لو vendorId موجود في URL استخدمه، لو لا استخدم من البيانات
        const actualVendorId = vendorId || branchDetails.vendor_id;

        if (actualVendorId) {
          console.log('🏢 Fetching vendor info for vendor ID:', actualVendorId);
          
          const vendorRes = await fetch(`/api/vendor/${actualVendorId}`, { headers });

          if (!mounted) return;

          if (vendorRes.ok) {
            const vendorDataResponse = await vendorRes.json();
            const vendorInfo = vendorDataResponse.data || vendorDataResponse.vendor || vendorDataResponse;

            console.log('✅ Vendor info loaded:', vendorInfo.business_name);
            setVendor(vendorInfo);
          } else {
            console.warn('⚠️ Could not fetch vendor info, continuing without it');
          }
        } else {
          console.warn('⚠️ No vendor ID found, skipping vendor fetch');
        }

      } catch (err) {
        console.error('❌ ERROR:', err);
        if (mounted) {
          setError(err.message || 'An error occurred while loading branch details');
        }
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
  const defaultImage = vendorLogo;

  return (
    <div className="branch-detail-container">
      
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      {/* Hero Section */}
      <div className="branch-hero">
        <img
          src={defaultImage}
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

      {/* Info Strip */}
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

      {/* Vendor Info */}
      {vendor && (
        <div className="vendor-info-section">
          <h2>About {vendor.business_name}</h2>
          <p className="vendor-description">
            {vendor.vendor_type || "Restaurant"} • Located at {branch.store_address}
          </p>
          <button
            className="view-vendor-btn"
            onClick={() => navigate(`/restaurant/${vendor.id}`)}
          >
            View all branches & offers
          </button>
        </div>
      )}

      {/* Location Map */}
      {lat && lng && (
        <div className="map-section">
          <h2>Location</h2>
          <div className="map-container">
            <iframe
              width="100%"
              height="400"
              frameBorder="0"
              style={{ borderRadius: "12px" }}
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s!2z${lat},${lng}!5e0!3m2!1sen!2seg!4v1234567890`}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <button
            className="directions-btn"
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')}
          >
            <NavigationIcon size={18} /> Get Directions
          </button>
        </div>
      )}

      {/* Offers Section */}
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

      {/* Orders Section */}
      <div className="branch-orders-section">
        <h2>Recent Orders ({branchOrders.length})</h2>
        {branchOrders.length === 0 ? (
          <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>
            No orders at this branch yet.
          </p>
        ) : (
          <div className="orders-list">
            {branchOrders.map((order) => (
              <div key={order.id} className="branch-order-card">
                <div className="order-header">
                  <div className="order-id-status">
                    <span className="order-id">Order #{order.id}</span>
                    <span className={`order-status order-status-${order.status}`}>
                      {order.status || "pending"}
                    </span>
                  </div>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>

                {order.customer && (
                  <div className="order-customer">
                    <span className="label">Customer:</span>
                    <span className="value">
                      {order.customer.user?.name || order.customer.name || "Unknown"}
                    </span>
                  </div>
                )}

                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <span className="label">Items:</span>
                    <ul className="items-list">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.offer?.title || "Item"} - EGP {item.offer?.discount_price || item.price || "N/A"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="order-total">
                  <span className="label">Total:</span>
                  <span className="value">EGP {order.total_price || "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

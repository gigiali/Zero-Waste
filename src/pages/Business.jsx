import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Bell, User, Globe, GitBranch, Package, ShoppingCart,
  ChevronRight, Loader, AlertCircle, CheckCircle, BarChart2, Leaf, Loader2,
  History, MessageSquare,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { NotificationsPanel } from "../Components/Notificationsdropdown";
import { useNotifications } from "../Context/Notificationscontext";
import "./Business.css";

const EMPTY_FORM = {
  title: "", description: "", originalPrice: "", discountPrice: "",
  quantityAvailable: "", expiresIn: "", image: null, status: "active", expirationDate: "",
};

const getToken = () =>
  localStorage.getItem("auth_token") || localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") || sessionStorage.getItem("token");

const readJson = async (response) => { try { return await response.json(); } catch { return {}; } };

const extractList = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
    if (Array.isArray(payload?.[key]?.data)) return payload[key].data;
  }
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

const branchName = (branch) => branch?.branch_name || branch?.name || branch?.address || "Unknown";

const normalizeOffer = (offer) => ({
  id: offer.id,
  title: offer.title || offer.name || "Untitled offer",
  description: offer.description || "",
  originalPrice: Number(offer.original_price ?? offer.originalPrice ?? 0),
  discountPrice: Number(offer.discount_price ?? offer.discountPrice ?? offer.price ?? 0),
  quantity: Number(offer.quantity_available ?? offer.quantity ?? 0),
  expiresIn: offer.expiration_time || offer.expires_at || offer.expiresIn || "N/A",
  status: offer.status || "active",
  branch_id: offer.branch_id || offer.branch?.id,
  branch: branchName(offer.branch),
  image: offer.image || offer.photo || "",
});

const normalizeOrder = (order) => {
  const firstItem = order.items?.[0] || order.order_items?.[0] || order.orderItems?.[0];
  const offer = order.offer || firstItem?.offer;
  const customer = order.user || order.customer || firstItem?.user || firstItem?.customer;
  
  const customerName = 
    customer?.user?.name ||
    customer?.user?.full_name ||
    customer?.name || 
    customer?.full_name || 
    order.customer_name || 
    order.user?.name || 
    order.buyer?.name || 
    order.user_name || 
    "N/A";

  return {
    id: order.id,
    offer: offer?.title || offer?.name || order.offer_title || "N/A",
    customer: customerName,
    amount: `EGP ${order.total_amount ?? order.total ?? order.amount ?? 0}`,
    status: order.order_status || order.status || "pending",
    delivery_type: order.delivery_type || "pickup",
    branch_id: order.branch_id || offer?.branch_id || firstItem?.branch_id,
    branch: branchName(order.branch || offer?.branch),
    created_at: order.created_at || order.createdAt || order.date || null,
  };
};

const normalizeTopSelling = (item) => ({
  offer_id: item.offer_id,
  total_sold: Number(item.total_sold ?? 0),
  title: item.offer?.title || item.offer?.name || `Offer #${item.offer_id}`,
});

const FALLBACK_CHART = [
  { day: "Mon", sales: 0, orders: 0 }, { day: "Tue", sales: 0, orders: 0 },
  { day: "Wed", sales: 0, orders: 0 }, { day: "Thu", sales: 0, orders: 0 },
  { day: "Fri", sales: 0, orders: 0 }, { day: "Sat", sales: 0, orders: 0 },
  { day: "Sun", sales: 0, orders: 0 },
];

function SaleDetailsModal({ saleId, onClose }) {
  const { t } = useTranslation();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoadingTimeout(true), 5000);
    (async () => {
      try {
        const token = getToken();
        const controller = new AbortController();
        const abort = setTimeout(() => controller.abort(), 8000);
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const res = await fetch(`${apiUrl}/api/vendor/dashboard/sales/${saleId}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(abort);
        const data = await res.json();
        if (!res.ok) { setError(data?.message ?? t("failedLoadSaleDetails")); return; }
        setDetails(data?.data ?? data ?? null);
      } catch (e) {
        if (e.name !== "AbortError") setError(t("failedLoadSaleDetails"));
      } finally {
        setLoading(false);
        setLoadingTimeout(false);
        clearTimeout(timeoutId);
      }
    })();
    return () => clearTimeout(timeoutId);
  }, [saleId, t]);

  const offerTitle    = details?.offer?.title   ?? details?.offer?.name   ?? "—";
  const offerImage    = details?.offer?.image   ?? details?.offer?.photo  ?? null;
  const offerDiscount = details?.offer?.discount_price ?? details?.price  ?? "—";
  const offerOriginal = details?.offer?.original_price ?? "—";
  const qty           = details?.quantity ?? "—";
  const totalPrice    = details?.price   ?? "—";
  const orderStatus   = details?.order?.order_status ?? details?.order?.status ?? "—";
  const orderDate     = details?.order?.order_date   ?? details?.order?.created_at ?? null;
  const deliveryType  = details?.order?.delivery_type ?? "—";
  const customerUser  = details?.order?.customer?.user ?? details?.order?.user ?? details?.order?.customer;
  const customerName  = customerUser?.name  ?? "—";
  const customerEmail = customerUser?.email ?? "—";
  const customerPhone = customerUser?.phone ?? "—";

  const statusColor = {
    completed:  { bg: "#e8faf0", text: "#28c76f" },
    cancelled:  { bg: "#ffeaea", text: "#ef4444" },
    pending:    { bg: "#fff6e0", text: "#ff9f43" },
    processing: { bg: "#e7e7ff", text: "#696cff" },
  }[orderStatus?.toLowerCase()] ?? { bg: "#f0f0f5", text: "#8592a3" };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `https://zero-waste-production.up.railway.app/storage/${imagePath}`;
  };

  return (
    <div
      className="mb-modal-overlay mb-modal-overlay--large"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mb-modal-content mb-modal-content--details">
        <div className="mb-details-header">
          <div className="mb-details-header__left">
            {offerImage && !imageError ? (
              <img
                src={getImageUrl(offerImage)}
                alt="offer"
                className="mb-details-logo"
                onError={() => setImageError(true)}
                style={{ borderRadius: "10px", objectFit: "cover" }}
              />
            ) : (
              <div className="mb-details-avatar">{offerTitle.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <h3 className="mb-details-title">{offerTitle}</h3>
              <span className="mb-details-category">{t("sale")} #{saleId}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="mb-details-close">✕</button>
        </div>

        <div className="mb-details-body">
          {loading && (
            <>
              {loadingTimeout && (
                <div className="mb-loading-timeout">
                  <AlertCircle size={18} color="#f59e0b" />
                  <span>{t("loadingTakingLonger")}</span>
                </div>
              )}
              <div className="mb-details-loading">
                <Loader2 size={24} className="mb-spin" />
              </div>
            </>
          )}
          {error && <div className="mb-details-error">{error}</div>}
          {details && !loading && (
            <>
              <p className="mb-details-section-title">{t("offerDetails")}</p>
              <div className="mb-details-grid">
                {[
                  { label: t("offer"),          value: offerTitle },
                  { label: t("originalPrice"), value: offerOriginal !== "—" ? `EGP ${offerOriginal}` : "—" },
                  { label: t("discountPrice"), value: offerDiscount !== "—" ? `EGP ${offerDiscount}` : "—" },
                  { label: t("quantitySold"),  value: qty },
                  { label: t("totalPrice"),    value: totalPrice !== "—" ? `EGP ${totalPrice}` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="mb-details-field">
                    <p className="mb-details-label">{label}</p>
                    <p className="mb-details-value">{value ?? "—"}</p>
                  </div>
                ))}
              </div>

              <p className="mb-details-section-title" style={{ marginTop: "18px" }}>{t("orderDetails")}</p>
              <div className="mb-details-grid">
                {[
                  { label: t("customer"),      value: customerName },
                  { label: t("email"),         value: customerEmail },
                  { label: t("phone"),         value: customerPhone },
                  { label: t("deliveryType"), value: deliveryType },
                  { label: t("orderDate"),    value: orderDate ? new Date(orderDate).toLocaleDateString("en-EG", { year: "numeric", month: "short", day: "numeric" }) : "—" },
                  { label: t("orderStatus"),  value: (
                    <span style={{ background: statusColor.bg, color: statusColor.text, borderRadius: "20px", padding: "2px 10px", fontSize: "0.78rem", fontWeight: 600 }}>
                      {orderStatus}
                    </span>
                  )},
                ].map(({ label, value }) => (
                  <div key={label} className="mb-details-field">
                    <p className="mb-details-label">{label}</p>
                    <p className="mb-details-value">{value ?? "—"}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function VendorSustainabilitySection({ branchId }) {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const url = new URL("/api/vendor/sustainability/metrics", apiUrl);
        if (branchId !== null) url.searchParams.set("branch_id", branchId);
        
        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.metrics) setMetrics(data.metrics);
      } catch (err) { console.error("Sustainability fetch error:", err); }
    };
    fetch_();
  }, [branchId]);

  if (!metrics) return null;

  const cards = [
    { icon: "🍽️", value: metrics.meals_saved ?? 0,                    label: t("mealsSaved"),       color: "#10b981", bg: "#f0fdf4" },
    { icon: "🌍", value: `${metrics.co2_prevented_kg ?? 0} kg`,        label: t("co2Prevented"),     color: "#3b82f6", bg: "#eff6ff" },
    { icon: "💰", value: `EGP ${Number(metrics.recovered_revenue ?? 0).toLocaleString()}`, label: t("revenueRecovered"), color: "#f59e0b", bg: "#fffbeb" },
  ];

  return (
    <div className="biz-section">
      <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", borderRadius: "16px", padding: "24px 28px", border: "1px solid #d1fae5" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "10px", padding: "6px 8px", display: "flex" }}>
              <span style={{ fontSize: "1.1rem" }}>🌱</span>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#065f46" }}>{t("sustainabilityImpact")}</h2>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>{t("contributionToReducing")}</p>
            </div>
          </div>
          {metrics.green_badge && (
            <span style={{ background: "#d1fae5", color: "#065f46", borderRadius: "20px", padding: "4px 14px", fontSize: "0.82rem", fontWeight: 600 }}>
              🏅 {metrics.green_badge}
            </span>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px" }}>
          {cards.map((card) => (
            <div key={card.label} style={{ background: card.bg, borderRadius: "12px", padding: "16px 18px", border: `1px solid ${card.color}22`, textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>{card.icon}</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: card.color, marginBottom: "3px" }}>{card.value}</div>
              <div style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500 }}>{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopSellingSection({ branchId }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      const token = getToken();
      if (!token) { setLoading(false); return; }
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const url = new URL("/api/vendor/dashboard/top-selling", apiUrl);
        if (branchId) url.searchParams.set("branch_id", branchId);

        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await readJson(res);
          const list = extractList(data, ["data"]);
          setItems(list.map(normalizeTopSelling));
        }
      } catch (err) { console.error("Top selling fetch error:", err); }
      finally { setLoading(false); }
    };
    fetchTop();
  }, [branchId]);

  if (loading) return null;
  if (items.length === 0) return null;

  const maxSold = Math.max(...items.map((i) => i.total_sold), 1);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="biz-section">
      <div style={{ background: "#fff", borderRadius: "16px", padding: "24px 28px", border: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "10px", padding: "6px 8px", display: "flex" }}>
            <span style={{ fontSize: "1.1rem" }}>🏆</span>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>{t("topSellingOffers")}</h2>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>{t("bestPerforming")}</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map((item, idx) => (
            <div key={item.offer_id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: idx === 0 ? "#f59e0b" : idx === 1 ? "#9ca3af" : idx === 2 ? "#b45309" : "#6b7280", minWidth: "20px" }}>
                {medals[idx] || `#${idx + 1}`}
              </span>
              <span style={{ flex: 1, fontSize: "0.9rem", fontWeight: 500, color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
              <div style={{ flex: 2, background: "#f3f4f6", borderRadius: "20px", height: "8px", overflow: "hidden" }}>
                <div style={{ width: `${(item.total_sold / maxSold) * 100}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #059669)", borderRadius: "20px", transition: "width 0.6s ease" }} />
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#10b981", minWidth: "50px", textAlign: "right" }}>{item.total_sold} {t("sold")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ✅ قسم REVIEWS المحسّن
function ReviewsSection({ branchId }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
  const fetchReviews = async () => {
    setLoading(true);
    setShowAll(false);
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;  // 👈 أضيفي
      const res = await fetch(`${apiUrl}/api/vendor/orders`, {  // 👈 استخدمي apiUrl
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      
      const data = await readJson(res);
      
      if (res.ok && (Array.isArray(data) || data.data || data.reviews)) {
        let reviewList = Array.isArray(data) ? data : (data.data || data.reviews || []);
        setReviews(reviewList);
      } else {
        setReviews([]);
      }
    } catch (err) { 
      console.error("Reviews fetch error:", err);
      setReviews([]);
    }
    finally { setLoading(false); }
  };
  fetchReviews();
}, [branchId]);

  // ✅ عرض حالة التحميل
  if (loading) {
    return (
      <div className="biz-section" id="reviews-section">
        <div className="biz-section-header">
          <h2 className="biz-section-title">⭐ {t("reviews") || "Customer Reviews"}</h2>
        </div>
        <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
          <Loader2 size={24} className="mb-spin" style={{ display: "inline" }} />
          <p style={{ marginTop: "10px" }}>{t("loading")}</p>
        </div>
      </div>
    );
  }

  // ✅ عرض حالة عدم وجود تقييمات
  if (reviews.length === 0) {
    return (
      <div className="biz-section" id="reviews-section">
        <div className="biz-section-header">
          <h2 className="biz-section-title">⭐ {t("reviews") || "Customer Reviews"}</h2>
        </div>
        <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
          📦 {t("noReviews") || "لا توجد تقييمات حتى الآن"}
        </div>
      </div>
    );
  }

  const displayed = showAll ? reviews : reviews.slice(0, 5);
  const getRatingStars = (rating) => {
    const stars = [];
    const rate = Math.min(Math.max(Math.round(rating), 1), 5);
    for (let i = 0; i < 5; i++) {
      stars.push(i < rate ? "⭐" : "☆");
    }
    return stars.join("");
  };

  const getRatingColor = (rating) => {
    const rate = Math.round(rating);
    if (rate >= 4) return { bg: "#d1fae5", text: "#065f46" };
    if (rate >= 3) return { bg: "#fef3c7", text: "#92400e" };
    return { bg: "#fee2e2", text: "#7f1d1d" };
  };

  return (
    <div className="biz-section" id="reviews-section">
      <div className="biz-section-header">
        <h2 className="biz-section-title">⭐ {t("reviews") || "Customer Reviews"}</h2>
        {reviews.length > 5 && (
          <button type="button" className="biz-link-btn" onClick={() => setShowAll((v) => !v)}>
            {showAll ? t("showLess") : `${t("viewAll")} (${reviews.length})`}
          </button>
        )}
      </div>
      <div className="biz-reviews-list">
        {displayed.map((review, idx) => {
          const ratingColor = getRatingColor(review.rating);
          return (
            <div key={idx} className="biz-review-card">
              <div className="biz-review-header">
                <div className="biz-review-left">
                  <div className="biz-review-avatar">{(review.customer_name || review.user?.name || "C").charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="biz-review-customer">{review.customer_name || review.user?.name || "Anonymous"}</p>
                    <p className="biz-review-date">{review.created_at ? new Date(review.created_at).toLocaleDateString("en-EG") : "—"}</p>
                  </div>
                </div>
                <span className={`biz-review-rating`} style={{ background: ratingColor.bg, color: ratingColor.text }}>
                  {getRatingStars(review.rating)} {review.rating || "0"}
                </span>
              </div>
              <p className="biz-review-text">{review.comment || review.review || "No comment"}</p>
              {review.offer?.title && <p className="biz-review-offer">📦 {review.offer.title}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SalesHistorySection({ branchId }) {
  const { t } = useTranslation();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setShowAll(false);
      const token = getToken();
      if (!token) { setLoading(false); return; }
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        console.log("🟢 API URL:", apiUrl);
        const url = new URL("/api/vendor/dashboard/sales", apiUrl);
        if (branchId) url.searchParams.set("branch_id", branchId);

        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await readJson(res);
          setSales(extractList(data, ["data"]));
        }
      } catch (err) { console.error("Sales history fetch error:", err); }
      finally { setLoading(false); }
    };
    fetchSales();
  }, [branchId]);

  if (loading) return null;
  if (sales.length === 0) return null;

  const displayed = showAll ? sales : sales.slice(0, 5);

  return (
    <>
      {selectedSaleId && (
        <SaleDetailsModal
          saleId={selectedSaleId}
          onClose={() => setSelectedSaleId(null)}
        />
      )}
      <div className="biz-section" id="sales-section">
        <div className="biz-section-header">
          <h2 className="biz-section-title">{t("salesHistory")}</h2>
          {sales.length > 5 && (
            <button type="button" className="biz-link-btn" onClick={() => setShowAll((v) => !v)}>
              {showAll ? t("showLess") : `${t("viewAll")} (${sales.length})`}
            </button>
          )}
        </div>
        <div className="biz-table-wrap">
          <table className="biz-table">
            <thead>
              <tr>
                <th>{t("saleID")}</th>
                <th>{t("offer")}</th>
                <th>{t("qty")}</th>
                <th>{t("price")}</th>
                <th>{t("orderStatus")}</th>
                <th>{t("date")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((sale) => (
                <tr key={sale.id}>
                  <td className="biz-td-id">#{sale.id}</td>
                  <td>{sale.offer?.title || sale.offer?.name || "—"}</td>
                  <td>{sale.quantity ?? "—"}</td>
                  <td className="biz-td-amount">EGP {sale.price ?? "—"}</td>
                  <td>
                    <span className={`biz-badge ${sale.order?.order_status === "completed" ? "active" : sale.order?.order_status === "cancelled" ? "expired" : "pending"}`}>
                      {sale.order?.order_status || "—"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    {sale.order?.order_date ? new Date(sale.order.order_date).toLocaleDateString("en-EG") : "—"}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="biz-icon-btn edit"
                      title={t("viewDetails")}
                      onClick={() => setSelectedSaleId(sale.id)}
                      style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function Business() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [language, setLanguage] = useState(i18n.language || "en");
  const [showBranches, setShowBranches] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [dashboardBranchId, setDashboardBranchId] = useState(null);

  const [branches, setBranches] = useState([]);
  const [businessName, setBusinessName] = useState("");
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [salesData, setSalesData] = useState(FALLBACK_CHART);
  const [ordersChartData, setOrdersChartData] = useState([]);
  const [kpiData, setKpiData] = useState({ activeOffers: 0, totalOrders: 0, revenue: "EGP 0", unitsSold: 0, grossRevenue: 0 });

  const [isLoading, setIsLoading] = useState(true);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [apiError, setApiError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteBranchId, setDeleteBranchId] = useState(null);
  const isSavingRef = React.useRef(false);
  const isFetchingOffersRef = React.useRef(false);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("language", lang);
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) { navigate("/signin"); return; }
      setIsLoading(true);
      setApiError("");
      const slowTimer = setTimeout(() => setIsSlowLoading(true), 5000);
      try {
        const profileRes = await fetch("/api/myprofile", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const data = await readJson(profileRes);
          const vendor = data.data?.vendor || data.vendor || data;
          if (vendor?.business_name || vendor?.name) setBusinessName(vendor.business_name || vendor.name);
        }
        const branchRes = await fetch("/api/my-branches", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (branchRes.ok) {
          const data = await readJson(branchRes);
          const branchList = extractList(data, ["branches"]);
          setBranches(branchList);
          if (branchList.length === 0) { setSelectedBranch(null); return; }
          setSelectedBranch(branchList[0]);
        } else {
          const errData = await readJson(branchRes);
          setApiError(errData.message || t("failedLoadBranches"));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setApiError(t("networkError"));
      } finally {
        setIsLoading(false);
        clearTimeout(slowTimer);
        setIsSlowLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchOverviewStats = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
const url = new URL("/api/vendor/dashboard/overview", apiUrl);
        if (dashboardBranchId !== null) url.searchParams.set("branch_id", dashboardBranchId);

        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await readJson(res);
          if (data.data) {
            setKpiData({
              activeOffers:  data.data.active_offers ?? 0,
              totalOrders:   data.data.total_orders ?? 0,
              unitsSold:     data.data.total_units_sold ?? 0,
              grossRevenue:  data.data.financials?.gross_revenue ?? 0,
              platformCut:   data.data.financials?.platform_deduction ?? 0,
              revenue: `EGP ${(data.data.financials?.net_revenue || 0).toLocaleString("en-EG", {
                minimumFractionDigits: 2, maximumFractionDigits: 2,
              })}`,
            });
          }
        }
      } catch (err) { console.error("Overview stats error:", err); }
    };
    fetchOverviewStats();
  }, [dashboardBranchId]);

  useEffect(() => {
    const fetchMonthlyChart = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
const url = new URL("/api/vendor/dashboard/monthly-chart", apiUrl);
        if (dashboardBranchId !== null) url.searchParams.set("branch_id", dashboardBranchId);

        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await readJson(res);
          if (Array.isArray(data.data) && data.data.length > 0) {
            const chartData = data.data.map((item) => ({
              day: item.month,
              sales: item.net_sales || 0,
              orders: item.total_orders || item.orders_count || item.orders || 0,
            }));
            setSalesData(chartData);
          } else {
            setSalesData(FALLBACK_CHART);
          }
        } else {
          setSalesData(FALLBACK_CHART);
        }
      } catch (err) {
        console.error("Monthly chart error:", err);
        setSalesData(FALLBACK_CHART);
      }
    };
    fetchMonthlyChart();
  }, [dashboardBranchId]);

  useEffect(() => {
    const fetchOrdersChart = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
const url = new URL("/api/vendor/dashboard/orders-chart", apiUrl);
        if (dashboardBranchId !== null) url.searchParams.set("branch_id", dashboardBranchId);
        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await readJson(res);
          console.log("orders-chart response:", data);
          if (Array.isArray(data.data) && data.data.length > 0) {
            setOrdersChartData(data.data.map((item) => ({
              day: new Date(item.date).toLocaleDateString("en-EG", { month: "short", day: "numeric" }),
              orders: item.total_orders || 0,
            })));
          }
        }
      } catch (err) { console.error("Orders chart error:", err); }
    };
    fetchOrdersChart();
  }, [dashboardBranchId]);

  const fetchOffers = React.useCallback(async () => {
    if (isFetchingOffersRef.current) return;
    isFetchingOffersRef.current = true;
    const token = getToken();
    if (!token) { isFetchingOffersRef.current = false; return; }
    try {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;  // 👈 أضيفي هذا
    const res = await fetch(`${apiUrl}/api/vendor/myoffers`, {  // 👈 استخدمي apiUrl
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
      if (res.ok) {
        const data = await readJson(res);
        setOffers(extractList(data, ["offers"]).map(normalizeOffer));
      }
    } catch (err) { console.error("Offers fetch error:", err); }
    finally { isFetchingOffersRef.current = false; }
  }, []);

  useEffect(() => { if (selectedBranch?.id) fetchOffers(); }, [selectedBranch?.id, fetchOffers]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch("/api/vendor/orders", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await readJson(res);
          const orderList = extractList(data, ["orders"]).map(normalizeOrder);
          setOrders(orderList);
        }
      } catch (err) { console.error("Orders fetch error:", err); }
    };
    if (selectedBranch) fetchOrders();
  }, [selectedBranch]);

  useEffect(() => {
    const handleOrderPlaced = () => {
      if (!selectedBranch) return;
      const fetchLatestOrders = async () => {
        const token = getToken();
        if (!token) return;
        try {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;  // 👈 أضيفي
    const res = await fetch(`${apiUrl}/api/vendor/orders`, {  // 👈 استخدمي apiUrl
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
          if (res.ok) {
            const data = await readJson(res);
            setOrders(extractList(data, ["orders"]).map(normalizeOrder));
          }
        } catch (err) { console.error("Orders refresh error:", err); }
      };
      fetchLatestOrders();
    };
    window.addEventListener("order-placed", handleOrderPlaced);
    window.addEventListener("zw-user-orders-updated", handleOrderPlaced);
    return () => {
      window.removeEventListener("order-placed", handleOrderPlaced);
      window.removeEventListener("zw-user-orders-updated", handleOrderPlaced);
    };
  }, [selectedBranch]);

  const selectedBranchName = branchName(selectedBranch);
  const filteredOffers = selectedBranch
    ? offers.filter((o) => o.branch_id === selectedBranch.id || o.branch === selectedBranchName)
    : offers;
  const filteredOrders = selectedBranch
    ? orders.filter((o) => o.branch_id === selectedBranch.id || o.branch === selectedBranchName)
    : orders;

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setSubmitError(""); setSubmitSuccess(""); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); setForm(EMPTY_FORM); setSubmitError(""); setSubmitSuccess(""); };

  const openEdit = (offer) => {
    setEditingId(offer.id);
    const expDate = offer.expiresIn && offer.expiresIn !== "N/A" ? new Date(offer.expiresIn).toISOString().slice(0, 16) : "";
    setForm({
      title: offer.title, description: offer.description,
      originalPrice: String(offer.originalPrice), discountPrice: String(offer.discountPrice),
      quantityAvailable: String(offer.quantity), expiresIn: "", image: null,
      status: offer.status?.toLowerCase() || "active", expirationDate: expDate,
    });
    setSubmitError(""); setSubmitSuccess(""); setDrawerOpen(true);
  };

  const handleChange = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); };
  const handleImage = (e) => { const file = e.target.files[0]; if (file) setForm((prev) => ({ ...prev, image: file })); };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!form.title.trim() || !form.description.trim()) { setSubmitError(t("fillRequired")); return; }
    if (!selectedBranch && !editingId) { setSubmitError(t("selectBranch")); return; }
    if (parseFloat(form.discountPrice) >= parseFloat(form.originalPrice)) { setSubmitError(t("discountError")); return; }

    isSavingRef.current = true;
    setIsSubmitting(true); setSubmitError(""); setSubmitSuccess("");
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("quantity_available", parseInt(form.quantityAvailable) || 1);
      fd.append("original_price", parseFloat(form.originalPrice) || 0);
      fd.append("discount_price", parseFloat(form.discountPrice) || 0);
      fd.append("status", form.status || "active");
      if (!editingId) {
        fd.append("branch_id", selectedBranch?.id);
        fd.append("expiration_time", new Date(Date.now() + (parseInt(form.expiresIn) || 2) * 3600000).toISOString());
      }
      if (editingId && form.expirationDate) {
        fd.append("expiration_time", new Date(form.expirationDate).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, ""));
      }
      if (form.image && typeof form.image === "object") fd.append("image", form.image);
      if (editingId) fd.append("_method", "PUT");

      const res = await fetch(editingId ? `/api/vendor/offers/${editingId}` : "/api/vendor/offers", {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: fd,
      });
      const responseData = await readJson(res);
      if (res.ok) { setSubmitSuccess(editingId ? t("offerUpdated") : t("offerCreated")); fetchOffers(); closeDrawer(); }
      else setSubmitError(responseData.message || responseData.error || t("failedSaveOffer"));
    } catch (err) {
      console.error("Save offer error:", err);
      setSubmitError(t("networkError"));
    } finally { setIsSubmitting(false); isSavingRef.current = false; }
  };

  const handleEditBranch = async () => {
    if (!editingBranch) return;
    const token = getToken();
    try {
      const res = await fetch(`/api/branches/${editingBranch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ branch_name: editingBranch.branch_name }),
      });
      if (res.ok) {
        setBranches((prev) => prev.map((b) => (b.id === editingBranch.id ? editingBranch : b)));
        if (selectedBranch?.id === editingBranch.id) setSelectedBranch(editingBranch);
        setEditingBranch(null);
      } else alert(t("failedUpdateBranch"));
    } catch { alert(t("networkError")); }
  };

  const confirmDeleteBranch = async () => {
    const id = deleteBranchId;
    const token = getToken();
    try {
      const res = await fetch(`/api/branches/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBranches((prev) => prev.filter((b) => b.id !== id));
        if (selectedBranch?.id === id) setSelectedBranch(branches.find((b) => b.id !== id) || null);
        if (dashboardBranchId === id) setDashboardBranchId(null);
      } else alert(t("failedDeleteBranch"));
    } catch { alert(t("networkError")); }
    finally { setDeleteBranchId(null); }
  };

  const handleDelete = async (id) => {
    const token = getToken();
    try {
      const res = await fetch(`/api/vendor/offers/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== id));
        setSubmitSuccess(t("offerDeleted"));
        setTimeout(() => setSubmitSuccess(""), 2000);
      } else {
        const data = await readJson(res);
        setSubmitError(data.message || t("failedDeleteOffer"));
      }
    } catch (err) { console.error("Delete error:", err); setSubmitError(t("networkError")); }
    finally { setDeleteConfirmId(null); }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    const token = getToken();
    try {
      const res = await fetch(`/api/vendor/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      else { const data = await readJson(res); alert(data.message || t("failedUpdateStatus")); }
    } catch (err) { console.error("Order status error:", err); alert(t("networkError")); }
    finally { setUpdatingOrderId(null); }
  };

  // ✅ Navigation updated مع Reviews
  const navItems = [
    { id: "charts", icon: BarChart2, label: t("salesCharts"), onClick: () => document.getElementById("charts-section")?.scrollIntoView({ behavior: "smooth" }) },
    { id: "sustainability", icon: Leaf, label: t("sustainabilityImpact"), onClick: () => document.getElementById("sustainability-section")?.scrollIntoView({ behavior: "smooth" }) },
    { id: "offers", icon: Package, label: t("myOffers"), onClick: () => document.getElementById("offers-section")?.scrollIntoView({ behavior: "smooth" }) },
    { id: "orders", icon: ShoppingCart, label: t("recentOrders"), onClick: () => document.getElementById("orders-section")?.scrollIntoView({ behavior: "smooth" }) },
    { id: "reviews", icon: MessageSquare, label: t("reviews") || "Reviews", onClick: () => document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" }) },
    { id: "sales", icon: History, label: t("salesHistory"), onClick: () => document.getElementById("sales-section")?.scrollIntoView({ behavior: "smooth" }) },
    { id: "notifications", icon: Bell, label: t("notifications"), badge: unreadCount > 0 ? unreadCount : null, onClick: () => setShowNotifications(true) },
    { id: "language", icon: Globe, label: language === "en" ? "English" : "العربية", onClick: () => handleLanguageChange(language === "en" ? "ar" : "en") },
    { id: "branches", icon: GitBranch, label: t("branches"), expandable: true, expanded: showBranches, onToggle: () => setShowBranches((b) => !b), children: branches, hasAddBranch: true },
  ];

  return (
    <div className="biz-root">
      <aside className="biz-sidebar">
        <div className="biz-logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
          <img src="/images/zerowaste-logo.png" alt="ZeroWaste" className="biz-logo-img" />
          <span className="biz-logo-text"></span>
        </div>
        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "4px 16px 8px" }} />
        <nav className="biz-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.expandable) {
              return (
                <div key={item.id} className="biz-nav-expandable">
                  <button type="button" className="biz-nav-btn" onClick={item.onToggle} style={{ justifyContent: "space-between" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="biz-nav-icon-wrap"><Icon size={16} /></span>
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight size={14} style={{ transition: "transform 0.2s", transform: item.expanded ? "rotate(90deg)" : "rotate(0deg)", opacity: 0.6 }} />
                  </button>
                  {item.expanded && (
                    <div className="biz-branches">
                      <button
                        type="button"
                        className={`biz-branch-btn biz-branch-all ${dashboardBranchId === null ? "active" : ""}`}
                        onClick={() => { setDashboardBranchId(null); setSelectedBranch(null); }}
                      >
                        🌿 {t("allBranches")}
                      </button>
                      {item.children.map((b) => (
                        <div key={b.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button
                            type="button"
                            className={`biz-branch-btn ${selectedBranch?.id === b.id && dashboardBranchId === b.id ? "active" : ""}`}
                            style={{ flex: 1 }}
                            onClick={() => { setSelectedBranch(b); setDashboardBranchId(b.id); }}
                          >
                            {branchName(b)}
                          </button>
                          <button type="button" onClick={() => setDeleteBranchId(b.id)} style={{ background: "rgba(239,68,68,0.15)", border: "none", borderRadius: "6px", color: "#ef4444", cursor: "pointer", padding: "4px 7px", fontSize: "0.75rem" }}>🗑️</button>
                          <button type="button" onClick={() => setEditingBranch(b)} style={{ background: "rgba(59,130,246,0.15)", border: "none", borderRadius: "6px", color: "#3b82f6", cursor: "pointer", padding: "4px 7px", fontSize: "0.75rem" }}>✏️</button>
                        </div>
                      ))}
                      {item.hasAddBranch && <button type="button" className="biz-branch-btn biz-branch-add" onClick={() => navigate("/add-branch")}>+ {t("addBranch")}</button>}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button type="button" key={item.id} className="biz-nav-btn" onClick={item.onClick}>
                <span style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                  <span className="biz-nav-icon-wrap"><Icon size={16} /></span>
                  <span>{item.label}</span>
                </span>
                {item.badge && <span className="biz-notif-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
        <div className="biz-sidebar-profile" onClick={() => navigate("/business/profile")} title={t("goToProfile")}>
          <div className="biz-sidebar-avatar"><User size={16} color="white" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{businessName || t("yourBusiness")}</p>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t("businessAccount")}</p>
          </div>
          <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
        </div>
      </aside>

      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}

      <main className="biz-main">
        {isLoading && (
          <div className="biz-skeleton-wrapper">
            <div className="biz-skeleton-header" />
            <div className="biz-skeleton-kpis">
              <div className="biz-skeleton-card" /><div className="biz-skeleton-card" /><div className="biz-skeleton-card" />
            </div>
            <div className="biz-skeleton-section">
              <div className="biz-skeleton-line long" /><div className="biz-skeleton-line short" /><div className="biz-skeleton-line medium" />
            </div>
            {isSlowLoading && <p className="biz-slow-msg">⏳ {t("takingLonger")}</p>}
          </div>
        )}

        {!isLoading && apiError && <div className="biz-alert error"><AlertCircle size={18} />{apiError}</div>}

        {!isLoading && !apiError && (
          <>
            <div className="biz-welcome">
              <div>
                <h1 className="biz-welcome-title">{t("welcomeBack")} {businessName || t("yourBusiness")} 👋</h1>
                <p className="biz-welcome-sub">{t("manageOffers")}</p>
              </div>
              <div className="biz-impact">
                <p className="biz-impact-label">{t("impact")}</p>
                <p className="biz-impact-value">{filteredOrders.length} {t("orders")}</p>
              </div>
            </div>

            <div className="biz-kpis">
              {[
                { label: t("activeOffers"),  value: kpiData.activeOffers,  icon: "📦" },
                { label: t("totalOrders"),   value: kpiData.totalOrders,   icon: "🛒" },
                { label: t("unitsSold"),     value: kpiData.unitsSold,     icon: "📊" },
                { label: t("netRevenue"),    value: kpiData.revenue,       icon: "💰" },
              ].map((kpi) => (
                <div key={kpi.label} className="biz-kpi-card">
                  <p className="biz-kpi-label">{kpi.label}</p>
                  <p className="biz-kpi-value">{kpi.value}</p>
                  <span className="biz-kpi-icon">{kpi.icon}</span>
                </div>
              ))}
            </div>

            {kpiData.platformCut > 0 && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "10px 16px", fontSize: "0.82rem", color: "#92400e", marginBottom: "8px" }}>
                ℹ️ {t("platformDeduction")} (12%): <strong>EGP {Number(kpiData.platformCut).toLocaleString("en-EG", { minimumFractionDigits: 2 })}</strong> — {t("grossRevenueWas")} <strong>EGP {Number(kpiData.grossRevenue).toLocaleString("en-EG", { minimumFractionDigits: 2 })}</strong>
              </div>
            )}

            <div id="charts-section" className="biz-charts" style={{ display: "flex", flexDirection: "row", gap: "16px", width: "100%" }}>
              <div className="biz-chart-card" style={{ flex: 1, minWidth: 0 }}>
                <h3 className="biz-chart-title">{t("netRevenueMonth")} (EGP)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={salesData && salesData.length > 0 ? salesData : FALLBACK_CHART} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `EGP ${v}`} />
                    <Tooltip formatter={(value) => [`EGP ${value.toLocaleString()}`, t("netRevenue")]} />
                    <Legend />
                    <Area type="monotone" dataKey="sales" name={t("netRevenue")} stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="biz-chart-card" style={{ flex: 1, minWidth: 0 }}>
                <h3 className="biz-chart-title">{t("ordersOverview")}</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ordersChartData.length > 0 ? ordersChartData : FALLBACK_CHART} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip formatter={(value) => [value, t("orders")]} />
                    <Legend />
                    <Bar dataKey="orders" name={t("orders")} radius={[4, 4, 0, 0]}>
                      {(salesData && salesData.length > 0 ? salesData : FALLBACK_CHART).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 10}, 70%, ${35 + (entry.orders / Math.max(...(salesData && salesData.length > 0 ? salesData.map(d => d.orders) : [1]), 1)) * 30}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div id="sustainability-section">
              <VendorSustainabilitySection branchId={dashboardBranchId} />
            </div>

            <TopSellingSection branchId={dashboardBranchId} />

            <div className="biz-section" id="offers-section">
              <div className="biz-section-header">
                <h2 className="biz-section-title">{t("myOffers")}</h2>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {filteredOffers.length > 2 && (
                    <button type="button" className="biz-link-btn" onClick={() => setShowAllOffers((v) => !v)}>
                      {showAllOffers ? t("showLess") : `${t("viewAll")} (${filteredOffers.length})`}
                    </button>
                  )}
                  <button type="button" className="biz-add-btn" onClick={openAdd}>+ {t("addOffer")}</button>
                </div>
              </div>

              {drawerOpen && (
                <div className="biz-drawer">
                  <div className="biz-drawer-header">
                    <h3 className="biz-drawer-title">{editingId ? t("editOffer") : t("newOffer")}</h3>
                    <button type="button" className="biz-drawer-close" onClick={closeDrawer} disabled={isSubmitting}>✕</button>
                  </div>
                  <div className="biz-drawer-body">
                    {submitSuccess && <div className="biz-alert-success"><CheckCircle size={16} />{submitSuccess}</div>}
                    {submitError && <div className="biz-alert-error"><AlertCircle size={16} />{submitError}</div>}
                    <div className="biz-field"><label>{t("title")}</label><input name="title" value={form.title} onChange={handleChange} placeholder={t("freshPasta")} disabled={isSubmitting} /></div>
                    <div className="biz-field"><label>{t("description")}</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} disabled={isSubmitting} /></div>
                    <div className="biz-field"><label>{t("photo")}</label><input type="file" accept="image/*" onChange={handleImage} disabled={isSubmitting} />{form.image && <p style={{ fontSize: "12px", color: "#10b981", margin: "4px 0 0" }}>✓ {form.image.name}</p>}</div>
                    <div className="biz-field-row">
                      <div className="biz-field"><label>{t("originalPrice")}</label><div className="biz-prefix-input"><span>EGP</span><input name="originalPrice" type="number" step="0.01" value={form.originalPrice} onChange={handleChange} disabled={isSubmitting} /></div></div>
                      <div className="biz-field"><label>{t("discountPrice")}</label><div className="biz-prefix-input"><span>EGP</span><input name="discountPrice" type="number" step="0.01" value={form.discountPrice} onChange={handleChange} disabled={isSubmitting} /></div></div>
                    </div>
                    <div className="biz-field-row">
                      <div className="biz-field"><label>{t("quantityAvailable")}</label><input name="quantityAvailable" type="number" value={form.quantityAvailable} onChange={handleChange} disabled={isSubmitting} /></div>
                      {!editingId && <div className="biz-field"><label>{t("expiresInHours")}</label><input name="expiresIn" type="number" value={form.expiresIn} onChange={handleChange} placeholder="24" disabled={isSubmitting} /></div>}
                    </div>
                    {editingId && (
                      <div className="biz-field-row">
                        <div className="biz-field"><label>{t("expirationDate")}</label><input name="expirationDate" type="datetime-local" value={form.expirationDate} onChange={handleChange} disabled={isSubmitting} /></div>
                        <div className="biz-field"><label>{t("status")}</label>
                          <select name="status" value={form.status} onChange={handleChange} disabled={isSubmitting}>
                            <option value="active">{t("active")}</option>
                            <option value="expired">{t("expired")}</option>
                            <option value="disabled">{t("disabled")}</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="biz-drawer-footer">
                    <button type="button" className="biz-btn-cancel" onClick={closeDrawer} disabled={isSubmitting}>{t("cancel")}</button>
                    <button type="button" className="biz-btn-save" onClick={handleSave} disabled={isSubmitting}>
                      {isSubmitting ? <><Loader size={14} style={{ display: "inline", marginRight: "6px" }} />{t("saving")}...</> : editingId ? t("saveChanges") : t("createOffer")}
                    </button>
                  </div>
                </div>
              )}

              <div className="biz-offers-list">
                {filteredOffers.length === 0 && <p className="biz-empty">{t("noOffers")}</p>}
                {(showAllOffers ? filteredOffers : filteredOffers.slice(0, 2)).map((offer) => (
                  <div key={offer.id} className="biz-offer-row">
                    <div className="biz-offer-info">
                      <p className="biz-offer-title">{offer.title}</p>
                      <p className="biz-offer-desc">{offer.description}</p>
                      <p className="biz-offer-meta-detail">{t("stock")}: {offer.quantity} | {t("expires")}: {offer.expiresIn}</p>
                    </div>
                    <div className="biz-offer-meta">
                      <span className="biz-price">EGP {offer.discountPrice}</span>
                      <span className={`biz-badge ${
                        offer.status === "active"   || offer.status === "Active"   ? "active"   :
                        offer.status === "expired"  || offer.status === "Expired"  ? "expired"  :
                        offer.status === "disabled" || offer.status === "Disabled" ? "disabled" :
                        "pending"
                      }`}>{offer.status}</span>
                    </div>
                    <div className="biz-offer-actions">
                      <button type="button" className="biz-icon-btn edit" onClick={() => openEdit(offer)} title={t("edit")} disabled={isSubmitting}>✏️</button>
                      <button type="button" className="biz-icon-btn delete" onClick={() => setDeleteConfirmId(offer.id)} title={t("delete")} disabled={isSubmitting}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="biz-section" id="orders-section">
              <div className="biz-section-header">
                <h2 className="biz-section-title">{t("recentOrders")}</h2>
                {filteredOrders.length > 2 && (
                  <button type="button" className="biz-link-btn" onClick={() => setShowAllOrders((v) => !v)}>
                    {showAllOrders ? t("showLess") : `${t("viewAll")} (${filteredOrders.length})`}
                  </button>
                )}
              </div>
              <div className="biz-table-wrap">
                <table className="biz-table">
                  <thead><tr><th>{t("orderID")}</th><th>{t("offer")}</th><th>{t("customer")}</th><th>{t("amount")}</th><th>{t("status")}</th></tr></thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", color: "#9ca3af" }}>{t("noOrders")}</td></tr>
                    ) : (
                      (showAllOrders ? filteredOrders : filteredOrders.slice(0, 2)).map((order) => (
                        <tr key={order.id}>
                          <td className="biz-td-id">{order.id}</td>
                          <td>{order.offer}</td>
                          <td>{order.customer}</td>
                          <td className="biz-td-amount">{order.amount}</td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                              disabled={updatingOrderId === order.id}
                              className={`biz-status-select status-${order.status?.toLowerCase()}`}
                            >
                              <option value="pending">{t("pending")}</option>
                              <option value="processing">{t("processing")}</option>
                              <option value="completed">{t("completed")}</option>
                              <option value="cancelled">{t("cancelled")}</option>
                              {order.delivery_type === "delivery" && <option value="delivered">{t("delivered")}</option>}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ✅ قسم Reviews بعد Orders */}
            <ReviewsSection branchId={dashboardBranchId} />

            {/* ✅ قسم Sales History في الآخر */}
            <SalesHistorySection branchId={dashboardBranchId} />
          </>
        )}
      </main>

      {editingBranch && (
        <div className="biz-modal-overlay">
          <div className="biz-modal">
            <h3 className="biz-modal-title">{t("editBranch")}</h3>
            <input className="biz-modal-input" value={editingBranch.branch_name || ""} onChange={(e) => setEditingBranch((prev) => ({ ...prev, branch_name: e.target.value }))} />
            <div className="biz-modal-actions">
              <button className="biz-modal-btn-cancel" onClick={() => setEditingBranch(null)}>{t("cancel")}</button>
              <button className="biz-modal-btn-save" onClick={handleEditBranch}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="biz-modal-overlay">
          <div className="biz-modal biz-modal-center">
            <div className="biz-modal-icon">🗑️</div>
            <h3 className="biz-modal-title">{t("deleteOffer")}</h3>
            <p className="biz-modal-body">{t("confirmDelete")}</p>
            <div className="biz-modal-actions-center">
              <button className="biz-modal-btn-cancel" onClick={() => setDeleteConfirmId(null)}>{t("cancel")}</button>
              <button className="biz-modal-btn-danger" onClick={() => handleDelete(deleteConfirmId)}>{t("delete")}</button>
            </div>
          </div>
        </div>
      )}

      {deleteBranchId && (
        <div className="biz-modal-overlay">
          <div className="biz-modal biz-modal-center">
            <div className="biz-modal-icon">🗑️</div>
            <h3 className="biz-modal-title">{t("deleteBranch")}</h3>
            <p className="biz-modal-body">{t("confirmDelete")}</p>
            <div className="biz-modal-actions-center">
              <button className="biz-modal-btn-cancel" onClick={() => setDeleteBranchId(null)}>{t("cancel")}</button>
              <button className="biz-modal-btn-danger" onClick={confirmDeleteBranch}>{t("delete")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

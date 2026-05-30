import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Bell, User, Globe, GitBranch, Package, ShoppingCart,
  ChevronRight, Loader, AlertCircle, CheckCircle, BarChart2, Leaf,
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
  const customer = order.user || order.customer;
  return {
    id: order.id,
    offer: offer?.title || offer?.name || order.offer_title || "N/A",
    customer: customer?.name || customer?.full_name || order.customer_name || order.user?.name || order.buyer?.name || "N/A",
    amount: `EGP ${order.total_amount ?? order.total ?? order.amount ?? 0}`,
    status: order.order_status || order.status || "pending",
    delivery_type: order.delivery_type || "pickup",
    branch_id: order.branch_id || offer?.branch_id || firstItem?.branch_id,
    branch: branchName(order.branch || offer?.branch),
    created_at: order.created_at || order.createdAt || order.date || null,
  };
};

const FALLBACK_CHART = [
  { day: "Mon", sales: 0, orders: 0 }, { day: "Tue", sales: 0, orders: 0 },
  { day: "Wed", sales: 0, orders: 0 }, { day: "Thu", sales: 0, orders: 0 },
  { day: "Fri", sales: 0, orders: 0 }, { day: "Sat", sales: 0, orders: 0 },
  { day: "Sun", sales: 0, orders: 0 },
];

// ── Sustainability Section ────────────────────────────────────────────────────
function VendorSustainabilitySection() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch("/api/vendor/sustainability/metrics", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.metrics) setMetrics(data.metrics);
      } catch (err) { console.error("Sustainability fetch error:", err); }
    };
    fetch_();
  }, []);

  if (!metrics) return null;

  const cards = [
    { icon: "🍽️", value: metrics.meals_saved ?? 0,                    label: "Meals Saved",       color: "#10b981", bg: "#f0fdf4" },
    { icon: "🌍", value: `${metrics.co2_prevented_kg ?? 0} kg`,        label: "CO₂ Prevented",     color: "#3b82f6", bg: "#eff6ff" },
    { icon: "💰", value: `EGP ${Number(metrics.recovered_revenue ?? 0).toLocaleString()}`, label: "Revenue Recovered", color: "#f59e0b", bg: "#fffbeb" },
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
              <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#065f46" }}>Your Sustainability Impact</h2>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#6b7280" }}>Your contribution to reducing food waste</p>
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

export default function Business() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [language, setLanguage] = useState("en");
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
  const [branches, setBranches] = useState([]);
  const [businessName, setBusinessName] = useState("");
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [kpiRevenue, setKpiRevenue] = useState("N/A");

  const [isLoading, setIsLoading] = useState(true);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [apiError, setApiError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteBranchId, setDeleteBranchId] = useState(null);
  const isSavingRef = React.useRef(false);
  const isFetchingOffersRef = React.useRef(false);

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
          setApiError(errData.message || "Failed to load branches.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setApiError("Network error. Please check your connection.");
      } finally {
        setIsLoading(false);
        clearTimeout(slowTimer);
        setIsSlowLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleOrderPlaced = () => {
      if (!selectedBranch) return;
      const fetchLatestOrders = async () => {
        const token = getToken();
        if (!token) return;
        try {
          const res = await fetch("/api/vendor/orders", {
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

  const fetchOffers = React.useCallback(async () => {
    if (isFetchingOffersRef.current) return;
    isFetchingOffersRef.current = true;
    const token = getToken();
    if (!token) { isFetchingOffersRef.current = false; return; }
    try {
      const res = await fetch("/api/vendor/myoffers", {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await readJson(res);
        setOffers(extractList(data, ["offers"]).map(normalizeOffer));
      }
    } catch (err) { console.error("Offers fetch error:", err); }
    finally { isFetchingOffersRef.current = false; }
  }, []);

  useEffect(() => { if (selectedBranch?.id) fetchOffers(); }, [selectedBranch?.id]);

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
          setOrders(extractList(data, ["orders"]).map(normalizeOrder));
        }
      } catch (err) { console.error("Orders fetch error:", err); }
    };
    if (selectedBranch) fetchOrders();
  }, [selectedBranch]);

  const selectedBranchName = branchName(selectedBranch);
  const filteredOffers = selectedBranch
    ? offers.filter((o) => o.branch_id === selectedBranch.id || o.branch === selectedBranchName)
    : offers;
  const filteredOrders = selectedBranch
    ? orders.filter((o) => o.branch_id === selectedBranch.id || o.branch === selectedBranchName)
    : orders;

  useEffect(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const map = {};
    days.forEach((d) => { map[d] = { day: d, sales: 0, orders: 0 }; });
    filteredOrders.forEach((order) => {
      const amount = Number(String(order.amount).replace("EGP ", "")) || 0;
      const dateKey = order.created_at;
      if (dateKey) {
        const d = new Date(dateKey);
        if (!isNaN(d.getTime())) {
          const day = days[d.getDay()];
          if (map[day]) { map[day].sales += amount; map[day].orders += 1; }
        }
      }
    });
    const chartData = days.map((d) => map[d]);
    const hasData = chartData.some((d) => d.sales > 0 || d.orders > 0);
    setSalesData(hasData ? chartData : FALLBACK_CHART);
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (Number(String(order.amount).replace("EGP ", "")) || 0), 0);
    setKpiRevenue(totalRevenue > 0 ? `EGP ${totalRevenue.toLocaleString()}` : "EGP 0");
  }, [orders, selectedBranch]);

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setSubmitError(""); setSubmitSuccess(""); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); setForm(EMPTY_FORM); setSubmitError(""); setSubmitSuccess(""); };

  const openEdit = (offer) => {
    setEditingId(offer.id);
    const expDate = offer.expiresIn && offer.expiresIn !== "N/A" ? new Date(offer.expiresIn).toISOString().slice(0, 16) : "";
    setForm({ title: offer.title, description: offer.description, originalPrice: String(offer.originalPrice), discountPrice: String(offer.discountPrice), quantityAvailable: String(offer.quantity), expiresIn: "", image: null, status: offer.status?.toLowerCase() || "active", expirationDate: expDate });
    setSubmitError(""); setSubmitSuccess(""); setDrawerOpen(true);
  };

  const handleChange = (e) => { const { name, value } = e.target; setForm((prev) => ({ ...prev, [name]: value })); };
  const handleImage = (e) => { const file = e.target.files[0]; if (file) setForm((prev) => ({ ...prev, image: file })); };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (!form.title.trim() || !form.description.trim()) { setSubmitError("Please fill in title and description"); return; }
    if (!selectedBranch && !editingId) { setSubmitError("Please select a branch first"); return; }
    if (parseFloat(form.discountPrice) >= parseFloat(form.originalPrice)) { setSubmitError("Discount price must be less than original price"); return; }

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
      if (res.ok) { setSubmitSuccess(editingId ? "Offer updated!" : "Offer created!"); fetchOffers(); closeDrawer(); }
      else setSubmitError(responseData.message || responseData.error || "Failed to save offer");
    } catch (err) {
      console.error("Save offer error:", err);
      setSubmitError("Network error. Please try again.");
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
      } else alert("Failed to update branch");
    } catch { alert("Network error"); }
  };

  const confirmDeleteBranch = async () => {
    const id = deleteBranchId;
    const token = getToken();
    try {
      const res = await fetch(`/api/branches/${id}`, { method: "DELETE", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setBranches((prev) => prev.filter((b) => b.id !== id));
        if (selectedBranch?.id === id) setSelectedBranch(branches.find((b) => b.id !== id) || null);
      } else alert("Failed to delete branch");
    } catch { alert("Network error"); }
    finally { setDeleteBranchId(null); }
  };

  const handleDelete = async (id) => {
    const token = getToken();
    try {
      const res = await fetch(`/api/vendor/offers/${id}`, { method: "DELETE", headers: { Accept: "application/json", Authorization: `Bearer ${token}` } });
      if (res.ok) { setOffers((prev) => prev.filter((o) => o.id !== id)); setSubmitSuccess("Offer deleted!"); setTimeout(() => setSubmitSuccess(""), 2000); }
      else { const data = await readJson(res); setSubmitError(data.message || "Failed to delete offer"); }
    } catch (err) { console.error("Delete error:", err); setSubmitError("Network error."); }
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
      else { const data = await readJson(res); alert(data.message || "Failed to update status"); }
    } catch (err) { console.error("Order status error:", err); alert("Network error."); }
    finally { setUpdatingOrderId(null); }
  };

  const navItems = [
  { id: "charts", icon: BarChart2, label: "Sales Charts", onClick: () => document.getElementById("charts-section")?.scrollIntoView({ behavior: "smooth" }) },
  { id: "sustainability", icon: Leaf, label: "Sustainability Impact", onClick: () => document.getElementById("sustainability-section")?.scrollIntoView({ behavior: "smooth" }) },
  { id: "offers", icon: Package, label: "My Offers", onClick: () => document.getElementById("offers-section")?.scrollIntoView({ behavior: "smooth" }) },
  { id: "orders", icon: ShoppingCart, label: "Recent Orders", onClick: () => document.getElementById("orders-section")?.scrollIntoView({ behavior: "smooth" }) },
  { id: "notifications", icon: Bell, label: "Notifications", badge: unreadCount > 0 ? unreadCount : null, onClick: () => setShowNotifications(true) },
  { id: "language", icon: Globe, label: language === "en" ? "English" : "العربية", onClick: () => setLanguage((l) => (l === "en" ? "ar" : "en")) },
  { id: "branches", icon: GitBranch, label: "Branches", expandable: true, expanded: showBranches, onToggle: () => setShowBranches((b) => !b), children: branches, hasAddBranch: true },
];

  return (
    <div className="biz-root">
      <aside className="biz-sidebar">
        <div className="biz-logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
          <img src="/images/e.png" alt="ZeroWaste" className="biz-logo-img" />
          <span className="biz-logo-text">ZeroWaste</span>
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
                      {item.children.map((b) => (
                        <div key={b.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button type="button" className={`biz-branch-btn ${selectedBranch?.id === b.id ? "active" : ""}`} style={{ flex: 1 }} onClick={() => setSelectedBranch(b)}>{branchName(b)}</button>
                          <button type="button" onClick={() => setDeleteBranchId(b.id)} style={{ background: "rgba(239,68,68,0.15)", border: "none", borderRadius: "6px", color: "#ef4444", cursor: "pointer", padding: "4px 7px", fontSize: "0.75rem" }}>🗑️</button>
                          <button type="button" onClick={() => setEditingBranch(b)} style={{ background: "rgba(59,130,246,0.15)", border: "none", borderRadius: "6px", color: "#3b82f6", cursor: "pointer", padding: "4px 7px", fontSize: "0.75rem" }}>✏️</button>
                        </div>
                      ))}
                      {item.hasAddBranch && <button type="button" className="biz-branch-btn biz-branch-add" onClick={() => navigate("/add-branch")}>+ Add Branch</button>}
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
        <div className="biz-sidebar-profile" onClick={() => navigate("/business/profile")} title="Go to profile">
          <div className="biz-sidebar-avatar"><User size={16} color="white" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{businessName || "Your Business"}</p>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Vendor Account</p>
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
            {isSlowLoading && <p className="biz-slow-msg">⏳ Taking longer than usual...</p>}
          </div>
        )}

        {!isLoading && apiError && <div className="biz-alert error"><AlertCircle size={18} />{apiError}</div>}

        {!isLoading && !apiError && (
          <>
            <div className="biz-welcome">
              <div>
                <h1 className="biz-welcome-title">Welcome back, {businessName || "Your Business"} 👋</h1>
                <p className="biz-welcome-sub">Manage your offers and orders</p>
              </div>
              <div className="biz-impact">
                <p className="biz-impact-label">Impact</p>
                <p className="biz-impact-value">{filteredOrders.length} orders</p>
              </div>
            </div>

            <div className="biz-kpis">
              {[
                { label: "Active Offers", value: filteredOffers.filter((o) => o.status === "active" || o.status === "Active").length, icon: "📦" },
                { label: "Total Orders", value: filteredOrders.length, icon: "🛒" },
                { label: "Revenue", value: kpiRevenue, icon: "💰" },
              ].map((kpi) => (
                <div key={kpi.label} className="biz-kpi-card">
                  <p className="biz-kpi-label">{kpi.label}</p>
                  <p className="biz-kpi-value">{kpi.value}</p>
                  <span className="biz-kpi-icon">{kpi.icon}</span>
                </div>
              ))}
            </div>

            <div id="charts-section" className="biz-charts" style={{ display: "flex", flexDirection: "row", gap: "16px", width: "100%" }}>
              <div className="biz-chart-card" style={{ flex: 1, minWidth: 0 }}>
                <h3 className="biz-chart-title">Revenue Overview (EGP)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={salesData.length > 0 ? salesData : FALLBACK_CHART} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `EGP ${v}`} />
                    <Tooltip formatter={(value) => [`EGP ${value.toLocaleString()}`, "Revenue"]} />
                    <Legend />
                    <Area type="monotone" dataKey="sales" name="Revenue (EGP)" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="biz-chart-card" style={{ flex: 1, minWidth: 0 }}>
                <h3 className="biz-chart-title">Orders Overview</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={salesData.length > 0 ? salesData : FALLBACK_CHART} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip formatter={(value) => [value, "Orders"]} />
                    <Legend />
                    <Bar dataKey="orders" name="Orders" radius={[4, 4, 0, 0]}>
                      {(salesData.length > 0 ? salesData : FALLBACK_CHART).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 10}, 70%, ${35 + (entry.orders / Math.max(...(salesData.map(d => d.orders)), 1)) * 30}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

           {/* ── Sustainability Impact ── */}
<div id="sustainability-section">
  <VendorSustainabilitySection />
</div>

            <div className="biz-section" id="offers-section">
              <div className="biz-section-header">
                <h2 className="biz-section-title">My Offers</h2>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {filteredOffers.length > 2 && (
                    <button type="button" className="biz-link-btn" onClick={() => setShowAllOffers((v) => !v)}>
                      {showAllOffers ? "Show Less" : `View All (${filteredOffers.length})`}
                    </button>
                  )}
                  <button type="button" className="biz-add-btn" onClick={openAdd}>+ Add Offer</button>
                </div>
              </div>

              {drawerOpen && (
                <div className="biz-drawer">
                  <div className="biz-drawer-header">
                    <h3 className="biz-drawer-title">{editingId ? "Edit Offer" : "New Offer"}</h3>
                    <button type="button" className="biz-drawer-close" onClick={closeDrawer} disabled={isSubmitting}>✕</button>
                  </div>
                  <div className="biz-drawer-body">
                    {submitSuccess && <div className="biz-alert-success"><CheckCircle size={16} />{submitSuccess}</div>}
                    {submitError && <div className="biz-alert-error"><AlertCircle size={16} />{submitError}</div>}
                    <div className="biz-field"><label>Title</label><input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Fresh Pasta" disabled={isSubmitting} /></div>
                    <div className="biz-field"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} disabled={isSubmitting} /></div>
                    <div className="biz-field"><label>Photo</label><input type="file" accept="image/*" onChange={handleImage} disabled={isSubmitting} />{form.image && <p style={{ fontSize: "12px", color: "#10b981", margin: "4px 0 0" }}>✓ {form.image.name}</p>}</div>
                    <div className="biz-field-row">
                      <div className="biz-field"><label>Original Price</label><div className="biz-prefix-input"><span>EGP</span><input name="originalPrice" type="number" step="0.01" value={form.originalPrice} onChange={handleChange} disabled={isSubmitting} /></div></div>
                      <div className="biz-field"><label>Discount Price</label><div className="biz-prefix-input"><span>EGP</span><input name="discountPrice" type="number" step="0.01" value={form.discountPrice} onChange={handleChange} disabled={isSubmitting} /></div></div>
                    </div>
                    <div className="biz-field-row">
                      <div className="biz-field"><label>Quantity Available</label><input name="quantityAvailable" type="number" value={form.quantityAvailable} onChange={handleChange} disabled={isSubmitting} /></div>
                      {!editingId && <div className="biz-field"><label>Expires In (hours)</label><input name="expiresIn" type="number" value={form.expiresIn} onChange={handleChange} placeholder="e.g., 24" disabled={isSubmitting} /></div>}
                    </div>
                    {editingId && (
                      <div className="biz-field-row">
                        <div className="biz-field"><label>Expiration Date</label><input name="expirationDate" type="datetime-local" value={form.expirationDate} onChange={handleChange} disabled={isSubmitting} /></div>
                        <div className="biz-field"><label>Status</label>
                          <select name="status" value={form.status} onChange={handleChange} disabled={isSubmitting}>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="biz-drawer-footer">
                    <button type="button" className="biz-btn-cancel" onClick={closeDrawer} disabled={isSubmitting}>Cancel</button>
                    <button type="button" className="biz-btn-save" onClick={handleSave} disabled={isSubmitting}>
                      {isSubmitting ? <><Loader size={14} style={{ display: "inline", marginRight: "6px" }} />Saving...</> : editingId ? "Save Changes" : "Create Offer"}
                    </button>
                  </div>
                </div>
              )}

              <div className="biz-offers-list">
                {filteredOffers.length === 0 && <p className="biz-empty">No offers yet. Create one to get started!</p>}
                {(showAllOffers ? filteredOffers : filteredOffers.slice(0, 2)).map((offer) => (
                  <div key={offer.id} className="biz-offer-row">
                    <div className="biz-offer-info">
                      <p className="biz-offer-title">{offer.title}</p>
                      <p className="biz-offer-desc">{offer.description}</p>
                      <p className="biz-offer-meta-detail">Stock: {offer.quantity} | Expires: {offer.expiresIn}</p>
                    </div>
                    <div className="biz-offer-meta">
                      <span className="biz-price">EGP {offer.discountPrice}</span>
                      <span className={`biz-badge ${offer.status === "active" || offer.status === "Active" ? "active" : offer.status === "expired" || offer.status === "Expired" ? "expired" : "pending"}`}>{offer.status}</span>
                    </div>
                    <div className="biz-offer-actions">
                      <button type="button" className="biz-icon-btn edit" onClick={() => openEdit(offer)} title="Edit" disabled={isSubmitting}>✏️</button>
                      <button type="button" className="biz-icon-btn delete" onClick={() => setDeleteConfirmId(offer.id)} title="Delete" disabled={isSubmitting}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="biz-section" id="orders-section">
              <div className="biz-section-header">
                <h2 className="biz-section-title">Recent Orders</h2>
                {filteredOrders.length > 2 && (
                  <button type="button" className="biz-link-btn" onClick={() => setShowAllOrders((v) => !v)}>
                    {showAllOrders ? "Show Less" : `View All (${filteredOrders.length})`}
                  </button>
                )}
              </div>
              <div className="biz-table-wrap">
                <table className="biz-table">
                  <thead><tr><th>Order ID</th><th>Offer</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: "center", color: "#9ca3af" }}>No orders yet</td></tr>
                    ) : (
                      (showAllOrders ? filteredOrders : filteredOrders.slice(0, 2)).map((order) => (
                        <tr key={order.id}>
                          <td className="biz-td-id">{order.id}</td>
                          <td>{order.offer}</td>
                          <td>{order.customer}</td>
                          <td className="biz-td-amount">{order.amount}</td>
                          <td>
                            <select value={order.status} onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)} disabled={updatingOrderId === order.id} className={`biz-status-select status-${order.status?.toLowerCase()}`}>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              {order.delivery_type === "delivery" && <option value="delivered">Delivered</option>}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {editingBranch && (
        <div className="biz-modal-overlay">
          <div className="biz-modal">
            <h3 className="biz-modal-title">Edit Branch</h3>
            <input className="biz-modal-input" value={editingBranch.branch_name || ""} onChange={(e) => setEditingBranch((prev) => ({ ...prev, branch_name: e.target.value }))} />
            <div className="biz-modal-actions">
              <button className="biz-modal-btn-cancel" onClick={() => setEditingBranch(null)}>Cancel</button>
              <button className="biz-modal-btn-save" onClick={handleEditBranch}>Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="biz-modal-overlay">
          <div className="biz-modal biz-modal-center">
            <div className="biz-modal-icon">🗑️</div>
            <h3 className="biz-modal-title">Delete Offer</h3>
            <p className="biz-modal-body">Are you sure? This cannot be undone.</p>
            <div className="biz-modal-actions-center">
              <button className="biz-modal-btn-cancel" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="biz-modal-btn-danger" onClick={() => handleDelete(deleteConfirmId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteBranchId && (
        <div className="biz-modal-overlay">
          <div className="biz-modal biz-modal-center">
            <div className="biz-modal-icon">🗑️</div>
            <h3 className="biz-modal-title">Delete Branch</h3>
            <p className="biz-modal-body">Are you sure? This cannot be undone.</p>
            <div className="biz-modal-actions-center">
              <button className="biz-modal-btn-cancel" onClick={() => setDeleteBranchId(null)}>Cancel</button>
              <button className="biz-modal-btn-danger" onClick={confirmDeleteBranch}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
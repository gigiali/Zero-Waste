import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Bell, User, Globe, GitBranch, Package, ShoppingCart,
  ChevronRight,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { NotificationsPanel } from "../Components/Notificationsdropdown";
import { useNotifications } from "../Context/Notificationscontext";
import "./Business.css";

const EMPTY_FORM = {
  title: "", description: "", originalPrice: "", discountPrice: "",
  quantityAvailable: "", expiresIn: "", image: null, status: "active",
};

const getToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  sessionStorage.getItem("token");

const readJson = async (response) => {
  try { return await response.json(); } catch { return {}; }
};

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

const branchName = (branch) => branch?.branch_name || branch?.name || branch?.address || "";

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
    customer: customer?.name || customer?.full_name || order.customer_name || "N/A",
    amount: `EGP ${order.total_amount ?? order.total ?? order.amount ?? 0}`,
    status: order.status || "Pending",
    branch_id: order.branch_id || offer?.branch_id || firstItem?.branch_id,
    branch: branchName(order.branch || offer?.branch),
  };
};

const normalizeSalesPoint = (item) => ({
  day: item.day || item.date || item.label || item.month || "N/A",
  sales: Number(item.sales ?? item.revenue ?? item.total_revenue ?? item.total ?? 0),
  orders: Number(item.orders ?? item.count ?? item.orders_count ?? item.total_orders ?? 0),
});

const readRevenue = (payload) =>
  payload?.total_revenue ?? payload?.revenue ??
  payload?.data?.total_revenue ?? payload?.data?.revenue ??
  payload?.summary?.total_revenue ?? payload?.data?.summary?.total_revenue;

const FALLBACK_CHART = [
  { day: "Mon", sales: 0, orders: 0 },
  { day: "Tue", sales: 0, orders: 0 },
  { day: "Wed", sales: 0, orders: 0 },
  { day: "Thu", sales: 0, orders: 0 },
  { day: "Fri", sales: 0, orders: 0 },
  { day: "Sat", sales: 0, orders: 0 },
  { day: "Sun", sales: 0, orders: 0 },
];

export default function Business() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [language, setLanguage]                   = useState("en");
  const [showBranches, setShowBranches]           = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedBranch, setSelectedBranch]       = useState(null);
  const [drawerOpen, setDrawerOpen]               = useState(false);
  const [editingId, setEditingId]                 = useState(null);
  const [showAllOffers, setShowAllOffers]         = useState(false);
  const [showAllOrders, setShowAllOrders]         = useState(false);
  const [form, setForm]                           = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [submitError, setSubmitError]             = useState("");
  const [branches, setBranches]                   = useState([]);
  const [businessName, setBusinessName]           = useState("");
  const [offers, setOffers]                       = useState([]);
  const [orders, setOrders]                       = useState([]);
  const [salesData, setSalesData]                 = useState([]);
  const [updatingOrderId, setUpdatingOrderId]     = useState(null);
  const [kpiRevenue, setKpiRevenue]               = useState("N/A");
  const [isLoading, setIsLoading]                 = useState(true);
  const [apiError, setApiError]                   = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) { navigate("/signin"); return; }
      setIsLoading(true);
      setApiError("");

      try {
        const res = await fetch("/api/myprofile", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await readJson(res);
          const v = d.data?.vendor || d.vendor || d;
          if (v?.business_name || v?.name) setBusinessName(v.business_name || v.name);
        }
      } catch (e) { console.error("Profile fetch error:", e); }

      try {
        const res = await fetch("/api/my-branches", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await readJson(res);
          const list = extractList(d, ["branches"]);
          setBranches(list);
          if (list.length === 0) { navigate("/add-branch"); return; }
          setSelectedBranch(list[0]);
        } else {
          const d = await readJson(res);
          setApiError(d.message || "Failed to load branches.");
        }
      } catch (e) {
        console.error("Branches fetch error:", e);
        setApiError("Network error while loading business data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const fetchOffers = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch("/api/vendor/myoffers", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await readJson(res);
          setOffers(extractList(d, ["offers"]).map(normalizeOffer));
        }
      } catch (e) { console.error("Offers fetch error:", e); }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch("/api/vendor/orders", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await readJson(res);
          setOrders(extractList(d, ["orders"]).map(normalizeOrder));
        }
      } catch (e) { console.error("Orders fetch error:", e); }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchSales = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch("/api/sales-report", {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const d = await readJson(res);
          const daily = extractList(d, ["daily_sales", "sales", "sales_by_day", "chart"]);
          if (daily.length > 0) setSalesData(daily.map(normalizeSalesPoint));
          const revenue = readRevenue(d);
          if (revenue !== undefined) setKpiRevenue(`EGP ${revenue}`);
        }
      } catch (e) { console.error("Sales report fetch error:", e); }
    };
    fetchSales();
  }, []);

  const selectedBranchName = branchName(selectedBranch);

  const filteredOffers = selectedBranch
    ? offers.filter((o) => o.branch_id === selectedBranch.id || o.branch === selectedBranchName)
    : offers;

  const filteredOrders = selectedBranch
    ? orders.filter((o) => o.branch_id === selectedBranch.id || o.branch === selectedBranchName)
    : orders;

  const openAdd     = () => { setEditingId(null); setForm(EMPTY_FORM); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); setForm(EMPTY_FORM); setSubmitError(""); };

  const openEdit = (offer) => {
    setEditingId(offer.id);
    const expDate = offer.expiresIn && offer.expiresIn !== "N/A"
      ? new Date(offer.expiresIn).toISOString().slice(0, 16) : "";
    setForm({
      title: offer.title, description: offer.description,
      originalPrice: String(offer.originalPrice), discountPrice: String(offer.discountPrice),
      quantityAvailable: String(offer.quantity), expiresIn: "", image: null,
      status: offer.status?.toLowerCase() || "active", expirationDate: expDate,
    });
    setDrawerOpen(true);
  };

  const handleChange = (e) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })); };
  const handleImage  = (e) => { const file = e.target.files[0]; if (file) setForm((p) => ({ ...p, image: file })); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setSubmitError("Please fill in title and description");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("title",              form.title.trim());
      fd.append("description",        form.description.trim());
      fd.append("quantity_available", parseInt(form.quantityAvailable) || 1);
      fd.append("original_price",     parseFloat(form.originalPrice)   || 0);
      fd.append("discount_price",     parseFloat(form.discountPrice)   || 0);
      fd.append("status",             form.status || "active");

      if (!editingId) {
        const branchId = selectedBranch?.id;
        if (!branchId) { setSubmitError("Please select a branch first"); setIsSubmitting(false); return; }
        fd.append("branch_id", branchId);
        fd.append("expiration_time", new Date(Date.now() + (parseInt(form.expiresIn) || 2) * 3600000).toISOString());
      } else if (form.expirationDate) {
        fd.append("expiration_time", new Date(form.expirationDate).toISOString());
      }
      if (form.image && typeof form.image === "object") fd.append("image", form.image);

      const url    = editingId ? `/api/vendor/offers/${editingId}` : "/api/vendor/offers";
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await readJson(res);

      if (res.ok) {
        if (editingId) {
          setOffers((p) => p.map((o) => o.id === editingId ? {
            ...o, title: form.title, description: form.description,
            originalPrice: parseFloat(form.originalPrice) || 0,
            discountPrice: parseFloat(form.discountPrice) || 0,
            quantity: parseInt(form.quantityAvailable) || 1,
            status: form.status, image: data.offer?.image || o.image,
          } : o));
        } else {
          const no = data.offer || data.data || {};
          setOffers((p) => [normalizeOffer({
            ...no,
            title: form.title, description: form.description,
            original_price: parseFloat(form.originalPrice) || 0,
            discount_price: parseFloat(form.discountPrice) || 0,
            quantity_available: parseInt(form.quantityAvailable) || 1,
            expiration_time: form.expiresIn + "h",
            status: "active",
            branch_id: selectedBranch?.id,
            branch: selectedBranch,
          }), ...p]);
        }
        closeDrawer();
      } else {
        setSubmitError(data.message || "Failed to save offer");
      }
    } catch (e) {
      console.error(e);
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const token = getToken();
    try {
      const res = await fetch(`/api/vendor/offers/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOffers((p) => p.filter((o) => o.id !== id));
    } catch (e) { console.error("Delete error:", e); }
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
      if (res.ok) {
        setOrders((p) => p.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        const d = await readJson(res);
        alert(d.message || "Failed to update order status");
      }
    } catch (e) { console.error(e); }
    finally { setUpdatingOrderId(null); }
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const navItems = [
    { id: "notifications", icon: Bell,         label: t("businessDashboard.notifications"), badge: unreadCount > 0 ? unreadCount : null, onClick: () => setShowNotifications(true) },
    { id: "language",      icon: Globe,        label: language === "en" ? t("businessDashboard.languageEnglish") : t("businessDashboard.languageArabic"), onClick: () => setLanguage((l) => l === "en" ? "ar" : "en") },
    { id: "branches",      icon: GitBranch,    label: t("businessDashboard.branches"), expandable: true, expanded: showBranches, onToggle: () => setShowBranches((b) => !b), children: branches, hasAddBranch: true },
    { id: "offers",        icon: Package,      label: t("businessDashboard.myOffers"), onClick: () => navigate("/business/offers") },
    { id: "orders",        icon: ShoppingCart, label: t("businessDashboard.orders"),   onClick: () => navigate("/business/orders") },
  ];

  return (
    <div className="biz-root">
      <aside className="biz-sidebar">
        <div className="biz-logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
          <img src="/images/e.png" alt="ZeroWaste" className="biz-logo-img" />
          <span className="biz-logo-text">ZeroWaste</span>
        </div>

        <div className="biz-nav-group">
          <p className="biz-nav-label">{t("businessDashboard.locationLabel")}</p>
          <select className="biz-select" value={selectedBranch?.id || ""}
            onChange={(e) => { const b = branches.find((x) => String(x.id) === e.target.value); if (b) setSelectedBranch(b); }}>
            {branches.map((b) => <option key={b.id} value={b.id}>{branchName(b)}</option>)}
          </select>
        </div>

        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "4px 16px 8px" }} />
        <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", padding: "0 20px", margin: "0 0 6px" }}>NAVIGATION</p>

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
                        <button type="button" key={b.id} className={`biz-branch-btn ${selectedBranch?.id === b.id ? "active" : ""}`} onClick={() => setSelectedBranch(b)}>
                          {branchName(b)}
                        </button>
                      ))}
                      {item.hasAddBranch && (
                        <button type="button" className="biz-branch-btn biz-branch-add" onClick={() => navigate("/add-branch")}>+ Add Branch</button>
                      )}
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
            <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {businessName || t("businessDashboard.yourBusiness")}
            </p>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {t("businessDashboard.businessAccount")}
            </p>
          </div>
          <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
        </div>
      </aside>

      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}

      <main className="biz-main">
        {isLoading && <div className="biz-alert">Loading business data...</div>}
        {!isLoading && apiError && <div className="biz-alert error">{apiError}</div>}

        <div className="biz-welcome">
          <div>
            <h1 className="biz-welcome-title">{t("businessDashboard.welcomeBack", { business: businessName || t("businessDashboard.yourBusiness") })} 👋</h1>
            <p className="biz-welcome-sub">{t("businessDashboard.manageOffersSubtitle")}</p>
          </div>
          <div className="biz-impact">
            <p className="biz-impact-label">{t("businessDashboard.impactTitle")}</p>
            <p className="biz-impact-value">{t("businessDashboard.foodSaved", { count: filteredOrders.length })}</p>
          </div>
        </div>

        <div className="biz-kpis">
          {[
            { label: t("businessDashboard.kpis.activeOffers"),  value: filteredOffers.filter((o) => o.status === "active" || o.status === "Active").length, icon: "📦" },
            { label: t("businessDashboard.kpis.totalOrders"),   value: filteredOrders.length, icon: "🛒" },
            { label: t("businessDashboard.kpis.todaysRevenue"), value: kpiRevenue, icon: "💰" },
          ].map((k) => (
            <div key={k.label} className="biz-kpi-card">
              <p className="biz-kpi-label">{k.label}</p>
              <p className="biz-kpi-value">{k.value}</p>
              <span className="biz-kpi-icon">{k.icon}</span>
            </div>
          ))}
        </div>

        <div className="biz-charts">
          <div className="biz-chart-card">
            <h3 className="biz-chart-title">{t("businessDashboard.charts.salesOverview")}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={salesData.length > 0 ? salesData : FALLBACK_CHART}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} />
                <Tooltip /><Legend />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name={t("businessDashboard.charts.salesLabel")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="biz-chart-card">
            <h3 className="biz-chart-title">{t("businessDashboard.charts.ordersOverview")}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesData.length > 0 ? salesData : FALLBACK_CHART}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} />
                <Tooltip /><Legend />
                <Bar dataKey="orders" fill="#3b82f6" name={t("businessDashboard.charts.ordersLabel")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="biz-section" id="offers-section">
          <div className="biz-section-header">
            <h2 className="biz-section-title">{t("businessDashboard.myOffers")}</h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {filteredOffers.length > 2 && (
                <button type="button" className="biz-link-btn" onClick={() => setShowAllOffers((v) => !v)}>
                  {showAllOffers ? t("businessDashboard.showLess") : t("businessDashboard.viewAllOffers", { count: filteredOffers.length })}
                </button>
              )}
              <button type="button" className="biz-add-btn" onClick={openAdd}>{t("businessDashboard.addOffer")}</button>
            </div>
          </div>

          {drawerOpen && (
            <div className="biz-drawer">
              <div className="biz-drawer-header">
                <h3 className="biz-drawer-title">{editingId ? t("businessDashboard.editOffer") : t("businessDashboard.newOffer")}</h3>
                <button type="button" className="biz-drawer-close" onClick={closeDrawer}>✕</button>
              </div>
              <div className="biz-drawer-body">
                {submitError && <div style={{ color: "#ef4444", marginBottom: "12px", padding: "8px", background: "#fef2f2", borderRadius: "6px" }}>{submitError}</div>}
                <div className="biz-field"><label>{t("businessDashboard.form.title")}</label><input name="title" value={form.title} onChange={handleChange} placeholder={t("businessDashboard.form.titlePlaceholder")} /></div>
                <div className="biz-field"><label>{t("businessDashboard.form.description")}</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} /></div>
                <div className="biz-field"><label>{t("businessDashboard.form.offerPhoto")}</label><input type="file" accept="image/*" onChange={handleImage} /></div>
                <div className="biz-field-row">
                  <div className="biz-field"><label>{t("businessDashboard.form.originalPrice")}</label><div className="biz-prefix-input"><span>EGP</span><input name="originalPrice" type="number" step="0.01" value={form.originalPrice} onChange={handleChange} /></div></div>
                  <div className="biz-field"><label>{t("businessDashboard.form.discountPrice")}</label><div className="biz-prefix-input"><span>EGP</span><input name="discountPrice" type="number" step="0.01" value={form.discountPrice} onChange={handleChange} /></div></div>
                </div>
                <div className="biz-field-row">
                  <div className="biz-field"><label>{t("businessDashboard.form.quantityAvailable")}</label><input name="quantityAvailable" type="number" value={form.quantityAvailable} onChange={handleChange} /></div>
                  {!editingId && <div className="biz-field"><label>{t("businessDashboard.form.expiresIn")}</label><input name="expiresIn" type="number" value={form.expiresIn} onChange={handleChange} placeholder="hours" /></div>}
                </div>
                {editingId && (
                  <div className="biz-field-row">
                    <div className="biz-field"><label>{t("businessDashboard.form.expirationDate")}</label><input name="expirationDate" type="datetime-local" value={form.expirationDate} onChange={handleChange} /></div>
                    <div className="biz-field"><label>{t("businessDashboard.form.status")}</label>
                      <select name="status" value={form.status} onChange={handleChange}>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div className="biz-drawer-footer">
                <button type="button" className="biz-btn-cancel" onClick={closeDrawer} disabled={isSubmitting}>{t("businessDashboard.cancel")}</button>
                <button type="button" className="biz-btn-save" onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? t("businessDashboard.saving") : editingId ? t("businessDashboard.saveChanges") : t("businessDashboard.createOffer")}
                </button>
              </div>
            </div>
          )}

          <div className="biz-offers-list">
            {filteredOffers.length === 0 && <p className="biz-empty">{t("businessDashboard.noOffers")}</p>}
            {(showAllOffers ? filteredOffers : filteredOffers.slice(0, 2)).map((offer) => (
              <div key={offer.id} className="biz-offer-row">
                <div className="biz-offer-info">
                  <p className="biz-offer-title">{offer.title}</p>
                  <p className="biz-offer-desc">{offer.description}</p>
                </div>
                <div className="biz-offer-meta">
                  <span className="biz-price">EGP {offer.discountPrice}</span>
                  <span className={`biz-badge ${offer.status === "active" || offer.status === "Active" ? "active" : offer.status === "expired" || offer.status === "Expired" ? "expired" : "pending"}`}>
                    {offer.status}
                  </span>
                </div>
                <div className="biz-offer-actions">
                  <button type="button" className="biz-icon-btn edit"   onClick={() => openEdit(offer)}       title="Edit">✏️</button>
                  <button type="button" className="biz-icon-btn delete" onClick={() => handleDelete(offer.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="biz-section" id="orders-section">
          <div className="biz-section-header">
            <h2 className="biz-section-title">{t("businessDashboard.recentOrders")}</h2>
            {filteredOrders.length > 2 && (
              <button type="button" className="biz-link-btn" onClick={() => setShowAllOrders((v) => !v)}>
                {showAllOrders ? t("businessDashboard.showLess") : t("businessDashboard.viewAllOrders", { count: filteredOrders.length })}
              </button>
            )}
          </div>
          <div className="biz-table-wrap">
            <table className="biz-table">
              <thead>
                <tr>
                  <th>{t("businessDashboard.orderTable.id")}</th>
                  <th>{t("businessDashboard.orderTable.offer")}</th>
                  <th>{t("businessDashboard.orderTable.customer")}</th>
                  <th>{t("businessDashboard.orderTable.amount")}</th>
                  <th>{t("businessDashboard.orderTable.status")}</th>
                </tr>
              </thead>
              <tbody>
                {(showAllOrders ? filteredOrders : filteredOrders.slice(0, 2)).map((o) => (
                  <tr key={o.id}>
                    <td className="biz-td-id">{o.id}</td>
                    <td>{o.offer}</td>
                    <td>{o.customer}</td>
                    <td className="biz-td-amount">{o.amount}</td>
                    <td>
                      <select value={o.status} onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                        disabled={updatingOrderId === o.id}
                        style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "0.85rem", cursor: updatingOrderId === o.id ? "wait" : "pointer" }}>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

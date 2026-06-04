import React, { useState, useEffect } from "react";
import {
  Users, CircleAlert, ClipboardList, Loader2, AlertCircle, Activity,
  ShoppingBag, ChevronDown, ChevronUp, Search, RefreshCw, LayoutDashboard,
  TrendingUp, Package, Star, Bell, Languages, ChevronRight, ArrowUpRight,
  ArrowDownRight, DollarSign, BarChart2, Menu, X, Leaf, Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, BarChart, Bar,
} from "recharts";
import { useAuth } from "../Context/AuthContext";
import { useTranslation } from "react-i18next";
import "./Admin.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";
const API_TIMEOUT = 8000;
const PIE_COLORS = ["#696cff", "#ff4d49", "#28c76f", "#ff9f43"];

const isSuperAdmin = (r) => r === "super_admin";
const isManager = (r) => r === "manager";
const isSupport = (r) => r === "support";
const canManage = (r) => isSuperAdmin(r) || isManager(r);
const canViewReports = (r) => isSuperAdmin(r) || isManager(r) || isSupport(r);

const buildWeeklyData = (orders = []) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  const map = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = days[d.getDay()];
    map[key] = { day: key, orders: 0, revenue: 0 };
  }
  orders.forEach((o) => {
    const d = new Date(o.created_at || o.order_date);
    const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) {
      const key = days[d.getDay()];
      if (map[key]) { map[key].orders += 1; map[key].revenue += parseFloat(o.total_amount || o.total || 0); }
    }
  });
  return Object.values(map);
};

const STATUS_COLORS = {
  pending:          { bg: "#fff8e1", text: "#f59e0b",  label: "Pending" },
  accepted:         { bg: "#e8f5e9", text: "#28c76f",  label: "Accepted" },
  preparing:        { bg: "#e3f2fd", text: "#696cff",  label: "Preparing" },
  out_for_delivery: { bg: "#f3e5f5", text: "#9c27b0",  label: "Out for Delivery" },
  delivered:        { bg: "#e8f5e9", text: "#1b5e20",  label: "Delivered" },
  completed:        { bg: "#e8f5e9", text: "#1b5e20",  label: "Completed" },
  cancelled:        { bg: "#ffebee", text: "#ff4d49",  label: "Cancelled" },
  rejected:         { bg: "#fce4ec", text: "#c62828",  label: "Rejected" },
  processing:       { bg: "#e3f2fd", text: "#696cff",  label: "Processing" },
  active:           { bg: "#e8f5e9", text: "#28c76f",  label: "Active" },
  expired:          { bg: "#ffebee", text: "#ff4d49",  label: "Expired" },
  disabled:         { bg: "#f1f5f9", text: "#64748b",  label: "Disabled" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status?.toLowerCase()] ?? { bg: "#f1f5f9", text: "#64748b", label: status ?? "—" };
  return <span className="status-badge" style={{ background: s.bg, color: s.text }}>{s.label}</span>;
};

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendUp }) => (
  <div className="stat-card">
    <div className="stat-card__body">
      <div>
        <p className="stat-card__label">{title}</p>
        <h3 className="stat-card__value">{value}</h3>
        {subtitle && <p className="stat-card__sub">{subtitle}</p>}
        {trend && (
          <span className={`stat-card__trend ${trendUp ? "up" : "down"}`}>
            {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {trend}
          </span>
        )}
      </div>
      <div className="stat-card__icon" style={{ background: `${color}20` }}>
        <Icon size={22} color={color} />
      </div>
    </div>
  </div>
);

const SustainabilityCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="sustainability-metric-card" style={{ borderTopColor: color }}>
    <div className="sustainability-metric-card__header">
      <div className="sustainability-metric-card__icon" style={{ background: `${color}15` }}>
        <Icon size={24} color={color} />
      </div>
      <p className="sustainability-metric-card__label">{title}</p>
    </div>
    <h2 className="sustainability-metric-card__value">{value}</h2>
    {subtitle && <p className="sustainability-metric-card__subtitle">{subtitle}</p>}
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button type="button" className={`sidebar-nav-item ${active ? "active" : ""}`} onClick={onClick}>
    <Icon size={18} />
    <span>{label}</span>
    {badge && <span className="sidebar-nav-badge">{badge}</span>}
    {active && <ChevronRight size={14} className="sidebar-nav-arrow" />}
  </button>
);

function DeleteConfirmModal({ offer, onConfirm, onCancel, isDeleting }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "14px", padding: "2rem", maxWidth: "380px", width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗑️</div>
        <h3 style={{ margin: "0 0 0.5rem", color: "#1f2937", fontSize: "1.1rem", fontWeight: 700 }}>Delete Offer?</h3>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 0.25rem" }}>
          <strong style={{ color: "#111827" }}>{offer?.title}</strong>
        </p>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "0 0 1.5rem" }}>This action is permanent and cannot be undone.</p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onCancel} disabled={isDeleting} style={{ flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting} style={{ flex: 1, padding: "0.65rem", border: "none", borderRadius: "8px", background: "#ff4d49", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}>
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AllOffersSection({ token }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const PER_PAGE = 10;

  const fetchOffers = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE_URL}/offers`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.offers) ? data.offers : [];
      setOffers(list);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/offers/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || "Failed to delete offer"); }
      setOffers((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setDeleteSuccess(`"${deleteTarget.title}" deleted successfully`);
      setTimeout(() => setDeleteSuccess(""), 3000);
      window.dispatchEvent(new CustomEvent("admin-offer-deleted", { detail: { id: deleteTarget.id } }));
    } catch (err) { alert(err.message); }
    finally { setIsDeleting(false); setDeleteTarget(null); }
  };

  const filtered = offers.filter((o) => {
    const q = search.toLowerCase();
    return !q || o.title?.toLowerCase().includes(q) || String(o.id).includes(q) ||
      (o.status || "").toLowerCase().includes(q) ||
      (o.branch?.vendor?.business_name || o.vendor?.business_name || "").toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const fmtExpiry = (v) => {
    if (!v) return "—";
    try {
      const date = new Date(v).toLocaleDateString("en-EG", { day: "2-digit", month: "short", year: "numeric" });
      const time = new Date(v).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      return `${date} · ${time}`;
    } catch { return v; }
  };

  return (
    <div className="orders-card">
      {deleteTarget && (
        <DeleteConfirmModal offer={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} isDeleting={isDeleting} />
      )}

      <div className="orders-card__header">
        <div className="orders-card__title-row">
          <Package size={20} color="#696cff" />
          <h3>All Offers</h3>
          <span className="orders-count-badge">{filtered.length}</span>
        </div>
        <div className="orders-card__controls">
          <div className="search-box">
            <Search size={14} color="#8592a3" />
            <input type="text" placeholder="Search title, vendor, status…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <button type="button" className="refresh-btn" onClick={fetchOffers} title="Refresh"><RefreshCw size={14} /></button>
        </div>
      </div>

      {deleteSuccess && (
        <div style={{ padding: "10px 22px", background: "#e8f5e9", color: "#28c76f", fontSize: "0.85rem", fontWeight: 600, borderBottom: "1px solid #d1fae5" }}>
          ✓ {deleteSuccess}
        </div>
      )}

      {loading ? (
        <div className="loading-state"><Loader2 size={18} className="spin" /> Loading offers…</div>
      ) : error ? (
        <div className="error-state"><AlertCircle size={16} /> {error}</div>
      ) : offers.length === 0 ? (
        <div className="empty-state"><Package size={40} color="#cbd5e1" /><p>No offers found.</p></div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Vendor</th>
                  <th>Branch</th>
                  <th>Original (EGP)</th>
                  <th>Discount (EGP)</th>
                  <th>Qty Left</th>
                  <th>Expires</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((offer, idx) => {
                  const imageUrl = offer.image
                    ? offer.image.startsWith("http")
                      ? offer.image
                      : `https://zero-waste-production.up.railway.app/storage/${offer.image.replace(/^\/+/, "")}`
                    : null;
                  const vendorName =
                    offer.branch?.vendor?.business_name ||
                    offer.vendor?.business_name ||
                    offer.branch?.branch_name ||
                    "—";
                  const branchName =
                    offer.branch?.branch_name ||
                    offer.branch?.store_address ||
                    "—";
                  return (
                    <tr key={offer.id ?? idx}>
                      <td className="order-id">#{offer.id}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {imageUrl ? (
                            <img src={imageUrl} alt={offer.title}
                              style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                              onError={(e) => { e.target.style.display = "none"; }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>🍽️</div>
                          )}
                          <span style={{ fontWeight: 600, color: "#2f3349", fontSize: "0.85rem" }}>{offer.title || "—"}</span>
                        </div>
                      </td>
                      <td style={{ color: "#8592a3", fontSize: "0.82rem" }}>{vendorName}</td>
                      <td style={{ color: "#8592a3", fontSize: "0.82rem" }}>{branchName}</td>
                      <td style={{ color: "#8592a3" }}>{offer.original_price ?? "—"}</td>
                      <td style={{ fontWeight: 700, color: "#28c76f" }}>{offer.discount_price ?? "—"}</td>
                      <td style={{ color: "#566a7f" }}>{offer.quantity_available ?? "—"}</td>
                      <td style={{ color: "#566a7f", fontSize: "0.8rem" }}>{fmtExpiry(offer.expiration_time)}</td>
                      <td>
                        <button
                          onClick={() => setDeleteTarget(offer)}
                          title="Delete offer"
                          style={{
                            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px",
                            padding: "6px 10px", cursor: "pointer", color: "#ff4d49",
                            display: "flex", alignItems: "center", gap: "4px",
                            fontSize: "0.78rem", fontWeight: 600,
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <span className="pagination__info">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </span>
              <div className="pagination__controls">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="pagination__btn">‹ Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pg) => (
                  <button key={pg} onClick={() => setPage(pg)} className={`pagination__btn ${pg === page ? "active" : ""}`}>{pg}</button>
                ))}
                {totalPages > 5 && <span className="pagination__ellipsis">…</span>}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="pagination__btn">Next ›</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const Admin = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role, isLoggedIn } = useAuth();
  const token =
    localStorage.getItem("auth_token") || localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") || sessionStorage.getItem("token");

  const ROLE_LABEL = { super_admin: "Super Admin", manager: "Manager", support: "Support" };

  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const [weeklyData, setWeeklyData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [rawStats, setRawStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [earningsData, setEarningsData] = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifUnread, setNotifUnread] = useState(0);
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersSortField, setOrdersSortField] = useState("created_at");
  const [ordersSortDir, setOrdersSortDir] = useState("desc");
  const ORDERS_PER_PAGE = 10;

  const [sustainabilityMetrics, setSustainabilityMetrics] = useState(null);
  const [sustainabilityChartData, setSustainabilityChartData] = useState([]);
  const [sustainabilityLoading, setSustainabilityLoading] = useState(false);
  const [sustainabilityError, setSustainabilityError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    (async () => {
      setSustainabilityLoading(true); setSustainabilityError(null);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
        const res = await fetch(`${BASE_URL}/admin/sustainability/metrics`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`Sustainability ${res.status}`);
        const data = await res.json();
        if (data.success) { setSustainabilityMetrics(data.metrics); setSustainabilityChartData(data.chart_data || []); }
      } catch (err) { if (err.name !== "AbortError") setSustainabilityError(err.message); }
      finally { setSustainabilityLoading(false); }
    })();
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    (async () => {
      setStatsLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
        const res = await fetch(`${BASE_URL}/dashboard/stats`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`Stats ${res.status}`);
        const data = await res.json();
        const s = data?.data ?? data;
        const parsedStats = {
          total_customers: s?.total_customers ?? 0, total_vendors: s?.total_vendors ?? 0,
          total_orders: s?.total_orders ?? 0, total_active_offers: s?.total_active_offers ?? 0,
          gross_revenue: s?.financials?.total_market_sales ?? 0, customer_fees: s?.financials?.customer_fees_6_pct ?? 0,
          vendor_fees: s?.financials?.vendor_fees_12_pct ?? 0, net_profit: s?.financials?.net_platform_profit ?? 0,
        };
        setRawStats(parsedStats);
        setPieData([
          { name: "Customers", value: parsedStats.total_customers },
          { name: "Vendors", value: parsedStats.total_vendors },
          { name: "Active Offers", value: parsedStats.total_active_offers },
          { name: "Total Orders", value: parsedStats.total_orders },
        ]);
      } catch (err) { if (err.name !== "AbortError") console.error("Stats fetch error:", err); }
      finally { setStatsLoading(false); }
    })();
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!isLoggedIn || !token || !canManage(role)) return; // ✅ SHELLE: Support ما يحمل earnings
    (async () => {
      setEarningsLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
        const res = await fetch(`${BASE_URL}/dashboard/earnings`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`Earnings ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setEarningsData(arr.map(item => ({ month: item.month, earnings: item.pure_profit || item.net_sales || 0 })));
      } catch (err) { if (err.name !== "AbortError") console.error("Earnings fetch error:", err); }
      finally { setEarningsLoading(false); }
    })();
  }, [isLoggedIn, token, role]);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    (async () => {
      setActivityLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
        const res = await fetch(`${BASE_URL}/dashboard/activity`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`Activity ${res.status}`);
        const data = await res.json();
        const users = data?.data?.latest_users ?? [];
        const offers = data?.data?.latest_offers ?? [];
        const merged = [
          ...users.map((u, idx) => ({ uid: `u-${idx}`, description: `New ${u.role ?? "user"} registered: ${u.name ?? "Unknown"}`, created_at: u.created_at })),
          ...offers.map((o, idx) => ({ uid: `o-${idx}`, description: `New offer: ${o.title ?? "Untitled"}`, created_at: o.created_at })),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setActivities(merged);
      } catch (err) { if (err.name !== "AbortError") console.error("Activity fetch error:", err); }
      finally { setActivityLoading(false); }
    })();
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    (async () => {
      setNotifLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
        const res = await fetch(`${BASE_URL}/notifications`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`Notif ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setNotifications(list);
        setNotifUnread(list.filter((n) => !n.read_at && !n.is_read).length);
      } catch (err) { if (err.name !== "AbortError") console.error("Notifications fetch error:", err); }
      finally { setNotifLoading(false); }
    })();
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    (async () => {
      setOrdersLoading(true); setOrdersError(null);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
        const res = await fetch(`${BASE_URL}/admin/all-orders`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`Orders ${res.status}`);
        const data = await res.json();
        const list =
          Array.isArray(data) ? data :
          Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.orders) ? data.orders :
          Array.isArray(data?.data?.orders) ? data.data.orders :
          Array.isArray(data?.data?.data) ? data.data.data :
          data?.data && typeof data.data === "object" && !Array.isArray(data.data)
            ? Object.values(data.data).find(Array.isArray) ?? [] : [];
        setAllOrders(list);
        setWeeklyData(buildWeeklyData(list));
      } catch (err) {
        if (err.name !== "AbortError") { console.error("Orders fetch error:", err); setOrdersError(err.message); }
      } finally { setOrdersLoading(false); }
    })();
  }, [isLoggedIn, token]);

  const totalCustomers = rawStats?.total_customers ?? 0;
  const totalVendors   = rawStats?.total_vendors ?? 0;
  const totalOrders    = rawStats?.total_orders ?? 0;
  const activeOffers   = rawStats?.total_active_offers ?? 0;
  const grossRev       = rawStats?.gross_revenue ?? 0;
  const customerFees   = rawStats?.customer_fees ?? 0;
  const vendorFees     = rawStats?.vendor_fees ?? 0;
  const netProfit      = rawStats?.net_profit ?? 0;
  const avgOrder       = totalOrders > 0 ? (grossRev / totalOrders).toFixed(2) : "0.00";

  const filteredOrders = allOrders
    .filter((o) => {
      const q = ordersSearch.toLowerCase();
      const customerName = (o.customer?.name || o.customer?.user?.name || o.customer?.full_name || o.customer_name || "").toLowerCase();
      return !q || String(o.id).includes(q) || customerName.includes(q) ||
        (o.status || o.order_status || "").toLowerCase().includes(q) ||
        (o.delivery_type || "").toLowerCase().includes(q) ||
        String(o.total_amount || o.total || "").includes(q);
    })
    .sort((a, b) => {
      if (ordersSortField === "created_at") {
        const ad = new Date(a.created_at || a.order_date || 0);
        const bd = new Date(b.created_at || b.order_date || 0);
        return ordersSortDir === "asc" ? ad - bd : bd - ad;
      }
      const av = a[ordersSortField] ?? "";
      const bv = b[ordersSortField] ?? "";
      return ordersSortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const totalPages  = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const pagedOrders = filteredOrders.slice((ordersPage - 1) * ORDERS_PER_PAGE, ordersPage * ORDERS_PER_PAGE);

  const handleSort = (field) => {
    if (ordersSortField === field) setOrdersSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setOrdersSortField(field); setOrdersSortDir("asc"); }
  };

  const SortIcon = ({ field }) =>
    ordersSortField === field ? (ordersSortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  const fmtDate = (v) => {
    if (!v) return "—";
    try { return new Date(v).toLocaleDateString("en-EG", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return v; }
  };

  const fmtCurrency = (v) => {
    try { return Number(v).toLocaleString("en-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch { return v; }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-auth-error">
        <AlertCircle size={40} />
        <p>Please <a href="/login">log in</a> to access the admin panel.</p>
      </div>
    );
  }

  // ✅ HODYA: Support nav - اضفنا reviews tab هنا
  const navItems = isSupport(role) 
  ? [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { id: "orders", icon: ShoppingBag, label: "Latest Orders", badge: (() => {
        const yesterday = new Date(Date.now() - 86400000);
        const recent = allOrders.filter(o => new Date(o.created_at || o.order_date) > yesterday).length;
        return recent > 0 ? recent : null;
      })() },
      { id: "activity", icon: Activity, label: "Activity" },
      { id: "reviews", icon: Star, label: "Reviews", badge: null }, // ✅ HODYA: Support يشوف reviews
    ]
  : [
      { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { id: "offers", icon: Package, label: "All Offers" },
      { id: "orders", icon: ShoppingBag, label: "Latest Orders", badge: (() => {
        const yesterday = new Date(Date.now() - 86400000);
        const recent = allOrders.filter(o => new Date(o.created_at || o.order_date) > yesterday).length;
        return recent > 0 ? recent : null;
      })() },
      { id: "activity", icon: Activity, label: "Activity" },
      { id: "sustainability", icon: Leaf, label: "Sustainability Impact" },
    ];

  const managementItems = canManage(role) ? [
    { id: "users",      icon: Users,         label: "Users",      path: "/admin/users" },
    { id: "businesses", icon: ClipboardList, label: "Businesses", path: "/admin/businesses" },
    { id: "reviews",    icon: Star,          label: "Reviews",    path: "/admin/review-moderation" },
  ] : isSupport(role) ? [
    // ✅ SHELLE: Support ما عنده management items - بيشوف reviews من التاب العادي
  ] : [];

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="biz-logo">
          <img src="/images/zerowaste-logo.png" alt="ZeroWaste Logo" className="biz-logo-img" />
          {sidebarOpen && (
            <span className="biz-logo__role">
              {ROLE_LABEL[role] ?? role}
            </span>
          )}
        </div>

        <button className="sidebar-toggle" onClick={() => setSidebarOpen((v) => !v)} type="button">
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <nav className="sidebar-nav">
          {sidebarOpen && <p className="sidebar-nav-section-title">MENU</p>}
          {navItems.map((item) => (
            <NavItem key={item.id} icon={item.icon} label={sidebarOpen ? item.label : ""}
              active={activeSection === item.id} badge={item.badge} onClick={() => setActiveSection(item.id)} />
          ))}

          {sidebarOpen && managementItems.length > 0 && <p className="sidebar-nav-section-title">MANAGEMENT</p>}
          {managementItems.map((item) => (
            <NavItem key={item.id} icon={item.icon} label={sidebarOpen ? item.label : ""}
              active={activeSection === item.id} onClick={() => navigate(item.path)} />
          ))}

          <div className="sidebar-nav-divider" />
          <NavItem icon={Bell} label={sidebarOpen ? "Notifications" : ""}
            active={activeSection === "notifications"} badge={notifUnread > 0 ? notifUnread : null}
            onClick={() => setActiveSection("notifications")} />

          <div className="sidebar-lang-wrapper">
            <button type="button" className="sidebar-nav-item" onClick={() => setLangDropdownOpen((v) => !v)}>
              <Languages size={18} />
              {sidebarOpen && (<><span>Language</span><ChevronDown size={14} style={{ marginLeft: "auto" }} /></>)}
            </button>
            {langDropdownOpen && (
              <div className="lang-dropdown">
                <button type="button" className={`lang-option ${i18n.language === "en" ? "active" : ""}`}
                  onClick={() => { i18n.changeLanguage("en"); setLangDropdownOpen(false); }}>🇬🇧 English</button>
                <button type="button" className={`lang-option ${i18n.language === "ar" ? "active" : ""}`}
                  onClick={() => { i18n.changeLanguage("ar"); setLangDropdownOpen(false); }}>🇪🇬 العربية</button>
              </div>
            )}
          </div>
        </nav>

        {sidebarOpen && (
          <div className="sidebar-profile" onClick={() => navigate("/admin/profile")} style={{ cursor: "pointer" }}>
            <div className="sidebar-profile__avatar">{(ROLE_LABEL[role] ?? "A")[0]}</div>
            <div className="sidebar-profile__info">
              <p className="sidebar-profile__name">Admin</p>
              <p className="sidebar-profile__role">{ROLE_LABEL[role] ?? role}</p>
            </div>
          </div>
        )}
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <h1 className="admin-topbar__title">
              {activeSection === "dashboard"      && "Dashboard"}
              {activeSection === "offers"         && "All Offers"}
              {activeSection === "orders"         && "Latest Orders"}
              {activeSection === "activity"       && "Recent Activity"}
              {activeSection === "sustainability" && "Sustainability Impact"}
              {activeSection === "notifications"  && "Notifications"}
              {activeSection === "reviews"        && "Review Moderation"}
            </h1>
            <div className="admin-topbar__breadcrumb">
              <span>Admin</span>
              <ChevronRight size={12} />
              <span style={{ color: "#696cff" }}>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</span>
            </div>
          </div>
        </header>

        <div className="admin-page-content">

          {activeSection === "dashboard" && !isSupport(role) && (
            <>
              {statsLoading ? (
                <div className="loading-state"><Loader2 size={20} className="spin" /> Loading stats…</div>
              ) : (
                <div className="stats-grid">
                  <StatCard title="Total Customers" value={Number(totalCustomers).toLocaleString()} icon={Users} color="#696cff" />
                  <StatCard title="Total Vendors" value={Number(totalVendors).toLocaleString()} icon={ShoppingBag} color="#28c76f" />
                  <StatCard title="Total Orders" value={Number(totalOrders).toLocaleString()} icon={Package} color="#ff9f43" trend={`Avg EGP ${avgOrder}`} />
                  <StatCard title="Active Offers" value={Number(activeOffers).toLocaleString()} icon={Star} color="#ff4d49" />
                  {/* ✅ SHELLE: Support ما يشوف financial cards */}
                  {canManage(role) && !isSupport(role) && (
                    <>
                      <StatCard title="Gross Revenue" value={`EGP ${fmtCurrency(grossRev)}`} icon={DollarSign} color="#03c3ec" />
                      <StatCard title="Platform Profit (Net)" value={`EGP ${fmtCurrency(netProfit)}`} icon={TrendingUp} color="#28c76f" />
                      <StatCard title="Customer Fees (6%)" value={`EGP ${fmtCurrency(customerFees)}`} icon={Users} color="#ff6b6b" />
                      <StatCard title="Vendor Fees (12%)" value={`EGP ${fmtCurrency(vendorFees)}`} icon={ShoppingBag} color="#ffa500" />
                    </>
                  )}
                </div>
              )}

              <div className="charts-row">
                <div className="chart-card chart-card--wide">
                  <div className="chart-card__header">
                    <div><h3 className="chart-card__title">Weekly Performance</h3><p className="chart-card__sub">Orders & Revenue — last 7 days</p></div>
                    <BarChart2 size={18} color="#696cff" />
                  </div>
                  {ordersLoading ? (
                    <div className="loading-state"><Loader2 size={16} className="spin" /> Loading chart…</div>
                  ) : weeklyData.length === 0 || weeklyData.every(d => d.orders === 0) ? (
                    <div className="empty-state"><Package size={32} color="#cbd5e1" /><p>No order data available for the last 7 days.</p></div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#696cff" stopOpacity={0.2} /><stop offset="95%" stopColor="#696cff" stopOpacity={0} />
                          </linearGradient>
                          {canManage(role) && !isSupport(role) && (
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#28c76f" stopOpacity={0.2} /><stop offset="95%" stopColor="#28c76f" stopOpacity={0} />
                            </linearGradient>
                          )}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8592a3" }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#8592a3" }} axisLine={false} tickLine={false} />
                        {canManage(role) && !isSupport(role) && <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#8592a3" }} axisLine={false} tickLine={false} />}
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e7e7ff" }} labelStyle={{ color: "#566a7f", fontWeight: 600 }} />
                        <Legend iconType="circle" iconSize={8} />
                        <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#696cff" strokeWidth={2} fill="url(#ordersGrad)" dot={{ r: 4, fill: "#696cff" }} name="Orders" />
                        {canManage(role) && !isSupport(role) && <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#28c76f" strokeWidth={2} fill="url(#revenueGrad)" dot={{ r: 4, fill: "#28c76f" }} name="Revenue (EGP)" />}
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="chart-card">
                  <div className="chart-card__header"><div><h3 className="chart-card__title">Distribution</h3><p className="chart-card__sub">Platform overview</p></div></div>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e7e7ff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-legend">
                    {pieData.map((entry, i) => (
                      <div key={i} className="pie-legend-item">
                        <span className="pie-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="pie-legend-label">{entry.name}</span>
                        <span className="pie-legend-value">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ✅ SHELLE: Support ما يشوف earnings chart */}
              {canManage(role) && !isSupport(role) && (
                <div className="chart-card" style={{ marginBottom: 24 }}>
                  <div className="chart-card__header">
                    <div><h3 className="chart-card__title">Monthly Earnings</h3><p className="chart-card__sub">Net sales — last 12 months</p></div>
                    <TrendingUp size={18} color="#03c3ec" />
                  </div>
                  {earningsLoading ? (
                    <div className="loading-state"><Loader2 size={16} className="spin" /> Loading earnings…</div>
                  ) : earningsData.length === 0 ? (
                    <div className="empty-state"><DollarSign size={32} color="#cbd5e1" /><p>No earnings data available.</p></div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={earningsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8592a3" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#8592a3" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e7e7ff" }} labelStyle={{ color: "#566a7f", fontWeight: 600 }} formatter={(value) => [`EGP ${fmtCurrency(value)}`, "Net Sales"]} />
                        <Legend iconType="circle" iconSize={8} />
                        <Bar dataKey="earnings" fill="#03c3ec" name="Net Sales (EGP)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}

              {!isSupport(role) && (
                <div className="quick-actions">
                  <h3 className="section-heading">Quick Actions</h3>
                  <div className="quick-actions-grid">
                    <button type="button" className="action-card" onClick={() => navigate("/admin/users")}>
                      <div className="action-card__icon" style={{ background: "#e7e7ff" }}><Users size={20} color="#696cff" /></div>
                      <div><p className="action-card__title">User Management</p><p className="action-card__sub">Manage customers & vendors</p></div>
                      <ChevronRight size={16} color="#8592a3" className="action-card__arrow" />
                    </button>
                    <button type="button" className="action-card" onClick={() => navigate("/admin/review-moderation")}>
                      <div className="action-card__icon" style={{ background: "#ffecd9" }}><CircleAlert size={20} color="#ff9f43" /></div>
                      <div><p className="action-card__title">Review Moderation</p><p className="action-card__sub">Manage user reviews</p></div>
                      <ChevronRight size={16} color="#8592a3" className="action-card__arrow" />
                    </button>
                    <button type="button" className="action-card" onClick={() => navigate("/admin/businesses")}>
                      <div className="action-card__icon" style={{ background: "#e8f8ee" }}><ClipboardList size={20} color="#28c76f" /></div>
                      <div><p className="action-card__title">Business Management</p><p className="action-card__sub">Approve & manage vendors</p></div>
                      <ChevronRight size={16} color="#8592a3" className="action-card__arrow" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeSection === "dashboard" && isSupport(role) && (
            <div className="orders-card">
              <div className="orders-card__header">
                <div className="orders-card__title-row">
                  <LayoutDashboard size={20} color="#696cff" />
                  <h3>Dashboard Overview</h3>
                </div>
              </div>
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#8592a3" }}>
                <p style={{ fontSize: "0.95rem", marginBottom: "20px" }}>Welcome to Support Dashboard</p>
                <p style={{ fontSize: "0.85rem" }}>Navigate using the menu to view Orders, Activity, and Reviews.</p>
              </div>
            </div>
          )}

          {activeSection === "offers" && <AllOffersSection token={token} />}

          {activeSection === "sustainability" && !isSupport(role) && (
            <div className="sustainability-section">
              <div className="sustainability-section__header">
                <div>
                  <h2 className="sustainability-section__title">🌍 Sustainability Impact</h2>
                  <p className="sustainability-section__subtitle">Environmental impact metrics across the platform</p>
                </div>
                <button type="button" className="refresh-btn" onClick={() => window.location.reload()} title="Refresh"><RefreshCw size={16} /></button>
              </div>
              {sustainabilityLoading ? (
                <div className="loading-state"><Loader2 size={20} className="spin" /> Loading sustainability data…</div>
              ) : sustainabilityError ? (
                <div className="error-state"><AlertCircle size={16} /> Failed to load: {sustainabilityError}</div>
              ) : sustainabilityMetrics ? (
                <>
                  <div className="sustainability-metrics-grid">
                    <SustainabilityCard title="Meals Saved" value={Number(sustainabilityMetrics.meals_saved).toLocaleString()} subtitle="Food items rescued from waste" icon={Package} color="#28c76f" />
                    <SustainabilityCard title="CO₂ Prevented" value={`${sustainabilityMetrics.co2_prevented_kg.toFixed(2)} kg`} subtitle="Carbon emissions avoided" icon={Leaf} color="#10b981" />
                    <SustainabilityCard title="Recovered Revenue" value={`EGP ${Number(sustainabilityMetrics.recovered_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} subtitle="From rescued food items" icon={DollarSign} color="#3b82f6" />
                    <SustainabilityCard title="Consumer Savings" value={`EGP ${Number(sustainabilityMetrics.consumer_savings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} subtitle="Amount saved by customers" icon={TrendingUp} color="#f59e0b" />
                  </div>
                  {sustainabilityChartData && sustainabilityChartData.length > 0 && (
                    <div className="chart-card sustainability-chart">
                      <div className="chart-card__header">
                        <div><h3 className="chart-card__title">Monthly Sustainability Trends</h3><p className="chart-card__sub">Meals saved & CO₂ prevented — last 12 months</p></div>
                        <BarChart2 size={18} color="#28c76f" />
                      </div>
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={sustainabilityChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8592a3" }} />
                          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#8592a3" }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#8592a3" }} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e7e7ff" }} labelStyle={{ color: "#566a7f", fontWeight: 600 }} />
                          <Legend iconType="circle" />
                          <Line yAxisId="left" type="monotone" dataKey="meals_saved" stroke="#28c76f" dot={{ fill: "#28c76f", r: 4 }} name="Meals Saved" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="co2_prevented" stroke="#10b981" dot={{ fill: "#10b981", r: 4 }} name="CO₂ Prevented (kg)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state"><Package size={40} color="#cbd5e1" /><p>No sustainability data available.</p></div>
              )}
            </div>
          )}

          {activeSection === "orders" && (
            <div className="orders-card">
              <div className="orders-card__header">
                <div className="orders-card__title-row">
                  <ShoppingBag size={20} color="#696cff" />
                  <h3>Latest Orders</h3>
                  <span className="orders-count-badge">{filteredOrders.length}</span>
                </div>
                {/* ✅ HODYA: Support info message */}
                {isSupport(role) && (
                  <div style={{ paddingLeft: "10px", fontSize: "0.85rem", color: "#4f46e5", fontWeight: 500 }}>
                    ℹ️ Support: Viewing customer orders
                  </div>
                )}
                <div className="orders-card__controls">
                  <div className="search-box">
                    <Search size={14} color="#8592a3" />
                    <input type="text" placeholder="Search ID, customer, status…" value={ordersSearch}
                      onChange={(e) => { setOrdersSearch(e.target.value); setOrdersPage(1); }} />
                  </div>
                  <button type="button" className="refresh-btn" onClick={() => window.location.reload()} title="Refresh"><RefreshCw size={14} /></button>
                </div>
              </div>
              {ordersLoading ? (
                <div className="loading-state"><Loader2 size={18} className="spin" /> Loading orders…</div>
              ) : ordersError ? (
                <div className="error-state"><AlertCircle size={16} /> Failed to load orders: {ordersError}</div>
              ) : allOrders.length === 0 ? (
                <div className="empty-state"><ShoppingBag size={40} color="#cbd5e1" /><p>No orders found.</p></div>
              ) : (
                <>
                  <div className="table-wrapper">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          {[
                            { label: "#", field: "id" },
                            { label: "Customer", field: "customer_name" },
                            { label: "Total (EGP)", field: "total_amount" },
                            { label: "Delivery Type", field: "delivery_type" },
                            { label: "Status", field: "status" },
                            { label: "Date", field: "created_at" },
                          ].map(({ label, field }) => (
                            <th key={field} onClick={() => handleSort(field)}>{label} <SortIcon field={field} /></th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pagedOrders.map((order, idx) => (
                          <tr key={`order-${order.id ?? idx}-${idx}`}>
                            <td className="order-id">#{order.id}</td>
                            <td className="order-customer">
                              <div className="customer-avatar">
                                {(order.customer?.name || order.customer?.full_name || order.customer_name || "C")[0].toUpperCase()}
                              </div>
                              {order.customer?.name || order.customer?.user?.name || order.customer_name || "—"}
                            </td>
                            <td className="order-amount">{fmtCurrency(order.total_amount || order.total || 0)}</td>
                            <td className="order-delivery">{order.delivery_type || "—"}</td>
                            <td><StatusBadge status={order.order_status || order.status} /></td>
                            <td className="order-date">{fmtDate(order.created_at || order.order_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="pagination">
                      <span className="pagination__info">
                        Showing {(ordersPage - 1) * ORDERS_PER_PAGE + 1}–{Math.min(ordersPage * ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
                      </span>
                      <div className="pagination__controls">
                        <button onClick={() => setOrdersPage((p) => Math.max(1, p - 1))} disabled={ordersPage === 1} className="pagination__btn">‹ Prev</button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pg) => (
                          <button key={pg} onClick={() => setOrdersPage(pg)} className={`pagination__btn ${pg === ordersPage ? "active" : ""}`}>{pg}</button>
                        ))}
                        {totalPages > 5 && <span className="pagination__ellipsis">…</span>}
                        <button onClick={() => setOrdersPage((p) => Math.min(totalPages, p + 1))} disabled={ordersPage === totalPages} className="pagination__btn">Next ›</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeSection === "activity" && (
            <div className="orders-card">
              <div className="orders-card__header">
                <div className="orders-card__title-row"><Activity size={20} color="#696cff" /><h3>Recent Activity</h3></div>
              </div>
              {activityLoading ? (
                <div className="loading-state"><Loader2 size={18} className="spin" /> Loading activity…</div>
              ) : activities.length === 0 ? (
                <div className="empty-state"><Activity size={36} color="#cbd5e1" /><p>No recent activity found.</p></div>
              ) : (
                <div className="activity-list">
                  {activities.map((act) => (
                    <div key={act.uid} className="activity-item">
                      <div className="activity-item__dot" />
                      <div className="activity-item__body">
                        <p className="activity-item__desc">{act.description}</p>
                        <span className="activity-item__time">{fmtDate(act.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ✅ HODYA: Reviews section - يشتغل للـ Support و للمنagement */}
          {activeSection === "reviews" && (
            <div className="orders-card">
              <div className="orders-card__header">
                <div className="orders-card__title-row">
                  <Star size={20} color="#696cff" /><h3>Review Moderation</h3>
                </div>
              </div>
              <div style={{ padding: "20px", textAlign: "center", color: "#8592a3" }}>
                <p>Navigate to the full Review Moderation page for detailed management.</p>
                <button type="button" style={{ marginTop: "10px", padding: "8px 16px", background: "#696cff", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem" }}
                  onClick={() => navigate("/admin/review-moderation")}>
                  Open Reviews
                </button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="orders-card">
              <div className="orders-card__header">
                <div className="orders-card__title-row">
                  <Bell size={20} color="#696cff" /><h3>Notifications</h3>
                  {notifUnread > 0 && <span className="orders-count-badge">{notifUnread} unread</span>}
                </div>
              </div>
              {notifLoading ? (
                <div className="loading-state"><Loader2 size={18} className="spin" /> Loading notifications…</div>
              ) : notifications.length === 0 ? (
                <div className="empty-state"><Bell size={36} color="#cbd5e1" /><p>No notifications found.</p></div>
              ) : (
                <div className="activity-list">
                  {notifications.map((n, idx) => (
                    <div key={n.id ?? idx} className="activity-item" style={{ opacity: n.read_at || n.is_read ? 0.6 : 1 }}>
                      <div className="activity-item__dot" style={{ background: n.read_at || n.is_read ? "#cbd5e1" : "#696cff" }} />
                      <div className="activity-item__body">
                        <p className="activity-item__desc">{n.message ?? n.data?.message ?? "—"}</p>
                        <span className="activity-item__time">{fmtDate(n.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .spin { animation: spin 1s linear infinite }
        .sidebar-lang-wrapper { position: relative; z-index: 1000; }
        .lang-dropdown { display: flex; flex-direction: column; background: #fff; border: 1px solid #e7e7ff; border-radius: 8px; margin: 4px 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(105,108,255,0.1); position: absolute; top: 100%; left: 0; right: 0; z-index: 1001; }
        .lang-option { background: none; border: none; padding: 10px 16px; text-align: left; cursor: pointer; font-size: 13px; color: #566a7f; transition: background 0.15s; }
        .lang-option:hover { background: #f5f5ff; }
        .lang-option.active { color: #696cff; font-weight: 600; background: #f0f0ff; }
      `}</style>
    </div>
  );
};

export default Admin;

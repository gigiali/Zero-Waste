import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, User, Globe, GitBranch, Package, ShoppingCart,
  ChevronRight, LayoutDashboard,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { NotificationsPanel } from "../components/NotificationsDropdown";
import { useNotifications } from "../Context/NotificationsContext";
import "./Business.css";

const salesData = [
  { day: "Mon", sales: 400, orders: 24 },
  { day: "Tue", sales: 520, orders: 18 },
  { day: "Wed", sales: 680, orders: 29 },
  { day: "Thu", sales: 450, orders: 20 },
  { day: "Fri", sales: 890, orders: 35 },
  { day: "Sat", sales: 720, orders: 28 },
  { day: "Sun", sales: 540, orders: 22 },
];

const EMPTY_FORM = {
  title: "", description: "", originalPrice: "",
  discountPrice: "", quantity: "", expiresIn: "", image: "",
};

export default function Business() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [location, setLocation]                   = useState("Maadi, Cairo");
  const [language, setLanguage]                   = useState("en");
  const [showBranches, setShowBranches]           = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedBranch, setSelectedBranch]       = useState("Maadi Branch");
  const [drawerOpen, setDrawerOpen]               = useState(false);
  const [editingId, setEditingId]                 = useState(null);
  const [showAllOffers, setShowAllOffers]         = useState(false);
  const [showAllOrders, setShowAllOrders]         = useState(false);
  const [form, setForm]                           = useState(EMPTY_FORM);

  const [offers, setOffers] = useState([
    { id: 1, title: "Fresh Bread & Pastries Box", description: "Assorted fresh bread and pastries from today", originalPrice: 15.99, discountPrice: 5.99, quantity: 8, expiresIn: "2h 30m", status: "Active", branch: "Maadi Branch", image: "" },
    { id: 2, title: "Special Baguette Pack", description: "4 fresh baguettes ready for takeaway", originalPrice: 8.5, discountPrice: 3.49, quantity: 12, expiresIn: "2h 30m", status: "Active", branch: "Maadi Branch", image: "" },
    { id: 3, title: "Mini Croissant Set", description: "A mix of sweet and savory croissants", originalPrice: 14.0, discountPrice: 4.99, quantity: 0, expiresIn: "1h 15m", status: "Expired", branch: "Maadi Branch", image: "" },
    { id: 4, title: "Croissant Bundle", description: "6 butter croissants", originalPrice: 12.0, discountPrice: 4.99, quantity: 0, expiresIn: "3h", status: "Expired", branch: "Nasr City Branch", image: "" },
    { id: 5, title: "Blueberry Muffin Box", description: "Fresh muffins from today", originalPrice: 10.0, discountPrice: 4.5, quantity: 6, expiresIn: "2h", status: "Active", branch: "Nasr City Branch", image: "" },
  ]);

  const [orders] = useState([
    { id: "ORD123", offer: "Fresh Bread Bundle",   customer: "John Doe",     amount: "EGP 5.99", status: "Completed", branch: "Maadi Branch" },
    { id: "ORD124", offer: "Fresh Bread Bundle",   customer: "Sara Ali",     amount: "EGP 7.99", status: "Pending",   branch: "Maadi Branch" },
    { id: "ORD127", offer: "Pastry Sampler",       customer: "Ahmed Hassan", amount: "EGP 6.50", status: "Completed", branch: "Maadi Branch" },
    { id: "ORD125", offer: "Fresh Bread Bundle",   customer: "John Doe",     amount: "EGP 5.99", status: "Completed", branch: "Nasr City Branch" },
    { id: "ORD126", offer: "Blueberry Muffin Box", customer: "Jane Smith",   amount: "EGP 4.50", status: "Completed", branch: "Nasr City Branch" },
  ]);

  const filteredOffers = offers.filter(o => o.branch === selectedBranch);
  const filteredOrders = orders.filter(o => o.branch === selectedBranch);

  const handleLocationChange = (val) => {
    setLocation(val);
    setSelectedBranch(val === "Maadi, Cairo" ? "Maadi Branch" : "Nasr City Branch");
    setShowAllOffers(false);
    setShowAllOrders(false);
  };

  const handleBranchChange = (name) => {
    setSelectedBranch(name);
    setLocation(name === "Maadi Branch" ? "Maadi, Cairo" : "Nasr City, Cairo");
  };

  const openAdd  = () => { setEditingId(null); setForm(EMPTY_FORM); setDrawerOpen(true); };
  const openEdit = (offer) => {
    setEditingId(offer.id);
    setForm({
      title: offer.title, description: offer.description,
      originalPrice: String(offer.originalPrice), discountPrice: String(offer.discountPrice),
      quantity: String(offer.quantity), expiresIn: offer.expiresIn.replace(/h.*/, ""),
      image: offer.image || "",
    });
    setDrawerOpen(true);
  };
  const closeDrawer  = () => { setDrawerOpen(false); setEditingId(null); setForm(EMPTY_FORM); };
  const handleChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const handleImage  = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.description.trim()) { alert("Please fill in title and description"); return; }
    const data = {
      title: form.title, description: form.description,
      originalPrice: parseFloat(form.originalPrice) || 0,
      discountPrice: parseFloat(form.discountPrice) || 0,
      quantity: parseInt(form.quantity) || 0,
      expiresIn: form.expiresIn + "h", branch: selectedBranch, image: form.image, status: "Active",
    };
    if (editingId) { setOffers(prev => prev.map(o => o.id === editingId ? { ...o, ...data } : o)); }
    else           { setOffers(prev => [{ id: Date.now(), ...data }, ...prev]); }
    closeDrawer();
  };

  const handleDelete = (id) => setOffers(prev => prev.filter(o => o.id !== id));
  const scrollTo     = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Sidebar nav items config
  const navItems = [
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      badge: unreadCount > 0 ? unreadCount : null,
      onClick: () => setShowNotifications(true),
    },
    {
      id: "language",
      icon: Globe,
      label: language === "en" ? "English" : "العربية",
      onClick: () => setLanguage(l => l === "en" ? "ar" : "en"),
    },
    {
      id: "profile",
      icon: User,
      label: "My Profile",
      onClick: () => navigate("/profile"),
    },
    {
      id: "branches",
      icon: GitBranch,
      label: "Branches",
      expandable: true,
      expanded: showBranches,
      onToggle: () => setShowBranches(b => !b),
      children: ["Maadi Branch", "Nasr City Branch"],
    },
    {
      id: "offers",
      icon: Package,
      label: "My Offers",
      onClick: () => scrollTo("offers-section"),
    },
    {
      id: "orders",
      icon: ShoppingCart,
      label: "Orders",
      onClick: () => scrollTo("orders-section"),
    },
  ];

  return (
    <div className="biz-root">

      {/* ── SIDEBAR ── */}
      <aside className="biz-sidebar">

        {/* Logo */}
        <div className="biz-logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
          <img src="/images/e.png" alt="ZeroWaste" className="biz-logo-img" />
          <span className="biz-logo-text">ZeroWaste</span>
        </div>

        {/* Location selector */}
        <div className="biz-nav-group">
          <p className="biz-nav-label">LOCATION</p>
          <select className="biz-select" value={location} onChange={e => handleLocationChange(e.target.value)}>
            <option>Maadi, Cairo</option>
            <option>Nasr City, Cairo</option>
          </select>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "4px 16px 8px" }} />

        {/* Nav label */}
        <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", padding: "0 20px", margin: "0 0 6px" }}>
          NAVIGATION
        </p>

        {/* Nav items */}
        <nav className="biz-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            if (item.expandable) {
              return (
                <div key={item.id} className="biz-nav-expandable">
                  <button
                    className="biz-nav-btn"
                    onClick={item.onToggle}
                    style={{ justifyContent: "space-between" }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="biz-nav-icon-wrap"><Icon size={16} /></span>
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight
                      size={14}
                      style={{
                        transition: "transform 0.2s",
                        transform: item.expanded ? "rotate(90deg)" : "rotate(0deg)",
                        opacity: 0.6,
                      }}
                    />
                  </button>
                  {item.expanded && (
                    <div className="biz-branches">
                      {item.children.map(b => (
                        <button
                          key={b}
                          className={`biz-branch-btn ${selectedBranch === b ? "active" : ""}`}
                          onClick={() => handleBranchChange(b)}
                        >{b}</button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                className="biz-nav-btn"
                onClick={item.onClick}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                  <span className="biz-nav-icon-wrap"><Icon size={16} /></span>
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span className="biz-notif-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom profile card */}
        <div
          className="biz-sidebar-profile"
          onClick={() => navigate("/profile")}
          title="Go to My Profile"
        >
          <div className="biz-sidebar-avatar">
            <User size={16} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Artisan Bakery
            </p>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Business Account
            </p>
          </div>
          <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
        </div>
      </aside>

      {/* ── Notifications slide-in panel ── */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* ── MAIN ── */}
      <main className="biz-main">

        <div className="biz-welcome">
          <div>
            <h1 className="biz-welcome-title">Welcome back, Artisan Bakery! 👋</h1>
            <p className="biz-welcome-sub">Manage your surplus food offers and reduce waste</p>
          </div>
          <div className="biz-impact">
            <p className="biz-impact-label">Your impact this month</p>
            <p className="biz-impact-value">142 kg food saved 🌱</p>
          </div>
        </div>

        <div className="biz-kpis">
          {[
            { label: "Active Offers",   value: filteredOffers.filter(o => o.status === "Active").length, icon: "📦" },
            { label: "Total Orders",    value: filteredOrders.length, icon: "🛒" },
            { label: "Today's Revenue", value: "EGP 287.50",          icon: "💰" },
          ].map(k => (
            <div key={k.label} className="biz-kpi-card">
              <p className="biz-kpi-label">{k.label}</p>
              <p className="biz-kpi-value">{k.value}</p>
              <span className="biz-kpi-icon">{k.icon}</span>
            </div>
          ))}
        </div>

        <div className="biz-charts">
          <div className="biz-chart-card">
            <h3 className="biz-chart-title">Sales Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip /><Legend />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Sales (EGP)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="biz-chart-card">
            <h3 className="biz-chart-title">Orders Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip /><Legend />
                <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Offers */}
        <div className="biz-section" id="offers-section">
          <div className="biz-section-header">
            <h2 className="biz-section-title">My Offers</h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {filteredOffers.length > 2 && (
                <button className="biz-link-btn" onClick={() => setShowAllOffers(v => !v)}>
                  {showAllOffers ? "Show less" : `View all ${filteredOffers.length} →`}
                </button>
              )}
              <button className="biz-add-btn" onClick={openAdd}>+ Add Offer</button>
            </div>
          </div>

          {drawerOpen && (
            <div className="biz-drawer">
              <div className="biz-drawer-header">
                <h3 className="biz-drawer-title">{editingId ? "✏️ Edit Offer" : "✨ New Offer"}</h3>
                <button className="biz-drawer-close" onClick={closeDrawer}>✕</button>
              </div>
              {form.image && <img src={form.image} alt="preview" className="biz-img-preview" />}
              <div className="biz-drawer-body">
                <div className="biz-field"><label>Title *</label><input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Fresh Bread Bundle" /></div>
                <div className="biz-field"><label>Description *</label><textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your offer..." rows={3} /></div>
                <div className="biz-field"><label>Offer Photo</label><input type="file" accept="image/*" onChange={handleImage} /></div>
                <div className="biz-field-row">
                  <div className="biz-field"><label>Original Price</label><div className="biz-prefix-input"><span>EGP</span><input name="originalPrice" type="number" step="0.01" value={form.originalPrice} onChange={handleChange} placeholder="0.00" /></div></div>
                  <div className="biz-field"><label>Discount Price</label><div className="biz-prefix-input"><span>EGP</span><input name="discountPrice" type="number" step="0.01" value={form.discountPrice} onChange={handleChange} placeholder="0.00" /></div></div>
                </div>
                <div className="biz-field-row">
                  <div className="biz-field"><label>Quantity</label><input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="0" /></div>
                  <div className="biz-field"><label>Expires In (hours)</label><input name="expiresIn" type="number" value={form.expiresIn} onChange={handleChange} placeholder="2" /></div>
                </div>
              </div>
              <div className="biz-drawer-footer">
                <button className="biz-btn-cancel" onClick={closeDrawer}>Cancel</button>
                <button className="biz-btn-save" onClick={handleSave}>{editingId ? "Save Changes" : "Create Offer"}</button>
              </div>
            </div>
          )}

          <div className="biz-offers-list">
            {filteredOffers.length === 0 && <p className="biz-empty">No offers for this branch yet. Add your first one!</p>}
            {(showAllOffers ? filteredOffers : filteredOffers.slice(0, 2)).map(offer => (
              <div key={offer.id} className="biz-offer-row">
                <div className="biz-offer-info">
                  <p className="biz-offer-title">{offer.title}</p>
                  <p className="biz-offer-desc">{offer.description}</p>
                </div>
                <div className="biz-offer-meta">
                  <span className="biz-price">EGP {offer.discountPrice}</span>
                  <span className={`biz-badge ${offer.status === "Active" ? "active" : "expired"}`}>{offer.status}</span>
                </div>
                <div className="biz-offer-actions">
                  <button className="biz-icon-btn edit"   onClick={() => openEdit(offer)}        title="Edit">✏️</button>
                  <button className="biz-icon-btn delete" onClick={() => handleDelete(offer.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
            {filteredOffers.length > 2 && !showAllOffers && <p className="biz-more">and {filteredOffers.length - 2} more offer(s)…</p>}
          </div>
        </div>

        {/* Orders */}
        <div className="biz-section" id="orders-section">
          <div className="biz-section-header">
            <h2 className="biz-section-title">Recent Orders</h2>
            {filteredOrders.length > 2 && (
              <button className="biz-link-btn" onClick={() => setShowAllOrders(v => !v)}>
                {showAllOrders ? "Show less" : `View all ${filteredOrders.length} →`}
              </button>
            )}
          </div>
          <div className="biz-table-wrap">
            <table className="biz-table">
              <thead><tr><th>ID</th><th>Offer</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {(showAllOrders ? filteredOrders : filteredOrders.slice(0, 2)).map(o => (
                  <tr key={o.id}>
                    <td className="biz-td-id">{o.id}</td>
                    <td>{o.offer}</td>
                    <td>{o.customer}</td>
                    <td className="biz-td-amount">{o.amount}</td>
                    <td><span className={`biz-badge ${o.status === "Completed" ? "active" : "pending"}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length > 2 && !showAllOrders && <p className="biz-more">and {filteredOrders.length - 2} more order(s)…</p>}
        </div>

      </main>
    </div>
  );
}
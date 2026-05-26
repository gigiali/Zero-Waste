import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Bell, User, Globe, GitBranch, Package, ShoppingCart,
  ChevronRight, LayoutDashboard,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { NotificationsPanel } from "../Components/Notificationsdropdown";
import { useNotifications } from "../Context/Notificationscontext";
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
  discountPrice: "", quantityAvailable: "", expiresIn: "", image: null, status: "active",
};

export default function Business() {
  const { t } = useTranslation();
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
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [submitError, setSubmitError]             = useState("");
  const [branches, setBranches]                   = useState([]);
  const [businessName, setBusinessName]           = useState("");

  // Check if vendor has branches, redirect to Add Branch if not
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/signin");
          return;
        }

        // Fetch vendor profile
        const profileResponse = await fetch("/api/vendor/profile", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.vendor?.business_name) {
            setBusinessName(profileData.vendor.business_name);
          }
        }

        // Fetch branches
        const branchesResponse = await fetch("/api/vendor/branches", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const branchesData = await branchesResponse.json();

        if (branchesResponse.ok && branchesData.branches) {
          setBranches(branchesData.branches);

          // If no branches, redirect to Add Branch
          if (branchesData.branches.length === 0) {
            navigate("/add-branch");
            return;
          }

          // Set first branch as selected
          setSelectedBranch(branchesData.branches[0].name);
          setLocation(branchesData.branches[0].location || branchesData.branches[0].name);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [navigate]);

  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Fetch vendor offers and orders
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        // Fetch vendor offers
        const offersResponse = await fetch("/api/vendor/offers", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (offersResponse.ok) {
          const offersData = await offersResponse.json();
          if (offersData.offers) {
            const transformedOffers = offersData.offers.map((offer) => ({
              id: offer.id,
              title: offer.title,
              description: offer.description,
              originalPrice: offer.original_price || 0,
              discountPrice: offer.discount_price || 0,
              quantity: offer.quantity_available || 0,
              expiresIn: offer.expiration_time || "N/A",
              status: offer.status || "Active",
              branch: offer.branch?.name || "Unknown",
              image: offer.image || "",
            }));
            setOffers(transformedOffers);
          }
        }

        // Fetch vendor orders
        const ordersResponse = await fetch("/api/vendor/orders", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          if (ordersData.orders) {
            const transformedOrders = ordersData.orders.map((order) => ({
              id: order.id,
              offer: order.offer?.title || "Unknown",
              customer: order.user?.name || "Unknown",
              amount: `EGP ${order.total || 0}`,
              status: order.status || "pending",
              branch: order.branch?.name || "Unknown",
            }));
            setOrders(transformedOrders);
          }
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
      }
    };

    fetchVendorData();
  }, []);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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
    // Calculate expiration date from expiresIn string (e.g., "2h 30m")
    const hoursMatch = offer.expiresIn?.match(/(\d+)h/);
    const minsMatch = offer.expiresIn?.match(/(\d+)m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const mins = minsMatch ? parseInt(minsMatch[1]) : 0;
    const expDate = new Date(Date.now() + (hours * 60 + mins) * 60 * 1000);
    const expDateStr = expDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm

    setForm({
      title: offer.title, description: offer.description,
      originalPrice: String(offer.originalPrice), discountPrice: String(offer.discountPrice),
      quantityAvailable: String(offer.quantity), expiresIn: "",
      image: null,
      status: offer.status?.toLowerCase() || "active",
      expirationDate: expDateStr,
    });
    setDrawerOpen(true);
  };
  const closeDrawer  = () => { setDrawerOpen(false); setEditingId(null); setForm(EMPTY_FORM); setSubmitError(""); };
  const handleChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const handleImage  = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setForm(prev => ({ ...prev, image: file }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setSubmitError(t("businessDashboard.errors.fillTitleDescription"));
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
          setSubmitError(t("businessDashboard.errors.loginToContinue"));
        return;
      }

      const submitData = new FormData();
      submitData.append("title", form.title.trim());
      submitData.append("description", form.description.trim());
      submitData.append("quantity_available", parseInt(form.quantityAvailable) || 1);
      submitData.append("original_price", parseFloat(form.originalPrice) || 0);
      submitData.append("discount_price", parseFloat(form.discountPrice) || 0);
      submitData.append("status", form.status || "active");

      // Handle expiration time
      if (!editingId) {
        // Find branch ID from selected branch (only for new offers)
        const branchId = branches.find(b => b.name === selectedBranch)?.id;
        if (!branchId) {
          setSubmitError(t("businessDashboard.errors.selectValidBranch"));
          setIsSubmitting(false);
          return;
        }
        submitData.append("branch_id", branchId);

        // Calculate expiration time from hours input for new offers
        const expiresInHours = parseInt(form.expiresIn) || 2;
        const expirationTime = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
        submitData.append("expiration_time", expirationTime);
      } else {
        // For editing, use the selected expiration date
        if (form.expirationDate) {
          submitData.append("expiration_time", new Date(form.expirationDate).toISOString());
        }
      }

      if (form.image && typeof form.image === 'object') {
        submitData.append("image", form.image);
      }

      const url = editingId
        ? `/api/offers/${editingId}`
        : "/api/offers";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        if (editingId) {
          // Update existing offer in local state
          setOffers(prev => prev.map(o => o.id === editingId ? {
            ...o,
            title: form.title,
            description: form.description,
            originalPrice: parseFloat(form.originalPrice) || 0,
            discountPrice: parseFloat(form.discountPrice) || 0,
            quantity: parseInt(form.quantityAvailable) || 1,
            status: form.status.charAt(0).toUpperCase() + form.status.slice(1),
            image: data.offer?.image_url || o.image,
          } : o));
        } else {
          // Add new offer to local state
          const newOffer = {
            id: data.offer?.id || Date.now(),
            title: form.title,
            description: form.description,
            originalPrice: parseFloat(form.originalPrice) || 0,
            discountPrice: parseFloat(form.discountPrice) || 0,
            quantity: parseInt(form.quantityAvailable) || 1,
            expiresIn: form.expiresIn + "h",
            status: "Active",
            branch: selectedBranch,
            image: data.offer?.image_url || "",
          };
          setOffers(prev => [newOffer, ...prev]);
        }
        closeDrawer();
      } else {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join("\n");
          setSubmitError(errorMessages || "Please fix the errors below");
        } else if (response.status === 401) {
          setSubmitError("Please login to continue");
        } else {
          setSubmitError(data.message || `Failed to ${editingId ? 'update' : 'create'} offer. Please try again.`);
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError(t("businessDashboard.errors.network"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => setOffers(prev => prev.filter(o => o.id !== id));
  const scrollTo     = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert(t("businessDashboard.errors.loginToContinue"));
        setUpdatingOrderId(null);
        return;
      }

      const response = await fetch(
        `/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        if (response.status === 422 && data.errors) {
          alert(Object.values(data.errors).flat().join("\n"));
        } else if (response.status === 401) {
          alert(t("businessDashboard.errors.loginToContinue"));
        } else {
          alert(data.message || t("businessDashboard.errors.failedUpdateOrderStatus"));
        }
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert(t("businessDashboard.errors.network"));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Sidebar nav items config
  const navItems = [
    {
      id: "notifications",
      icon: Bell,
      label: t("businessDashboard.notifications"),
      badge: unreadCount > 0 ? unreadCount : null,
      onClick: () => setShowNotifications(true),
    },
    {
      id: "language",
      icon: Globe,
      label: language === "en" ? t("businessDashboard.languageEnglish") : t("businessDashboard.languageArabic"),
      onClick: () => setLanguage((l) => (l === "en" ? "ar" : "en")),
    },
    {
      id: "profile",
      icon: User,
      label: t("businessDashboard.myProfile"),
      onClick: () => navigate("/business/profile"),
    },
    {
      id: "branches",
      icon: GitBranch,
      label: t("businessDashboard.branches"),
      expandable: true,
      expanded: showBranches,
      onToggle: () => setShowBranches((b) => !b),
      children: [t("businessDashboard.branchLocations.maadi"), t("businessDashboard.branchLocations.nasrCity")],
      hasAddBranch: true,
    },
    {
      id: "offers",
      icon: Package,
      label: t("businessDashboard.myOffers"),
      onClick: () => scrollTo("offers-section"),
    },
    {
      id: "orders",
      icon: ShoppingCart,
      label: t("businessDashboard.orders"),
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
          <p className="biz-nav-label">{t("businessDashboard.locationLabel")}</p>
          <select className="biz-select" value={location} onChange={(e) => handleLocationChange(e.target.value)}>
            <option>{t("businessDashboard.location.maadi")}</option>
            <option>{t("businessDashboard.location.nasrCity")}</option>
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
                      {item.hasAddBranch && (
                        <button
                          className="biz-branch-btn biz-branch-add"
                          onClick={() => navigate("/add-branch")}
                        >+ Add Branch</button>
                      )}
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
          onClick={() => navigate("/business/profile")}
          title={t("businessDashboard.goToProfile")}
        >
          <div className="biz-sidebar-avatar">
            <User size={16} color="white" />
          </div>
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

      {/* ── Notifications slide-in panel ── */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* ── MAIN ── */}
      <main className="biz-main">

        <div className="biz-welcome">
          <div>
            <h1 className="biz-welcome-title">
              {t("businessDashboard.welcomeBack", { business: businessName || t("businessDashboard.yourBusiness") })} 👋
            </h1>
            <p className="biz-welcome-sub">{t("businessDashboard.manageOffersSubtitle")}</p>
          </div>
          <div className="biz-impact">
            <p className="biz-impact-label">{t("businessDashboard.impactTitle")}</p>
            <p className="biz-impact-value">{t("businessDashboard.foodSaved", { count: 142 })}</p>
          </div>
        </div>

        <div className="biz-kpis">
          {[
            {
              label: t("businessDashboard.kpis.activeOffers"),
              value: filteredOffers.filter((o) => o.status === "Active").length,
              icon: "📦",
            },
            {
              label: t("businessDashboard.kpis.totalOrders"),
              value: filteredOrders.length,
              icon: "🛒",
            },
            {
              label: t("businessDashboard.kpis.todaysRevenue"),
              value: "EGP 287.50",
              icon: "💰",
            },
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
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip /><Legend />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name={t("businessDashboard.charts.salesLabel")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="biz-chart-card">
            <h3 className="biz-chart-title">{t("businessDashboard.charts.ordersOverview")}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip /><Legend />
                <Bar dataKey="orders" fill="#3b82f6" name={t("businessDashboard.charts.ordersLabel")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Offers */}
        <div className="biz-section" id="offers-section">
          <div className="biz-section-header">
            <h2 className="biz-section-title">{t("businessDashboard.myOffers")}</h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {filteredOffers.length > 2 && (
                <button className="biz-link-btn" onClick={() => setShowAllOffers((v) => !v)}>
                  {showAllOffers ? t("businessDashboard.showLess") : t("businessDashboard.viewAllOffers", { count: filteredOffers.length })}
                </button>
              )}
              <button className="biz-add-btn" onClick={openAdd}>{t("businessDashboard.addOffer")}</button>
            </div>
          </div>

          {drawerOpen && (
            <div className="biz-drawer">
              <div className="biz-drawer-header">
                <h3 className="biz-drawer-title">
                  {editingId ? t("businessDashboard.editOffer") : t("businessDashboard.newOffer")}
                </h3>
                <button className="biz-drawer-close" onClick={closeDrawer}>✕</button>
              </div>
              {form.image && typeof form.image === 'string' && <img src={form.image} alt={t("businessDashboard.previewImageAlt")} className="biz-img-preview" />}
              {form.image && typeof form.image === 'object' && <div className="biz-img-preview">📷 {form.image.name}</div>}
              <div className="biz-drawer-body">
                {submitError && <div className="biz-error-box" style={{color: "#ef4444", marginBottom: "12px", padding: "8px", background: "#fef2f2", borderRadius: "6px"}}>{submitError}</div>}
                <div className="biz-field"><label>{t("businessDashboard.form.title")}</label><input name="title" value={form.title} onChange={handleChange} placeholder={t("businessDashboard.form.titlePlaceholder")} /></div>
                <div className="biz-field"><label>{t("businessDashboard.form.description")}</label><textarea name="description" value={form.description} onChange={handleChange} placeholder={t("businessDashboard.form.descriptionPlaceholder")} rows={3} /></div>
                <div className="biz-field"><label>{t("businessDashboard.form.offerPhoto")}</label><input type="file" accept="image/*" onChange={handleImage} /></div>
                <div className="biz-field-row">
                  <div className="biz-field"><label>{t("businessDashboard.form.originalPrice")}</label><div className="biz-prefix-input"><span>{t("businessDashboard.currency")}</span><input name="originalPrice" type="number" step="0.01" value={form.originalPrice} onChange={handleChange} placeholder={t("businessDashboard.form.pricePlaceholder")} /></div></div>
                  <div className="biz-field"><label>{t("businessDashboard.form.discountPrice")}</label><div className="biz-prefix-input"><span>{t("businessDashboard.currency")}</span><input name="discountPrice" type="number" step="0.01" value={form.discountPrice} onChange={handleChange} placeholder={t("businessDashboard.form.pricePlaceholder")} /></div></div>
                </div>
                <div className="biz-field-row">
                  <div className="biz-field"><label>{t("businessDashboard.form.quantityAvailable")}</label><input name="quantityAvailable" type="number" value={form.quantityAvailable} onChange={handleChange} placeholder={t("businessDashboard.form.quantityPlaceholder")} /></div>
                  {!editingId && <div className="biz-field"><label>{t("businessDashboard.form.expiresIn")}</label><input name="expiresIn" type="number" value={form.expiresIn} onChange={handleChange} placeholder={t("businessDashboard.form.expiresInPlaceholder")} /></div>}
                </div>
                {editingId && (
                  <div className="biz-field-row">
                    <div className="biz-field">
                      <label>{t("businessDashboard.form.expirationDate")}</label>
                      <input name="expirationDate" type="datetime-local" value={form.expirationDate} onChange={handleChange} />
                    </div>
                    <div className="biz-field">
                      <label>{t("businessDashboard.form.status")}</label>
                      <select name="status" value={form.status} onChange={handleChange} className="form-input">
                        <option value="active">{t("businessDashboard.status.active")}</option>
                        <option value="expired">{t("businessDashboard.status.expired")}</option>
                        <option value="disabled">{t("businessDashboard.status.disabled")}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div className="biz-drawer-footer">
                <button className="biz-btn-cancel" onClick={closeDrawer} disabled={isSubmitting}>{t("businessDashboard.cancel")}</button>
                <button className="biz-btn-save" onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? t("businessDashboard.saving") : (editingId ? t("businessDashboard.saveChanges") : t("businessDashboard.createOffer"))}</button>
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
                  <span className="biz-price">{t("businessDashboard.currency")} {offer.discountPrice}</span>
                  <span className={`biz-badge ${offer.status === "Active" ? "active" : offer.status === "Expired" ? "expired" : "disabled"}`}>
                    {t(`businessDashboard.offerStatus.${offer.status.toLowerCase()}`, { status: offer.status })}
                  </span>
                </div>
                <div className="biz-offer-actions">
                  <button className="biz-icon-btn edit" onClick={() => openEdit(offer)} title={t("businessDashboard.edit")}>✏️</button>
                  <button className="biz-icon-btn delete" onClick={() => handleDelete(offer.id)} title={t("businessDashboard.delete")}>🗑️</button>
                </div>
              </div>
            ))}
            {filteredOffers.length > 2 && !showAllOffers && <p className="biz-more">{t("businessDashboard.moreOffers", { count: filteredOffers.length - 2 })}</p>}
          </div>
        </div>

        {/* Orders */}
        <div className="biz-section" id="orders-section">
          <div className="biz-section-header">
            <h2 className="biz-section-title">{t("businessDashboard.recentOrders")}</h2>
            {filteredOrders.length > 2 && (
              <button className="biz-link-btn" onClick={() => setShowAllOrders((v) => !v)}>
                {showAllOrders ? t("businessDashboard.showLess") : t("businessDashboard.viewAllOrders", { count: filteredOrders.length })}
              </button>
            )}
          </div>
          <div className="biz-table-wrap">
            <table className="biz-table">
              <thead><tr><th>{t("businessDashboard.orderTable.id")}</th><th>{t("businessDashboard.orderTable.offer")}</th><th>{t("businessDashboard.orderTable.customer")}</th><th>{t("businessDashboard.orderTable.amount")}</th><th>{t("businessDashboard.orderTable.status")}</th></tr></thead>
              <tbody>
                {(showAllOrders ? filteredOrders : filteredOrders.slice(0, 2)).map(o => (
                  <tr key={o.id}>
                    <td className="biz-td-id">{o.id}</td>
                    <td>{o.offer}</td>
                    <td>{o.customer}</td>
                    <td className="biz-td-amount">{o.amount}</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                        disabled={updatingOrderId === o.id}
                        className={`biz-status-select biz-status-${o.status}`}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.85rem",
                          cursor: updatingOrderId === o.id ? "wait" : "pointer",
                          backgroundColor: o.status === "completed" ? "#dcfce7" :
                                          o.status === "processing" ? "#dbeafe" :
                                          o.status === "delivered" ? "#f3e8ff" :
                                          o.status === "cancelled" ? "#fee2e2" : "#f3f4f6",
                          color: o.status === "completed" ? "#166534" :
                                 o.status === "processing" ? "#1e40af" :
                                 o.status === "delivered" ? "#7c3aed" :
                                 o.status === "cancelled" ? "#991b1b" : "#374151",
                        }}
                      >
                        <option value="processing">{t("businessDashboard.orderStatus.processing")}</option>
                        <option value="completed">{t("businessDashboard.orderStatus.completed")}</option>
                        <option value="delivered">{t("businessDashboard.orderStatus.delivered")}</option>
                        <option value="cancelled">{t("businessDashboard.orderStatus.cancelled")}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length > 2 && !showAllOrders && <p className="biz-more">{t("businessDashboard.moreOrders", { count: filteredOrders.length - 2 })}</p>}
        </div>

      </main>
    </div>
  );
}

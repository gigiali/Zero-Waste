import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../Context/AuthContext";
import {
  LayoutDashboard, Package, ShoppingBag, Activity, Leaf,
  Bell, Languages, ChevronDown, ChevronRight, Menu, X,
  Users, ClipboardList, Star,
} from "lucide-react";
import "../pages/Admin.css";

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const isSupport    = (r) => r === "support";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);

const DASHBOARD_IDS = new Set(["dashboard", "offers", "orders", "activity", "sustainability", "notifications"]);

function NavItem({ icon: Icon, label, active, onClick, badge, collapsed }) {
  return (
    <button
      type="button"
      className={`sidebar-nav-item ${active ? "active" : ""}`}
      onClick={onClick}
      title={collapsed ? label : undefined}
    >
      <Icon size={18} />
      {!collapsed && <span>{label}</span>}
      {badge != null && badge > 0 && <span className="sidebar-nav-badge">{badge}</span>}
      {active && !collapsed && <ChevronRight size={14} className="sidebar-nav-arrow" />}
    </button>
  );
}

export default function AdminSidebar({
  activeSection,
  onSectionChange,
  notifUnread = 0,
  ordersBadge = null,
}) {
  const { t, i18n } = useTranslation();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { role, user } = useAuth();

  const [open, setOpen]       = useState(true);
  const [langOpen, setLangOpen] = useState(false);

  const ROLE_LABEL = {
    super_admin: t("admin.superAdmin"),
    manager:     t("admin.manager"),
    support:     t("admin.support"),
  };

  const path = location.pathname;

  // Determine if a nav item is "active"
  const isActive = (id) => {
    // When used inside /admin with section switching
    if (activeSection && DASHBOARD_IDS.has(id)) {
      return activeSection === id;
    }
    // Route-based checks for management pages
    if (id === "dashboard")      return path === "/admin";
    if (id === "businesses")     return path.startsWith("/admin/businesses");
    if (id === "reviews")        return path.startsWith("/admin/review-moderation");
    if (id === "users")          return path.startsWith("/admin/users");
    if (id === "notifications")  return activeSection === "notifications";
    return false;
  };

  const handleItemClick = (item) => {
    if (DASHBOARD_IDS.has(item.id) && onSectionChange) {
      // Inside Admin.jsx dashboard — switch section without navigating
      onSectionChange(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const dashboardItems = isSupport(role)
    ? [
        { id: "dashboard",      icon: LayoutDashboard, label: t("admin.dashboard"),           path: "/admin" },
        { id: "orders",         icon: ShoppingBag,     label: t("admin.latestOrders"),         path: "/admin", badge: ordersBadge },
        { id: "activity",       icon: Activity,        label: t("admin.recentActivity"),       path: "/admin" },
        { id: "sustainability", icon: Leaf,            label: t("admin.sustainabilityImpact"), path: "/admin" },
      ]
    : [
        { id: "dashboard",      icon: LayoutDashboard, label: t("admin.dashboard"),           path: "/admin" },
        { id: "offers",         icon: Package,         label: t("admin.allOffers"),            path: "/admin" },
        { id: "orders",         icon: ShoppingBag,     label: t("admin.latestOrders"),         path: "/admin", badge: ordersBadge },
        { id: "activity",       icon: Activity,        label: t("admin.recentActivity"),       path: "/admin" },
        { id: "sustainability", icon: Leaf,            label: t("admin.sustainabilityImpact"), path: "/admin" },
      ];

  const managementItems = canManage(role)
    ? [
        { id: "users",      icon: Users,         label: t("admin.users"),      path: "/admin/users" },
        { id: "businesses", icon: ClipboardList, label: t("admin.businesses"), path: "/admin/businesses" },
        { id: "reviews",    icon: Star,          label: t("admin.reviews"),    path: "/admin/review-moderation" },
      ]
    : [];

  return (
    <aside className={`admin-sidebar ${open ? "open" : "closed"}`}>
      <div className="biz-logo">
        <img src="/images/zerowaste-logo.png" alt="ZeroWaste Logo" className="biz-logo-img" />
        {open && <span className="biz-logo__role">{ROLE_LABEL[role] ?? role}</span>}
      </div>

      <button className="sidebar-toggle" onClick={() => setOpen((v) => !v)} type="button">
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      <nav className="sidebar-nav">
        {open && <p className="sidebar-nav-section-title">{t("admin.menu")}</p>}

        {dashboardItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={open ? item.label : ""}
            active={isActive(item.id)}
            collapsed={!open}
            badge={item.badge}
            onClick={() => handleItemClick(item)}
          />
        ))}

        {open && managementItems.length > 0 && (
          <p className="sidebar-nav-section-title">{t("admin.management")}</p>
        )}
        {managementItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={open ? item.label : ""}
            active={isActive(item.id)}
            collapsed={!open}
            onClick={() => handleItemClick(item)}
          />
        ))}

        <div className="sidebar-nav-divider" />

        <NavItem
          icon={Bell}
          label={open ? t("admin.notifications") : ""}
          active={isActive("notifications")}
          collapsed={!open}
          badge={notifUnread > 0 ? notifUnread : null}
          onClick={() => onSectionChange ? onSectionChange("notifications") : navigate("/admin")}
        />

        <div className="sidebar-lang-wrapper">
          <button
            type="button"
            className="sidebar-nav-item"
            onClick={() => setLangOpen((v) => !v)}
          >
            <Languages size={18} />
            {open && (
              <>
                <span>{t("admin.language")}</span>
                <ChevronDown size={14} style={{ marginLeft: "auto" }} />
              </>
            )}
          </button>
          {langOpen && (
            <div className="lang-dropdown">
              <button
                type="button"
                className={`lang-option ${i18n.language === "en" ? "active" : ""}`}
                onClick={() => { i18n.changeLanguage("en"); setLangOpen(false); }}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                className={`lang-option ${i18n.language === "ar" ? "active" : ""}`}
                onClick={() => { i18n.changeLanguage("ar"); setLangOpen(false); }}
              >
                🇪🇬 العربية
              </button>
            </div>
          )}
        </div>
      </nav>

      {open && (
        <div
          className="sidebar-profile"
          onClick={() => navigate("/admin/profile")}
          style={{ cursor: "pointer" }}
        >
          <div className="sidebar-profile__avatar">
            {(ROLE_LABEL[role] ?? "A")[0]}
          </div>
          <div className="sidebar-profile__info">
            <p className="sidebar-profile__name">{t("admin.admin")}</p>
            <p className="sidebar-profile__role">{ROLE_LABEL[role] ?? role}</p>
          </div>
        </div>
      )}
    </aside>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "../Components/Navigation";
import { Search, MoreVertical, Eye, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./ManageBusinesses.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);
const canDelete    = (r) => isSuperAdmin(r);

const statusConfig = {
  approved:     { bg: "#d1fae5", text: "#065f46", icon: "✓",  labelKey: "manageBusinesses.status.approved" },
  active:        { bg: "#d1fae5", text: "#065f46", icon: "✓",  labelKey: "manageBusinesses.status.active" },
  pending:      { bg: "#fef9c3", text: "#854d0e", icon: "⏳", labelKey: "manageBusinesses.status.pending" },
  under_review: { bg: "#dbeafe", text: "#1e40af", icon: "⚙️", labelKey: "manageBusinesses.status.underReview" },
  rejected:     { bg: "#fee2e2", text: "#991b1b", icon: "✗",  labelKey: "manageBusinesses.status.rejected" },
};
const fallbackStatus = { bg: "#f3f4f6", text: "#374151", icon: "*", labelKey: "manageBusinesses.status.unknown" };
const getStatus = (s) => statusConfig[s?.toLowerCase?.()] ?? fallbackStatus;

const formatEGP = (n) =>
  n >= 1000 ? `EGP ${(n / 1000).toFixed(1)}K` : `EGP ${Number(n || 0).toLocaleString()}`;

/* ── ACTION MENU ── */
function ActionMenu({ business, role, token, onStatusChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const { t } = useTranslation();

  const doRequest = async (url, method = "POST") => {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          Accept: "application/json", 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });
      return res.ok;
    } catch { 
      return false; 
    } finally { 
      setBusy(false); 
    }
  };

  const handleApprove = async () => {
    const ok = await doRequest(`${BASE_URL}/admin/vendor/${business.id}/accept`, "POST");
    if (ok) onStatusChange(business.id, "approved");
    else alert(t("manageBusinesses.errors.approveFailed"));
    setOpen(false);
  };

  const handleReject = async () => {
    if (!window.confirm(t("manageBusinesses.confirm.rejectVendor", { name: business.name }))) return;
    const ok = await doRequest(`${BASE_URL}/admin/vendor/${business.id}/reject`, "POST");
    if (ok) onStatusChange(business.id, "rejected");
    else alert(t("manageBusinesses.errors.rejectFailed"));
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(t("manageBusinesses.confirm.deleteVendor", { name: business.name }))) return;
    const ok = await doRequest(`${BASE_URL}/admin/vendor/${business.id}`, "DELETE");
    if (ok) onDelete(business.id);
    else alert(t("manageBusinesses.errors.deleteFailed"));
    setOpen(false);
  };

  const actions = [
    { icon: <Eye size={15} />,     label: t("manageBusinesses.actions.manageDetails"), color: "#374151", onClick: () => { alert(t("manageBusinesses.alerts.vendorView", { name: business.name })); setOpen(false); }, show: true },
    { icon: <CheckCircle size={15} />, label: t("manageBusinesses.actions.approve"),      color: "#10b981", onClick: handleApprove, show: canManage(role) && business.status === "pending" },
    { icon: <XCircle size={15} />,     label: t("manageBusinesses.actions.reject"),       color: "#f59e0b", onClick: handleReject,  show: canManage(role) && business.status === "pending" },
    { icon: <Trash2 size={15} />,      label: t("manageBusinesses.actions.delete"),       color: "#ef4444", onClick: handleDelete,  show: canDelete(role), divider: true },
  ].filter((a) => a.show);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button className="action-menu-btn" onClick={() => setOpen((v) => !v)} disabled={busy}>
        {busy ? <Loader2 size={16} className="spin" /> : <MoreVertical size={16} />}
      </button>

      {open && (
        <div className="action-dropdown">
          {actions.map((a, i) => (
            <React.Fragment key={i}>
              {a.divider && <div className="action-dropdown__divider" />}
              <button className="action-dropdown__item" style={{ color: a.color }} onClick={a.onClick}>
                {a.icon}<span>{a.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function ManageBusinesses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, token: contextToken } = useAuth();
  
  // High reliability fallback for live hosting environments
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const [businesses,     setBusinesses]     = useState([]);
  const [dataLoading,    setDataLoading]    = useState(false);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
  if (!token) return;
  (async () => {
    setDataLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        fetch(`${BASE_URL}/vendors`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/admin/vendor/pending`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        }),
      ]);

      const allData = await allRes.json();
      const pendingData = pendingRes.ok ? await pendingRes.json() : { vendors: [] };

      const allVendors = allData?.vendors ?? allData?.data ?? (Array.isArray(allData) ? allData : []);
      const pendingVendors = pendingData?.vendors ?? pendingData?.data ?? (Array.isArray(pendingData) ? pendingData : []);

      const pendingIds = new Set(pendingVendors.map((v) => v.id));
      const merged = [
        ...pendingVendors.map((v) => ({ ...v, status: v.status ?? "pending" })),
        ...allVendors.filter((v) => !pendingIds.has(v.id)),
      ];

      setBusinesses(merged.map((v) => ({
        id:       v.id,
        name:     v.business_name ?? v.name ?? t("manageBusinesses.unknownBusiness"),
        category: v.category ?? v.type ?? "—",
        status:   v.status ?? "pending",
        rating:   v.rating ?? 0,
        users:    v.users_count ?? 0,
        joined:   v.created_at ?? null,
        revenue:  v.revenue ?? 0,
      })));
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setDataLoading(false);
    }
  })();
}, [token]);

  const handleStatusChange = (id, status) =>
    setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));

  const handleDelete = (id) =>
    setBusinesses((prev) => prev.filter((b) => b.id !== id));

  const filtered = businesses.filter((b) => {
    const search   = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const byStatus = filterStatus   === "all" || b.status   === filterStatus;
    const byCat    = filterCategory === "all" || b.category === filterCategory;
    return search && byStatus && byCat;
  });

  const categories = [...new Set(businesses.map((b) => b.category))];
  const statuses   = [...new Set(businesses.map((b) => b.status))];
  const totalRev   = businesses.reduce((s, b) => s + (b.revenue || 0), 0);

  return (
    <>
      <Navigation hideCart hideLocation hideProfile />
      <div className="businesses-page container mt-4 mb-5">

        <div className="businesses-header">
          <div>
            <h1 className="businesses-title">{t("manageBusinesses.title")}</h1>
            <p className="businesses-subtitle">{t("manageBusinesses.subtitle")}</p>
          </div>
          <button type="button" className="businesses-back-btn" onClick={() => navigate("/admin") }>
            ← {t("manageBusinesses.backToAdmin")}
          </button>
        </div>

        <div className="businesses-stats">
          <div className="biz-stat">
            <p className="biz-stat__label">{t("manageBusinesses.stats.totalRegistered")}</p>
            <p className="biz-stat__value">{businesses.length}</p>
          </div>
          <div className="biz-stat">
            <p className="biz-stat__label">{t("manageBusinesses.stats.activeState")}</p>
            <p className="biz-stat__value">{businesses.filter((b) => ["approved","active"].includes(b.status)).length}</p>
          </div>
          <div className="biz-stat">
            <p className="biz-stat__label">{t("manageBusinesses.stats.awaitingVerification")}</p>
            <p className="biz-stat__value">{businesses.filter((b) => ["pending","under_review"].includes(b.status)).length}</p>
          </div>
          {canManage(role) && (
            <div className="biz-stat">
              <p className="biz-stat__label">{t("manageBusinesses.stats.grossVolume")}</p>
              <p className="biz-stat__value">{formatEGP(totalRev)}</p>
            </div>
          )}
        </div>

        <div className="businesses-controls">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder={t("manageBusinesses.controls.searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">{t("manageBusinesses.controls.allStates")}</option>
              {statuses.map((s) => <option key={s} value={s}>{t(getStatus(s).labelKey)}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
              <option value="all">{t("manageBusinesses.controls.allSectors")}</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="businesses-table-wrapper">
          {dataLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <Loader2 size={20} className="spin" /> {t("manageBusinesses.loading")}
            </div>
          ) : (
            <table className="businesses-table">
              <thead>
                <tr>
                  <th>{t("manageBusinesses.table.businessEntity")}</th><th>{t("manageBusinesses.table.sector")}</th><th>{t("manageBusinesses.table.state")}</th>
                  <th>{t("manageBusinesses.table.performance")}</th><th>{t("manageBusinesses.table.userBase")}</th><th>{t("manageBusinesses.table.timestamp")}</th>
                  {canManage(role) && <th>{t("manageBusinesses.table.volumeValuation")}</th>}
                  <th>{t("manageBusinesses.table.managementActions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((biz) => {
                  const st = getStatus(biz.status);
                  return (
                    <tr key={biz.id}>
                      <td className="table-name"><strong>{biz.name}</strong></td>
                      <td>{biz.category}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: st.bg, color: st.text }}>
                          {st.icon} {t(st.labelKey)}
                        </span>
                      </td>
                      <td><span className="stars">★ {biz.rating}</span></td>
                      <td>{Number(biz.users).toLocaleString()}</td>
                      <td>{biz.joined ? new Date(biz.joined).toLocaleDateString() : "N/A"}</td>
                      {canManage(role) && <td className="table-revenue">{formatEGP(biz.revenue)}</td>}
                      <td>
                        <ActionMenu business={biz} role={role} token={token} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={canManage(role) ? 8 : 7} className="table-empty">Zero query matches returned</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

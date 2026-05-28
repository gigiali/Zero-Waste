import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search, MoreVertical, Eye, CheckCircle, XCircle,
  Trash2, Loader2, ArrowLeft, Store, Clock, ChevronRight,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./ManageBusinesses.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);
const canDelete    = (r) => isSuperAdmin(r);

const statusConfig = {
  approved:     { bg: "#e8faf0", text: "#28c76f", dot: "#28c76f", labelKey: "manageBusinesses.status.approved" },
  active:       { bg: "#e8faf0", text: "#28c76f", dot: "#28c76f", labelKey: "manageBusinesses.status.active" },
  pending:      { bg: "#fff6e0", text: "#ff9f43", dot: "#ff9f43", labelKey: "manageBusinesses.status.pending" },
  under_review: { bg: "#e7e7ff", text: "#696cff", dot: "#696cff", labelKey: "manageBusinesses.status.underReview" },
  rejected:     { bg: "#ffeaea", text: "#ef4444", dot: "#ef4444", labelKey: "manageBusinesses.status.rejected" },
};
const fallbackStatus = { bg: "#f0f0f5", text: "#8592a3", dot: "#8592a3", labelKey: "manageBusinesses.status.unknown" };
const getStatus = (s) => statusConfig[s?.toLowerCase?.()] ?? fallbackStatus;

/* ── ACTION MENU ── */
function ActionMenu({ business, role, token, onStatusChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const doRequest = async (url, method = "POST") => {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch { return false; }
    finally { setBusy(false); }
  };

  const handleApprove = async () => {
    const ok = await doRequest(`${BASE_URL}/admin/vendor/${business.id}/accept`, "POST");
    if (ok) onStatusChange(business.id, "approved"); else alert(t("manageBusinesses.errors.approveFailed"));
    setOpen(false);
  };
  const handleReject = async () => {
    if (!window.confirm(t("manageBusinesses.confirm.rejectVendor", { name: business.name }))) return;
    const ok = await doRequest(`${BASE_URL}/admin/vendor/${business.id}/reject`, "POST");
    if (ok) onStatusChange(business.id, "rejected"); else alert(t("manageBusinesses.errors.rejectFailed"));
    setOpen(false);
  };
  const handleDelete = async () => {
    if (!window.confirm(t("manageBusinesses.confirm.deleteVendor", { name: business.name }))) return;
    const ok = await doRequest(`${BASE_URL}/admin/vendor/${business.id}`, "DELETE");
    if (ok) onDelete(business.id); else alert(t("manageBusinesses.errors.deleteFailed"));
    setOpen(false);
  };

  const actions = [
    { icon: <Eye size={14} />, label: t("manageBusinesses.actions.manageDetails"), color: "#566a7f", onClick: () => { alert(t("manageBusinesses.alerts.vendorView", { name: business.name })); setOpen(false); }, show: true },
    { icon: <CheckCircle size={14} />, label: t("manageBusinesses.actions.approve"), color: "#28c76f", onClick: handleApprove, show: canManage(role) && business.status === "pending" },
    { icon: <XCircle size={14} />, label: t("manageBusinesses.actions.reject"), color: "#ff9f43", onClick: handleReject, show: canManage(role) && business.status === "pending" },
    { icon: <Trash2 size={14} />, label: t("manageBusinesses.actions.delete"), color: "#ef4444", onClick: handleDelete, show: canDelete(role), divider: true },
  ].filter((a) => a.show);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button className="action-menu-btn" onClick={() => setOpen((v) => !v)} disabled={busy}>
        {busy ? <Loader2 size={15} className="spin" /> : <MoreVertical size={15} />}
      </button>
      {open && (
        <div className="action-dropdown">
          {actions.map((a, i) => (
            <React.Fragment key={i}>
              {a.divider && <div className="action-dropdown__divider" />}
              <button className="action-dropdown__item" style={{ color: a.color }} onClick={a.onClick}>
                <span className="action-dropdown__icon">{a.icon}</span>
                <span>{a.label}</span>
                <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.35 }} />
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── MAIN ── */
export default function ManageBusinesses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const [businesses, setBusinesses]   = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterStatus, setFilterStatus]     = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    if (!token) return;
    (async () => {
      setDataLoading(true);
      try {
        const [allRes, pendingRes] = await Promise.all([
          fetch(`${BASE_URL}/vendors`,              { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/admin/vendor/pending`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }),
        ]);
        const allData     = await allRes.json();
        const pendingData = pendingRes.ok ? await pendingRes.json() : { vendors: [] };

        const allVendorsRaw     = allData?.data?.data ?? allData?.vendors ?? allData?.data ?? (Array.isArray(allData) ? allData : []);
        const allVendors        = Array.isArray(allVendorsRaw) ? allVendorsRaw : [];
        const pendingVendorsRaw = pendingData?.vendors ?? pendingData?.data ?? (Array.isArray(pendingData) ? pendingData : []);
        const pendingVendors    = Array.isArray(pendingVendorsRaw) ? pendingVendorsRaw : [];

        const pendingIds = new Set(pendingVendors.map((v) => v.id));
        const merged = [
          ...pendingVendors.map((v) => ({ ...v, status: v.status ?? "pending" })),
          ...allVendors.filter((v) => !pendingIds.has(v.id)),
        ];
        setBusinesses(merged.map((v) => ({
          id:       v.id,
          name:     v.business_name ?? v.name ?? t("manageBusinesses.unknownBusiness"),
          category: v.vendor_type ?? "—",
          status:   v.status ?? "pending",
        })));
      } catch (err) { console.error("Fetch Error:", err); }
      finally { setDataLoading(false); }
    })();
  }, [token]);

  const handleStatusChange = (id, status) =>
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  const handleDelete = (id) =>
    setBusinesses((prev) => prev.filter((b) => b.id !== id));

  const filtered = businesses.filter((b) => {
    const matchSearch  = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus  = filterStatus   === "all" || b.status   === filterStatus;
    const matchCat     = filterCategory === "all" || b.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const categories   = [...new Set(businesses.map((b) => b.category))];
  const statuses     = [...new Set(businesses.map((b) => b.status))];
  const activeCount  = businesses.filter((b) => ["approved", "active"].includes(b.status)).length;
  const pendingCount = businesses.filter((b) => ["pending", "under_review"].includes(b.status)).length;

  return (
    <>
      <div className="businesses-page container mt-4 mb-5">

        {/* Header */}
        <div className="businesses-header">
          <div className="businesses-header__left">
            <button type="button" className="businesses-back-btn" onClick={() => navigate("/admin")}>
              <ArrowLeft size={15} />
              {t("manageBusinesses.backToAdmin")}
            </button>
            <div>
              <h1 className="businesses-title">{t("manageBusinesses.title")}</h1>
              <p className="businesses-subtitle">{t("manageBusinesses.subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="businesses-stats">
          <div className="biz-stat biz-stat--indigo">
            <div className="biz-stat__icon"><Store size={20} /></div>
            <div>
              <p className="biz-stat__label">{t("manageBusinesses.stats.totalRegistered")}</p>
              <p className="biz-stat__value">{businesses.length}</p>
            </div>
          </div>
          <div className="biz-stat biz-stat--emerald">
            <div className="biz-stat__icon"><CheckCircle size={20} /></div>
            <div>
              <p className="biz-stat__label">{t("manageBusinesses.stats.activeState")}</p>
              <p className="biz-stat__value">{activeCount}</p>
            </div>
          </div>
          <div className="biz-stat biz-stat--amber">
            <div className="biz-stat__icon"><Clock size={20} /></div>
            <div>
              <p className="biz-stat__label">{t("manageBusinesses.stats.awaitingVerification")}</p>
              <p className="biz-stat__value">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="businesses-controls">
          <div className="search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder={t("manageBusinesses.controls.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

        {/* Table */}
        <div className="businesses-table-wrapper">
          {dataLoading ? (
            <div className="table-loading">
              <Loader2 size={18} className="spin" />
              <span>{t("manageBusinesses.loading")}</span>
            </div>
          ) : (
            <table className="businesses-table">
              <thead>
                <tr>
                  <th>{t("manageBusinesses.table.businessEntity")}</th>
                  <th>{t("manageBusinesses.table.sector")}</th>
                  <th>{t("manageBusinesses.table.state")}</th>
                  <th style={{ textAlign: "right" }}>{t("manageBusinesses.table.managementActions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((biz) => {
                  const st = getStatus(biz.status);
                  return (
                    <tr key={biz.id}>
                      <td className="table-name">
                        <div className="table-name__inner">
                          <div className="table-name__avatar">{biz.name.charAt(0).toUpperCase()}</div>
                          <span>{biz.name}</span>
                        </div>
                      </td>
                      <td><span className="table-category">{biz.category}</span></td>
                      <td>
                        <span className="status-badge" style={{ background: st.bg, color: st.text }}>
                          <span className="status-badge__dot" style={{ background: st.dot }} />
                          {t(st.labelKey)}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <ActionMenu business={biz} role={role} token={token} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      {t("manageBusinesses.noResults", "Zero query matches returned")}
                    </td>
                  </tr>
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

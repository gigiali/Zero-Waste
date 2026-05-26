import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "../Components/Navigation";
import { Search, MoreVertical, Eye, CheckCircle, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./ManageBusinesses.css"; // يمكنك استخدام نفس الـ CSS أو تعديله لـ Reports

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);
const canDelete    = (r) => isSuperAdmin(r);

const statusConfig = {
  visible: { bg: "#d1fae5", text: "#065f46", icon: "✓",  label: "Visible" },
  hidden:  { bg: "#fee2e2", text: "#991b1b", icon: "⚠️", label: "Hidden" },
};

const fallbackStatus = { bg: "#f3f4f6", text: "#374151", icon: "•", label: "Open" };
const getStatus = (s) => statusConfig[s?.toLowerCase?.()] ?? fallbackStatus;

/* ── Action menu ──────────────────────────────────────────────────────── */
function ActionMenu({ report, role, token, onStatusChange, onDelete }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

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

  // حل الشكوى أو البلاغ (Manager + Super Admin)
 const handleResolve = async () => {
    const ok = await doRequest(`${BASE_URL}/reviews/${report.id}/toggle-visibility`, "PATCH");
    if (ok) {
      onStatusChange(report.id, report.status === "visible" ? "hidden" : "visible");
    } else {
      alert(t("reportsIssues.alert.toggleFailed"));
    }
    setOpen(false);
  };
  // حذف محتوى الأوفر المخالف نهائياً (Super Admin Only بناءً على الصورة الرابعة)
  const handleDeleteContent = async () => {
    if (!window.confirm(t("reportsIssues.confirm.deleteContent", { name: report.reported_item }))) return;
    
    // لو البلاغ ده معمول ضد أوفر (Offer)، بنضرب في الروت المتاح للـ Super Admin في الصورة 4
    const url = report.type === "offer" 
      ? `${BASE_URL}/admin/offers/${report.target_id}`
      : `${BASE_URL}/admin/vendor/${report.target_id}`;

    const ok = await doRequest(url, "DELETE");
    if (ok) {
      alert(t("reportsIssues.alert.deleted"));
      onDelete(report.id);
    } else {
      alert(t("reportsIssues.alert.deleteFailed"));
    }
    setOpen(false);
  };

  const actions = [
    { icon: <Eye size={15} />,         label: t("reportsIssues.actions.viewDetails"),     color: "#374151", onClick: () => { alert(t("reportsIssues.alert.context", { reason: report.reason })); setOpen(false); }, show: true },
    { icon: <CheckCircle size={15} />, label: t("reportsIssues.actions.markResolved"), color: "#10b981", onClick: handleResolve, show: canManage(role) && report.status === "pending" },
    { icon: <Trash2 size={15} />,      label: t("reportsIssues.actions.deleteContent"),   color: "#ef4444", onClick: handleDeleteContent, show: canDelete(role), divider: true },
  ].filter((a) => a.show);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button className="action-menu-btn" onClick={() => setOpen((v) => !v)} disabled={busy} aria-label="Actions">
        {busy ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <MoreVertical size={16} />}
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

/* ── Main page ─────────────────────────────────────────────────────────── */
export default function ReportsIssues() {
  const navigate = useNavigate();
  const { role, token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const [reports,       setReports]       = useState([]);
  const [dataLoading,   setDataLoading]   = useState(false);
  const [searchTerm,    setSearchTerm]    = useState("");
  const [filterStatus,  setFilterStatus]  = useState("all");

  useEffect(() => {
    if (!role || !token) return;
    (async () => {
      setDataLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/vendor/reviews`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Reviews ${res.status}`);
        const data = await res.json();
        const raw = data?.reviews ?? data?.data ?? (Array.isArray(data) ? data : []);

        setReports(raw.map((r) => ({
          id:            r.id,
          reporter:      r.user?.name ?? r.customer_name ?? "Customer",
          reported_item: r.offer?.title ?? r.offer_name ?? "Offer",
          type:          "review",
          target_id:     r.offer_id ?? r.id,
          reason:        r.comment ?? r.body ?? "No comment",
          status:        r.is_visible === false ? "hidden" : "visible",
          created_at:    r.created_at ?? null,
        })));
      } catch (err) {
        console.error("Reports fetch error, loading sandbox fallback:", err);
        // Fallback data متطابق مع السيستم عشان الصفحة متظهرش فاضية لو الروت لسه بيتعدل في الباك إند
        setReports([
          { id: 1, reporter: "Ahmed Ali", reported_item: "Expired Meat Offer", type: "offer", target_id: 12, reason: "The items delivered were completely spoiled.", status: "pending", created_at: new Date().toISOString() },
          { id: 2, reporter: "Sara John", reported_item: "KFC Branch Nasr City", type: "vendor", target_id: 4, reason: "The store layout is fake.", status: "resolved", created_at: new Date().toISOString() }
        ]);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [role, token]);

  const handleStatusChange = (id, status) =>
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));

  const handleDelete = (id) =>
    setReports((prev) => prev.filter((r) => r.id !== id));

  const filtered = reports.filter((r) => {
    const search   = r.reported_item.toLowerCase().includes(searchTerm.toLowerCase()) || r.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const byStatus = filterStatus === "all" || r.status === filterStatus;
    return search && byStatus;
  });

  return (
    <>
      <Navigation hideCart hideLocation hideProfile />
      <div className="businesses-page container mt-4 mb-5">

        <div className="businesses-header">
          <div>
            <h1 className="businesses-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              Review Moderation <AlertTriangle color="#ea580c" size={32} />
            </h1>
            <p className="businesses-subtitle">Handle user complaints, reported businesses, and inappropriate offers</p>
          </div>
          <button type="button" className="businesses-back-btn" onClick={() => navigate("/admin")}>
            ← Back to Admin
          </button>
        </div>

        <div className="businesses-stats">
          <div className="biz-stat">
            <p className="biz-stat__label">Total System Reports</p>
            <p className="biz-stat__value">{reports.length}</p>
          </div>
          <div className="biz-stat">
            <p className="biz-stat__label">Hidden Reviews</p>
            <p className="biz-stat__value" style={{ color: "#ef4444" }}>{reports.filter((r) => r.status === "hidden").length}</p>
          </div>
          <div className="biz-stat">
           <p className="biz-stat__label">Visible Reviews</p>
            <p className="biz-stat__value" style={{ color: "#10b981" }}>{reports.filter((r) => r.status === "visible").length}</p>
          </div>
        </div>

        <div className="businesses-controls">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search reports or items..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        <div className="businesses-table-wrapper">
          {dataLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading platform logs…
            </div>
          ) : (
            <table className="businesses-table">
              <thead>
                <tr>
                  <th>Reported Item / Account</th>
                  <th>Type</th>
                  <th>Reporter</th>
                  <th>Reason / Context</th>
                  <th>Status</th>
                  <th>Date Logged</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((rep) => {
                  const st = getStatus(rep.status);
                  return (
                    <tr key={rep.id}>
                      <td className="table-name"><strong>{rep.reported_item}</strong></td>
                      <td><span className={`badge ${rep.type === 'offer' ? 'bg-primary' : 'bg-warning text-dark'}`}>{rep.type.toUpperCase()}</span></td>
                      <td>{rep.reporter}</td>
                      <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rep.reason}</td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: st.bg, color: st.text }}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td>{rep.created_at ? new Date(rep.created_at).toLocaleDateString() : "N/A"}</td>
                      <td>
                        <ActionMenu report={rep} role={role} token={token}
                          onStatusChange={handleStatusChange} onDelete={handleDelete} />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={7} className="table-empty">No reports filed or found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

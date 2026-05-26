import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  approved:     { bg: "#d1fae5", text: "#065f46", icon: "✓",  label: "Approved"     },
  active:       { bg: "#d1fae5", text: "#065f46", icon: "✓",  label: "Active"       },
  pending:      { bg: "#fef9c3", text: "#854d0e", icon: "⏳", label: "Pending"      },
  under_review: { bg: "#dbeafe", text: "#1e40af", icon: "⚙️", label: "Under Review" },
  rejected:     { bg: "#fee2e2", text: "#991b1b", icon: "✗",  label: "Rejected"     },
};
const fallbackStatus = { bg: "#f3f4f6", text: "#374151", icon: "*", label: "Unknown" };
const getStatus = (s) => statusConfig[s?.toLowerCase?.()] ?? fallbackStatus;

const formatEGP = (n) =>
  n >= 1000 ? `EGP ${(n / 1000).toFixed(1)}K` : `EGP ${Number(n || 0).toLocaleString()}`;

/* ── Action menu ──────────────────────────────────────────────────────── */
function ActionMenu({ business, role, token, onStatusChange, onDelete }) {
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
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch { return false; }
    finally { setBusy(false); }
  };

  const handleApprove = async () => {
    const ok = await doRequest(`${BASE_URL}/admin/vendor/${business.id}/accept`);
    ok ? onStatusChange(business.id, "approved") : alert("Failed to approve vendor");
    setOpen(false);
  };

  const handleReject = async () => {
    if (!window.confirm(`Reject "${business.name}"?`)) return;
    const ok = await doRequest(`${BASE_URL}/admin/vendor/${business.id}/reject`);
    ok ? onStatusChange(business.id, "rejected") : alert("Failed to reject vendor");
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete "${business.name}"?`)) return;
    const ok = await doRequest(`${BASE_URL}/admin/vendor/${business.id}`, "DELETE");
    ok ? onDelete(business.id) : alert("Failed to delete vendor");
    setOpen(false);
  };

  const actions = [
    { icon: <Eye size={15} />,         label: "View Details", color: "#374151", onClick: () => { alert(`Viewing: ${business.name}`); setOpen(false); }, show: true },
    { icon: <CheckCircle size={15} />, label: "Approve",      color: "#10b981", onClick: handleApprove, show: canManage(role) },
    { icon: <XCircle size={15} />,     label: "Reject",       color: "#f59e0b", onClick: handleReject,  show: canManage(role) },
    { icon: <Trash2 size={15} />,      label: "Delete",       color: "#ef4444", onClick: handleDelete,  show: canDelete(role), divider: true },
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
export default function ManageBusinesses() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [businesses,     setBusinesses]     = useState([]);
  const [dataLoading,    setDataLoading]    = useState(false);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    if (!role || !token) return;
    (async () => {
      setDataLoading(true);
      try {
        const res  = await fetch(`${BASE_URL}/vendors`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Vendors ${res.status}`);
        const data = await res.json();
        const raw  = data?.vendors ?? data?.data ?? (Array.isArray(data) ? data : []);

        setBusinesses(raw.map((v) => ({
          id:       v.id,
          name:     v.business_name ?? v.name ?? "Unknown",
          category: v.category ?? v.type ?? "—",
          status:   v.status ?? "pending",
          rating:   v.rating ?? 0,
          users:    v.users_count ?? 0,
          joined:   v.created_at ?? null,
          revenue:  v.revenue ?? 0,
        })));
      } catch (err) {
        console.error("Businesses fetch error:", err);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [role]);

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
            <h1 className="businesses-title">Manage Businesses</h1>
            <p className="businesses-subtitle">View all registered businesses and manage their status</p>
          </div>
          <button type="button" className="businesses-back-btn" onClick={() => navigate("/admin")}>
            ← Back to Admin
          </button>
        </div>

        <div className="businesses-stats">
          <div className="biz-stat">
            <p className="biz-stat__label">Total Businesses</p>
            <p className="biz-stat__value">{businesses.length}</p>
          </div>
          <div className="biz-stat">
            <p className="biz-stat__label">Approved</p>
            <p className="biz-stat__value">{businesses.filter((b) => ["approved","active"].includes(b.status)).length}</p>
          </div>
          <div className="biz-stat">
            <p className="biz-stat__label">Pending Review</p>
            <p className="biz-stat__value">{businesses.filter((b) => ["pending","under_review"].includes(b.status)).length}</p>
          </div>
          {canManage(role) && (
            <div className="biz-stat">
              <p className="biz-stat__label">Total Revenue</p>
              <p className="biz-stat__value">{formatEGP(totalRev)}</p>
            </div>
          )}
        </div>

        <div className="businesses-controls">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search businesses..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              {statuses.map((s) => <option key={s} value={s}>{getStatus(s).label}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="businesses-table-wrapper">
          {dataLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading businesses…
            </div>
          ) : (
            <table className="businesses-table">
              <thead>
                <tr>
                  <th>Business Name</th><th>Category</th><th>Status</th>
                  <th>Rating</th><th>Users</th><th>Joined</th>
                  {canManage(role) && <th>Revenue</th>}
                  <th>Actions</th>
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
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td><span className="stars">★ {biz.rating}</span></td>
                      <td>{Number(biz.users).toLocaleString()}</td>
                      <td>{biz.joined ? new Date(biz.joined).toLocaleDateString() : "N/A"}</td>
                      {canManage(role) && <td className="table-revenue">{formatEGP(biz.revenue)}</td>}
                      <td>
                        <ActionMenu business={biz} role={role} token={token}
                          onStatusChange={handleStatusChange} onDelete={handleDelete} />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={canManage(role) ? 8 : 7} className="table-empty">No businesses found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && !dataLoading && (
          <div className="pagination">
            <button className="pagination-btn">← Previous</button>
            <span className="pagination-info">Showing {filtered.length} of {businesses.length}</span>
            <button className="pagination-btn">Next →</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

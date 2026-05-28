import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MoreVertical, Eye, UserX, UserCheck,
  Trash2, Loader2, Mail, Users, ShoppingBag,
  ShieldCheck, ShieldOff, RefreshCw, ChevronLeft,
  CheckCircle, XCircle, X,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./UserManagement.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);
const canDelete    = (r) => isSuperAdmin(r);

const STATUS_CFG = {
  active:    { bg: "#dcfce7", text: "#166534", label: "Active"    },
  inactive:  { bg: "#f3f4f6", text: "#4b5563", label: "Inactive"  },
  blocked:   { bg: "#fee2e2", text: "#991b1b", label: "Blocked"   },
  suspended: { bg: "#fee2e2", text: "#991b1b", label: "Suspended" },
  pending:   { bg: "#fef9c3", text: "#854d0e", label: "Pending"   },
  approved:  { bg: "#dcfce7", text: "#166534", label: "Approved"  },
  rejected:  { bg: "#fee2e2", text: "#991b1b", label: "Rejected"  },
};
const getStatus = (s) => STATUS_CFG[s?.toLowerCase?.()] ?? { bg: "#f3f4f6", text: "#374151", label: s ?? "Unknown" };

const TYPE_CFG = {
  vendor:   { bg: "#f3e8ff", text: "#6b21a8", label: "Vendor"   },
  customer: { bg: "#e0f2fe", text: "#0c4a6e", label: "Customer" },
  admin:    { bg: "#fef3c7", text: "#92400e", label: "Admin"    },
};
const getType = (r) => TYPE_CFG[r?.toLowerCase?.()] ?? { bg: "#f3f4f6", text: "#374151", label: r ?? "Unknown" };

/* ── TOAST ── */
function Toast({ toasts, removeToast }) {
  return (
    <div className="um-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`um-toast um-toast--${t.type}`}>
          {t.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          <span>{t.msg}</span>
          <button onClick={() => removeToast(t.id)}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

/* ── DELETE CONFIRM MODAL ── */
function DeleteModal({ user, onConfirm, onCancel }) {
  return (
    <div className="um-modal-overlay" onClick={onCancel}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>
        <div className="um-modal__icon">🗑️</div>
        <h3 className="um-modal__title">Delete User?</h3>
        <p className="um-modal__text">
          Are you sure you want to delete <strong>{user?.name}</strong>? This action cannot be undone.
        </p>
        <div className="um-modal__btns">
          <button className="um-modal__cancel" onClick={onCancel}>Cancel</button>
          <button className="um-modal__confirm" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── ACTION MENU ── */
function ActionMenu({ user, role, token, onStatusChange, onDelete, addToast }) {
  const [open,        setOpen]        = useState(false);
  const [busy,        setBusy]        = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const doRequest = async (url, method = "PATCH") => {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("API error:", res.status, errData);
      }
      return res.ok;
    } catch (err) {
      console.error("Request failed:", err);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const isBlocked = ["blocked", "suspended"].includes(user.status?.toLowerCase());

  const handleBlock = async () => {
    setOpen(false);
    const ok = await doRequest(`${BASE_URL}/admin/users/${user.role === "vendor" ? user.user_id : user.id}/block`);
    if (ok) {
      onStatusChange(user.id, "blocked");
      addToast("success", `${user.name} has been blocked.`);
    } else {
      addToast("error", `Failed to block ${user.name}.`);
    }
  };

  const handleUnblock = async () => {
    setOpen(false);
    const ok = await doRequest(`${BASE_URL}/admin/users/${user.role === "vendor" ? user.user_id : user.id}/unblock`);
    if (ok) {
      onStatusChange(user.id, "active");
      addToast("success", `${user.name} has been unblocked.`);
    } else {
      addToast("error", `Failed to unblock ${user.name}.`);
    }
  };

  const handleDeleteConfirm = async () => {
    setShowDelete(false);
    const endpoint = user.role === "vendor"
  ? `${BASE_URL}/admin/vendor/${user.id}`
  : `${BASE_URL}/admin/customers/${user.id}`;

console.log("Deleting:", user.role, user.id, endpoint);
    const ok = await doRequest(endpoint, "DELETE");
    if (ok) {
      onDelete(user.id);
      addToast("success", `${user.name} has been deleted.`);
    } else {
      addToast("error", `Failed to delete ${user.name}.`);
    }
  };

  const actions = [
    {
      icon: <ShieldOff size={15} />,
      label: "Block User",
      color: "#f59e0b",
      onClick: handleBlock,
      show: canManage(role) && !isBlocked,
    },
    {
      icon: <ShieldCheck size={15} />,
      label: "Unblock User",
      color: "#10b981",
      onClick: handleUnblock,
      show: canManage(role) && isBlocked,
    },
    {
      icon: <Trash2 size={15} />,
      label: "Delete User",
      color: "#ef4444",
      onClick: () => { setOpen(false); setShowDelete(true); },
      show: canDelete(role),
      divider: true,
    },
  ].filter((a) => a.show);

  return (
    <>
      <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
        <button className="um-action-btn" onClick={() => setOpen((v) => !v)} disabled={busy}>
          {busy ? <Loader2 size={16} className="um-spin" /> : <MoreVertical size={16} />}
        </button>
        {open && actions.length > 0 && (
          <div className="um-dropdown">
            {actions.map((a, i) => (
              <React.Fragment key={i}>
                {a.divider && <div className="um-dropdown__divider" />}
                <button className="um-dropdown__item" style={{ color: a.color }} onClick={a.onClick}>
                  {a.icon}<span>{a.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {showDelete && (
        <DeleteModal
          user={user}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}

/* ── AVATAR ── */
const Avatar = ({ name, role }) => {
  const colors = {
    vendor:   ["#f3e8ff", "#7c3aed"],
    customer: ["#e0f2fe", "#0369a1"],
    admin:    ["#fef3c7", "#b45309"],
  };
  const [bg, text] = colors[role?.toLowerCase()] ?? ["#f1f5f9", "#475569"];
  return (
    <div className="um-avatar" style={{ background: bg, color: text }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
};

/* ── MAIN ── */
export default function UserManagement() {
  const navigate = useNavigate();
  const { role, token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType,   setFilterType]   = useState("all");
  const [page,         setPage]         = useState(1);
  const [toasts,       setToasts]       = useState([]);
  const PER_PAGE = 10;

  const addToast = useCallback((type, msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [custRes, vendRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/customers`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/vendors?per_page=100`, {
  headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
}),
      ]);

      const custData = await custRes.json();
      const vendData = await vendRes.json();

      console.log("📦 Customers raw:", custData);
      console.log("🏢 Vendors raw:",   vendData);

      // ── Parse customers ──
      const custList = custData?.customers
        ?? custData?.data?.customers
        ?? custData?.data
        ?? (Array.isArray(custData) ? custData : []);

      const customers = (Array.isArray(custList) ? custList : []).map((u) => ({
  id:     u.id ?? u._id ?? u.customer_id,
        name:   u.name      ?? "Unknown",
        email:  u.email     ?? "—",
        role:   "customer",
        status: u.status    ?? u.user_status ?? "active",
        joined: u.created_at ?? null,
      }));

      // ── Parse vendors ──
      const vendList = vendData?.data?.data
  ?? vendData?.data?.vendors
  ?? (Array.isArray(vendData) ? vendData : []);

      const vendors = (Array.isArray(vendList) ? vendList : []).map((v) => ({
  id:      v.id,
  user_id: v.user_id,
  name:    v.business_name ?? v.name ?? "Unknown",
  email:   v.email         ?? v.contact_email ?? "—",
  role:    "vendor",
  status:  v.status        ?? v.vendor_status ?? v.approval_status ?? "active",
  joined:  v.created_at    ?? null,
}));
      console.log("✅ Customers parsed:", customers.length, "| sample status:", customers[0]?.status);
      console.log("✅ Vendors parsed:",   vendors.length,   "| sample status:", vendors[0]?.status);

      setUsers([...customers, ...vendors]);
    } catch (err) {
      console.error("Fetch error:", err);
      addToast("error", "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const handleStatusChange = (id, status) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));

  const handleDelete = (id) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  const filtered = users.filter((u) => {
    const q     = searchQuery.toLowerCase();
    const match = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const bySt  = filterStatus === "all" || u.status === filterStatus;
    const byTp  = filterType   === "all" || u.role   === filterType;
    return match && bySt && byTp;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const statuses  = [...new Set(users.map((u) => u.status))].filter(Boolean);
  const roleTypes = [...new Set(users.map((u) => u.role))].filter(Boolean);

  const fmtDate = (v) => {
    if (!v) return "—";
    return new Date(v).toLocaleDateString("en-EG", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="um-shell">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* ── Header ── */}
      <div className="um-header">
        <div className="um-header__left">
          <button className="um-back-btn" onClick={() => navigate("/admin")}>
            <ChevronLeft size={16} /> Dashboard
          </button>
          <div>
            <h1 className="um-title">User Management</h1>
            <p className="um-subtitle">Manage customers & vendors</p>
          </div>
        </div>
        <button className="um-refresh-btn" onClick={fetchUsers} disabled={loading}>
          <RefreshCw size={15} className={loading ? "um-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="um-stats">
        <div className="um-stat">
          <div className="um-stat__icon" style={{ background: "#e7e7ff" }}>
            <Users size={20} color="#696cff" />
          </div>
          <div>
            <p className="um-stat__label">Total Users</p>
            <p className="um-stat__value">{users.length}</p>
          </div>
        </div>
        <div className="um-stat">
          <div className="um-stat__icon" style={{ background: "#dcfce7" }}>
            <ShieldCheck size={20} color="#16a34a" />
          </div>
          <div>
            <p className="um-stat__label">Active</p>
            <p className="um-stat__value">{users.filter((u) => u.status === "active").length}</p>
          </div>
        </div>
        <div className="um-stat">
          <div className="um-stat__icon" style={{ background: "#fee2e2" }}>
            <ShieldOff size={20} color="#dc2626" />
          </div>
          <div>
            <p className="um-stat__label">Blocked</p>
            <p className="um-stat__value">{users.filter((u) => ["blocked","suspended"].includes(u.status)).length}</p>
          </div>
        </div>
        <div className="um-stat">
          <div className="um-stat__icon" style={{ background: "#f3e8ff" }}>
            <ShoppingBag size={20} color="#7c3aed" />
          </div>
          <div>
            <p className="um-stat__label">Vendors</p>
            <p className="um-stat__value">{users.filter((u) => u.role === "vendor").length}</p>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="um-controls">
        <div className="um-search">
          <Search size={16} color="#8592a3" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
        <select className="um-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="all">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{getStatus(s).label}</option>)}
        </select>
        <select className="um-select" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
          <option value="all">All Types</option>
          {roleTypes.map((t) => <option key={t} value={t}>{getType(t).label}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="um-table-card">
        <div className="um-table-header">
          <div className="um-table-title-row">
            <Users size={18} color="#696cff" />
            <span>All Users</span>
            <span className="um-count-badge">{filtered.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="um-loading">
            <Loader2 size={20} className="um-spin" /> Loading users…
          </div>
        ) : (
          <div className="um-table-wrapper">
            <table className="um-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.length > 0 ? paged.map((user) => {
                  const st = getStatus(user.status);
                  const tp = getType(user.role);
                  return (
                    <tr key={`${user.role}-${user.id ?? user.email}`}>
                      <td>
                        <div className="um-user-cell">
                          <Avatar name={user.name} role={user.role} />
                          <span className="um-user-name">{user.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="um-email-cell">
                          <Mail size={13} color="#8592a3" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="um-badge" style={{ background: tp.bg, color: tp.text }}>
                          {tp.label}
                        </span>
                      </td>
                      <td>
                        <span className="um-badge" style={{ background: st.bg, color: st.text }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="um-date">{fmtDate(user.joined)}</td>
                      <td>
                        <ActionMenu
                          user={user}
                          role={role}
                          token={token}
                          onStatusChange={handleStatusChange}
                          onDelete={handleDelete}
                          addToast={addToast}
                        />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="um-empty">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="um-pagination">
            <span className="um-pagination__info">
              {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="um-pagination__btns">
              <button className="um-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pg) => (
                <button key={pg} className={`um-page-btn ${pg === page ? "active" : ""}`} onClick={() => setPage(pg)}>{pg}</button>
              ))}
              {totalPages > 5 && <span style={{ color: "#8592a3" }}>…</span>}
              <button className="um-page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next ›</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes um-spin{to{transform:rotate(360deg)}}.um-spin{animation:um-spin 1s linear infinite}`}</style>
    </div>
  );
}

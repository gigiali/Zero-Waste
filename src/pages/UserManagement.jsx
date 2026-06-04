import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MoreVertical, Trash2, Loader2, Mail, Users, ShoppingBag,
  ShieldCheck, ShieldOff, RefreshCw, ChevronLeft,
  CheckCircle, XCircle, X, AlertCircle,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./UserManagement.css";

function SkeletonRow() {
  return (
    <tr>
      <td><div className="um-skeleton um-skeleton--user" /></td>
      <td><div className="um-skeleton um-skeleton--email" /></td>
      <td><div className="um-skeleton um-skeleton--badge" /></td>
      <td><div className="um-skeleton um-skeleton--badge" /></td>
      <td><div className="um-skeleton um-skeleton--date" /></td>
      <td><div className="um-skeleton um-skeleton--action" /></td>
    </tr>
  );
}

function LoadingTimeout() {
  return (
    <div className="um-loading-timeout">
      <AlertCircle size={18} color="#f59e0b" />
      <span>Loading is taking longer than expected...</span>
    </div>
  );
}

const BASE_URL = "https://zero-waste-production.up.railway.app/api";
const API_TIMEOUT = 8000;

const isSuperAdmin = (r) => r === "super_admin";
const isManager = (r) => r === "manager";
const isSupport = (r) => r === "support";
const canManage = (r) => isSuperAdmin(r) || isManager(r);
const canDelete = (r) => isSuperAdmin(r);
const canViewUsers = (r) => isSuperAdmin(r) || isManager(r);
const STATUS_CFG = {
  active: { bg: "#dcfce7", text: "#166534", label: "Active" },
  inactive: { bg: "#f3f4f6", text: "#4b5563", label: "Inactive" },
  blocked: { bg: "#fee2e2", text: "#991b1b", label: "Blocked" },
  suspended: { bg: "#fee2e2", text: "#991b1b", label: "Suspended" },
  pending: { bg: "#fef9c3", text: "#854d0e", label: "Pending" },
  approved: { bg: "#dcfce7", text: "#166534", label: "Approved" },
  rejected: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
};
const getStatus = (s) => STATUS_CFG[s?.toLowerCase?.()] ?? { bg: "#f3f4f6", text: "#374151", label: s ?? "Unknown" };

const TYPE_CFG = {
  vendor: { bg: "#f3e8ff", text: "#6b21a8", label: "Vendor" },
  customer: { bg: "#e0f2fe", text: "#0c4a6e", label: "Customer" },
  admin: { bg: "#fef3c7", text: "#92400e", label: "Admin" },
};
const getType = (r) => TYPE_CFG[r?.toLowerCase()] ?? { bg: "#f3f4f6", text: "#374151", label: r ?? "Unknown" };

async function fetchAllVendors(token) {
  let page = 1;
  let all = [];
  while (true) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      const res = await fetch(`${BASE_URL}/vendors?page=${page}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) break;
      const data = await res.json();
      const isPaginated = data?.data?.data && Array.isArray(data.data.data);
      if (isPaginated) {
        all = [...all, ...data.data.data];
        if (page >= (data.data.last_page ?? 1)) break;
        page++;
      } else {
        const raw = data?.data ?? (Array.isArray(data) ? data : []);
        all = Array.isArray(raw) ? raw : [];
        break;
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Fetch vendors error:", err);
      break;
    }
  }
  return all;
}

function Toast({ toasts, removeToast }) {
  return (
    <div className="um-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`um-toast um-toast--${t.type}`}>
          {t.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          <span>{t.msg}</span>
          <button onClick={() => removeToast(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function DeleteModal({ user, onConfirm, onCancel, busy }) {
  return (
    <div className="um-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="um-modal-content">
        <div className="um-modal-body">
          <div className="um-modal-icon">
            <Trash2 size={22} color="#ef4444" />
          </div>
          <h3 className="um-modal-title">Delete User?</h3>
          <p className="um-modal-text">
            Are you sure you want to delete <strong>{user?.name}</strong>?
            <br />This action cannot be undone.
          </p>
        </div>
        <div className="um-modal-actions">
          <button className="um-modal-btn um-modal-btn--cancel" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="um-modal-btn um-modal-btn--delete" onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 size={15} className="um-spin" /> : <Trash2 size={15} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionMenu({ user, role, token, onStatusChange, onDelete, addToast }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const doRequest = async (url, method = "PATCH") => {
    setBusy(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      const res = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return false;
      return true;
    } catch (err) {
      if (err.name !== "AbortError") console.error("Request failed:", err);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const isBlocked = ["blocked", "suspended"].includes(user.status?.toLowerCase());
  const blockId = user.user_id ?? user.id;

  const handleBlock = async () => {
    setOpen(false);
    const ok = await doRequest(`${BASE_URL}/admin/users/${blockId}/block`);
    if (ok) {
      onStatusChange(user.id, "blocked");
      addToast("success", `${user.name} has been blocked.`);
    } else {
      addToast("error", `Failed to block ${user.name}.`);
    }
  };

  const handleUnblock = async () => {
    setOpen(false);
    const ok = await doRequest(`${BASE_URL}/admin/users/${blockId}/unblock`);
    if (ok) {
      onStatusChange(user.id, "active");
      addToast("success", `${user.name} has been unblocked.`);
    } else {
      addToast("error", `Failed to unblock ${user.name}.`);
    }
  };

  const handleDeleteConfirm = async () => {
    const endpoint = user.role === "vendor"
      ? `${BASE_URL}/admin/vendors/${user.user_id}`
: `${BASE_URL}/admin/customers/${user.user_id}`;

    const ok = await doRequest(endpoint, "DELETE");
    if (ok) {
      onDelete(user.id);
      addToast("success", `${user.name} has been deleted.`);
    } else {
      addToast("error", `Failed to delete ${user.name}.`);
    }
    setShowDelete(false);
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
      onClick: () => {
        setOpen(false);
        setShowDelete(true);
      },
      show: canDelete(role),
      divider: true,
    },
  ].filter((a) => a.show);

  return (
    <>
      <div ref={ref} className="um-action-menu-wrapper">
        <button
          className="um-action-btn"
          onClick={() => {
            if (!open && ref.current) {
              const rect = ref.current.getBoundingClientRect();
              const spaceBelow = window.innerHeight - rect.bottom;
              const menuHeight = 100;
              const top = spaceBelow < menuHeight ? rect.top - menuHeight : rect.bottom + 4;
              setMenuPos({ top, left: rect.right - 160 });
            }
            setOpen((v) => !v);
          }}
          disabled={busy}
        >
          {busy ? <Loader2 size={16} className="um-spin" /> : <MoreVertical size={16} />}
        </button>
        {open && actions.length > 0 && (
          <div className="um-dropdown" style={{ top: menuPos.top, left: menuPos.left }}>
            {actions.map((a, i) => (
              <React.Fragment key={i}>
                {a.divider && <div className="um-dropdown__divider" />}
                <button className="um-dropdown__item" style={{ color: a.color }} onClick={a.onClick}>
                  {a.icon}
                  <span>{a.label}</span>
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
          busy={busy}
        />
      )}
    </>
  );
}

const Avatar = ({ name, role }) => {
  const colors = {
    vendor: ["#f3e8ff", "#7c3aed"],
    customer: ["#e0f2fe", "#0369a1"],
    admin: ["#fef3c7", "#b45309"],
  };
  const [bg, text] = colors[role?.toLowerCase()] ?? ["#f1f5f9", "#475569"];
  const initials = ((name && name.trim()[0]) || "?").toUpperCase();
  return (
    <div className="um-avatar" style={{ background: bg, color: text }}>
      {initials}
    </div>
  );
};

export default function UserManagement() {
  const navigate = useNavigate();
  const { role, token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const PER_PAGE = 10;
  const LOAD_TIMEOUT = 5000;

  const addToast = useCallback((type, msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

if (!role || !canViewUsers(role)) {
  return (
    <div className="admin-auth-error">
      <AlertCircle size={40} />
      <p>You don't have permission to access user management.</p>
    </div>
  );
}

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadingTimeout(false);
    
    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true);
    }, LOAD_TIMEOUT);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      const custRes = await fetch(`${BASE_URL}/admin/customers`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const vendorList = await fetchAllVendors(token);
      const custData = await custRes.json();

      const custList = custData?.customers
        ?? custData?.data?.customers
        ?? custData?.data
        ?? (Array.isArray(custData) ? custData : []);

      const customers = (Array.isArray(custList) ? custList : []).map((u) => ({
        id: u.id ?? u._id ?? u.customer_id,
        user_id: u.user_id ?? u.id,
        name: u.name ?? "Unknown",
        email: u.email ?? "—",
        role: "customer",
        status: u.status ?? u.user_status ?? u.account_status ?? u.user?.status ?? "active",
        joined: u.created_at ?? null,
      }));

      const vendors = vendorList.map((v) => ({
        id: v.id,
        user_id: v.user_id ?? v.user?.id,
        name: v.business_name ?? v.name ?? "Unknown",
        email: v.email ?? v.contact_email ?? "—",
        role: "vendor",
        status: v.user?.status ?? v.status ?? v.vendor_status ?? v.approval_status ?? "active",
        joined: v.created_at ?? null,
      }));

      setUsers([...customers, ...vendors]);
      clearTimeout(timeoutId);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Fetch error:", err);
        addToast("error", "Failed to load users.");
      }
      clearTimeout(timeoutId);
    } finally {
      setLoading(false);
      setLoadingTimeout(false);
    }
  }, [token, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = (id, status) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));

  const handleDelete = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const match = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const bySt = filterStatus === "all" || u.status === filterStatus;
    const byTp = filterType === "all" || u.role === filterType;
    return match && bySt && byTp;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const statuses = [...new Set(users.map((u) => u.status))].filter(Boolean);
  const roleTypes = [...new Set(users.map((u) => u.role))].filter(Boolean);

  const fmtDate = (v) => {
    if (!v) return "—";
    return new Date(v).toLocaleDateString("en-EG", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="um-shell">
      <Toast toasts={toasts} removeToast={removeToast} />

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
            <p className="um-stat__value">{users.filter((u) => ["blocked", "suspended"].includes(u.status)).length}</p>
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

      <div className="um-controls">
        <div className="um-search">
          <Search size={16} color="#8592a3" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="um-select"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {getStatus(s).label}
            </option>
          ))}
        </select>
        <select
          className="um-select"
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Types</option>
          {roleTypes.map((t) => (
            <option key={t} value={t}>
              {getType(t).label}
            </option>
          ))}
        </select>
      </div>

      <div className="um-table-card">
        <div className="um-table-header">
          <div className="um-table-title-row">
            <Users size={18} color="#696cff" />
            <span>All Users</span>
            <span className="um-count-badge">{filtered.length}</span>
          </div>
        </div>

        {loading ? (
          <>
            {loadingTimeout && <LoadingTimeout />}
            <div className="um-loading">
              <Loader2 size={20} className="um-spin" /> Loading users…
            </div>
          </>
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
                {paged.length > 0 ? (
                  paged.map((user) => {
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
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="um-empty">
                      No users found.
                    </td>
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
              <button
                className="um-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹ Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  className={`um-page-btn ${pg === page ? "active" : ""}`}
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </button>
              ))}
              {totalPages > 5 && <span style={{ color: "#8592a3" }}>…</span>}
              <button
                className="um-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes um-spin { to { transform: rotate(360deg); } } .um-spin { animation: um-spin 1s linear infinite; }`}</style>
    </div>
  );
}
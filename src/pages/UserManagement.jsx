import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../Components/Navigation";
import { Search, MoreVertical, Eye, UserX, UserCheck, Trash2, Loader2, Mail } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./UserManagement.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);
const canDelete    = (r) => isSuperAdmin(r);

const statusConfig = {
  active:    { bg: "#d1fae5", text: "#065f46", icon: "●", label: "Active"    },
  inactive:  { bg: "#f3f4f6", text: "#4b5563", icon: "●", label: "Inactive"  },
  blocked:   { bg: "#fee2e2", text: "#991b1b", icon: "●", label: "Blocked"   },
  suspended: { bg: "#fee2e2", text: "#991b1b", icon: "●", label: "Suspended" },
};
const fallbackStatus = { bg: "#f3f4f6", text: "#374151", icon: "*", label: "Unknown" };
const getStatus = (s) => statusConfig[s?.toLowerCase?.()] ?? fallbackStatus;

const userTypeConfig = {
  vendor:   { bg: "#f3e8ff", text: "#6b21a8", icon: "🏢", label: "Vendor"   },
  customer: { bg: "#eff6ff", text: "#0c4a6e", icon: "👤", label: "Customer" },
  admin:    { bg: "#fef3c7", text: "#92400e", icon: "👑", label: "Admin"    },
};
const fallbackType = { bg: "#f3f4f6", text: "#374151", icon: "*", label: "Unknown" };
const getType = (r) => userTypeConfig[r?.toLowerCase?.()] ?? fallbackType;

/* ── Action menu ──────────────────────────────────────────────────────── */
function ActionMenu({ user, role, token, onStatusChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const doRequest = async (url, method = "PATCH") => {
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

  const isBlocked = ["blocked", "suspended"].includes(user.status?.toLowerCase());

  const handleBlock = async () => {
    const ok = await doRequest(`${BASE_URL}/admin/users/${user.id}/block`);
    ok ? onStatusChange(user.id, "blocked") : alert("Failed to block user");
    setOpen(false);
  };

  const handleUnblock = async () => {
    const ok = await doRequest(`${BASE_URL}/admin/users/${user.id}/unblock`);
    ok ? onStatusChange(user.id, "active") : alert("Failed to unblock user");
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete "${user.name}"?`)) return;
    const ok = await doRequest(`${BASE_URL}/admin/customers/${user.id}`, "DELETE");
    ok ? onDelete(user.id) : alert("Failed to delete user");
    setOpen(false);
  };

  const actions = [
    { icon: <Eye size={15} />,        label: "View Profile", color: "#374151", onClick: () => { alert(`Viewing: ${user.name}`); setOpen(false); }, show: true },
    { icon: <UserX size={15} />,      label: "Block User",   color: "#f59e0b", onClick: handleBlock,   show: canManage(role) && !isBlocked },
    { icon: <UserCheck size={15} />,  label: "Unblock User", color: "#10b981", onClick: handleUnblock, show: canManage(role) && isBlocked },
    { icon: <Trash2 size={15} />,     label: "Delete User",  color: "#ef4444", onClick: handleDelete,  show: canDelete(role), divider: true },
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
export default function UserManagement() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [users,        setUsers]        = useState([]);
  const [dataLoading,  setDataLoading]  = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType,   setFilterType]   = useState("all");

  useEffect(() => {
    if (!role || !token) return;
    (async () => {
      setDataLoading(true);
      try {
        const res  = await fetch(`${BASE_URL}/admin/customers`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Customers ${res.status}`);
        const data = await res.json();
        const raw  = data?.customers ?? data?.users ?? data?.data ?? (Array.isArray(data) ? data : []);

        setUsers(raw.map((u) => ({
          id:         u.id,
          name:       u.name       ?? "Unknown",
          email:      u.email      ?? "",
          role:       u.role       ?? "customer",
          status:     u.status     ?? "active",
          joined:     u.created_at ?? null,
          orders:     u.orders_count ?? 0,
          lastActive: u.last_active ?? u.updated_at ?? "—",
        })));
      } catch (err) {
        console.error("Users fetch error:", err);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [role]);

  const handleStatusChange = (id, status) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));

  const handleDelete = (id) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  const filtered = users.filter((u) => {
    const match   = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const bySt    = filterStatus === "all" || u.status === filterStatus;
    const byType  = filterType   === "all" || u.role   === filterType;
    return match && bySt && byType;
  });

  const statuses  = [...new Set(users.map((u) => u.status))];
  const roleTypes = [...new Set(users.map((u) => u.role))];

  const activeCount = users.filter((u) => u.status === "active").length;
  const vendorCount = users.filter((u) => u.role   === "vendor").length;
  const totalOrders = users.reduce((s, u) => s + (u.orders || 0), 0);

  return (
    <>
      <Navigation hideCart hideLocation hideProfile />
      <div className="users-page container mt-4 mb-5">

        <div className="users-header">
          <div>
            <h1 className="users-title">User Management</h1>
            <p className="users-subtitle">View all users, manage accounts and monitor activity</p>
          </div>
          <button type="button" className="users-back-btn" onClick={() => navigate("/admin")}>
            ← Back to Admin
          </button>
        </div>

        <div className="users-stats">
          <div className="user-stat">
            <p className="user-stat__label">Total Users</p>
            <p className="user-stat__value">{users.length}</p>
          </div>
          <div className="user-stat">
            <p className="user-stat__label">Active Users</p>
            <p className="user-stat__value">{activeCount}</p>
          </div>
          <div className="user-stat">
            <p className="user-stat__label">Vendors</p>
            <p className="user-stat__value">{vendorCount}</p>
          </div>
          {canManage(role) && (
            <div className="user-stat">
              <p className="user-stat__label">Total Transactions</p>
              <p className="user-stat__value">{totalOrders.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="users-controls">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search by name or email..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              {statuses.map((s) => <option key={s} value={s}>{getStatus(s).label}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              <option value="all">All Types</option>
              {roleTypes.map((t) => <option key={t} value={t}>{getType(t).label}</option>)}
            </select>
          </div>
        </div>

        <div className="users-table-wrapper">
          {dataLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Loading users…
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Type</th><th>Status</th>
                  <th>Joined</th><th>Orders</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((user) => {
                  const st = getStatus(user.status);
                  const tp = getType(user.role);
                  return (
                    <tr key={user.id}>
                      <td className="table-name"><strong>{user.name}</strong></td>
                      <td>
                        <div className="email-cell">
                          <Mail size={14} /><span>{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="type-badge" style={{ backgroundColor: tp.bg, color: tp.text }}>
                          {tp.icon} {tp.label}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: st.bg, color: st.text }}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td>{user.joined ? new Date(user.joined).toLocaleDateString() : "N/A"}</td>
                      <td className="table-orders"><strong>{user.orders}</strong></td>
                      <td>
                        <ActionMenu user={user} role={role} token={token}
                          onStatusChange={handleStatusChange} onDelete={handleDelete} />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="7" className="table-empty">No users found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && !dataLoading && (
          <div className="pagination">
            <button className="pagination-btn">← Previous</button>
            <span className="pagination-info">Showing {filtered.length} of {users.length}</span>
            <button className="pagination-btn">Next →</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  active:    { bg: "#d1fae5", text: "#065f46", icon: "●", label: "userManagement.status.active"    },
  inactive:  { bg: "#f3f4f6", text: "#4b5563", icon: "●", label: "userManagement.status.inactive"  },
  blocked:   { bg: "#fee2e2", text: "#991b1b", icon: "●", label: "userManagement.status.blocked"   },
  suspended: { bg: "#fee2e2", text: "#991b1b", icon: "●", label: "userManagement.status.suspended" },
};
const fallbackStatus = { bg: "#f3f4f6", text: "#374151", icon: "*", label: "userManagement.status.unknown" };
const getStatus = (s) => statusConfig[s?.toLowerCase?.()] ?? fallbackStatus;

const userTypeConfig = {
  vendor:   { bg: "#f3e8ff", text: "#6b21a8", icon: "🏢", label: "userManagement.type.vendor"   },
  customer: { bg: "#eff6ff", text: "#0c4a6e", icon: "👤", label: "userManagement.type.customer" },
  admin:    { bg: "#fef3c7", text: "#92400e", icon: "👑", label: "userManagement.type.admin"    },
};
const fallbackType = { bg: "#f3f4f6", text: "#374151", icon: "*", label: "userManagement.type.unknown" };
const getType = (r) => userTypeConfig[r?.toLowerCase?.()] ?? fallbackType;

/* ── ACTION MENU ── */
function ActionMenu({ user, role, token, onStatusChange, onDelete }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
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

  const isBlocked = ["blocked", "suspended"].includes(user.status?.toLowerCase());

  const handleBlock = async () => {
    const ok = await doRequest(`${BASE_URL}/admin/users/${user.id}/block`, "PATCH");
    if (ok) onStatusChange(user.id, "blocked");
    else alert(t("userManagement.alert.blockError"));
    setOpen(false);
  };

  const handleUnblock = async () => {
    const ok = await doRequest(`${BASE_URL}/admin/users/${user.id}/unblock`, "PATCH");
    if (ok) onStatusChange(user.id, "active");
    else alert(t("userManagement.alert.unblockError"));
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(t("userManagement.confirm.deleteUser", { name: user.name }))) return;
    const ok = await doRequest(`${BASE_URL}/admin/customers/${user.id}`, "DELETE");
    if (ok) onDelete(user.id);
    else alert(t("userManagement.alert.deleteError"));
    setOpen(false);
  };

  const actions = [
    { icon: <Eye size={15} />,         label: t("userManagement.actions.viewRecord"), color: "#374151", onClick: () => { alert(t("userManagement.alert.viewUser", { name: user.name })); setOpen(false); }, show: true },
    { icon: <UserX size={15} />,      label: t("userManagement.actions.blockAccess"),   color: "#f59e0b", onClick: handleBlock,   show: canManage(role) && !isBlocked },
    { icon: <UserCheck size={15} />,  label: t("userManagement.actions.unblockAccess"), color: "#10b981", onClick: handleUnblock, show: canManage(role) && isBlocked },
    { icon: <Trash2 size={15} />,      label: t("userManagement.actions.deleteRecord"),  color: "#ef4444", onClick: handleDelete,  show: canDelete(role), divider: true },
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
export default function UserManagement() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role, token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const [users,        setUsers]        = useState([]);
  const [dataLoading,  setDataLoading]  = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType,   setFilterType]   = useState("all");

  useEffect(() => {
    if (!token) return;
    (async () => {
      setDataLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/admin/customers`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
        const data = await res.json();
        const raw  = data?.customers ?? data?.users ?? data?.data ?? (Array.isArray(data) ? data : []);

        setUsers(raw.map((u) => ({
          id:         u.id,
          name:       u.name       ?? "System Client",
          email:      u.email      ?? "No Email Address",
          role:       u.role       ?? "customer",
          status:     u.status     ?? "active",
          joined:     u.created_at ?? null,
          orders:     u.orders_count ?? 0,
        })));
      } catch (err) {
        console.error("Live Synchronization Error:", err);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [token]);

  const handleStatusChange = (id, status) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));

  const handleDelete = (id) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  const filtered = users.filter((u) => {
    const match   = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const bySt    = filterStatus === "all" || u.status === filterStatus;
    const byType  = filterType   === "all" || u.role   === filterType;
    return match && bySt && byType;
  });

  const statuses  = [...new Set(users.map((u) => u.status))];
  const roleTypes = [...new Set(users.map((u) => u.role))];

  return (
    <>
      <Navigation hideCart hideLocation hideProfile />
      <div className="users-page container mt-4 mb-5">

        <div className="users-header">
          <div>
            <h1 className="users-title">{t("userManagement.title")}</h1>
            <p className="users-subtitle">{t("userManagement.subtitle")}</p>
          </div>
          <button type="button" className="users-back-btn" onClick={() => navigate("/admin") }>
            {t("userManagement.backToDashboard")}
          </button>
        </div>

        <div className="users-stats">
          <div className="user-stat">
            <p className="user-stat__label">{t("userManagement.stats.totalRegistries")}</p>
            <p className="user-stat__value">{users.length}</p>
          </div>
          <div className="user-stat">
            <p className="user-stat__label">{t("userManagement.stats.activeAccounts")}</p>
            <p className="user-stat__value">{users.filter((u) => u.status === "active").length}</p>
          </div>
          <div className="user-stat">
            <p className="user-stat__label">{t("userManagement.stats.activeVendors")}</p>
            <p className="user-stat__value">{users.filter((u) => u.role === "vendor").length}</p>
          </div>
        </div>

        <div className="users-controls">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder={t("userManagement.searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">{t("userManagement.filters.allAccessStates")}</option>
              {statuses.map((s) => <option key={s} value={s}>{t(getStatus(s).label)}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              <option value="all">{t("userManagement.filters.allClearanceTiers")}</option>
              {roleTypes.map((tpe) => <option key={tpe} value={tpe}>{t(getType(tpe).label)}</option>)}
            </select>
          </div>
        </div>

        <div className="users-table-wrapper">
          {dataLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <Loader2 size={20} className="spin" /> {t("userManagement.loading")}
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>{t("userManagement.table.identityLabel")}</th><th>{t("userManagement.table.emailRoute")}</th><th>{t("userManagement.table.tierClassification")}</th><th>{t("userManagement.table.stateStatus")}</th><th>{t("userManagement.table.joined")}</th><th>{t("userManagement.table.actions")}</th>
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
                          {tp.icon} {t(tp.label)}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: st.bg, color: st.text }}>
                          {st.icon} {t(st.label)}
                        </span>
                      </td>
                      <td>{user.joined ? new Date(user.joined).toLocaleDateString() : t("userManagement.na")}</td>
                      <td>
                        <ActionMenu user={user} role={role} token={token} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="6" className="table-empty">{t("userManagement.table.empty")}</td></tr>
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

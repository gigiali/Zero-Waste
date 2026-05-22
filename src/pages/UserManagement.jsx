import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../Components/Navigation";
import { Search, MoreVertical, Mail, Eye, Edit, UserX, UserCheck, Trash2 } from "lucide-react";
import "./UserManagement.css";

const statusConfig = {
  Active:    { bg: "#d1fae5", text: "#065f46", icon: "●" },
  Inactive:  { bg: "#f3f4f6", text: "#4b5563", icon: "●" },
  Suspended: { bg: "#fee2e2", text: "#991b1b", icon: "●" },
};

const fallbackStatus = { bg: "#f3f4f6", text: "#374151", icon: "*" };

const userTypeConfig = {
  "Business Owner": { bg: "#f3e8ff", text: "#6b21a8", icon: "🏢" },
  "Customer":       { bg: "#eff6ff", text: "#0c4a6e", icon: "👤" },
  "Admin":          { bg: "#fef3c7", text: "#92400e", icon: "👑" },
  "Vendor":         { bg: "#f3e8ff", text: "#6b21a8", icon: "🏢" },
};

const fallbackUserType = { bg: "#f3f4f6", text: "#374151", icon: "*" };

function ActionMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const actions = [
    { icon: <Eye size={15} />,       label: "View Profile",   color: "#374151", onClick: () => alert(`Viewing: ${user.name}`) },
    { icon: <Edit size={15} />,      label: "Edit User",      color: "#374151", onClick: () => alert(`Editing: ${user.name}`) },
    { icon: <UserX size={15} />,     label: "Suspend User",   color: "#f59e0b", onClick: () => alert(`Suspended: ${user.name}`) },
    { icon: <UserCheck size={15} />, label: "Activate User",  color: "#10b981", onClick: () => alert(`Activated: ${user.name}`) },
    { icon: <Trash2 size={15} />,    label: "Delete User",    color: "#ef4444", onClick: () => alert(`Deleted: ${user.name}`), divider: true },
  ];

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        className="action-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Actions"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="action-dropdown">
          {actions.map((action, i) => (
            <React.Fragment key={i}>
              {action.divider && <div className="action-dropdown__divider" />}
              <button
                className="action-dropdown__item"
                style={{ color: action.color }}
                onClick={() => { action.onClick(); setOpen(false); }}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        const response = await fetch("/api/admin/users", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.users) {
            const transformedUsers = data.users.map((user) => ({
              id: user.id,
              name: user.name || "Unknown",
              email: user.email || "",
              userType: user.role === "vendor" ? "Business Owner" : user.role === "admin" ? "Admin" : "Customer",
              status: user.status || "Active",
              joined: user.created_at || "N/A",
              orders: user.orders_count || 0,
              lastActive: user.last_active || "Unknown",
            }));
            setUsers(transformedUsers);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchMatch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = filterStatus === "all" || user.status === filterStatus;
    const typeMatch = filterType === "all" || user.userType === filterType;
    return searchMatch && statusMatch && typeMatch;
  });

  const userTypes = [...new Set(users.map((u) => u.userType))];
  const statuses = [...new Set(users.map((u) => u.status))];

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const businessOwners = users.filter((u) => u.userType === "Business Owner").length;
  const totalTransactions = users.reduce((sum, u) => sum + u.orders, 0);

  return (
    <>
      <Navigation hideCart hideLocation hideProfile />
      <div className="users-page container mt-4 mb-5">

        {/* Header */}
        <div className="users-header">
          <div>
            <h1 className="users-title">User Management</h1>
            <p className="users-subtitle">View all users, manage accounts and monitor activity</p>
          </div>
          <button type="button" className="users-back-btn" onClick={() => navigate("/admin")}>
            ← Back to Admin
          </button>
        </div>

        {/* Stats */}
        <div className="users-stats">
          <div className="user-stat">
            <p className="user-stat__label">Total Users</p>
            <p className="user-stat__value">{totalUsers}</p>
          </div>
          <div className="user-stat">
            <p className="user-stat__label">Active Users</p>
            <p className="user-stat__value">{activeUsers}</p>
          </div>
          <div className="user-stat">
            <p className="user-stat__label">Business Owners</p>
            <p className="user-stat__value">{businessOwners}</p>
          </div>
          <div className="user-stat">
            <p className="user-stat__label">Total Transactions</p>
            <p className="user-stat__value">{totalTransactions}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="users-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              <option value="all">All Types</option>
              {userTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Type</th><th>Status</th>
                <th>Joined</th><th>Orders</th><th>Last Active</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="table-name"><strong>{user.name}</strong></td>
                    <td>
                      <div className="email-cell">
                        <Mail size={14} /><span>{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge"
                        style={{ backgroundColor: (userTypeConfig[user.userType] || fallbackUserType).bg, color: (userTypeConfig[user.userType] || fallbackUserType).text }}>
                        {(userTypeConfig[user.userType] || fallbackUserType).icon} {user.userType || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge"
                        style={{ backgroundColor: (statusConfig[user.status] || fallbackStatus).bg, color: (statusConfig[user.status] || fallbackStatus).text }}>
                        {(statusConfig[user.status] || fallbackStatus).icon} {user.status || "Unknown"}
                      </span>
                    </td>
                    <td>{user.joined && user.joined !== "N/A" ? new Date(user.joined).toLocaleDateString() : "N/A"}</td>
                    <td className="table-orders"><strong>{Number(user.orders || 0)}</strong></td>
                    <td className="table-lastactive">{user.lastActive}</td>
                    <td><ActionMenu user={user} /></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="table-empty">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="pagination">
            <button className="pagination-btn">← Previous</button>
            <span className="pagination-info">Page 1 of 1</span>
            <button className="pagination-btn">Next →</button>
          </div>
        )}
      </div>
    </>
  );
}

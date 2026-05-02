import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../Components/Navigation";
import { Search, MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import "./ManageBusinesses.css";

const businessesData = [
  { id: 1, name: "Urban Bakery",      category: "Bakery",      status: "Approved",     rating: 4.8, users: 245, joined: "2024-01-15", revenue: 12450  },
  { id: 2, name: "Green Market",      category: "Supermarket", status: "Pending",      rating: 4.5, users: 189, joined: "2024-02-20", revenue: 8920   },
  { id: 3, name: "Bella Restaurant",  category: "Restaurant",  status: "Approved",     rating: 4.9, users: 512, joined: "2024-01-05", revenue: 24680  },
  { id: 4, name: "Sunrise Hotel",     category: "Hotel",       status: "Under Review", rating: 4.3, users: 156, joined: "2024-03-10", revenue: 15240  },
  { id: 5, name: "Fresh Bakehouse",   category: "Bakery",      status: "Approved",     rating: 4.7, users: 320, joined: "2024-02-01", revenue: 18900  },
  { id: 6, name: "Quick Bites Cafe",  category: "Cafe",        status: "Approved",     rating: 4.6, users: 278, joined: "2024-01-28", revenue: 14560  },
];

const statusConfig = {
  Approved:      { bg: "#d1fae5", text: "#065f46", icon: "✓"  },
  Pending:       { bg: "#fef9c3", text: "#854d0e", icon: "⏳" },
  "Under Review":{ bg: "#dbeafe", text: "#1e40af", icon: "⚙️" },
  Rejected:      { bg: "#fee2e2", text: "#991b1b", icon: "✗"  },
};

const totalRevenue = businessesData.reduce((sum, b) => sum + b.revenue, 0);
const formatEGP = (n) =>
  n >= 1000 ? `EGP ${(n / 1000).toFixed(1)}K` : `EGP ${n.toLocaleString()}`;

function ActionMenu({ business }) {
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
    { icon: <Eye size={15} />,       label: "View Details",  color: "#374151", onClick: () => alert(`Viewing: ${business.name}`) },
    { icon: <Edit size={15} />,      label: "Edit Business", color: "#374151", onClick: () => alert(`Editing: ${business.name}`) },
    { icon: <CheckCircle size={15}/>,label: "Approve",       color: "#10b981", onClick: () => alert(`Approved: ${business.name}`) },
    { icon: <XCircle size={15} />,   label: "Reject",        color: "#ef4444", onClick: () => alert(`Rejected: ${business.name}`) },
    { icon: <Trash2 size={15} />,    label: "Delete",        color: "#ef4444", onClick: () => alert(`Deleted: ${business.name}`), divider: true },
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

export default function ManageBusinesses() {
  const navigate = useNavigate();
  const [searchTerm,      setSearchTerm]      = useState("");
  const [filterStatus,    setFilterStatus]    = useState("all");
  const [filterCategory,  setFilterCategory]  = useState("all");

  const filteredBusinesses = businessesData.filter((business) => {
    const searchMatch   = business.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch   = filterStatus   === "all" || business.status   === filterStatus;
    const categoryMatch = filterCategory === "all" || business.category === filterCategory;
    return searchMatch && statusMatch && categoryMatch;
  });

  const categories = [...new Set(businessesData.map((b) => b.category))];
  const statuses   = [...new Set(businessesData.map((b) => b.status))];

  return (
    <>
      <Navigation hideCart hideLocation hideProfile />
      <div className="businesses-page container mt-4 mb-5">

        {/* Header */}
        <div className="businesses-header">
          <div>
            <h1 className="businesses-title">Manage Businesses</h1>
            <p className="businesses-subtitle">View all registered businesses and manage their status</p>
          </div>
          <button type="button" className="businesses-back-btn" onClick={() => navigate("/admin")}>
            ← Back to Admin
          </button>
        </div>

        {/* Stats */}
        <div className="businesses-stats">
          <div className="biz-stat">
            <p className="biz-stat__label">Total Businesses</p>
            <p className="biz-stat__value">{businessesData.length}</p>
          </div>
          <div className="biz-stat">
            <p className="biz-stat__label">Approved</p>
            <p className="biz-stat__value">{businessesData.filter((b) => b.status === "Approved").length}</p>
          </div>
          <div className="biz-stat">
            <p className="biz-stat__label">Pending Review</p>
            <p className="biz-stat__value">
              {businessesData.filter((b) => b.status === "Pending" || b.status === "Under Review").length}
            </p>
          </div>
          <div className="biz-stat">
            <p className="biz-stat__label">Total Revenue</p>
            <p className="biz-stat__value">{formatEGP(totalRevenue)}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="businesses-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="businesses-table-wrapper">
          <table className="businesses-table">
            <thead>
              <tr>
                <th>Business Name</th><th>Category</th><th>Status</th>
                <th>Rating</th><th>Users</th><th>Joined</th><th>Revenue</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBusinesses.length > 0 ? (
                filteredBusinesses.map((business) => (
                  <tr key={business.id}>
                    <td className="table-name"><strong>{business.name}</strong></td>
                    <td>{business.category}</td>
                    <td>
                      <span className="status-badge"
                        style={{ backgroundColor: statusConfig[business.status].bg, color: statusConfig[business.status].text }}>
                        {statusConfig[business.status].icon} {business.status}
                      </span>
                    </td>
                    <td><span className="stars">★ {business.rating}</span></td>
                    <td>{business.users.toLocaleString()}</td>
                    <td>{new Date(business.joined).toLocaleDateString()}</td>
                    <td className="table-revenue">EGP {business.revenue.toLocaleString()}</td>
                    <td>
                      <ActionMenu business={business} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="table-empty">No businesses found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredBusinesses.length > 0 && (
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
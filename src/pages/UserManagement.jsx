import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../Components/Navigation";
import { Search, MoreVertical, Mail } from "lucide-react";
import "./UserManagement.css";

const usersData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    userType: "Business Owner",
    status: "Active",
    joined: "2024-01-10",
    orders: 45,
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@example.com",
    userType: "Customer",
    status: "Active",
    joined: "2024-01-15",
    orders: 12,
    lastActive: "30 minutes ago",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    userType: "Business Owner",
    status: "Active",
    joined: "2024-02-05",
    orders: 78,
    lastActive: "1 hour ago",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@example.com",
    userType: "Customer",
    status: "Inactive",
    joined: "2024-01-20",
    orders: 5,
    lastActive: "1 week ago",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david@example.com",
    userType: "Business Owner",
    status: "Active",
    joined: "2024-02-15",
    orders: 34,
    lastActive: "3 hours ago",
  },
  {
    id: 6,
    name: "Lisa Garcia",
    email: "lisa@example.com",
    userType: "Customer",
    status: "Active",
    joined: "2024-03-01",
    orders: 8,
    lastActive: "15 minutes ago",
  },
];

const statusConfig = {
  Active: { bg: "#d1fae5", text: "#065f46", icon: "●" },
  Inactive: { bg: "#f3f4f6", text: "#4b5563", icon: "●" },
  Suspended: { bg: "#fee2e2", text: "#991b1b", icon: "●" },
};

const userTypeConfig = {
  "Business Owner": { bg: "#f3e8ff", text: "#6b21a8", icon: "🏢" },
  "Customer": { bg: "#eff6ff", text: "#0c4a6e", icon: "👤" },
  "Admin": { bg: "#fef3c7", text: "#92400e", icon: "👑" },
};

export default function UserManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const filteredUsers = usersData.filter(user => {
    const searchMatch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === "all" || user.status === filterStatus;
    const typeMatch = filterType === "all" || user.userType === filterType;
    return searchMatch && statusMatch && typeMatch;
  });

  const userTypes = [...new Set(usersData.map(u => u.userType))];
  const statuses = [...new Set(usersData.map(u => u.status))];

  return (
    <>
      <Navigation />
      <div className="users-page container mt-4 mb-5">
        {/* Header */}
        <div className="users-header">
          <div>
            <h1 className="users-title">User Management</h1>
            <p className="users-subtitle">
              View all users, manage accounts and monitor activity
            </p>
          </div>
          <button
            type="button"
            className="users-back-btn"
            onClick={() => navigate("/admin")}
          >
            ← Back to Admin
          </button>
        </div>

        {/* Stats */}
        <div className="users-stats">
          <div className="user-stat">
            <p className="user-stat__label">Total Users</p>
            <p className="user-stat__value">{usersData.length}</p>
          </div>
          <div className="user-stat">
            <p className="user-stat__label">Active Users</p>
            <p className="user-stat__value">{usersData.filter(u => u.status === "Active").length}</p>
          </div>
          <div className="user-stat">
            <p className="user-stat__label">Business Owners</p>
            <p className="user-stat__value">{usersData.filter(u => u.userType === "Business Owner").length}</p>
          </div>
          <div className="user-stat">
            <p className="user-stat__label">Total Transactions</p>
            <p className="user-stat__value">{usersData.reduce((sum, u) => sum + u.orders, 0)}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="users-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              {userTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Orders</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="table-name">
                      <strong>{user.name}</strong>
                    </td>
                    <td>
                      <div className="email-cell">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className="type-badge"
                        style={{
                          backgroundColor: userTypeConfig[user.userType].bg,
                          color: userTypeConfig[user.userType].text
                        }}
                      >
                        {userTypeConfig[user.userType].icon} {user.userType}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{
                          backgroundColor: statusConfig[user.status].bg,
                          color: statusConfig[user.status].text
                        }}
                      >
                        {statusConfig[user.status].icon} {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.joined).toLocaleDateString()}</td>
                    <td className="table-orders">
                      <strong>{user.orders}</strong>
                    </td>
                    <td className="table-lastactive">{user.lastActive}</td>
                    <td>
                      <button className="action-menu-btn">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="table-empty">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

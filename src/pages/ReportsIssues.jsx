import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../Components/Navigation";
import { AlertCircle, CheckCircle, Clock, Zap } from "lucide-react";
import "./ReportsIssues.css";

const alertsData = [
  { 
    id: 1,
    color: "#ef4444", 
    icon: "🚫",
    message: "Inappropriate content reported", 
    time: "2 hours ago", 
    type: "Content",
    severity: "high",
    description: "User flagged offensive content in business listing"
  },
  { 
    id: 2,
    color: "#f59e0b", 
    icon: "⏳",
    message: "Business verification pending", 
    time: "5 hours ago", 
    type: "Verification",
    severity: "medium",
    description: "Document review in progress for new restaurant"
  },
  { 
    id: 3,
    color: "#f59e0b", 
    icon: "⭐",
    message: "Low rating alert for Pizza Corner", 
    time: "1 day ago", 
    type: "Quality",
    severity: "medium",
    description: "Business rating dropped below threshold"
  },
  { 
    id: 4,
    color: "#3b82f6", 
    icon: "⚙️",
    message: "System maintenance scheduled", 
    time: "2 days ago", 
    type: "System",
    severity: "low",
    description: "Planned maintenance on payment processing"
  },
];

export default function ReportsIssues() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  const filteredAlerts = alertsData.filter(alert => {
    const typeMatch = selectedType === "all" || alert.type === selectedType;
    const severityMatch = selectedSeverity === "all" || alert.severity === selectedSeverity;
    return typeMatch && severityMatch;
  });

  const severityConfig = {
    high: { bg: "#fee2e2", text: "#991b1b", label: "High" },
    medium: { bg: "#fef3c7", text: "#92400e", label: "Medium" },
    low: { bg: "#dbeafe", text: "#1e40af", label: "Low" },
  };

  return (
    <>
      <Navigation />
      <div className="reports-page container mt-4 mb-5">
        {/* Header */}
        <div className="reports-page__header">
          <div>
            <h1 className="reports-page__title">Reports & Issues</h1>
            <p className="reports-page__subtitle">
              Review flagged content, pending verifications, and platform incidents
            </p>
          </div>
          <button
            type="button"
            className="reports-page__back-btn"
            onClick={() => navigate("/admin")}
          >
            ← Back to Admin
          </button>
        </div>

        {/* Stats */}
        <div className="reports-stats">
          <div className="report-stat">
            <div className="stat-icon stat-icon--red">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="stat-label">Critical Issues</p>
              <p className="stat-value">{alertsData.filter(a => a.severity === "high").length}</p>
            </div>
          </div>

          <div className="report-stat">
            <div className="stat-icon stat-icon--orange">
              <Clock size={20} />
            </div>
            <div>
              <p className="stat-label">Pending Review</p>
              <p className="stat-value">{alertsData.filter(a => a.severity === "medium").length}</p>
            </div>
          </div>

          <div className="report-stat">
            <div className="stat-icon stat-icon--blue">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="stat-label">Total Reports</p>
              <p className="stat-value">{alertsData.length}</p>
            </div>
          </div>

          <div className="report-stat">
            <div className="stat-icon stat-icon--green">
              <Zap size={20} />
            </div>
            <div>
              <p className="stat-label">Resolution Rate</p>
              <p className="stat-value">94%</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="reports-filters">
          <div className="filter-group">
            <label className="filter-label">Report Type</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="Content">Content</option>
              <option value="Verification">Verification</option>
              <option value="Quality">Quality</option>
              <option value="System">System</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Severity</label>
            <select 
              value={selectedSeverity} 
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="reports-list-card">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="reports-list-item"
                style={{ borderBottom: alert.id !== filteredAlerts[filteredAlerts.length - 1].id ? "1px solid #f1f5f9" : "none" }}
              >
                <div className="reports-list-item__icon-wrapper">
                  <div
                    className="reports-list-item__icon"
                    style={{ borderColor: alert.color, color: alert.color }}
                  >
                    {alert.icon}
                  </div>
                </div>

                <div className="reports-list-item__content">
                  <div className="reports-list-item__title">{alert.message}</div>
                  <div className="reports-list-item__description">{alert.description}</div>
                  <div className="reports-list-item__meta">
                    <span>{alert.time}</span>
                    <span className="reports-list-item__dot">•</span>
                    <span>{alert.type}</span>
                  </div>
                </div>

                <div className="reports-list-item__status">
                  <span 
                    className="severity-badge"
                    style={{
                      backgroundColor: severityConfig[alert.severity].bg,
                      color: severityConfig[alert.severity].text
                    }}
                  >
                    {severityConfig[alert.severity].label}
                  </span>
                </div>

                <button type="button" className="reports-list-item__action">
                  Review
                </button>
              </div>
            ))
          ) : (
            <div className="reports-empty">
              <p>✓ No issues found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

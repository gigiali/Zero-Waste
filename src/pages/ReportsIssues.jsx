import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../Components/Navigation";
import { AlertCircle, CheckCircle, Clock, Zap, X } from "lucide-react";
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
    description: "User flagged offensive content in business listing",
    reportedBy: "customer_user_42",
    affectedEntity: "Urban Bakery",
    status: "Open",
  },
  {
    id: 2,
    color: "#f59e0b",
    icon: "⏳",
    message: "Business verification pending",
    time: "5 hours ago",
    type: "Verification",
    severity: "medium",
    description: "Document review in progress for new restaurant",
    reportedBy: "system",
    affectedEntity: "Bella Restaurant",
    status: "In Progress",
  },
  {
    id: 3,
    color: "#f59e0b",
    icon: "⭐",
    message: "Low rating alert for Pizza Corner",
    time: "1 day ago",
    type: "Quality",
    severity: "medium",
    description: "Business rating dropped below threshold",
    reportedBy: "system",
    affectedEntity: "Pizza Corner",
    status: "Open",
  },
  {
    id: 4,
    color: "#3b82f6",
    icon: "⚙️",
    message: "System maintenance scheduled",
    time: "2 days ago",
    type: "System",
    severity: "low",
    description: "Planned maintenance on payment processing",
    reportedBy: "admin",
    affectedEntity: "Payment Gateway",
    status: "Scheduled",
  },
];

const severityConfig = {
  high:   { bg: "#fee2e2", text: "#991b1b", label: "High"   },
  medium: { bg: "#fef3c7", text: "#92400e", label: "Medium" },
  low:    { bg: "#dbeafe", text: "#1e40af", label: "Low"    },
};

const statusColors = {
  Open:        { bg: "#fee2e2", text: "#991b1b" },
  "In Progress":{ bg: "#fef3c7", text: "#92400e" },
  Scheduled:   { bg: "#dbeafe", text: "#1e40af" },
  Resolved:    { bg: "#d1fae5", text: "#065f46" },
};

// ✅ Fix 3: Review modal with real report data
function ReviewModal({ alert, onClose, onResolve }) {
  const [note, setNote] = useState("");

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "white", borderRadius: "16px", width: "90%", maxWidth: "520px",
        padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Modal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.3rem", color: "#0f172a" }}>Review Report</h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9rem" }}>ID #{alert.id} · {alert.time}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
            <X size={22} />
          </button>
        </div>

        {/* Report details */}
        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "1.5rem" }}>{alert.icon}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>{alert.message}</p>
              <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#64748b" }}>{alert.description}</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem" }}>
            <div><span style={{ color: "#94a3b8" }}>Type: </span><strong>{alert.type}</strong></div>
            <div>
              <span style={{ color: "#94a3b8" }}>Severity: </span>
              <span style={{
                background: severityConfig[alert.severity].bg,
                color: severityConfig[alert.severity].text,
                padding: "1px 8px", borderRadius: "6px", fontWeight: 600,
              }}>
                {severityConfig[alert.severity].label}
              </span>
            </div>
            <div><span style={{ color: "#94a3b8" }}>Reported by: </span><strong>{alert.reportedBy}</strong></div>
            <div><span style={{ color: "#94a3b8" }}>Affected: </span><strong>{alert.affectedEntity}</strong></div>
            <div>
              <span style={{ color: "#94a3b8" }}>Status: </span>
              <span style={{
                background: statusColors[alert.status]?.bg || "#f1f5f9",
                color: statusColors[alert.status]?.text || "#475569",
                padding: "1px 8px", borderRadius: "6px", fontWeight: 600,
              }}>
                {alert.status}
              </span>
            </div>
          </div>
        </div>

        {/* Admin note */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>
            Admin Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about your decision..."
            rows={3}
            style={{
              width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
              borderRadius: "10px", fontSize: "0.9rem", resize: "vertical",
              outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose}
            style={{
              flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb",
              borderRadius: "8px", background: "white", color: "#374151",
              fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
            }}>
            Close
          </button>
          <button
            onClick={() => onResolve(alert.id, note)}
            style={{
              flex: 1, padding: "0.65rem", border: "none",
              borderRadius: "8px", background: "#10b981", color: "white",
              fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
            }}>
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsIssues() {
  const navigate = useNavigate();
  const [selectedType,     setSelectedType]     = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [alerts,           setAlerts]           = useState(alertsData);
  const [reviewingAlert,   setReviewingAlert]   = useState(null); // ✅ Fix 3: which alert is open

  const filteredAlerts = alerts.filter((alert) => {
    const typeMatch     = selectedType     === "all" || alert.type     === selectedType;
    const severityMatch = selectedSeverity === "all" || alert.severity === selectedSeverity;
    return typeMatch && severityMatch;
  });

  // ✅ Mark alert as resolved and close modal
  const handleResolve = (id, note) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Resolved", adminNote: note } : a))
    );
    setReviewingAlert(null);
  };

  return (
    <>
      <Navigation hideCart hideLocation hideProfile />
      <div className="reports-page container mt-4 mb-5">

        {/* Header */}
        <div className="reports-page__header">
          <div>
            <h1 className="reports-page__title">Reports &amp; Issues</h1>
            <p className="reports-page__subtitle">
              Review flagged content, pending verifications, and platform incidents
            </p>
          </div>
          <button type="button" className="reports-page__back-btn" onClick={() => navigate("/admin")}>
            ← Back to Admin
          </button>
        </div>

        {/* ✅ Dynamic stats */}
        <div className="reports-stats">
          <div className="report-stat">
            <div className="stat-icon stat-icon--red"><AlertCircle size={20} /></div>
            <div>
              <p className="stat-label">Critical Issues</p>
              <p className="stat-value">{alerts.filter((a) => a.severity === "high").length}</p>
            </div>
          </div>
          <div className="report-stat">
            <div className="stat-icon stat-icon--orange"><Clock size={20} /></div>
            <div>
              <p className="stat-label">Pending Review</p>
              <p className="stat-value">{alerts.filter((a) => a.severity === "medium").length}</p>
            </div>
          </div>
          <div className="report-stat">
            <div className="stat-icon stat-icon--blue"><CheckCircle size={20} /></div>
            <div>
              <p className="stat-label">Total Reports</p>
              <p className="stat-value">{alerts.length}</p>
            </div>
          </div>
          <div className="report-stat">
            <div className="stat-icon stat-icon--green"><Zap size={20} /></div>
            <div>
              <p className="stat-label">Resolution Rate</p>
              {/* ✅ Dynamic: resolved / total */}
              <p className="stat-value">
                {alerts.length > 0
                  ? Math.round((alerts.filter((a) => a.status === "Resolved").length / alerts.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="reports-filters">
          <div className="filter-group">
            <label className="filter-label">Report Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="filter-select">
              <option value="all">All Types</option>
              <option value="Content">Content</option>
              <option value="Verification">Verification</option>
              <option value="Quality">Quality</option>
              <option value="System">System</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Severity</label>
            <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)} className="filter-select">
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Reports list */}
        <div className="reports-list-card">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert, idx) => (
              <div
                key={alert.id}
                className="reports-list-item"
                style={{ borderBottom: idx !== filteredAlerts.length - 1 ? "1px solid #f1f5f9" : "none" }}
              >
                <div className="reports-list-item__icon-wrapper">
                  <div className="reports-list-item__icon" style={{ borderColor: alert.color, color: alert.color }}>
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
                    {alert.status === "Resolved" && (
                      <>
                        <span className="reports-list-item__dot">•</span>
                        <span style={{ color: "#10b981", fontWeight: 600 }}>✓ Resolved</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="reports-list-item__status">
                  <span
                    className="severity-badge"
                    style={{ backgroundColor: severityConfig[alert.severity].bg, color: severityConfig[alert.severity].text }}
                  >
                    {severityConfig[alert.severity].label}
                  </span>
                </div>

                {/* ✅ Fix 3: Review button opens modal with real data */}
                <button
                  type="button"
                  className="reports-list-item__action"
                  disabled={alert.status === "Resolved"}
                  style={{ opacity: alert.status === "Resolved" ? 0.45 : 1, cursor: alert.status === "Resolved" ? "default" : "pointer" }}
                  onClick={() => setReviewingAlert(alert)}
                >
                  {alert.status === "Resolved" ? "Resolved" : "Review"}
                </button>
              </div>
            ))
          ) : (
            <div className="reports-empty"><p>✓ No issues found</p></div>
          )}
        </div>
      </div>

      {/* ✅ Fix 3: Review modal */}
      {reviewingAlert && (
        <ReviewModal
          alert={reviewingAlert}
          onClose={() => setReviewingAlert(null)}
          onResolve={handleResolve}
        />
      )}
    </>
  );
}

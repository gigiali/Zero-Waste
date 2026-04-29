import React from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../Components/Navigation";
import "./ReportsIssues.css";

const alerts = [
  { color: "#ef4444", message: "Inappropriate content reported", time: "2 hours ago", type: "Content" },
  { color: "#f59e0b", message: "Business verification pending", time: "5 hours ago", type: "Verification" },
  { color: "#f59e0b", message: "Low rating alert for Pizza Corner", time: "1 day ago", type: "Quality" },
  { color: "#3b82f6", message: "System maintenance scheduled", time: "2 days ago", type: "System" },
];

export default function ReportsIssues() {
  const navigate = useNavigate();

  return (
    <>
      <Navigation />
      <div className="reports-page container mt-4 mb-5">
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
            Back to Admin
          </button>
        </div>

        <div className="reports-list-card">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="reports-list-item"
              style={{ borderBottom: i < alerts.length - 1 ? "1px solid #f1f5f9" : "none" }}
            >
              <div
                className="reports-list-item__icon"
                style={{ borderColor: alert.color, color: alert.color }}
              >
                !
              </div>
              <div className="reports-list-item__content">
                <div className="reports-list-item__title">{alert.message}</div>
                <div className="reports-list-item__meta">
                  <span>{alert.time}</span>
                  <span className="reports-list-item__dot">•</span>
                  <span>{alert.type}</span>
                </div>
              </div>
              <button type="button" className="reports-list-item__action">
                Review
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

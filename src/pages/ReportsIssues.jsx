import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navigation from "../Components/Navigation";
import { AlertCircle, CheckCircle, Clock, Zap, X, Loader2 } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./ReportsIssues.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const isSuperAdmin = (r) => r === "super_admin";
const isManager = (r) => r === "manager";
const canManage = (r) => isSuperAdmin(r) || isManager(r);

const severityConfig = {
  high: { bg: "#fee2e2", text: "#991b1b" },
  medium: { bg: "#fef3c7", text: "#92400e" },
  low: { bg: "#dbeafe", text: "#1e40af" },
};
const fallbackSeverity = { bg: "#f3f4f6", text: "#374151" };
const getSeverity = (s) =>
  severityConfig[s?.toLowerCase?.()] ?? fallbackSeverity;

const typeIcon = {
  Content: "🚫",
  Verification: "⏳",
  Quality: "⭐",
  System: "⚙️",
};

/* ── Review Modal ─────────────────────────────────────────────────────── */
function ReviewModal({ alert, onClose, onResolve, canAct }) {
  const { t } = useTranslation();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const handleResolve = async () => {
    setBusy(true);
    await onResolve(alert.id, note);
    setBusy(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "520px",
          padding: "2rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.3rem", color: "#0f172a" }}>
              {t("reports.reviewTitle")}
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                color: "#64748b",
                fontSize: "0.9rem",
              }}
            >
              {t("reports.reviewId", { id: alert.id })} · {alert.time}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            <X size={22} />
          </button>
        </div>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>
              {typeIcon[alert.type] ?? "📋"}
            </span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>
                {alert.message || t("reports.reportFallback")}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.85rem",
                  color: "#64748b",
                }}
              >
                {alert.description}
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              fontSize: "0.85rem",
            }}
          >
            <div>
              <span style={{ color: "#94a3b8" }}>{t("reports.fieldType")}</span>
              <strong>{getTypeLabel(alert.type)}</strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>
                {t("reports.fieldSeverity")}
              </span>
              <span
                style={{
                  background: getSeverity(alert.severity).bg,
                  color: getSeverity(alert.severity).text,
                  padding: "1px 8px",
                  borderRadius: "6px",
                  fontWeight: 600,
                }}
              >
                {getSeverityLabel(alert.severity)}
              </span>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>
                {t("reports.fieldReportedBy")}
              </span>
              <strong>{alert.reportedBy ?? t("reports.unknown")}</strong>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>
                {t("reports.fieldAffected")}
              </span>
              <strong>{alert.affectedEntity ?? t("reports.unknown")}</strong>
            </div>
          </div>
        </div>

        {/* Note textarea — only for super_admin + manager */}
        {canAct && (
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: "6px",
              }}
            >
              {t("reports.adminNoteLabel")}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("reports.adminNotePlaceholder")}
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "0.9rem",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "0.65rem",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              background: "white",
              color: "#374151",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            {t("common.close")}
          </button>
          {canAct && (
            <button
              onClick={handleResolve}
              disabled={busy}
              style={{
                flex: 1,
                padding: "0.65rem",
                border: "none",
                borderRadius: "8px",
                background: "#10b981",
                color: "white",
                fontWeight: 600,
                cursor: busy ? "wait" : "pointer",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {busy && (
                <Loader2
                  size={15}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              )}
              {t("reports.markResolved")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
export default function ReportsIssues() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { role } = useAuth();
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const getSeverityLabel = (severity) => {
    const key = `reports.severity.${String(severity ?? "unknown").toLowerCase()}`;
    return t(key, { defaultValue: t("reports.severity.unknown") });
  };

  const getTypeLabel = (type) => {
    const normalized = String(type ?? "general").toLowerCase();
    return t(`reports.type.${normalized}`, {
      defaultValue: t("reports.type.general"),
    });
  };

  const [alerts, setAlerts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [backendMissing, setBackendMissing] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [reviewingAlert, setReviewingAlert] = useState(null);

  useEffect(() => {
    if (!role || !token) return;
    (async () => {
      setDataLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/admin/reports`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          setBackendMissing(true);
          return;
        }
        if (!res.ok) throw new Error(`Reports ${res.status}`);

        const data = await res.json();
        const raw =
          data?.reports ?? data?.data ?? (Array.isArray(data) ? data : []);

        setAlerts(
          raw.map((r) => ({
            id: r.id,
            message: r.title ?? null,
            description: r.description ?? "",
            type: r.type ?? "General",
            severity: r.severity ?? "medium",
            status: r.status ?? "open",
            time: r.created_at ?? null,
            reportedBy: r.reported_by ?? null,
            affectedEntity: r.affected_entity ?? null,
            adminNote: r.admin_note ?? "",
          })),
        );
      } catch (err) {
        console.error("Reports fetch error:", err);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [role]);

  const handleResolve = async (id, note) => {
    try {
      await fetch(`${BASE_URL}/admin/reports/${id}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ admin_note: note }),
      });
    } catch {
      /* optimistic update anyway */
    }

    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "resolved", adminNote: note } : a,
      ),
    );
    setReviewingAlert(null);
  };

  const filtered = alerts.filter((a) => {
    const byType = selectedType === "all" || a.type === selectedType;
    const bySeverity =
      selectedSeverity === "all" || a.severity === selectedSeverity;
    return byType && bySeverity;
  });

  const resolvedCount = alerts.filter((a) => a.status === "resolved").length;
  const resolutionRate =
    alerts.length > 0 ? Math.round((resolvedCount / alerts.length) * 100) : 0;

  return (
    <>
      <Navigation hideCart hideLocation hideProfile />
      <div className="reports-page container mt-4 mb-5">
        <div className="reports-page__header">
          <div>
            <h1 className="reports-page__title">{t("reports.title")}</h1>
            <p className="reports-page__subtitle">{t("reports.subtitle")}</p>
          </div>
          <button
            type="button"
            className="reports-page__back-btn"
            onClick={() => navigate("/admin")}
          >
            ← {t("reports.backToAdmin")}
          </button>
        </div>

        {/* Warning if backend route doesn't exist yet */}
        {backendMissing && (
          <div
            style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "24px",
              color: "#92400e",
              fontSize: "0.9rem",
            }}
          >
            <strong>⚠️ {t("reports.backendMissingTitle")}</strong>{" "}
            {t("reports.backendMissingMessage", {
              endpoint: "/api/admin/reports",
            })}
          </div>
        )}

        <div className="reports-stats">
          <div className="report-stat">
            <div className="stat-icon stat-icon--red">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="stat-label">{t("reports.stats.criticalIssues")}</p>
              <p className="stat-value">
                {alerts.filter((a) => a.severity === "high").length}
              </p>
            </div>
          </div>
          <div className="report-stat">
            <div className="stat-icon stat-icon--orange">
              <Clock size={20} />
            </div>
            <div>
              <p className="stat-label">{t("reports.stats.pendingReview")}</p>
              <p className="stat-value">
                {alerts.filter((a) => a.status === "open").length}
              </p>
            </div>
          </div>
          <div className="report-stat">
            <div className="stat-icon stat-icon--blue">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="stat-label">{t("reports.stats.totalReports")}</p>
              <p className="stat-value">{alerts.length}</p>
            </div>
          </div>
          <div className="report-stat">
            <div className="stat-icon stat-icon--green">
              <Zap size={20} />
            </div>
            <div>
              <p className="stat-label">{t("reports.stats.resolutionRate")}</p>
              <p className="stat-value">{resolutionRate}%</p>
            </div>
          </div>
        </div>

        <div className="reports-filters">
          <div className="filter-group">
            <label className="filter-label">{t("reports.filterType")}</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t("reports.filterAllTypes")}</option>
              <option value="Content">{t("reports.type.content")}</option>
              <option value="Verification">
                {t("reports.type.verification")}
              </option>
              <option value="Quality">{t("reports.type.quality")}</option>
              <option value="System">{t("reports.type.system")}</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">
              {t("reports.filterSeverity")}
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="filter-select"
            >
              <option value="all">{t("reports.filterAllSeverities")}</option>
              <option value="high">{t("reports.severity.high")}</option>
              <option value="medium">{t("reports.severity.medium")}</option>
              <option value="low">{t("reports.severity.low")}</option>
            </select>
          </div>
        </div>

        <div className="reports-list-card">
          {dataLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <Loader2
                size={20}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              {t("reports.loadingReports")}
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((alert, idx) => (
              <div
                key={alert.id}
                className="reports-list-item"
                style={{
                  borderBottom:
                    idx !== filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <div className="reports-list-item__icon-wrapper">
                  <div className="reports-list-item__icon">
                    {typeIcon[alert.type] ?? "📋"}
                  </div>
                </div>

                <div className="reports-list-item__content">
                  <div className="reports-list-item__title">
                    {alert.message || t("reports.reportFallback")}
                  </div>
                  <div className="reports-list-item__description">
                    {alert.description}
                  </div>
                  <div className="reports-list-item__meta">
                    <span>{alert.time ?? t("reports.unknown")}</span>
                    <span className="reports-list-item__dot">•</span>
                    <span>{getTypeLabel(alert.type)}</span>
                    {alert.status === "resolved" && (
                      <>
                        <span className="reports-list-item__dot">•</span>
                        <span style={{ color: "#10b981", fontWeight: 600 }}>
                          ✓ {t("reports.resolved")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="reports-list-item__status">
                  <span
                    className="severity-badge"
                    style={{
                      backgroundColor: getSeverity(alert.severity).bg,
                      color: getSeverity(alert.severity).text,
                    }}
                  >
                    {getSeverityLabel(alert.severity)}
                  </span>
                </div>

                <button
                  type="button"
                  className="reports-list-item__action"
                  disabled={alert.status === "resolved"}
                  style={{
                    opacity: alert.status === "resolved" ? 0.45 : 1,
                    cursor: alert.status === "resolved" ? "default" : "pointer",
                  }}
                  onClick={() => setReviewingAlert(alert)}
                >
                  {alert.status === "resolved"
                    ? t("reports.resolved")
                    : t("reports.reviewAction")}
                </button>
              </div>
            ))
          ) : (
            <div className="reports-empty">
              <p>
                {backendMissing ? `${t("reports.noDataBackendMissing")} ` : ""}
                {!backendMissing ? t("reports.noIssuesFound") : null}
              </p>
            </div>
          )}
        </div>
      </div>

      {reviewingAlert && (
        <ReviewModal
          alert={reviewingAlert}
          onClose={() => setReviewingAlert(null)}
          onResolve={handleResolve}
          canAct={canManage(role)}
        />
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

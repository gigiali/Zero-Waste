import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MoreVertical,
  Eye,
  CheckCircle,
  Trash2,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  EyeOff,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./ReviewModeration.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);
const canDelete    = (r) => isSuperAdmin(r);

const statusConfig = {
  visible: { bg: "var(--rm-green-bg)", text: "var(--rm-green-text)", dot: "#10b981", label: "Visible" },
  hidden:  { bg: "var(--rm-red-bg)",   text: "var(--rm-red-text)",   dot: "#ef4444", label: "Hidden"  },
};
const fallbackStatus = { bg: "var(--rm-muted-bg)", text: "var(--rm-muted-text)", dot: "#94a3b8", label: "Open" };
const getStatus = (s) => statusConfig[s?.toLowerCase?.()] ?? fallbackStatus;

function ActionMenu({ report, role, token, onStatusChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const doRequest = async (url, method = "POST") => {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return res.ok;
    } catch { return false; }
    finally { setBusy(false); }
  };

  const handleToggle = async () => {
    const ok = await doRequest(`${BASE_URL}/reviews/${report.id}/toggle-visibility`, "PATCH");
    if (ok) onStatusChange(report.id, report.status === "visible" ? "hidden" : "visible");
    else alert("Failed to toggle visibility.");
    setOpen(false);
  };

  const handleDeleteOffer = async () => {
    if (!window.confirm(`Delete offer: "${report.reported_item}"? This cannot be undone.`)) return;
    setBusy(true);
    console.log("[Delete] target_id:", report.target_id, "review_id:", report.id);
    try {
      const res = await fetch(`${BASE_URL}/admin/offers/${report.target_id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[Delete] status:", res.status);
      if (res.ok || res.status === 204) {
        onDelete(report.target_id, "offer");   // pass offer id + type
      } else {
        let msg = `Delete failed (${res.status})`;
        try { const b = await res.json(); msg = b?.message ?? msg; } catch {}
        console.error("[Delete] error body:", msg);
        alert(msg);
      }
    } catch (err) {
      console.error("[Delete] network error:", err);
      alert("Network error: " + err.message);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const actions = [
    {
      icon: report.status === "visible" ? <EyeOff size={14} /> : <Eye size={14} />,
      label: report.status === "visible" ? "Hide review" : "Show review",
      accent: true,
      onClick: handleToggle,
      show: canManage(role),
    },
    {
      icon: <Trash2 size={14} />,
      label: "Delete offer",
      danger: true,
      onClick: handleDeleteOffer,
      show: canDelete(role),
    },
  ].filter((a) => a.show);

  return (
    <div ref={ref} className="rm-menu-wrap">
      <button
        className="rm-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-label="Actions"
      >
        {busy
          ? <Loader2 size={15} className="rm-spin" />
          : <MoreVertical size={15} />}
      </button>

      {open && (
        <div className="rm-dropdown">
          {actions.map((a, i) => (
            <React.Fragment key={i}>
              {a.divider && <div className="rm-dropdown__divider" />}
              <button
                className={`rm-dropdown__item${a.danger ? " rm-dropdown__item--danger" : ""}${a.accent ? " rm-dropdown__item--accent" : ""}`}
                onClick={a.onClick}
              >
                {a.icon}
                <span>{a.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────── */
export default function ReviewModeration() {
  const navigate = useNavigate();
  const { role, token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const [reviews,     setReviews]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [filterStatus,setFilterStatus]= useState("all");

  /* ── Fetch: GET /api/offers → GET /api/offers/{offer_id}/reviews ── */
  useEffect(() => {
    if (!role || !token) return;
    (async () => {
      setLoading(true);
      try {
        const offersRes  = await fetch(`${BASE_URL}/offers`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        const offersJson = await offersRes.json();
        const offers     = offersJson?.data?.data ?? offersJson?.data ?? (Array.isArray(offersJson) ? offersJson : []);

        const reviewArrays = await Promise.all(
          offers.map(async (offer) => {
            try {
              const r = await fetch(`${BASE_URL}/offers/${offer.id}/reviews`, {
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
              });
              const d    = await r.json();
              const revs = d?.reviews ?? d?.data ?? (Array.isArray(d) ? d : []);
              return revs.map((rev) => ({ ...rev, offer }));
            } catch { return []; }
          })
        );

        const raw = reviewArrays.flat();
        setReviews(
          raw.map((r) => ({
            id:             r.id,
            reviewer:       r.user?.name ?? r.customer_name ?? "Customer",
            offer_title:    r.offer?.title ?? r.offer_name ?? "Offer",
            target_id:      r.offer_id ?? r.offer?.id ?? r.id,
            comment:        r.comment ?? r.body ?? "—",
            rating:         r.rating ?? null,
            status:         r.is_visible === false ? "hidden" : "visible",
            created_at:     r.created_at ?? null,
          }))
        );
      } catch (err) {
        console.error("ReviewModeration fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [role, token]);

  const handleStatusChange = (id, status) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const handleDelete = (id, type = "review") => {
    console.log("[handleDelete] called — id:", id, "| type:", type);
    setReviews((prev) => {
      console.log("[handleDelete] prev count:", prev.length);
      console.log("[handleDelete] sample target_ids:", prev.slice(0, 3).map(r => r.target_id));
      const next = type === "offer"
        ? prev.filter((r) => String(r.target_id) !== String(id))
        : prev.filter((r) => String(r.id)        !== String(id));
      console.log("[handleDelete] after filter count:", next.length);
      return next;
    });
  };

  const filtered = reviews.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = r.offer_title.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q) || r.reviewer.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalVisible = reviews.filter((r) => r.status === "visible").length;
  const totalHidden  = reviews.filter((r) => r.status === "hidden").length;

  return (
    <div className="rm-page">
      {/* ── Header ── */}
      <div className="rm-header">
        <div className="rm-header__left">
          <button className="rm-back-btn" onClick={() => navigate("/admin")}>
            <ArrowLeft size={16} />
            Back to Admin
          </button>
          <div className="rm-header__title-row">
            <span className="rm-header__icon"><ShieldAlert size={22} /></span>
            <h1 className="rm-title">Review Moderation</h1>
          </div>
          <p className="rm-subtitle">Monitor and manage customer reviews across all offers</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="rm-stats">
        <div className="rm-stat">
          <span className="rm-stat__icon rm-stat__icon--blue"><BookOpen size={18} /></span>
          <div>
            <p className="rm-stat__label">Total Reviews</p>
            <p className="rm-stat__value">{reviews.length}</p>
          </div>
        </div>
        <div className="rm-stat">
          <span className="rm-stat__icon rm-stat__icon--green"><CheckCircle size={18} /></span>
          <div>
            <p className="rm-stat__label">Visible</p>
            <p className="rm-stat__value rm-stat__value--green">{totalVisible}</p>
          </div>
        </div>
        <div className="rm-stat">
          <span className="rm-stat__icon rm-stat__icon--red"><EyeOff size={18} /></span>
          <div>
            <p className="rm-stat__label">Hidden</p>
            <p className="rm-stat__value rm-stat__value--red">{totalHidden}</p>
          </div>
        </div>
        <div className="rm-stat">
          <span className="rm-stat__icon rm-stat__icon--amber"><AlertTriangle size={18} /></span>
          <div>
            <p className="rm-stat__label">Hidden Rate</p>
            <p className="rm-stat__value rm-stat__value--amber">
              {reviews.length ? Math.round((totalHidden / reviews.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="rm-controls">
        <div className="rm-search">
          <Search size={16} className="rm-search__icon" />
          <input
            type="text"
            placeholder="Search by offer, reviewer, or comment…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rm-search__input"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rm-filter"
        >
          <option value="all">All statuses</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="rm-card">
        {loading ? (
          <div className="rm-loading">
            <Loader2 size={20} className="rm-spin" />
            <span>Loading reviews…</span>
          </div>
        ) : (
          <div className="rm-table-wrap">
            <table className="rm-table">
              <thead>
                <tr>
                  <th>Offer</th>
                  <th>Reviewer</th>
                  <th>Comment</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((rev) => {
                    const st = getStatus(rev.status);
                    return (
                      <tr key={rev.id} className="rm-table__row">
                        <td className="rm-table__offer">
                          <span className="rm-offer-name">{rev.offer_title}</span>
                        </td>
                        <td className="rm-table__reviewer">
                          <span className="rm-avatar">
                            {(rev.reviewer[0] ?? "?").toUpperCase()}
                          </span>
                          {rev.reviewer}
                        </td>
                        <td className="rm-table__comment" title={rev.comment}>
                          {rev.comment}
                        </td>
                        <td className="rm-table__rating">
                          {rev.rating != null ? (
                            <span className="rm-rating">
                              ★ {rev.rating}
                            </span>
                          ) : "—"}
                        </td>
                        <td>
                          <span
                            className="rm-status-badge"
                            style={{ background: st.bg, color: st.text }}
                          >
                            <span
                              className="rm-status-dot"
                              style={{ background: st.dot }}
                            />
                            {st.label}
                          </span>
                        </td>
                        <td className="rm-table__date">
                          {rev.created_at
                            ? new Date(rev.created_at).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td>
                          <ActionMenu
                            report={{ ...rev, reported_item: rev.offer_title }}
                            role={role}
                            token={token}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="rm-table__empty">
                      {loading ? "" : "No reviews found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
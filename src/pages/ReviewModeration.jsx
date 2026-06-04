import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MoreVertical,
  Eye,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  EyeOff,
  BookOpen,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./ReviewModeration.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const isSupport    = (r) => r === "support";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);
const canViewReviews = (r) => isSuperAdmin(r) || isManager(r) || isSupport(r);

const statusConfig = {
  visible: { bg: "var(--rm-green-bg)", text: "var(--rm-green-text)", dot: "#10b981", label: "Visible" },
  hidden:  { bg: "var(--rm-red-bg)",   text: "var(--rm-red-text)",   dot: "#ef4444", label: "Hidden"  },
};
const fallbackStatus = { bg: "var(--rm-muted-bg)", text: "var(--rm-muted-text)", dot: "#94a3b8", label: "Open" };
const getStatus = (s) => statusConfig[s?.toLowerCase?.()] ?? fallbackStatus;

function SkeletonRow() {
  return (
    <tr className="rm-skeleton-row">
      <td><div className="rm-skeleton rm-skeleton--text" /></td>
      <td>
        <div className="rm-skeleton-reviewer">
          <div className="rm-skeleton rm-skeleton--avatar" />
          <div className="rm-skeleton rm-skeleton--text rm-skeleton--short" />
        </div>
      </td>
      <td><div className="rm-skeleton rm-skeleton--text rm-skeleton--long" /></td>
      <td><div className="rm-skeleton rm-skeleton--text rm-skeleton--xs" /></td>
      <td><div className="rm-skeleton rm-skeleton--badge" /></td>
      <td><div className="rm-skeleton rm-skeleton--text rm-skeleton--short" /></td>
      <td><div className="rm-skeleton rm-skeleton--icon" /></td>
    </tr>
  );
}

function ActionMenu({ report, role, token, onStatusChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const handleToggleVisibility = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${BASE_URL}/reviews/${report.id}/toggle-visibility`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) onStatusChange(report.id, report.status === "visible" ? "hidden" : "visible");
      else alert("Failed: " + (data?.message ?? res.status));
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const handleMenuToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 6, left: rect.right - 170 });
    }
    setOpen((v) => !v);
  };

  const actions = [
    {
      icon: report.status === "visible" ? <EyeOff size={14} /> : <Eye size={14} />,
      label: report.status === "visible" ? "Hide review" : "Show review",
      accent: true,
      onClick: handleToggleVisibility,
      show: canManage(role),
    },
  ].filter((a) => a.show);

  return (
    <div ref={ref} className="rm-menu-wrap">
      <button
        ref={buttonRef}
        className="rm-menu-trigger"
        onClick={handleMenuToggle}
        disabled={busy}
        aria-label="Actions"
      >
        {busy ? <Loader2 size={15} className="rm-spin" /> : <MoreVertical size={15} />}
      </button>

      {open && (
        <div className="rm-dropdown" style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}>
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

export default function ReviewModeration() {
  const navigate = useNavigate();
  const { role, token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const [reviews,     setReviews]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [slowWarning, setSlowWarning] = useState(false);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [filterStatus,setFilterStatus]= useState("all");

  useEffect(() => {
    if (!role || !token || !canViewReviews(role)) return;
    let timeoutId;

    (async () => {
      setLoading(true);
      setSlowWarning(false);
      timeoutId = setTimeout(() => setSlowWarning(true), 10000);

      try {
        // ✅ SHELLE: استخدم endpoint admin/reviews الصحيح بدل /offers
        const reviewsRes = await fetch(`${BASE_URL}/admin/reviews`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });

        if (!reviewsRes.ok) throw new Error(`Failed to fetch reviews: ${reviewsRes.status}`);

        const reviewsData = await reviewsRes.json();
        
        // ✅ HODYA: handle different response structures
        const raw = Array.isArray(reviewsData?.data) 
          ? reviewsData.data 
          : Array.isArray(reviewsData?.reviews)
          ? reviewsData.reviews
          : Array.isArray(reviewsData) 
          ? reviewsData 
          : [];

        setReviews(
          raw.map((r) => ({
            id:          r.id,
            reviewer:    r.user?.name ?? r.customer_name ?? "Customer",
            offer_title: r.offer?.title ?? r.offer_name ?? "Offer",
            target_id:   r.offer_id ?? r.offer?.id ?? r.id,
            comment:     r.comment ?? r.body ?? "—",
            rating:      r.rating ?? null,
            status:      (r.is_visible === false || r.is_visible === 0) ? "hidden" : "visible",
            created_at:  r.created_at ?? null,
          }))
        );
      } catch (err) {
        console.error("ReviewModeration fetch error:", err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        setSlowWarning(false);
      }
    })();

    return () => clearTimeout(timeoutId);
  }, [role, token]);

  const handleStatusChange = (id, status) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const handleDelete = (id, type = "review") =>
    setReviews((prev) =>
      type === "offer"
        ? prev.filter((r) => String(r.target_id) !== String(id))
        : prev.filter((r) => String(r.id)        !== String(id))
    );

  const filtered = reviews.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      r.offer_title.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q) ||
      r.reviewer.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalVisible = reviews.filter((r) => r.status === "visible").length;
  const totalHidden  = reviews.filter((r) => r.status === "hidden").length;

  return (
    <div className="rm-page">
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

      <div className="rm-stats">
        <div className="rm-stat">
          <span className="rm-stat__icon rm-stat__icon--blue"><BookOpen size={18} /></span>
          <div>
            <p className="rm-stat__label">Total Reviews</p>
            <p className="rm-stat__value">
              {loading ? <span className="rm-skeleton rm-skeleton--stat" /> : reviews.length}
            </p>
          </div>
        </div>
        <div className="rm-stat">
          <span className="rm-stat__icon rm-stat__icon--green"><CheckCircle size={18} /></span>
          <div>
            <p className="rm-stat__label">Visible</p>
            <p className="rm-stat__value rm-stat__value--green">
              {loading ? <span className="rm-skeleton rm-skeleton--stat" /> : totalVisible}
            </p>
          </div>
        </div>
        <div className="rm-stat">
          <span className="rm-stat__icon rm-stat__icon--red"><EyeOff size={18} /></span>
          <div>
            <p className="rm-stat__label">Hidden</p>
            <p className="rm-stat__value rm-stat__value--red">
              {loading ? <span className="rm-skeleton rm-skeleton--stat" /> : totalHidden}
            </p>
          </div>
        </div>
        <div className="rm-stat">
          <span className="rm-stat__icon rm-stat__icon--amber"><AlertTriangle size={18} /></span>
          <div>
            <p className="rm-stat__label">Hidden Rate</p>
            <p className="rm-stat__value rm-stat__value--amber">
              {loading
                ? <span className="rm-skeleton rm-skeleton--stat" />
                : `${reviews.length ? Math.round((totalHidden / reviews.length) * 100) : 0}%`}
            </p>
          </div>
        </div>
      </div>

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

      {slowWarning && loading && (
        <div className="rm-timeout-banner">
          <Clock size={16} />
          <span>This is taking longer than expected — please wait or check your connection.</span>
        </div>
      )}

      <div className="rm-card">
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
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length > 0 ? (
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
                          <span className="rm-rating">★ {rev.rating}</span>
                        ) : "—"}
                      </td>
                      <td>
                        <span
                          className="rm-status-badge"
                          style={{ background: st.bg, color: st.text }}
                        >
                          <span className="rm-status-dot" style={{ background: st.dot }} />
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
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

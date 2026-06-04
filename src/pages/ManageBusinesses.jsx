import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search, MoreVertical, CheckCircle, XCircle,
  Trash2, Loader2, ArrowLeft, Store, Clock, AlertCircle,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./ManageBusinesses.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";
const API_TIMEOUT = 8000;
const LOAD_TIMEOUT = 5000;

const isSuperAdmin = (r) => r === "super_admin";
const isManager = (r) => r === "manager";
const isSupport = (r) => r === "support";
const canManage = (r) => isSuperAdmin(r) || isManager(r);
const canDelete = (r) => isSuperAdmin(r);
const canViewBusinesses = (r) => isSuperAdmin(r) || isManager(r);

const statusConfig = {
  approved: { bg: "#e8faf0", text: "#28c76f", dot: "#28c76f", labelKey: "manageBusinesses.status.approved" },
  active: { bg: "#e8faf0", text: "#28c76f", dot: "#28c76f", labelKey: "manageBusinesses.status.active" },
  pending: { bg: "#fff6e0", text: "#ff9f43", dot: "#ff9f43", labelKey: "manageBusinesses.status.pending" },
  under_review: { bg: "#e7e7ff", text: "#696cff", dot: "#696cff", labelKey: "manageBusinesses.status.underReview" },
  rejected: { bg: "#ffeaea", text: "#ef4444", dot: "#ef4444", labelKey: "manageBusinesses.status.rejected" },
};
const fallbackStatus = { bg: "#f0f0f5", text: "#8592a3", dot: "#8592a3", labelKey: "manageBusinesses.status.unknown" };
const getStatus = (s) => statusConfig[s?.toLowerCase?.()] ?? fallbackStatus;

function SkeletonRow() {
  return (
    <tr>
      <td><div className="mb-skeleton mb-skeleton--name" /></td>
      <td><div className="mb-skeleton mb-skeleton--category" /></td>
      <td><div className="mb-skeleton mb-skeleton--badge" /></td>
      <td><div className="mb-skeleton mb-skeleton--action" style={{ marginLeft: "auto" }} /></td>
    </tr>
  );
}

function LoadingTimeoutAlert() {
  return (
    <div className="mb-loading-timeout">
      <AlertCircle size={18} color="#f59e0b" />
      <span>Loading is taking longer than expected...</span>
    </div>
  );
}

async function fetchAllVendors(token) {
  let page = 1;
  let allVendors = [];
  while (true) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      const res = await fetch(`${BASE_URL}/vendors?page=${page}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) break;
      const data = await res.json();
      const isPaginated = data?.data?.data && Array.isArray(data.data.data);
      if (isPaginated) {
        allVendors = [...allVendors, ...data.data.data];
        const lastPage = data.data.last_page ?? 1;
        if (page >= lastPage) break;
        page++;
      } else {
        const raw = data?.data ?? (Array.isArray(data) ? data : []);
        allVendors = Array.isArray(raw) ? raw : [];
        break;
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Fetch vendors error:", err);
      break;
    }
  }
  return allVendors;
}

function DeleteConfirmModal({ businessName, onConfirm, onCancel, busy }) {
  return (
    <div className="mb-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="mb-modal-content">
        <div className="mb-modal-body">
          <div className="mb-modal-icon mb-modal-icon--delete">
            <Trash2 size={22} color="#ef4444" />
          </div>
          <h3 className="mb-modal-title">Delete Business</h3>
          <p className="mb-modal-text">
            Are you sure you want to delete <strong>"{businessName}"</strong>?
            <br />This action cannot be undone.
          </p>
        </div>
        <div className="mb-modal-actions">
          <button className="mb-modal-btn mb-modal-btn--cancel" onClick={onCancel} disabled={busy} type="button">
            Cancel
          </button>
          <button className="mb-modal-btn mb-modal-btn--delete" onClick={onConfirm} disabled={busy} type="button">
            {busy ? <Loader2 size={15} className="mb-spin" /> : <Trash2 size={15} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectReasonModal({ businessName, onConfirm, onCancel, busy }) {
  const [reason, setReason] = useState("Does not meet requirements");

  return (
    <div className="mb-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="mb-modal-content">
        <div className="mb-modal-header">
          <div className="mb-modal-header__content">
            <div className="mb-modal-icon mb-modal-icon--reject">
              <XCircle size={20} color="#ff9f43" />
            </div>
            <div>
              <h3 className="mb-modal-title mb-modal-title--small">Reject Business</h3>
              <p className="mb-modal-subtitle">"{businessName}"</p>
            </div>
          </div>
        </div>
        <div className="mb-modal-body">
          <label className="mb-modal-label">Rejection Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            autoFocus
            className="mb-modal-textarea"
          />
        </div>
        <div className="mb-modal-actions">
          <button className="mb-modal-btn mb-modal-btn--cancel" onClick={onCancel} disabled={busy} type="button">
            Cancel
          </button>
          <button
            className={`mb-modal-btn mb-modal-btn--reject ${reason.trim() ? "" : "mb-modal-btn--disabled"}`}
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={busy || !reason.trim()}
            type="button"
          >
            {busy ? <Loader2 size={15} className="mb-spin" /> : <XCircle size={15} />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorDetailsModal({ business, token, onClose, onStatusChange }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { t } = useTranslation();

  const isPending = ["pending", "under_review"].includes(business.status);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true);
    }, LOAD_TIMEOUT);

    (async () => {
      try {
        const url = isPending
          ? `${BASE_URL}/admin/vendor/${business.id}`
          : `${BASE_URL}/vendor/${business.id}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

        const res = await fetch(url, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const data = await res.json();
        if (!res.ok) {
          setError(data?.message ?? "Failed to load vendor details.");
          return;
        }
        setDetails(data?.data ?? null);
      } catch (e) {
        if (e.name !== "AbortError") {
          setError("Failed to load vendor details.");
        }
      } finally {
        setLoading(false);
        setLoadingTimeout(false);
        clearTimeout(timeoutId);
      }
    })();

    return () => clearTimeout(timeoutId);
  }, [business.id, token, isPending]);

  const handleApprove = async () => {
    setBusy(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      const res = await fetch(`${BASE_URL}/admin/vendor/${business.id}/accept`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        onStatusChange(business.id, "approved");
        onClose();
      } else {
        alert(t("manageBusinesses.errors.approveFailed"));
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Approve error:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    setBusy(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      const res = await fetch(`${BASE_URL}/admin/vendor/${business.id}/reject`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        onStatusChange(business.id, "rejected");
        onClose();
      } else {
        alert(t("manageBusinesses.errors.rejectFailed"));
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Reject error:", err);
    } finally {
      setBusy(false);
      setShowRejectModal(false);
    }
  };

  const storageBase = "https://zero-waste-production.up.railway.app/";
  const canAct = isPending;
  const businessName = details?.business_name?.replace(/"/g, "") ?? business.name;
  const vendorType = details?.vendor_type?.replace(/"/g, "") ?? business.category;
  const ownerName = details?.user?.name ?? details?.owner_name ?? "—";
  const ownerEmail = details?.user?.email ?? details?.email ?? "—";
  const ownerPhone = details?.user?.phone ?? details?.phone ?? "—";
  const ownerAddress = details?.user?.address ?? details?.address ?? "—";
  const taxNumber = details?.tax_number ?? "—";
  const userStatus = details?.user?.status ?? details?.status ?? business.status;
  const logoUrl = details?.logo ? details.logo.replace("http://", "https://") : null;
  const commercialReg = details?.commercial_register ?? null;
  const taxCard = details?.tax_card ?? null;
  const rejectionReason = details?.rejection_reason ?? null;

  return (
    <>
      {showRejectModal && (
        <RejectReasonModal
          businessName={business.name}
          onConfirm={handleRejectConfirm}
          onCancel={() => setShowRejectModal(false)}
          busy={busy}
        />
      )}
      <div className="mb-modal-overlay mb-modal-overlay--large" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="mb-modal-content mb-modal-content--details">
          <div className="mb-details-header">
            <div className="mb-details-header__left">
              {logoUrl ? (
                <img src={logoUrl} alt="logo" className="mb-details-logo" />
              ) : (
                <div className="mb-details-avatar">{business.name.charAt(0)}</div>
              )}
              <div>
                <h3 className="mb-details-title">{businessName}</h3>
                <span className="mb-details-category">{vendorType}</span>
              </div>
            </div>
            <button type="button" onClick={onClose} className="mb-details-close">✕</button>
          </div>

          <div className="mb-details-body">
            {loading && (
              <>
                {loadingTimeout && <LoadingTimeoutAlert />}
                <div className="mb-details-loading">
                  <Loader2 size={24} className="mb-spin" />
                </div>
              </>
            )}
            {error && <div className="mb-details-error">{error}</div>}
            {details && !loading && (
              <>
                <div className="mb-details-grid">
                  {[
                    { label: "Owner", value: ownerName },
                    { label: "Email", value: ownerEmail },
                    { label: "Phone", value: ownerPhone },
                    { label: "Address", value: ownerAddress },
                    { label: "Tax No.", value: taxNumber },
                    { label: "Status", value: userStatus },
                  ].map(({ label, value }) => (
                    <div key={label} className="mb-details-field">
                      <p className="mb-details-label">{label}</p>
                      <p className="mb-details-value">{value ?? "—"}</p>
                    </div>
                  ))}
                </div>

                {(commercialReg || taxCard) && (
                  <>
                    <p className="mb-details-section-title">Documents</p>
                    <div className="mb-details-docs">
                      {[
                        { label: "Commercial Register", path: commercialReg },
                        { label: "Tax Card", path: taxCard },
                      ].map(({ label, path }) => (
                        <a
                          key={label}
                          href={path ? storageBase + path : "#"}
                          target="_blank"
                          rel="noreferrer"
                          className={`mb-details-doc ${!path ? "mb-details-doc--disabled" : ""}`}
                        >
                          📄 {label}
                        </a>
                      ))}
                    </div>
                  </>
                )}

                {rejectionReason && (
                  <div className="mb-details-rejection">
                    <p className="mb-details-rejection__title">Rejection Reason</p>
                    <p className="mb-details-rejection__text">{rejectionReason}</p>
                  </div>
                )}

                {canAct && (
                  <div className="mb-details-actions">
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={busy}
                      className="mb-details-btn mb-details-btn--approve"
                    >
                      {busy ? <Loader2 size={15} className="mb-spin" /> : <CheckCircle size={15} />}
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      disabled={busy}
                      className="mb-details-btn mb-details-btn--reject"
                    >
                      {busy ? <Loader2 size={15} className="mb-spin" /> : <XCircle size={15} />}
                      Reject
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ActionMenu({ business, role, token, onStatusChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const menuHeight = 140;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < menuHeight ? rect.top - menuHeight : rect.bottom + 4;
      setMenuPos({ top, left: rect.right - 160 });
    }
    setOpen((o) => !o);
  };

  const handleApprove = async () => {
    setBusy(true);
    setOpen(false);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      const res = await fetch(`${BASE_URL}/admin/vendor/${business.id}/accept`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        onStatusChange(business.id, "approved");
      } else {
        alert(t("manageBusinesses.errors.approveFailed"));
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Approve error:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    setBusy(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      const res = await fetch(`${BASE_URL}/admin/vendor/${business.id}/reject`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        onStatusChange(business.id, "rejected");
      } else {
        alert(t("manageBusinesses.errors.rejectFailed"));
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Reject error:", err);
    } finally {
      setBusy(false);
      setShowRejectModal(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setBusy(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      const res = await fetch(`${BASE_URL}/admin/vendor/${business.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        onDelete(business.id);
      } else {
        alert(t("manageBusinesses.errors.deleteFailed"));
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Delete error:", err);
    } finally {
      setBusy(false);
      setShowDeleteModal(false);
    }
  };

  const actions = [
    {
      icon: <Store size={14} />,
      label: "View Details",
      color: "#696cff",
      onClick: () => {
        setShowModal(true);
        setOpen(false);
      },
      show: canManage(role),
    },
    {
      icon: <CheckCircle size={14} />,
      label: t("manageBusinesses.actions.approve"),
      color: "#28c76f",
      onClick: handleApprove,
      show: canManage(role) && !["approved", "rejected", "active"].includes(business.status),
    },
    {
      icon: <XCircle size={14} />,
      label: t("manageBusinesses.actions.reject"),
      color: "#ff9f43",
      onClick: () => {
        setShowRejectModal(true);
        setOpen(false);
      },
      show: canManage(role) && !["approved", "rejected", "active"].includes(business.status),
    },
    {
      icon: <Trash2 size={14} />,
      label: t("manageBusinesses.actions.delete"),
      color: "#ef4444",
      onClick: () => {
        setShowDeleteModal(true);
        setOpen(false);
      },
      show: canDelete(role),
      divider: true,
    },
  ].filter((a) => a.show);

  return (
    <>
      {showModal && (
        <VendorDetailsModal
          business={business}
          token={token}
          onClose={() => setShowModal(false)}
          onStatusChange={onStatusChange}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmModal
          businessName={business.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          busy={busy}
        />
      )}
      {showRejectModal && (
        <RejectReasonModal
          businessName={business.name}
          onConfirm={handleRejectConfirm}
          onCancel={() => setShowRejectModal(false)}
          busy={busy}
        />
      )}

      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        disabled={busy}
        className="mb-action-btn"
      >
        {busy ? <Loader2 size={16} className="mb-spin" /> : <MoreVertical size={16} />}
      </button>

      {open && actions.length > 0 && (
        <div ref={menuRef} className="mb-dropdown" style={{ top: menuPos.top, left: menuPos.left }}>
          {actions.map((a) => (
            <React.Fragment key={a.label}>
              {a.divider && <div className="mb-dropdown__divider" />}
              <button type="button" onClick={a.onClick} className="mb-dropdown__item" style={{ color: a.color }}>
                {a.icon}
                <span>{a.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
}

export default function ManageBusinesses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const [businesses, setBusinesses] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    if (!token) return;

    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true);
    }, LOAD_TIMEOUT);

    (async () => {
      setDataLoading(true);
      setFetchError(null);
      try {
        const [allVendorsResult, pendingResult] = await Promise.allSettled([
          fetchAllVendors(token),
          fetch(`${BASE_URL}/admin/vendor/pending`, {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          })
            .then((r) => (r.ok ? r.json() : { data: { vendors: [] } }))
            .catch(() => ({ data: { vendors: [] } })),
        ]);

        const allVendorsList = allVendorsResult.status === "fulfilled" ? allVendorsResult.value : [];
        const pendingData = pendingResult.status === "fulfilled" ? pendingResult.value : {};
        const pendingVendors = Array.isArray(pendingData?.data?.vendors) ? pendingData.data.vendors : [];

        const pendingIds = new Set(pendingVendors.map((v) => v.id));
        const merged = [
          ...pendingVendors.map((v) => ({ ...v })),
          ...allVendorsList.filter((v) => !pendingIds.has(v.id)),
        ];

        setBusinesses(
          merged.map((v) => ({
            id: v.id,
            name: v.business_name ?? v.name ?? t("manageBusinesses.unknownBusiness"),
            category: v.vendor_type ?? "—",
            status: v.status ?? "approved",
          }))
        );
      } catch (err) {
        console.error("Fetch Error:", err);
        setFetchError(err.message);
      } finally {
        setDataLoading(false);
        setLoadingTimeout(false);
        clearTimeout(timeoutId);
      }
    })();

    return () => clearTimeout(timeoutId);
  }, [token, t]);

  const handleStatusChange = (id, status) =>
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

  const handleDelete = (id) => setBusinesses((prev) => prev.filter((b) => b.id !== id));

  const filtered = businesses.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchCat = filterCategory === "all" || b.category === filterCategory;
    if (!role || !canViewBusinesses(role)) {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <AlertCircle size={40} />
      <p>You don't have permission to manage businesses.</p>
    </div>
  );
}
    return matchSearch && matchStatus && matchCat;
  });

  const categories = [...new Set(businesses.map((b) => b.category))];
  const statuses = [...new Set(businesses.map((b) => b.status))];
  const activeCount = businesses.filter((b) => ["approved", "active"].includes(b.status)).length;
  const pendingCount = businesses.filter((b) => ["pending", "under_review"].includes(b.status)).length;
  const rejectedCount = businesses.filter((b) => b.status === "rejected").length;

  return (
    <>
      <div className="businesses-page">
        <div className="businesses-header">
          <div className="businesses-header__left">
            <button type="button" className="businesses-back-btn" onClick={() => navigate("/admin")}>
              <ArrowLeft size={15} />
              {t("manageBusinesses.backToAdmin")}
            </button>
            <div>
              <h1 className="businesses-title">{t("manageBusinesses.title")}</h1>
              <p className="businesses-subtitle">{t("manageBusinesses.subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="businesses-stats">
          <div className="biz-stat biz-stat--indigo">
            <div className="biz-stat__icon">
              <Store size={20} />
            </div>
            <div>
              <p className="biz-stat__label">{t("manageBusinesses.stats.totalRegistered")}</p>
              <p className="biz-stat__value">{businesses.length}</p>
            </div>
          </div>
          <div className="biz-stat biz-stat--emerald">
            <div className="biz-stat__icon">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="biz-stat__label">{t("manageBusinesses.stats.activeState")}</p>
              <p className="biz-stat__value">{activeCount}</p>
            </div>
          </div>
          <div className="biz-stat biz-stat--amber">
            <div className="biz-stat__icon">
              <Clock size={20} />
            </div>
            <div>
              <p className="biz-stat__label">{t("manageBusinesses.stats.awaitingVerification")}</p>
              <p className="biz-stat__value">{pendingCount}</p>
            </div>
          </div>
          <div className="biz-stat biz-stat--red">
            <div className="biz-stat__icon">
              <XCircle size={20} />
            </div>
            <div>
              <p className="biz-stat__label">Rejected</p>
              <p className="biz-stat__value">{rejectedCount}</p>
            </div>
          </div>
        </div>

        <div className="businesses-controls">
          <div className="search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder={t("manageBusinesses.controls.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">{t("manageBusinesses.controls.allStates")}</option>
              {statuses
                .filter(Boolean)
                .map((s) => (
                  <option key={s} value={s}>
                    {t(getStatus(s).labelKey)}
                  </option>
                ))}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
              <option value="all">{t("manageBusinesses.controls.allSectors")}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {fetchError && <div className="mb-error-banner">⚠️ {fetchError}</div>}

        <div className="businesses-table-wrapper">
          {dataLoading ? (
            <>
              {loadingTimeout && <LoadingTimeoutAlert />}
              <div className="table-loading">
                <Loader2 size={18} className="mb-spin" />
                <span>{t("manageBusinesses.loading")}</span>
              </div>
            </>
          ) : (
            <table className="businesses-table">
              <thead>
                <tr>
                  <th>{t("manageBusinesses.table.businessEntity")}</th>
                  <th>{t("manageBusinesses.table.sector")}</th>
                  <th>{t("manageBusinesses.table.state")}</th>
                  <th style={{ textAlign: "right" }}>{t("manageBusinesses.table.managementActions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((biz) => {
                    const st = getStatus(biz.status);
                    return (
                      <tr key={biz.id}>
                        <td className="table-name">
                          <div className="table-name__inner">
                            <div className="table-name__avatar">{biz.name.charAt(0).toUpperCase()}</div>
                            <span>{biz.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="table-category">{biz.category}</span>
                        </td>
                        <td>
                          <span className="status-badge" style={{ background: st.bg, color: st.text }}>
                            <span className="status-badge__dot" style={{ background: st.dot }} />
                            {t(st.labelKey)}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <ActionMenu
                            business={biz}
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
                    <td colSpan={4} className="table-empty">
                      {t("manageBusinesses.noResults", "No businesses found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`.mb-spin{animation:mb-spin 1s linear infinite}@keyframes mb-spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

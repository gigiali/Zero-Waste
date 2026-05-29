import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search, MoreVertical, CheckCircle, XCircle,
  Trash2, Loader2, ArrowLeft, Store, Clock,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import "./ManageBusinesses.css";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);
const canDelete    = (r) => isSuperAdmin(r);

const statusConfig = {
  approved:     { bg: "#e8faf0", text: "#28c76f", dot: "#28c76f", labelKey: "manageBusinesses.status.approved" },
  active:       { bg: "#e8faf0", text: "#28c76f", dot: "#28c76f", labelKey: "manageBusinesses.status.active" },
  pending:      { bg: "#fff6e0", text: "#ff9f43", dot: "#ff9f43", labelKey: "manageBusinesses.status.pending" },
  under_review: { bg: "#e7e7ff", text: "#696cff", dot: "#696cff", labelKey: "manageBusinesses.status.underReview" },
  rejected:     { bg: "#ffeaea", text: "#ef4444", dot: "#ef4444", labelKey: "manageBusinesses.status.rejected" },
};
const fallbackStatus = { bg: "#f0f0f5", text: "#8592a3", dot: "#8592a3", labelKey: "manageBusinesses.status.unknown" };
const getStatus = (s) => statusConfig[s?.toLowerCase?.()] ?? fallbackStatus;

/* ── fetch ALL pages helper ── */
async function fetchAllVendors(token) {
  let page = 1;
  let allVendors = [];
  while (true) {
    const res = await fetch(`${BASE_URL}/vendors?page=${page}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
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
  }
  return allVendors;
}

/* ── DELETE CONFIRM MODAL ── */
function DeleteConfirmModal({ businessName, onConfirm, onCancel, busy }) {
  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:400, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" }}>
        <div style={{ padding:"28px 28px 20px", textAlign:"center" }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:"#ffeaea", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <Trash2 size={22} color="#ef4444" />
          </div>
          <h3 style={{ margin:"0 0 8px", fontSize:17, fontWeight:700, color:"#2d3a4a" }}>Delete Business</h3>
          <p style={{ margin:0, fontSize:13.5, color:"#8592a3", lineHeight:1.6 }}>
            Are you sure you want to delete <strong style={{ color:"#2d3a4a" }}>"{businessName}"</strong>?
            <br />This action cannot be undone.
          </p>
        </div>
        <div style={{ display:"flex", gap:10, padding:"0 28px 24px" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{ flex:1, padding:"11px", borderRadius:10, border:"1.5px solid #e0e3eb", background:"#fff", color:"#5d6679", fontWeight:600, fontSize:14, cursor:"pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:"#ef4444", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
          >
            {busy ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── REJECT REASON MODAL ── */
function RejectReasonModal({ businessName, onConfirm, onCancel, busy }) {
  const [reason, setReason] = useState("Does not meet requirements");
  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:420, boxShadow:"0 20px 60px rgba(0,0,0,0.2)", overflow:"hidden" }}>
        <div style={{ padding:"24px 24px 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:42, height:42, borderRadius:"50%", background:"#fff3e0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <XCircle size={20} color="#ff9f43" />
            </div>
            <div>
              <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"#2d3a4a" }}>Reject Business</h3>
              <p style={{ margin:0, fontSize:12.5, color:"#8592a3" }}>"{businessName}"</p>
            </div>
          </div>
          <label style={{ display:"block", fontSize:12.5, fontWeight:600, color:"#5d6679", marginBottom:6, textTransform:"uppercase", letterSpacing:.4 }}>
            Rejection Reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            autoFocus
            style={{ width:"100%", borderRadius:10, border:"1.5px solid #e0e3eb", padding:"10px 12px", fontSize:13.5, color:"#2d3a4a", resize:"vertical", outline:"none", fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.5 }}
            onFocus={(e) => e.target.style.borderColor = "#696cff"}
            onBlur={(e) => e.target.style.borderColor = "#e0e3eb"}
          />
        </div>
        <div style={{ display:"flex", gap:10, padding:"16px 24px 24px" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{ flex:1, padding:"11px", borderRadius:10, border:"1.5px solid #e0e3eb", background:"#fff", color:"#5d6679", fontWeight:600, fontSize:14, cursor:"pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={busy || !reason.trim()}
            style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background: reason.trim() ? "#ff9f43" : "#f0f0f5", color: reason.trim() ? "#fff" : "#aaa", fontWeight:700, fontSize:14, cursor: reason.trim() ? "pointer" : "not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all .15s" }}
          >
            {busy ? <Loader2 size={15} className="spin" /> : <XCircle size={15} />} Reject
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VENDOR DETAILS MODAL ── */
function VendorDetailsModal({ business, token, onClose, onStatusChange }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [busy, setBusy]       = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { t } = useTranslation();

  const isPending = ["pending", "under_review"].includes(business.status);

  useEffect(() => {
    (async () => {
      try {
        const url = isPending
          ? `${BASE_URL}/admin/vendor/${business.id}`
          : `${BASE_URL}/vendor/${business.id}`;
        const res  = await fetch(url, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) { setError(data?.message ?? "Failed to load vendor details."); return; }
        setDetails(data?.data ?? null);
      } catch (e) {
        setError("Failed to load vendor details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [business.id, token]);

  const handleApprove = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/vendor/${business.id}/accept`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      if (res.ok) { onStatusChange(business.id, "approved"); onClose(); }
      else alert(t("manageBusinesses.errors.approveFailed"));
    } finally { setBusy(false); }
  };

  const handleRejectConfirm = async (reason) => {
    setBusy(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/vendor/${business.id}/reject`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) { onStatusChange(business.id, "rejected"); onClose(); }
      else alert(t("manageBusinesses.errors.rejectFailed"));
    } finally { setBusy(false); setShowRejectModal(false); }
  };

  const storageBase = "https://zero-waste-production.up.railway.app/storage/";
  const canAct = isPending;
  const businessName    = details?.business_name?.replace(/"/g, "") ?? business.name;
  const vendorType      = details?.vendor_type?.replace(/"/g, "")   ?? business.category;
  const ownerName       = details?.user?.name     ?? details?.owner_name ?? "—";
  const ownerEmail      = details?.user?.email    ?? details?.email      ?? "—";
  const ownerPhone      = details?.user?.phone    ?? details?.phone      ?? "—";
  const ownerAddress    = details?.user?.address  ?? details?.address    ?? "—";
  const taxNumber       = details?.tax_number     ?? "—";
  const userStatus      = details?.user?.status   ?? details?.status     ?? business.status;
  const logoUrl         = details?.logo           ?? null;
  const commercialReg   = details?.commercial_register ?? null;
  const taxCard         = details?.tax_card            ?? null;
  const rejectionReason = details?.rejection_reason    ?? null;

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
      <div
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
          <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #f0f0f5", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {logoUrl
                ? <img src={logoUrl} alt="logo" style={{ width:44, height:44, borderRadius:10, objectFit:"cover", border:"1px solid #eee" }} />
                : <div style={{ width:44, height:44, borderRadius:10, background:"#f0f0f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#8592a3" }}>{business.name.charAt(0)}</div>
              }
              <div>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"#2d3a4a" }}>{businessName}</h3>
                <span style={{ fontSize:12, color:"#8592a3" }}>{vendorType}</span>
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#8592a3", lineHeight:1 }}>✕</button>
          </div>
          <div style={{ padding:"20px 24px" }}>
            {loading && <div style={{ textAlign:"center", padding:"32px 0", color:"#8592a3" }}><Loader2 size={24} className="spin" /></div>}
            {error   && <div style={{ color:"#ef4444", fontSize:13 }}>{error}</div>}
            {details && !loading && (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                  {[
                    { label:"Owner",   value: ownerName },
                    { label:"Email",   value: ownerEmail },
                    { label:"Phone",   value: ownerPhone },
                    { label:"Address", value: ownerAddress },
                    { label:"Tax No.", value: taxNumber },
                    { label:"Status",  value: userStatus },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background:"#f8f9fc", borderRadius:8, padding:"10px 14px" }}>
                      <p style={{ margin:0, fontSize:11, color:"#8592a3", fontWeight:600, textTransform:"uppercase", letterSpacing:.5 }}>{label}</p>
                      <p style={{ margin:"4px 0 0", fontSize:13, color:"#2d3a4a", fontWeight:500 }}>{value ?? "—"}</p>
                    </div>
                  ))}
                </div>
                {(commercialReg || taxCard) && (
                  <>
                    <p style={{ margin:"0 0 10px", fontSize:12, fontWeight:700, color:"#8592a3", textTransform:"uppercase", letterSpacing:.5 }}>Documents</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                      {[
                        { label:"Commercial Register", path: commercialReg },
                        { label:"Tax Card",             path: taxCard },
                      ].map(({ label, path }) => (
                        <a key={label} href={path ? storageBase + path : "#"} target="_blank" rel="noreferrer"
                           style={{ display:"block", border:"1.5px dashed #d0d5dd", borderRadius:10, padding:"14px", textAlign:"center", textDecoration:"none", color: path ? "#696cff" : "#aaa", fontSize:13, fontWeight:600, background:"#f8f9ff" }}>
                          📄 {label}
                        </a>
                      ))}
                    </div>
                  </>
                )}
                {rejectionReason && (
                  <div style={{ background:"#ffeaea", borderRadius:8, padding:"10px 14px", marginBottom:16 }}>
                    <p style={{ margin:0, fontSize:12, color:"#ef4444", fontWeight:600 }}>Rejection Reason</p>
                    <p style={{ margin:"4px 0 0", fontSize:13, color:"#2d3a4a" }}>{rejectionReason}</p>
                  </div>
                )}
                {canAct && (
                  <div style={{ display:"flex", gap:10 }}>
                    <button type="button" onClick={handleApprove} disabled={busy}
                      style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:"#28c76f", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      {busy ? <Loader2 size={15} className="spin" /> : <CheckCircle size={15} />} Approve
                    </button>
                    <button type="button" onClick={() => setShowRejectModal(true)} disabled={busy}
                      style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:"#fff3e0", color:"#ff9f43", fontWeight:700, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      {busy ? <Loader2 size={15} className="spin" /> : <XCircle size={15} />} Reject
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

/* ── ACTION MENU ── */
function ActionMenu({ business, role, token, onStatusChange, onDelete }) {
  const [open, setOpen]                   = useState(false);
  const [busy, setBusy]                   = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [menuPos, setMenuPos]             = useState({ top: 0, left: 0 });
  const btnRef  = useRef(null);
  const menuRef = useRef(null);
  const { t }   = useTranslation();

  useEffect(() => {
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false);
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
    setBusy(true); setOpen(false);
    try {
      const res = await fetch(`${BASE_URL}/admin/vendor/${business.id}/accept`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      if (res.ok) onStatusChange(business.id, "approved");
      else alert(t("manageBusinesses.errors.approveFailed"));
    } finally { setBusy(false); }
  };

  const handleRejectConfirm = async (reason) => {
    setBusy(true); setOpen(false);
    try {
      const res = await fetch(`${BASE_URL}/admin/vendor/${business.id}/reject`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) onStatusChange(business.id, "rejected");
      else alert(t("manageBusinesses.errors.rejectFailed"));
    } finally { setBusy(false); setShowRejectModal(false); }
  };

  const handleDeleteConfirm = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/vendor/${business.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) onDelete(business.id);
      else alert(t("manageBusinesses.errors.deleteFailed"));
    } finally { setBusy(false); setShowDeleteModal(false); }
  };

  const actions = [
    { icon: <Store size={14} />,       label: "View Details",                        color: "#696cff", onClick: () => { setShowModal(true); setOpen(false); },       show: canManage(role) },
    { icon: <CheckCircle size={14} />, label: t("manageBusinesses.actions.approve"), color: "#28c76f", onClick: handleApprove,                                        show: canManage(role) && !["approved", "rejected", "active"].includes(business.status) },
    { icon: <XCircle size={14} />,     label: t("manageBusinesses.actions.reject"),  color: "#ff9f43", onClick: () => { setShowRejectModal(true); setOpen(false); },  show: canManage(role) && !["approved", "rejected", "active"].includes(business.status) },
    { icon: <Trash2 size={14} />,      label: t("manageBusinesses.actions.delete"),  color: "#ef4444", onClick: () => { setShowDeleteModal(true); setOpen(false); },  show: canDelete(role), divider: true },
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
        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6, color: "#8592a3" }}
      >
        {busy ? <Loader2 size={16} className="spin" /> : <MoreVertical size={16} />}
      </button>

      {open && actions.length > 0 && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            zIndex: 9999,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: 160,
            padding: "6px 0",
            border: "1px solid #f0f0f5",
          }}
        >
          {actions.map((a) => (
            <React.Fragment key={a.label}>
              {a.divider && <div style={{ height: 1, background: "#f0f0f5", margin: "4px 0" }} />}
              <button
                type="button"
                onClick={a.onClick}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 14px", border: "none", background: "none", cursor: "pointer", fontSize: 13, color: a.color, fontWeight: 500, textAlign: "left" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f8f9fc"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                {a.icon} {a.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
}

/* ── MAIN ── */
export default function ManageBusinesses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, token: contextToken } = useAuth();
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");

  const [businesses, setBusinesses]         = useState([]);
  const [dataLoading, setDataLoading]       = useState(false);
  const [fetchError, setFetchError]         = useState(null);
  const [searchTerm, setSearchTerm]         = useState("");
  const [filterStatus, setFilterStatus]     = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    if (!token) return;
    (async () => {
      setDataLoading(true);
      setFetchError(null);
      try {
        const [allVendors, pendingResult] = await Promise.allSettled([
          fetchAllVendors(token),
          fetch(`${BASE_URL}/admin/vendor/pending`, {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          }).then((r) => (r.ok ? r.json() : { data: { vendors: [] } }))
            .catch(() => ({ data: { vendors: [] } })),
        ]);

        const allVendorsList = allVendors.status === "fulfilled" ? allVendors.value : [];
        const pendingData    = pendingResult.status === "fulfilled" ? pendingResult.value : {};
        const pendingVendors = Array.isArray(pendingData?.data?.vendors) ? pendingData.data.vendors : [];

        const pendingIds = new Set(pendingVendors.map((v) => v.id));
        const merged = [
          ...pendingVendors.map((v) => ({ ...v })),
          ...allVendorsList.filter((v) => !pendingIds.has(v.id)),
        ];

        setBusinesses(merged.map((v) => ({
          id:       v.id,
          name:     v.business_name ?? v.name ?? t("manageBusinesses.unknownBusiness"),
          category: v.vendor_type ?? "—",
          status:   v.status ?? "approved",
        })));
      } catch (err) {
        console.error("Fetch Error:", err);
        setFetchError(err.message);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [token]);

  const handleStatusChange = (id, status) =>
    setBusinesses((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  const handleDelete = (id) =>
    setBusinesses((prev) => prev.filter((b) => b.id !== id));

  const filtered = businesses.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus   === "all" || b.status   === filterStatus;
    const matchCat    = filterCategory === "all" || b.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const categories    = [...new Set(businesses.map((b) => b.category))];
  const statuses      = [...new Set(businesses.map((b) => b.status))];
  const activeCount   = businesses.filter((b) => ["approved", "active"].includes(b.status)).length;
  const pendingCount  = businesses.filter((b) => ["pending", "under_review"].includes(b.status)).length;
  const rejectedCount = businesses.filter((b) => b.status === "rejected").length;

  return (
    <>
      <div className="businesses-page container mt-4 mb-5">

        {/* Header */}
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

        {/* Stats */}
        <div className="businesses-stats">
          <div className="biz-stat biz-stat--indigo">
            <div className="biz-stat__icon"><Store size={20} /></div>
            <div>
              <p className="biz-stat__label">{t("manageBusinesses.stats.totalRegistered")}</p>
              <p className="biz-stat__value">{businesses.length}</p>
            </div>
          </div>
          <div className="biz-stat biz-stat--emerald">
            <div className="biz-stat__icon"><CheckCircle size={20} /></div>
            <div>
              <p className="biz-stat__label">{t("manageBusinesses.stats.activeState")}</p>
              <p className="biz-stat__value">{activeCount}</p>
            </div>
          </div>
          <div className="biz-stat biz-stat--amber">
            <div className="biz-stat__icon"><Clock size={20} /></div>
            <div>
              <p className="biz-stat__label">{t("manageBusinesses.stats.awaitingVerification")}</p>
              <p className="biz-stat__value">{pendingCount}</p>
            </div>
          </div>
          <div className="biz-stat biz-stat--red">
            <div className="biz-stat__icon"><XCircle size={20} /></div>
            <div>
              <p className="biz-stat__label">Rejected</p>
              <p className="biz-stat__value">{rejectedCount}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
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
              {statuses.filter(Boolean).map((s) => <option key={s} value={s}>{t(getStatus(s).labelKey)}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
              <option value="all">{t("manageBusinesses.controls.allSectors")}</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Error banner */}
        {fetchError && (
          <div style={{ background: "#ffeaea", color: "#ef4444", padding: "10px 16px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
            ⚠️ حصل خطأ في جلب البيانات: {fetchError}
          </div>
        )}

        {/* Table */}
        <div className="businesses-table-wrapper">
          {dataLoading ? (
            <div className="table-loading">
              <Loader2 size={18} className="spin" />
              <span>{t("manageBusinesses.loading")}</span>
            </div>
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
                {filtered.length > 0 ? filtered.map((biz) => {
                  const st = getStatus(biz.status);
                  return (
                    <tr key={biz.id}>
                      <td className="table-name">
                        <div className="table-name__inner">
                          <div className="table-name__avatar">{biz.name.charAt(0).toUpperCase()}</div>
                          <span>{biz.name}</span>
                        </div>
                      </td>
                      <td><span className="table-category">{biz.category}</span></td>
                      <td>
                        <span className="status-badge" style={{ background: st.bg, color: st.text }}>
                          <span className="status-badge__dot" style={{ background: st.dot }} />
                          {t(st.labelKey)}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <ActionMenu business={biz} role={role} token={token} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                      </td>
                    </tr>
                  );
                }) : (
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
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit2, LogOut, Trash2, ChevronRight, KeyRound,
  Building2, Hash, Image, FileText, Upload, X,
} from "lucide-react";
import "./MyProfileBusiness.css";
import { useAuth } from "../Context/AuthContext";

const BASE_URL = "https://zero-waste-production.up.railway.app/api";

const getToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  sessionStorage.getItem("token");

function LoadingSkeleton() {
  return (
    <>
      <div className="biz-card biz-skeleton-card">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
      <div className="biz-card biz-skeleton-card">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
      <div className="biz-card biz-skeleton-card">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
    </>
  );
}

function TimeoutMessage({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`biz-timeout-message biz-timeout-${type}`}>
      <span className="biz-timeout-icon">
        {type === "error" ? "⚠" : type === "success" ? "✓" : "⏱"}
      </span>
      <span className="biz-timeout-text">{message}</span>
      <button className="biz-timeout-close" onClick={onClose}>×</button>
    </div>
  );
}

function ChangePassword({ onCancel }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [timeoutMsg, setTimeoutMsg] = useState("");

  const handleChange = async () => {
    const e = {};
    if (!form.current) e.current_password = "Current password is required";
    if (!form.next) e.new_password = "New password is required";
    else if (form.next.length < 6) e.new_password = "At least 6 characters";
    if (!form.confirm) e.new_password_confirmation = "Please confirm password";
    else if (form.next !== form.confirm) e.new_password_confirmation = "Passwords do not match";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/vendor/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          current_password: form.current,
          password: form.next,
          password_confirmation: form.confirm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("✓ Password changed successfully!");
        setTimeoutMsg("");
        setTimeout(() => onCancel(), 1500);
      } else if (data.errors) {
        const newErrors = {};
        Object.keys(data.errors).forEach((f) => {
          newErrors[f] = Array.isArray(data.errors[f]) ? data.errors[f][0] : data.errors[f];
        });
        setErrors(newErrors);
      } else {
        setTimeoutMsg(data.message || "Failed to change password.");
      }
    } catch (err) {
      setTimeoutMsg("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="biz-page">
      <div className="biz-hero">
        <div className="biz-hero-inner">
          <div className="biz-hero-left">
            <div>
              <h1 className="biz-hero-title">Change Password</h1>
              <p className="biz-hero-sub">Update your business account password</p>
            </div>
          </div>
          <button className="biz-hero-btn" onClick={onCancel}>← Back</button>
        </div>
      </div>
      <div className="biz-body">
        {timeoutMsg && <TimeoutMessage message={timeoutMsg} type="error" onClose={() => setTimeoutMsg("")} />}
        <div className="biz-card">
          <h2 className="biz-card-title">Set New Password</h2>
          <div className="biz-pw-group">
            {[
              ["current", "current_password", "Current password"],
              ["next", "new_password", "New password"],
              ["confirm", "new_password_confirmation", "Confirm new password"],
            ].map(([fk, ek, ph]) => (
              <div key={fk} className="biz-pw-wrap">
                <input
                  type="password"
                  placeholder={ph}
                  value={form[fk]}
                  className={errors[ek] ? "has-error" : ""}
                  onChange={(e) => setForm((p) => ({ ...p, [fk]: e.target.value }))}
                />
                {errors[ek] && <span className="biz-pw-error">{errors[ek]}</span>}
              </div>
            ))}
            {errors.general && <span className="biz-pw-error">{errors.general}</span>}
            {success && <span className="biz-pw-success">{success}</span>}
            <button
              onClick={handleChange}
              disabled={isLoading}
              className="biz-btn-save biz-btn-fullwidth"
            >
              {isLoading ? "Saving…" : "Save Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileUploadField({ label, icon, accept, file, previewUrl, onChange, onClear, error, hint }) {
  const inputRef = useRef();
  const isImage =
    file?.type?.startsWith("image/") ||
    (!file && previewUrl && /\.(jpg|jpeg|png)$/i.test(previewUrl));

  return (
    <div className="biz-info-row biz-info-row-file">
      <span className="biz-info-icon">{icon}</span>
      <div className="biz-info-text">
        <span className="biz-info-label">{label}</span>
        {hint && <span className="biz-info-hint">{hint}</span>}

        {previewUrl && (
          <div className="biz-preview-wrap">
            {isImage ? (
              <img src={previewUrl} alt={label} className="biz-preview-img" />
            ) : (
              <div className="biz-preview-doc">
                <FileText size={15} />
                <span>{file?.name || "Uploaded file"}</span>
              </div>
            )}
            <button className="biz-clear-btn" onClick={onClear} type="button">
              <X size={11} color="white" />
            </button>
          </div>
        )}

        <button
          type="button"
          className={`biz-upload-btn${error ? " has-error" : ""}`}
          onClick={() => inputRef.current.click()}
        >
          <Upload size={14} />
          {previewUrl ? "Change file" : "Upload file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="biz-file-input"
          onChange={onChange}
        />
        {error && <span className="biz-input-error">{error}</span>}
      </div>
    </div>
  );
}

function ConfirmModal({ emoji, title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="biz-overlay" onClick={onCancel}>
      <div className="biz-modal" onClick={(e) => e.stopPropagation()}>
        <div className="biz-modal-emoji">{emoji}</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="biz-modal-actions">
          <button className="biz-modal-cancel" onClick={onCancel}>Cancel</button>
          <button className="biz-modal-confirm" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function MyProfileBusiness() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [view, setView] = useState("main");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errors, setErrors] = useState({});
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [timeoutMsg, setTimeoutMsg] = useState("");
  const [timeoutType, setTimeoutType] = useState("error");

  const [vendorData, setVendorData] = useState({
    business_name: "",
    tax_number: "",
    vendor_type: "",
    status: "",
  });
  const [editData, setEditData] = useState({ ...vendorData });
  const [editOwner, setEditOwner] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [ownerInfo, setOwnerInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  useEffect(() => {
    console.log("user object:", user);
    setEditOwner({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  }, [user]);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [commercialFile, setCommercialFile] = useState(null);
  const [commercialPreview, setCommercialPreview] = useState("");
  const [taxCardFile, setTaxCardFile] = useState(null);
  const [taxCardPreview, setTaxCardPreview] = useState("");

  const fetchVendorData = async () => {
    setIsLoadingProfile(true);
    setTimeoutMsg("");
    try {
      const res = await fetch(`${BASE_URL}/myprofile`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        const v = data.data?.vendor || data.vendor || data.data || data;
       // لـ
const toUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const clean = path.replace(/^\/+/, "");
  return `https://zero-waste-production.up.railway.app/${clean}`;
};

        const d = {
          business_name: v.business_name || "",
          tax_number: v.tax_number || "",
          vendor_type: v.vendor_type || "",
          status: v.status || "",
        };
        setVendorData(d);
        setEditData(d);
        setLogoPreview(toUrl(v.logo));
        setCommercialPreview(toUrl(v.commercial_register));
        setTaxCardPreview(toUrl(v.tax_card));
      } else {
        setTimeoutMsg("Failed to load profile");
        setTimeoutType("error");
      }
    } catch (err) {
      setTimeoutMsg("Network error. Please check your connection.");
      setTimeoutType("error");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const handleFile = (setter, previewSetter) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setter(file);
    previewSetter(URL.createObjectURL(file));
    e.target.value = "";
  };

  const clearFile = (setter, previewSetter) => () => {
    setter(null);
    previewSetter("");
  };

  const handleSave = async () => {
    const e = {};
    if (!editData.business_name.trim()) e.business_name = "Business name is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsLoading(true);
    setTimeoutMsg("");
    try {
      const formData = new FormData();
      formData.append("business_name", editData.business_name.trim());
      if (editData.tax_number.trim()) formData.append("tax_number", editData.tax_number.trim());
      if (editData.vendor_type) formData.append("vendor_type", editData.vendor_type);
      if (editOwner.name.trim()) formData.append("name", editOwner.name.trim());
      if (editOwner.email.trim()) formData.append("email", editOwner.email.trim());
      if (editOwner.phone.trim()) formData.append("phone", editOwner.phone.trim());
      formData.append("address", editOwner.address?.trim() || "");
      if (logoFile) formData.append("logo", logoFile);
      if (commercialFile) formData.append("commercial_register", commercialFile);
      if (taxCardFile) formData.append("tax_card", taxCardFile);

      const res = await fetch(`${BASE_URL}/vendor/myprofile/update`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setLogoFile(null);
        setCommercialFile(null);
        setTaxCardFile(null);
        setIsEditing(false);
        setTimeoutMsg("Profile updated successfully");
        setTimeoutType("success");
        setOwnerInfo({
          name: editOwner.name,
          email: editOwner.email,
          phone: editOwner.phone,
          address: editOwner.address,
        });
        await fetchVendorData();
      } else if (res.status === 422 && data.errors) {
        const newErrors = {};
        Object.keys(data.errors).forEach((f) => {
          newErrors[f] = Array.isArray(data.errors[f]) ? data.errors[f][0] : data.errors[f];
        });
        setErrors(newErrors);
        setTimeoutMsg("Please fix the errors below");
        setTimeoutType("error");
      } else {
        setTimeoutMsg(data.message || "Failed to update profile.");
        setTimeoutType("error");
      }
    } catch (err) {
      setTimeoutMsg("Network error. Please check your connection.");
      setTimeoutType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...vendorData });
    setEditOwner({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setLogoFile(null);
    setCommercialFile(null);
    setTaxCardFile(null);
    setErrors({});
    setIsEditing(false);
    fetchVendorData();
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${BASE_URL}/vendor/delete-account`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        logout();
        navigate("/home");
      } else {
        setTimeoutMsg("Failed to delete account");
        setTimeoutType("error");
      }
    } catch (err) {
      setTimeoutMsg("Network error");
      setTimeoutType("error");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
    } finally {
      logout();
      setShowLogout(false);
      navigate("/home");
    }
  };

  const initials = vendorData.business_name
    ? vendorData.business_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "B";

  const statusClass =
    vendorData.status === "approved" ? "approved"
    : vendorData.status === "rejected" ? "rejected"
    : "pending";

  const statusLabel =
    vendorData.status === "approved" ? "✓ Approved"
    : vendorData.status === "rejected" ? "✗ Rejected"
    : "⏳ Pending Review";

  const vendorTypes = ["restaurant", "supermarket", "coffee-shop", "hotel", "bakery", "dessert-shop"];

  const ownerRows = [
    ["Owner Name", ownerInfo.name],
    ["Email", ownerInfo.email],
    ["Phone", ownerInfo.phone],
    ["Address", ownerInfo.address],
  ];

  if (view === "password") return <ChangePassword onCancel={() => setView("main")} />;

  return (
    <>
      <div className="biz-page">
        {timeoutMsg && (
          <TimeoutMessage
            message={timeoutMsg}
            type={timeoutType}
            onClose={() => setTimeoutMsg("")}
          />
        )}

        <div className="biz-hero">
          <div className="biz-hero-inner">
            <div className="biz-hero-left">
              <div className="biz-avatar">{initials}</div>
              <div>
                <h1 className="biz-hero-title">
                  {vendorData.business_name || "Business Profile"}
                </h1>
                <p className="biz-hero-sub">Manage your business information</p>
                {vendorData.status && (
                  <span className={`biz-status-badge ${statusClass}`}>
                    {statusLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="biz-hero-actions">
              <button
                className="biz-hero-btn"
                onClick={() => { if (isEditing) handleCancel(); else setIsEditing(true); }}
              >
                <Edit2 size={15} />
                {isEditing ? "Cancel Editing" : "Edit Profile"}
              </button>
              <button className="biz-hero-btn" onClick={async () => {
                  try {
                    const res = await fetch(`${BASE_URL}/myprofile`, {
                      headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
                    });
                    const data = await res.json();
                    const v = data.data?.vendor || data.vendor || data.data || data;
                    const freshStatus = data.data?.status || "";

                    if (freshStatus !== "approved" && freshStatus !== "active") {
                      setTimeoutMsg("⏳ Your account is still waiting for admin approval. You cannot access the dashboard yet.");
                      setTimeoutType("warning");
                    } else {
                    
const branchRes = await fetch(`${BASE_URL}/my-branches`, {
                      headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
                    });
                    const branchData = await branchRes.json();
                    const branches = branchData.data || branchData.branches || branchData || [];
                    const branchList = Array.isArray(branches) ? branches : [];
                    if (branchList.length === 0) {
                      navigate("/add-branch");
                    } else {
                      navigate("/business");
                    }
                    }
                  } catch {
                    setTimeoutMsg("Network error. Please try again.");
                    setTimeoutType("error");
                  }
                }}>
                Dashboard →
              </button>
            </div>
          </div>
        </div>

        <div className="biz-body">
          {isLoadingProfile ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="biz-card">
                <h2 className="biz-card-title">Owner Information</h2>
                <div className="biz-info-list">
                  {[
                    ["Owner Name", "name"],
                    ["Email", "email"],
                    ["Phone", "phone"],
                    ["Address", "address"],
                  ].map(([label, field]) => (
                    <div className="biz-info-row" key={field}>
                      <span className="biz-info-icon"><Building2 size={17} /></span>
                      <div className="biz-info-text">
                        <span className="biz-info-label">{label}</span>
                        {isEditing ? (
                          <input
                            className={`biz-input${errors[field] ? " has-error" : ""}`}
                            type="text"
                            value={editOwner[field]}
                            onChange={(e) => setEditOwner((p) => ({ ...p, [field]: e.target.value }))}
                          />
                        ) : (
                          <span className="biz-info-value">{ownerInfo[field] || "—"}</span>
                        )}
                        {errors[field] && <span className="biz-input-error">{errors[field]}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="biz-card">
                <h2 className="biz-card-title">Business Information</h2>
                <div className="biz-info-list">
                  <div className="biz-info-row">
                    <span className="biz-info-icon"><Building2 size={17} /></span>
                    <div className="biz-info-text">
                      <span className="biz-info-label">Business Name</span>
                      {isEditing ? (
                        <>
                          <input
                            className={`biz-input${errors.business_name ? " has-error" : ""}`}
                            type="text"
                            value={editData.business_name}
                            onChange={(e) => {
                              setEditData({ ...editData, business_name: e.target.value });
                              if (errors.business_name) setErrors((p) => ({ ...p, business_name: "" }));
                            }}
                          />
                          {errors.business_name && <span className="biz-input-error">{errors.business_name}</span>}
                        </>
                      ) : (
                        <span className="biz-info-value">{vendorData.business_name || "—"}</span>
                      )}
                    </div>
                  </div>

                  <div className="biz-info-row">
                    <span className="biz-info-icon"><Building2 size={17} /></span>
                    <div className="biz-info-text">
                      <span className="biz-info-label">Business Type</span>
                      {isEditing ? (
                        <select
                          className="biz-input"
                          value={editData.vendor_type}
                          onChange={(e) => setEditData({ ...editData, vendor_type: e.target.value })}
                        >
                          <option value="">Select type</option>
                          {vendorTypes.map((t) => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="biz-info-value">
                          {vendorData.vendor_type
                            ? vendorData.vendor_type.charAt(0).toUpperCase() + vendorData.vendor_type.slice(1).replace("-", " ")
                            : "—"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="biz-info-row">
                    <span className="biz-info-icon"><Hash size={17} /></span>
                    <div className="biz-info-text">
                      <span className="biz-info-label">Tax Number</span>
                      {isEditing ? (
                        <>
                          <input
                            className={`biz-input${errors.tax_number ? " has-error" : ""}`}
                            type="text"
                            placeholder="Optional"
                            value={editData.tax_number}
                            onChange={(e) => {
                              setEditData({ ...editData, tax_number: e.target.value });
                              if (errors.tax_number) setErrors((p) => ({ ...p, tax_number: "" }));
                            }}
                          />
                          {errors.tax_number && <span className="biz-input-error">{errors.tax_number}</span>}
                        </>
                      ) : (
                        <span className="biz-info-value">{vendorData.tax_number || "—"}</span>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      <FileUploadField
                        label="Business Logo"
                        icon={<Image size={17} />}
                        accept="image/jpeg,image/png,image/jpg"
                        file={logoFile}
                        previewUrl={logoFile ? URL.createObjectURL(logoFile) : logoPreview}
                        onChange={handleFile(setLogoFile, setLogoPreview)}
                        onClear={clearFile(setLogoFile, setLogoPreview)}
                        error={errors.logo}
                        hint="JPEG or PNG · max 2 MB"
                      />
                      <FileUploadField
                        label="Commercial Register"
                        icon={<FileText size={17} />}
                        accept="application/pdf,image/jpeg,image/png,image/jpg"
                        file={commercialFile}
                        previewUrl={commercialFile ? URL.createObjectURL(commercialFile) : commercialPreview}
                        onChange={handleFile(setCommercialFile, setCommercialPreview)}
                        onClear={clearFile(setCommercialFile, setCommercialPreview)}
                        error={errors.commercial_register}
                        hint="PDF, JPG or PNG · max 5 MB"
                      />
                      <FileUploadField
                        label="Tax Card"
                        icon={<FileText size={17} />}
                        accept="application/pdf,image/jpeg,image/png,image/jpg"
                        file={taxCardFile}
                        previewUrl={taxCardFile ? URL.createObjectURL(taxCardFile) : taxCardPreview}
                        onChange={handleFile(setTaxCardFile, setTaxCardPreview)}
                        onClear={clearFile(setTaxCardFile, setTaxCardPreview)}
                        error={errors.tax_card}
                        hint="PDF, JPG or PNG · max 5 MB"
                      />
                    </>
                  ) : (
                    <>
                      <div className="biz-info-row">
                        <span className="biz-info-icon"><Image size={17} /></span>
                        <div className="biz-info-text">
                          <span className="biz-info-label">Business Logo</span>
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="biz-preview-img" />
                          ) : (
                            <span className="biz-info-value">—</span>
                          )}
                        </div>
                      </div>

                      <div className="biz-info-row">
                        <span className="biz-info-icon"><FileText size={17} /></span>
                        <div className="biz-info-text">
                          <span className="biz-info-label">Commercial Register</span>
                          {commercialPreview
                            ? <a href={commercialPreview} target="_blank" rel="noreferrer" className="biz-doc-link">View document ↗</a>
                            : <span className="biz-info-value">—</span>}
                        </div>
                      </div>

                      <div className="biz-info-row">
                        <span className="biz-info-icon"><FileText size={17} /></span>
                        <div className="biz-info-text">
                          <span className="biz-info-label">Tax Card</span>
                          {taxCardPreview
                            ? <a href={taxCardPreview} target="_blank" rel="noreferrer" className="biz-doc-link">View document ↗</a>
                            : <span className="biz-info-value">—</span>}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {errors.general && <div className="biz-general-error">{errors.general}</div>}

                {isEditing && (
                  <div className="biz-edit-actions">
                    <button className="biz-btn-save" onClick={handleSave} disabled={isLoading}>
                      {isLoading ? "Saving…" : "Save Changes"}
                    </button>
                    <button className="biz-btn-cancel" onClick={handleCancel} disabled={isLoading}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="biz-card">
                <h2 className="biz-card-title">Account Settings</h2>
                <div className="biz-settings-list">
                  {[
                    { icon: <KeyRound size={16} />, label: "Change Password", onClick: () => setView("password"), red: false, chevron: true },
                    { icon: <LogOut size={16} />, label: "Log Out", onClick: () => setShowLogout(true), red: true, chevron: false },
                    { icon: <Trash2 size={16} />, label: "Delete Account", onClick: () => setShowDelete(true), red: true, chevron: false },
                  ].map(({ icon, label, onClick, red, chevron }) => (
                    <button key={label} className={`biz-setting-row${red ? " biz-setting-red" : ""}`} onClick={onClick}>
                      <span className="biz-setting-icon">{icon}</span>
                      <span className="biz-setting-label">{label}</span>
                      {chevron && <ChevronRight size={16} className="biz-chevron" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showDelete && (
        <ConfirmModal
          emoji="🗑️"
          title="Delete Account?"
          message="This action is permanent and cannot be undone. Your business and all its data will be permanently deleted."
          confirmLabel="Yes, Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}

      {showLogout && (
        <ConfirmModal
          emoji="👋"
          title="Log Out?"
          message="Are you sure you want to log out of your business account?"
          confirmLabel="Yes, Log Out"
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
}

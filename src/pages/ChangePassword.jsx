import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import "./ChangePassword.css";

export default function ChangePassword({ onCancel }) {
  const { t } = useTranslation();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    setError("");
    if (!form.current || !form.newPass || !form.confirm) {
      setError(t("auth.fillAllFields"));
      return;
    }
    if (form.newPass.length < 8) {
      setError(t("auth.passwordMinLength"));
      return;
    }
    if (form.newPass !== form.confirm) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="cp-page">
      {/* Hero */}
      <div className="cp-hero">
        <div className="cp-hero-inner">
          <h1 className="cp-title">{t("auth.changePasswordTitle")}</h1>
          <p className="cp-subtitle">{t("auth.changePasswordSubtitle")}</p>
        </div>
      </div>

      {/* Card */}
      <div className="cp-body">
        <div className="cp-card">
          {success ? (
            <div className="cp-success">
              <div className="cp-success-icon">✓</div>
              <h2>{t("auth.passwordUpdatedTitle")}</h2>
              <p>{t("auth.passwordUpdatedMessage")}</p>
              <button className="cp-btn-update" onClick={onCancel}>
                {t("auth.backToProfile")}
              </button>
            </div>
          ) : (
            <>
              {/* Current Password */}
              <div className="cp-field">
                <label className="cp-label">{t("auth.currentPassword")}</label>
                <div className="cp-input-wrap">
                  <span className="cp-lock">🔒</span>
                  <input
                    className="cp-input"
                    type={showCurrent ? "text" : "password"}
                    value={form.current}
                    onChange={(e) =>
                      setForm({ ...form, current: e.target.value })
                    }
                    placeholder={t("auth.currentPasswordPlaceholder")}
                  />
                  <button
                    className="cp-eye"
                    onClick={() => setShowCurrent(!showCurrent)}
                    type="button"
                  >
                    {showCurrent ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="cp-field">
                <label className="cp-label">{t("auth.newPassword")}</label>
                <div className="cp-input-wrap">
                  <span className="cp-lock">🔒</span>
                  <input
                    className="cp-input"
                    type={showNew ? "text" : "password"}
                    value={form.newPass}
                    onChange={(e) =>
                      setForm({ ...form, newPass: e.target.value })
                    }
                    placeholder={t("auth.passwordPlaceholder")}
                  />
                  <button
                    className="cp-eye"
                    onClick={() => setShowNew(!showNew)}
                    type="button"
                  >
                    {showNew ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                <p className="cp-hint">{t("auth.passwordHint")}</p>
              </div>

              {/* Confirm New Password */}
              <div className="cp-field">
                <label className="cp-label">
                  {t("auth.confirmNewPassword")}
                </label>
                <div className="cp-input-wrap">
                  <span className="cp-lock">🔒</span>
                  <input
                    className="cp-input"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={(e) =>
                      setForm({ ...form, confirm: e.target.value })
                    }
                    placeholder={t("auth.confirmPasswordPlaceholder")}
                  />
                  <button
                    className="cp-eye"
                    onClick={() => setShowConfirm(!showConfirm)}
                    type="button"
                  >
                    {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>

              {error && <p className="cp-error">{error}</p>}

              {/* Buttons */}
              <div className="cp-actions">
                <button className="cp-btn-cancel" onClick={onCancel}>
                  {t("common.cancel")}
                </button>
                <button className="cp-btn-update" onClick={handleSubmit}>
                  {t("auth.updatePassword")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

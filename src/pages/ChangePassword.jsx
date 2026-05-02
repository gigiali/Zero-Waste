import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./ChangePassword.css";

export default function ChangePassword({ onCancel }) {
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
      setError("Please fill in all fields.");
      return;
    }
    if (form.newPass.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.newPass !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="cp-page">

      {/* Hero */}
      <div className="cp-hero">
        <div className="cp-hero-inner">
          <h1 className="cp-title">Change Password</h1>
          <p className="cp-subtitle">Update your account password</p>
        </div>
      </div>

      {/* Card */}
      <div className="cp-body">
        <div className="cp-card">

          {success ? (
            <div className="cp-success">
              <div className="cp-success-icon">✓</div>
              <h2>Password Updated!</h2>
              <p>Your password has been changed successfully.</p>
              <button className="cp-btn-update" onClick={onCancel}>
                Back to Profile
              </button>
            </div>
          ) : (
            <>
              {/* Current Password */}
              <div className="cp-field">
                <label className="cp-label">Current Password</label>
                <div className="cp-input-wrap">
                  <span className="cp-lock">🔒</span>
                  <input
                    className="cp-input"
                    type={showCurrent ? "text" : "password"}
                    value={form.current}
                    onChange={(e) => setForm({ ...form, current: e.target.value })}
                    placeholder=""
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
                <label className="cp-label">New Password</label>
                <div className="cp-input-wrap">
                  <span className="cp-lock">🔒</span>
                  <input
                    className="cp-input"
                    type={showNew ? "text" : "password"}
                    value={form.newPass}
                    onChange={(e) => setForm({ ...form, newPass: e.target.value })}
                    placeholder=""
                  />
                  <button
                    className="cp-eye"
                    onClick={() => setShowNew(!showNew)}
                    type="button"
                  >
                    {showNew ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                <p className="cp-hint">Must be at least 8 characters</p>
              </div>

              {/* Confirm New Password */}
              <div className="cp-field">
                <label className="cp-label">Confirm New Password</label>
                <div className="cp-input-wrap">
                  <span className="cp-lock">🔒</span>
                  <input
                    className="cp-input"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder=""
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
                  Cancel
                </button>
                <button className="cp-btn-update" onClick={handleSubmit}>
                  Update Password
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
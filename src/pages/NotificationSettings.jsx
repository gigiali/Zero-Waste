import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Bell, MessageSquare } from "lucide-react";
import "./NotificationSettings.css";

export default function NotificationSettings({ onCancel }) {
  const { t } = useTranslation();
  const [channels, setChannels] = useState({
    email: true,
    push: true,
    sms: false,
  });

  const [types, setTypes] = useState({
    orderUpdates: true,
    newOffers: true,
    promotions: false,
    weeklyDigest: true,
  });

  const toggleChannel = (key) =>
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleType = (key) =>
    setTypes((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    onCancel(); // go back after save
  };

  return (
    <div className="ns-page">
      {/* Hero */}
      <div className="ns-hero">
        <div className="ns-hero-inner">
          <h1 className="ns-title">{t("notifications.title")}</h1>
          <p className="ns-subtitle">{t("notifications.subtitle")}</p>
        </div>
      </div>

      {/* Body */}
      <div className="ns-body">
        {/* Notification Channels */}
        <div className="ns-card">
          <h2 className="ns-card-title">{t("notifications.channelsTitle")}</h2>

          <div className="ns-list">
            <div className="ns-row">
              <span className="ns-icon">
                <Mail size={20} />
              </span>
              <div className="ns-info">
                <span className="ns-name">
                  {t("notifications.channels.email.name")}
                </span>
                <span className="ns-desc">
                  {t("notifications.channels.email.description")}
                </span>
              </div>
              <label className="ns-toggle">
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={() => toggleChannel("email")}
                />
                <span className="ns-slider" />
              </label>
            </div>

            <div className="ns-row">
              <span className="ns-icon">
                <Bell size={20} />
              </span>
              <div className="ns-info">
                <span className="ns-name">
                  {t("notifications.channels.push.name")}
                </span>
                <span className="ns-desc">
                  {t("notifications.channels.push.description")}
                </span>
              </div>
              <label className="ns-toggle">
                <input
                  type="checkbox"
                  checked={channels.push}
                  onChange={() => toggleChannel("push")}
                />
                <span className="ns-slider" />
              </label>
            </div>

            <div className="ns-row">
              <span className="ns-icon">
                <MessageSquare size={20} />
              </span>
              <div className="ns-info">
                <span className="ns-name">
                  {t("notifications.channels.sms.name")}
                </span>
                <span className="ns-desc">
                  {t("notifications.channels.sms.description")}
                </span>
              </div>
              <label className="ns-toggle">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={() => toggleChannel("sms")}
                />
                <span className="ns-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="ns-card">
          <h2 className="ns-card-title">{t("notifications.typesTitle")}</h2>

          <div className="ns-list">
            <div className="ns-row">
              <div className="ns-info">
                <span className="ns-name">
                  {t("notifications.types.orderUpdates.name")}
                </span>
                <span className="ns-desc">
                  {t("notifications.types.orderUpdates.description")}
                </span>
              </div>
              <label className="ns-toggle">
                <input
                  type="checkbox"
                  checked={types.orderUpdates}
                  onChange={() => toggleType("orderUpdates")}
                />
                <span className="ns-slider" />
              </label>
            </div>

            <div className="ns-row">
              <div className="ns-info">
                <span className="ns-name">
                  {t("notifications.types.newOffers.name")}
                </span>
                <span className="ns-desc">
                  {t("notifications.types.newOffers.description")}
                </span>
              </div>
              <label className="ns-toggle">
                <input
                  type="checkbox"
                  checked={types.newOffers}
                  onChange={() => toggleType("newOffers")}
                />
                <span className="ns-slider" />
              </label>
            </div>

            <div className="ns-row">
              <div className="ns-info">
                <span className="ns-name">
                  {t("notifications.types.promotions.name")}
                </span>
                <span className="ns-desc">
                  {t("notifications.types.promotions.description")}
                </span>
              </div>
              <label className="ns-toggle">
                <input
                  type="checkbox"
                  checked={types.promotions}
                  onChange={() => toggleType("promotions")}
                />
                <span className="ns-slider" />
              </label>
            </div>

            <div className="ns-row">
              <div className="ns-info">
                <span className="ns-name">
                  {t("notifications.types.weeklyDigest.name")}
                </span>
                <span className="ns-desc">
                  {t("notifications.types.weeklyDigest.description")}
                </span>
              </div>
              <label className="ns-toggle">
                <input
                  type="checkbox"
                  checked={types.weeklyDigest}
                  onChange={() => toggleType("weeklyDigest")}
                />
                <span className="ns-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="ns-actions">
          <button className="ns-btn-cancel" onClick={onCancel}>
            {t("common.cancel")}
          </button>
          <button className="ns-btn-save" onClick={handleSave}>
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

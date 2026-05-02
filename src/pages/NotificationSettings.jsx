import { useState } from "react";
import { Mail, Bell, MessageSquare } from "lucide-react";
import "./NotificationSettings.css";

export default function NotificationSettings({ onCancel }) {
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
          <h1 className="ns-title">Notification Settings</h1>
          <p className="ns-subtitle">Manage how you receive notifications</p>
        </div>
      </div>

      {/* Body */}
      <div className="ns-body">

        {/* Notification Channels */}
        <div className="ns-card">
          <h2 className="ns-card-title">Notification Channels</h2>

          <div className="ns-list">
            <div className="ns-row">
              <span className="ns-icon"><Mail size={20} /></span>
              <div className="ns-info">
                <span className="ns-name">Email Notifications</span>
                <span className="ns-desc">Receive notifications via email</span>
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
              <span className="ns-icon"><Bell size={20} /></span>
              <div className="ns-info">
                <span className="ns-name">Push Notifications</span>
                <span className="ns-desc">Get instant updates on your device</span>
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
              <span className="ns-icon"><MessageSquare size={20} /></span>
              <div className="ns-info">
                <span className="ns-name">SMS Notifications</span>
                <span className="ns-desc">Text message alerts for important updates</span>
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
          <h2 className="ns-card-title">Notification Types</h2>

          <div className="ns-list">
            <div className="ns-row">
              <div className="ns-info">
                <span className="ns-name">Order Updates</span>
                <span className="ns-desc">Status changes for your orders</span>
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
                <span className="ns-name">New Offers</span>
                <span className="ns-desc">Alerts about new food surplus offers</span>
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
                <span className="ns-name">Promotions &amp; Deals</span>
                <span className="ns-desc">Special offers and discounts</span>
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
                <span className="ns-name">Weekly Digest</span>
                <span className="ns-desc">Weekly summary of activity</span>
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
          <button className="ns-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="ns-btn-save" onClick={handleSave}>Save</button>
        </div>

      </div>
    </div>
  );
}
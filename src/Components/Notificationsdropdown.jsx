import React, { useRef, useEffect } from "react";
import { Bell, Tag, ShoppingBag, CreditCard, Info, CheckCheck, Trash2, X } from "lucide-react";
import { useNotifications } from "../Context/NotificationsContext";

export const NOTIF_META = {
  offer:   { icon: Tag,         bg: "linear-gradient(135deg,#fff7ed,#ffedd5)", color: "#f97316", accent: "#fb923c" },
  order:   { icon: ShoppingBag, bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)", color: "#10b981", accent: "#34d399" },
  payment: { icon: CreditCard,  bg: "linear-gradient(135deg,#eff6ff,#dbeafe)", color: "#3b82f6", accent: "#60a5fa" },
  info:    { icon: Info,        bg: "linear-gradient(135deg,#f5f3ff,#ede9fe)", color: "#8b5cf6", accent: "#a78bfa" },
};

/* ── Full-screen overlay panel (used in Business sidebar) ── */
export function NotificationsPanel({ onClose }) {
  const { notifications, unreadCount, markRead, markAllRead, remove, clearAll } = useNotifications();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(2px)",
          zIndex: 9998,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed",
        top: 0, right: 0,
        width: "400px", height: "100vh",
        background: "white",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        zIndex: 9999,
        display: "flex", flexDirection: "column",
        animation: "slideInRight 0.25s cubic-bezier(0.22,1,0.36,1)",
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 24px 16px",
          borderBottom: "1px solid #f3f4f6",
          background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg,#10b981,#059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
              }}>
                <Bell size={17} color="white" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>Notifications</h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#f3f4f6", border: "none", borderRadius: "8px",
                width: "32px", height: "32px", display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#6b7280", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e5e7eb"; e.currentTarget.style.color = "#111827"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#6b7280"; }}
            >
              <X size={16} />
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                marginTop: "12px", width: "100%",
                background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                border: "1px solid #bbf7d0", borderRadius: "8px",
                color: "#059669", fontSize: "0.82rem", fontWeight: 600,
                padding: "8px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"}
              onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg,#f0fdf4,#dcfce7)"}
            >
              <CheckCheck size={14} /> Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {notifications.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "16px",
                background: "linear-gradient(135deg,#f3f4f6,#e5e7eb)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <Bell size={28} color="#d1d5db" />
              </div>
              <p style={{ color: "#9ca3af", fontSize: "0.9rem", fontWeight: 500, margin: "0 0 4px" }}>No notifications yet</p>
              <p style={{ color: "#d1d5db", fontSize: "0.8rem", margin: 0 }}>We'll notify you when something happens</p>
            </div>
          ) : (
            notifications.map((notif, idx) => {
              const meta = NOTIF_META[notif.type] || NOTIF_META.info;
              const Icon = meta.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  style={{
                    display: "flex", gap: "14px",
                    padding: "14px 20px",
                    borderBottom: idx < notifications.length - 1 ? "1px solid #f9fafb" : "none",
                    background: notif.read ? "white" : "linear-gradient(135deg,#f8fffe,#f0fdf9)",
                    cursor: "pointer", position: "relative",
                    transition: "background 0.15s",
                    borderLeft: notif.read ? "3px solid transparent" : `3px solid ${meta.accent}`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#fafafa";
                    const btn = e.currentTarget.querySelector(".notif-del-btn");
                    if (btn) btn.style.opacity = "1";
                    if (btn) btn.style.transform = "scale(1)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = notif.read ? "white" : "linear-gradient(135deg,#f8fffe,#f0fdf9)";
                    const btn = e.currentTarget.querySelector(".notif-del-btn");
                    if (btn) btn.style.opacity = "0";
                    if (btn) btn.style.transform = "scale(0.8)";
                  }}
                >
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
                    background: meta.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 2px 8px ${meta.color}22`,
                  }}>
                    <Icon size={18} color={meta.color} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0, paddingRight: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <span style={{
                        fontWeight: notif.read ? 500 : 700, fontSize: "0.875rem",
                        color: "#111827", lineHeight: 1.3,
                      }}>{notif.title}</span>
                      {!notif.read && (
                        <div style={{
                          width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                          background: meta.accent, marginTop: "4px",
                          boxShadow: `0 0 0 3px ${meta.color}22`,
                        }} />
                      )}
                    </div>
                    <p style={{ margin: "4px 0 6px", fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                    <span style={{
                      fontSize: "0.72rem", color: "#9ca3af",
                      background: "#f3f4f6", padding: "2px 8px", borderRadius: "20px",
                    }}>{notif.time}</span>
                  </div>

                  <button
                    className="notif-del-btn"
                    onClick={e => { e.stopPropagation(); remove(notif.id); }}
                    style={{
                      position: "absolute", top: "12px", right: "16px",
                      background: "#fee2e2", border: "none", borderRadius: "8px",
                      width: "28px", height: "28px", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      cursor: "pointer", opacity: 0, transform: "scale(0.8)",
                      transition: "opacity 0.15s, transform 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fecaca"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fee2e2"}
                  >
                    <Trash2 size={13} color="#ef4444" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div style={{
            padding: "16px 20px",
            borderTop: "1px solid #f3f4f6",
            background: "#fafafa",
          }}>
            <button
              onClick={clearAll}
              style={{
                width: "100%", background: "none",
                border: "1.5px solid #fecaca", borderRadius: "8px",
                color: "#ef4444", fontSize: "0.82rem", fontWeight: 600,
                padding: "9px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#fecaca"; }}
            >
              <Trash2 size={13} /> Clear all notifications
            </button>
          </div>
        )}

        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}

/* ── Dropdown panel (used in horizontal nav) ── */
export function NotificationsDropdown({ align = "right" }) {
  const { notifications, unreadCount, markRead, markAllRead, remove, clearAll } = useNotifications();

  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 14px)",
      ...(align === "right" ? { right: "-60px" } : { left: 0 }),
      width: "380px",
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
      border: "1px solid #f0f0f0",
      zIndex: 99999,
      overflow: "hidden",
      animation: "dropIn 0.2s cubic-bezier(0.22,1,0.36,1)",
    }}>
      {/* Arrow */}
      <div style={{
        position: "absolute", top: "-7px",
        ...(align === "right" ? { right: "76px" } : { left: "16px" }),
        width: "14px", height: "14px", background: "white",
        border: "1px solid #f0f0f0", borderBottom: "none", borderRight: "none",
        transform: "rotate(45deg)", zIndex: 1,
      }} />

      {/* Header */}
      <div style={{
        padding: "16px 18px 14px",
        borderBottom: "1px solid #f3f4f6",
        background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>Notifications</span>
            {unreadCount > 0 && (
              <span style={{
                background: "linear-gradient(135deg,#10b981,#059669)",
                color: "white", borderRadius: "20px",
                fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px",
                boxShadow: "0 2px 6px rgba(16,185,129,0.35)",
              }}>{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#10b981", fontSize: "0.8rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "4px", padding: 0,
            }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: "360px", overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "2.5rem 1rem", textAlign: "center" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "linear-gradient(135deg,#f3f4f6,#e5e7eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
            }}>
              <Bell size={24} color="#d1d5db" />
            </div>
            <p style={{ color: "#9ca3af", fontSize: "0.88rem", margin: 0, fontWeight: 500 }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif, idx) => {
            const meta = NOTIF_META[notif.type] || NOTIF_META.info;
            const Icon = meta.icon;
            return (
              <div
                key={notif.id}
                onClick={() => markRead(notif.id)}
                style={{
                  display: "flex", gap: "12px", padding: "13px 18px",
                  borderBottom: idx < notifications.length - 1 ? "1px solid #f9fafb" : "none",
                  background: notif.read ? "white" : "#f8fffe",
                  cursor: "pointer", position: "relative",
                  borderLeft: notif.read ? "3px solid transparent" : `3px solid ${meta.accent}`,
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#fafafa";
                  const btn = e.currentTarget.querySelector(".notif-del-btn");
                  if (btn) { btn.style.opacity = "1"; btn.style.transform = "scale(1)"; }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = notif.read ? "white" : "#f8fffe";
                  const btn = e.currentTarget.querySelector(".notif-del-btn");
                  if (btn) { btn.style.opacity = "0"; btn.style.transform = "scale(0.8)"; }
                }}
              >
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
                  background: meta.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 2px 6px ${meta.color}20`,
                }}>
                  <Icon size={16} color={meta.color} />
                </div>

                <div style={{ flex: 1, minWidth: 0, paddingRight: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontWeight: notif.read ? 500 : 700, fontSize: "0.87rem", color: "#111827", lineHeight: 1.3 }}>
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <div style={{
                        width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                        background: meta.accent, marginTop: "3px", marginLeft: "6px",
                      }} />
                    )}
                  </div>
                  <p style={{ margin: "3px 0 5px", fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.45 }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: "0.72rem", color: "#9ca3af", background: "#f3f4f6", padding: "1px 6px", borderRadius: "20px" }}>
                    {notif.time}
                  </span>
                </div>

                <button
                  className="notif-del-btn"
                  onClick={e => { e.stopPropagation(); remove(notif.id); }}
                  style={{
                    position: "absolute", top: "10px", right: "12px",
                    background: "#fee2e2", border: "none", borderRadius: "6px",
                    width: "26px", height: "26px", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", opacity: 0, transform: "scale(0.8)",
                    transition: "opacity 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fecaca"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fee2e2"}
                >
                  <Trash2 size={12} color="#ef4444" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{ padding: "10px 18px", borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
          <button onClick={clearAll} style={{
            width: "100%", background: "none", border: "1.5px solid #fecaca",
            borderRadius: "8px", cursor: "pointer",
            color: "#ef4444", fontSize: "0.8rem", fontWeight: 600,
            padding: "7px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "5px",
            transition: "background 0.12s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <Trash2 size={13} /> Clear all notifications
          </button>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ── Bell trigger (used in horizontal nav) ── */
export function NotificationsBell({ show, onToggle, notifRef }) {
  const { unreadCount } = useNotifications();

  return (
    <div ref={notifRef} style={{ position: "relative" }}>
      <div
        onClick={onToggle}
        title="Notifications"
        style={{
          display: "flex", alignItems: "center", cursor: "pointer",
          color: show ? "#10b981" : "#374151", position: "relative",
          transition: "color 0.15s",
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "-8px", right: "-8px",
            background: "linear-gradient(135deg,#ef4444,#dc2626)",
            color: "white", borderRadius: "50%",
            width: "18px", height: "18px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold",
            boxShadow: "0 2px 6px rgba(239,68,68,0.4)",
          }}>{unreadCount}</span>
        )}
      </div>
      {show && <NotificationsDropdown align="right" />}
    </div>
  );
}
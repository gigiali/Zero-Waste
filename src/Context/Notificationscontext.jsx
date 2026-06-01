import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const NotificationsContext = createContext();

const getToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  sessionStorage.getItem("token");

const typeFromData = (notif) => {
  const title = (notif.title || notif.data?.title || "").toLowerCase();
  const msg = (notif.data?.message || notif.message || "").toLowerCase();
  if (title.includes("order") || msg.includes("order")) return "order";
  if (title.includes("payment") || msg.includes("payment")) return "payment";
  if (title.includes("offer") || msg.includes("offer")) return "offer";
  return "info";
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const raw = data.data || data.notifications || data || [];
      const mapped = raw.map((n) => ({
        id: n.id,
        type: typeFromData(n),
read: !!n.read_at || n.is_read === 1 || n.is_read === true,        time: timeAgo(n.created_at),
        title: n.data?.title || n.title || "Notification",
        message: n.data?.message || n.message || "",
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id) => {
    setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    const token = getToken();
    if (!token) return;
    try {
     await fetch("/api/notifications/read-all", {
  method: "POST",
  headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
});
await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const remove = async (id) => {
    setNotifications((p) => p.filter((n) => n.id !== id));
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    const token = getToken();
    if (!token) return;
    try {
      await fetch("/api/notifications/clear-all", {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, remove, clearAll, loading, refetch: fetchNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);

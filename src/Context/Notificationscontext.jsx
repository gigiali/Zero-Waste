import React, { createContext, useContext, useState } from "react";

export const INITIAL_NOTIFICATIONS = [
  {
    id: 1, type: "offer", read: false, time: "5 min ago",
    title: "New Offer Available",
    message: "Fresh Bread Bundle now available at Artisan Bakery — 50% off!",
  },
  {
    id: 2, type: "order", read: false, time: "1 hour ago",
    title: "Order Confirmed",
    message: "Your order #ORD-2026-001 has been confirmed and is being prepared.",
  },
  {
    id: 3, type: "payment", read: false, time: "1 hour ago",
    title: "Payment Successful",
    message: "Payment of EGP 230 has been processed successfully.",
  },
  {
    id: 4, type: "offer", read: true, time: "3 hours ago",
    title: "Special Weekend Deal",
    message: "Get extra 20% off on all orders this weekend!",
  },
  {
    id: 5, type: "order", read: true, time: "Yesterday",
    title: "Order Delivered",
    message: "Your order #ORD-2026-000 was delivered. Enjoy your meal!",
  },
];

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead    = (id) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()   => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const remove      = (id) => setNotifications((p) => p.filter((n) => n.id !== id));
  const clearAll    = ()   => setNotifications([]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, remove, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
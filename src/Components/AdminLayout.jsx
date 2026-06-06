import React from "react";
import AdminSidebar from "./AdminSidebar";
import "../pages/Admin.css";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

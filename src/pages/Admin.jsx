import React, { useState, useEffect } from "react";
import Navigation from "../Components/Navigation";
import { Shield, BriefcaseBusiness, Users, CircleAlert, ClipboardList, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../Context/AuthContext";
import "./Admin.css";

const BASE_URL  = "https://zero-waste-production.up.railway.app/api";
const PIE_COLORS = ["#ef4444", "#f97316", "#10b981", "#3b82f6"];

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);

const ROLE_LABEL = {
  super_admin : "Super Admin — Full Control",
  manager     : "Manager",
  support     : "Support",
};

const Admin = () => {
  const navigate = useNavigate();
  const { role, isLoggedIn } = useAuth();

  // ✅ correct token key
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [weeklyData,   setWeeklyData]   = useState([]);
  const [pieData,      setPieData]      = useState([]);
  const [rawStats,     setRawStats]     = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // fetch stats only after role is known
  useEffect(() => {
    if (!role || !token) return;

    (async () => {
      setStatsLoading(true);
      try {
        const res  = await fetch(`${BASE_URL}/dashboard/stats`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Stats ${res.status}`);
        const data = await res.json();

        setRawStats(data);
        setWeeklyData(data?.weekly_data  ?? data?.data?.weekly_data  ?? []);
        setPieData(data?.category_distribution ?? data?.data?.category_distribution ?? []);
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [role]);

  const totalOrders  = weeklyData.reduce((s, d) => s + (d.orders  || 0), 0);
  const totalRevenue = weeklyData.reduce((s, d) => s + (d.revenue || 0), 0);
  const commission   = (totalRevenue * 0.15).toFixed(2);
  const avgOrder     = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";
  const activeBiz    = pieData.reduce((s, d) => s + (d.value || 0), 0);

  const totalOrdersF = rawStats?.total_orders  ?? rawStats?.data?.total_orders  ?? totalOrders;
  const totalRevF    = rawStats?.total_revenue ?? rawStats?.data?.total_revenue ?? totalRevenue;
  const totalUsers   = rawStats?.total_users   ?? rawStats?.data?.total_users   ?? 0;

  if (!isLoggedIn) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#8b2323" }}>
        <AlertCircle size={40} style={{ marginBottom: 12 }} />
        <p>You are not logged in. Please <a href="/login">log in</a>.</p>
      </div>
    );
  }

  return (
    <>
      <Navigation hideCart hideLocation hideProfile />

      <section className="admin-header">
        <div className="admin-header__left">
          <h1 className="admin-header__title">
            Admin Control Panel&nbsp;
            <Shield size={28} color="#3b82f6" strokeWidth={1.8} />
          </h1>
          <p className="admin-header__subtitle">
            {ROLE_LABEL[role] ?? role} — Monitor platform performance and manage the ZeroWaste ecosystem
          </p>
        </div>

        <div className="stats-group">
          {canManage(role) && (
            <div className="stats-group__item">
              <span className="stats-group__label">Platform Commission</span>
              <span className="stats-group__value">EGP {commission}</span>
            </div>
          )}
          <div className="stats-group__item">
            <span className="stats-group__label">Active Issues</span>
            <span className="stats-group__value">4</span>
          </div>
        </div>
      </section>

      <div className="admin-content">

        {/* Quick-action cards */}
        <section className="platform-analytics-section">
          <div className="section-title">
            <h2 className="section-title__main">Platform Analytics</h2>
            <p className="section-title__sub">Real-time insights and system health monitoring</p>
          </div>

          <div className="cards-container">
            <button type="button" className="analytics-card analytics-card--button"
              onClick={() => navigate("/admin/businesses")}>
              <div className="icon-box icon-box--purple"><BriefcaseBusiness size={22} color="#9333ea" /></div>
              <div>
                <h3 className="analytics-card__title">Manage Businesses</h3>
                <p className="analytics-card__subtitle">View all business accounts</p>
              </div>
            </button>

            <button type="button" className="analytics-card analytics-card--button"
              onClick={() => navigate("/admin/users")}>
              <div className="icon-box icon-box--blue"><Users size={22} color="#3b82f6" /></div>
              <div>
                <h3 className="analytics-card__title">User Management</h3>
                <p className="analytics-card__subtitle">View &amp; manage customers</p>
              </div>
            </button>

            <button type="button" className="analytics-card analytics-card--button"
              onClick={() => navigate("/admin/reports-issues")}>
              <div className="icon-box icon-box--orange"><CircleAlert size={22} color="#ea580c" /></div>
              <div>
                <h3 className="analytics-card__title">Reports &amp; Issues</h3>
                <p className="analytics-card__subtitle">Handle reported content</p>
              </div>
            </button>

            {canManage(role) && (
              <button type="button" className="analytics-card analytics-card--button"
                onClick={() => navigate("/admin/vendors/pending")}>
                <div className="icon-box icon-box--purple"><ClipboardList size={22} color="#9333ea" /></div>
                <div>
                  <h3 className="analytics-card__title">Pending Vendors</h3>
                  <p className="analytics-card__subtitle">Approve or reject vendors</p>
                </div>
              </button>
            )}
          </div>
        </section>

        {/* Stat cards */}
        {statsLoading ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#64748b", margin: "24px 0" }}>
            <Loader2 size={20} className="spin" /> Loading stats…
          </div>
        ) : (
          <>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card p-4 shadow-sm">
                  <p className="text-muted mb-1">Total Orders</p>
                  <h2>{Number(totalOrdersF).toLocaleString()}</h2>
                  <span className="badge bg-success">+12.5%</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card p-4 shadow-sm">
                  <p className="text-muted mb-1">Total Revenue</p>
                  <h2>EGP {Number(totalRevF).toLocaleString()}</h2>
                  <span className="badge bg-primary">+8.3%</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card p-4 shadow-sm">
                  <p className="text-muted mb-1">Active Businesses</p>
                  <h2>{activeBiz}</h2>
                  <span className="badge bg-purple text-white">+15.2%</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card p-4 shadow-sm">
                  <p className="text-muted mb-1">Total Users</p>
                  <h2>{Number(totalUsers).toLocaleString()}</h2>
                  <span className="badge bg-warning text-dark">+22.1%</span>
                </div>
              </div>
            </div>

            {/* Financial banners — super_admin + manager only */}
            {canManage(role) && (
              <div className="mt-4">
                <div className="p-4 mb-3 text-white rounded" style={{ background: "#10b981" }}>
                  <p className="mb-1">Platform Commission</p>
                  <h2>EGP {commission}</h2>
                  <small>15% commission rate</small>
                </div>
                <div className="p-4 mb-3 text-white rounded"
                  style={{ background: "linear-gradient(to right, #3b82f6, #2563eb)" }}>
                  <p className="mb-1">Food Saved</p>
                  <h2>2,450 kg</h2>
                  <small>Environmental Impact</small>
                </div>
                <div className="p-4 text-white rounded"
                  style={{ background: "linear-gradient(to right, #a855f7, #9333ea)" }}>
                  <p className="mb-1">Avg. Order Value</p>
                  <h2>EGP {avgOrder}</h2>
                  <small>Per Transaction</small>
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="card p-4 shadow-sm mt-4">
              <h6 className="fw-bold mb-4">Weekly Performance</h6>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 13 }} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 13 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 13 }} />
                  <Tooltip /><Legend />
                  <Line yAxisId="left"  type="monotone" dataKey="orders"  stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Revenue (EGP)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-4 shadow-sm mt-4 mb-5">
              <h6 className="fw-bold mb-4">Business Distribution</h6>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`} labelLine>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}`}</style>
    </>
  );
};

export default Admin;

import React from "react";
import Navigation from "../Components/Navigation";
import { Shield, BriefcaseBusiness, Users, CircleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import "./admin.css";

// ── Data ─────────────────────────────────────────────────────────────────────

const weeklyData = [
  { day: "Mon", orders: 140, revenue: 2600 },
  { day: "Tue", orders: 175, revenue: 3200 },
  { day: "Wed", orders: 155, revenue: 2800 },
  { day: "Thu", orders: 185, revenue: 3400 },
  { day: "Fri", orders: 210, revenue: 3600 },
  { day: "Sat", orders: 180, revenue: 3100 },
  { day: "Sun", orders: 160, revenue: 2700 },
];

const pieData = [
  { name: "Restaurants", value: 45 },
  { name: "Bakeries", value: 30 },
  { name: "Supermarkets", value: 15 },
  { name: "Hotels", value: 10 },
];
const PIE_COLORS = ["#ef4444", "#f97316", "#10b981", "#3b82f6"];

// ── Component ─────────────────────────────────────────────────────────────────

const Admin = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navigation />

      <section className="admin-header">
        <div className="admin-header__left">
          <h1 className="admin-header__title">
            Admin Control Panel <Shield size={28} color="#3b82f6" strokeWidth={1.8} />
          </h1>
          <p className="admin-header__subtitle">
            Monitor platform performance and manage the ZeroWaste ecosystem
          </p>
        </div>
        <div className="stats-group">
          <div className="stats-group__item">
            <span className="stats-group__label">Platform Commission</span>
            <span className="stats-group__value">$2797.57</span>
          </div>
          <div className="stats-group__item">
            <span className="stats-group__label">Active Issues</span>
            <span className="stats-group__value">4</span>
          </div>
        </div>
      </section>

      <div className="admin-content">

        {/* Platform Analytics Section */}
        <section className="platform-analytics-section">
          <div className="section-title">
            <h2 className="section-title__main">Platform Analytics</h2>
            <p className="section-title__sub">Real-time insights and system health monitoring</p>
          </div>

          <div className="cards-container">
            <button
              type="button"
              className="analytics-card analytics-card--button"
              onClick={() => navigate("/admin/businesses")}
            >
              <div className="icon-box icon-box--purple">
                <BriefcaseBusiness size={22} color="#9333ea" />
              </div>
              <div>
                <h3 className="analytics-card__title">Manage Businesses</h3>
                <p className="analytics-card__subtitle">View all business accounts</p>
              </div>
            </button>

            <button
              type="button"
              className="analytics-card analytics-card--button"
              onClick={() => navigate("/admin/users")}
            >
              <div className="icon-box icon-box--blue">
                <Users size={22} color="#3b82f6" />
              </div>
              <div>
                <h3 className="analytics-card__title">User Management</h3>
                <p className="analytics-card__subtitle">View all customers</p>
              </div>
            </button>

            <button
              type="button"
              className="analytics-card analytics-card--button"
              onClick={() => navigate("/admin/reports-issues")}
            >
              <div className="icon-box icon-box--orange">
                <CircleAlert size={22} color="#ea580c" />
              </div>
              <div>
                <h3 className="analytics-card__title">Reports & Issues</h3>
                <p className="analytics-card__subtitle">Handle reported content</p>
              </div>
            </button>
          </div>
        </section>

        {/* TOP CARDS */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card p-4 shadow-sm">
              <p className="text-muted mb-1">Total Orders</p>
              <h2>1,247</h2>
              <span className="badge bg-success">+12.5%</span>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-4 shadow-sm">
              <p className="text-muted mb-1">Total Revenue</p>
              <h2>$18,650.5</h2>
              <span className="badge bg-primary">+8.3%</span>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-4 shadow-sm">
              <p className="text-muted mb-1">Active Businesses</p>
              <h2>142</h2>
              <span className="badge bg-purple text-white">+15.2%</span>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-4 shadow-sm">
              <p className="text-muted mb-1">Total Users</p>
              <h2>3,456</h2>
              <span className="badge bg-warning text-dark">+22.1%</span>
            </div>
          </div>
        </div>

        {/* BIG CARDS */}
        <div className="mt-4">
          <div className="p-4 mb-3 text-white rounded" style={{ background: "#10b981" }}>
            <p className="mb-1">Platform Commission</p>
            <h2>$2797.57</h2>
            <small>15% commission rate</small>
          </div>

          <div className="p-4 mb-3 text-white rounded" style={{ background: "linear-gradient(to right, #3b82f6, #2563eb)" }}>
            <p className="mb-1">Food Saved</p>
            <h2>2,450 kg</h2>
            <small>Environmental Impact</small>
          </div>

          <div className="p-4 text-white rounded" style={{ background: "linear-gradient(to right, #a855f7, #9333ea)" }}>
            <p className="mb-1">Avg. Order Value</p>
            <h2>$14.96</h2>
            <small>Per Transaction</small>
          </div>
        </div>

        {/* WEEKLY PERFORMANCE */}
        <div className="card p-4 shadow-sm mt-4">
          <h6 className="fw-bold mb-4">Weekly Performance</h6>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 13 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 13 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 13 }} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Orders"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Revenue ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BUSINESS DISTRIBUTION */}
        <div className="card p-4 shadow-sm mt-4 mb-5">
          <h6 className="fw-bold mb-4">Business Distribution</h6>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={true}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </>
  );
};

export default Admin;

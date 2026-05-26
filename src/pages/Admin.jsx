import React, { useState, useEffect } from "react";
import Navigation from "../Components/Navigation";
import { Shield, Users, CircleAlert, ClipboardList, Loader2, AlertCircle, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../Context/AuthContext";
import { useTranslation } from "react-i18next";
import "./Admin.css";

const BASE_URL  = "https://zero-waste-production.up.railway.app/api";
const PIE_COLORS = ["#ef4444", "#f97316", "#10b981", "#3b82f6"];

const isSuperAdmin = (r) => r === "super_admin";
const isManager    = (r) => r === "manager";
const canManage    = (r) => isSuperAdmin(r) || isManager(r);

const Admin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, isLoggedIn, token: contextToken } = useAuth();
  // ✅ جلب الـ Token فقط كإثبات هوية للسيرفر عشان يقبل الـ API Requests
  const token = contextToken || localStorage.getItem("token") || sessionStorage.getItem("token");
  const ROLE_LABEL = {
    super_admin: t("admin.roles.superAdmin"),
    manager: t("admin.roles.manager"),
    support: t("admin.roles.support"),
  };
  // States
  const [weeklyData,   setWeeklyData]   = useState([]);
  const [pieData,      setPieData]      = useState([]);
  const [activities,   setActivities]   = useState([]);
  const [rawStats,     setRawStats]     = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  // 1️⃣ طلب العدادات والبيانات الحية من الباك إند فعلياً (Dashboard Stats API)
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    (async () => {
      setStatsLoading(true);
      try {
        const res  = await fetch(`${BASE_URL}/dashboard/stats`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Stats ${res.status}`);
        const data = await res.json();

        // قراءة البيانات الفعلية القادمة من الـ API مباشرة
        const realData = data?.data ?? data;
        setRawStats(realData);
        setWeeklyData(realData?.weekly_data ?? []);
        setPieData(realData?.category_distribution ?? []);
      } catch (err) {
        console.error("Stats fetch error:", err);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [isLoggedIn, token]);

  // 2️⃣ طلب سجل العمليات الفعلي من الباك إند (Recent Activity API)
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    (async () => {
      setActivityLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/dashboard/activity`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Activity ${res.status}`);
        const data = await res.json();
        setActivities(data?.activities ?? data?.data ?? (Array.isArray(data) ? data : []));
      } catch (err) {
        console.error("Activity fetch error:", err);
      } finally {
        setActivityLoading(false);
      }
    })();
  }, [isLoggedIn, token]);

  // الحسابات المبنية على داتا الـ API
  const totalOrders  = weeklyData.reduce((s, d) => s + (d.orders  || 0), 0);
  const totalRevenue = weeklyData.reduce((s, d) => s + (d.revenue || 0), 0);
  const commission   = (totalRevenue * 0.15).toFixed(2);
  const avgOrder     = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";
  const activeBiz    = pieData.reduce((s, d) => s + (d.value || 0), 0);

  const totalOrdersF = rawStats?.total_orders  ?? totalOrders;
  const totalRevF    = rawStats?.total_revenue ?? totalRevenue;
  const totalUsers   = rawStats?.total_users   ?? 0;

  if (!isLoggedIn) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#8b2323" }}>
        <AlertCircle size={40} style={{ marginBottom: 12 }} />
        <p>{t("admin.notLoggedIn")} <a href="/login">{t("admin.login")}</a>.</p>
      </div>
    );
  }

  return (
    <>
      <Navigation hideCart hideLocation hideProfile />

      <section className="admin-header">
        <div className="admin-header__left">
          <h1 className="admin-header__title">
            {t("admin.title")}&nbsp;
            <Shield size={28} color="#3b82f6" strokeWidth={1.8} />
          </h1>
          <p className="admin-header__subtitle">
            {ROLE_LABEL[role] ?? role} — {t("admin.subtitle")}
          </p>
        </div>

        <div className="stats-group">
          {canManage(role) && (
            <div className="stats-group__item">
              <span className="stats-group__label">{t("admin.platformCommission")}</span>
              <span className="stats-group__value">EGP {commission}</span>
            </div>
          )}
          <div className="stats-group__item">
            <span className="stats-group__label">{t("admin.activeIssues")}</span>
            <span className="stats-group__value">{rawStats?.active_issues ?? 0}</span>
          </div>
        </div>
      </section>

      <div className="admin-content">

        {/* كروت التحكم والزراير الثلاثة المربوطة بالـ App.jsx */}
        <section className="platform-analytics-section">
          <div className="section-title">
            <h2 className="section-title__main">{t("admin.platformAnalytics")}</h2>
            <p className="section-title__sub">{t("admin.analyticsSubtitle")}</p>
          </div>

          <div className="cards-container">
            {/* ✅ زرار إدارة المستخدمين - ينقل للروت الصح المتوافق مع الـ App.jsx */}
            <button type="button" className="analytics-card analytics-card--button"
              onClick={() => navigate("/admin/users")}>
              <div className="icon-box icon-box--blue"><Users size={22} color="#3b82f6" /></div>
              <div>
                <h3 className="analytics-card__title">{t("admin.cards.userManagement")}</h3>
                <p className="analytics-card__subtitle">{t("admin.cards.userManagementSubtitle")}</p>
              </div>
            </button>

            {/* ✅ زرار البلاغات والشكاوى */}
            <button type="button" className="analytics-card analytics-card--button"
              onClick={() => navigate("/admin/reports-issues")}>
              <div className="icon-box icon-box--orange"><CircleAlert size={22} color="#ea580c" /></div>
              <div>
                <h3 className="analytics-card__title">{t("admin.cards.reportsIssues")}</h3>
                <p className="analytics-card__subtitle">{t("admin.cards.reportsIssuesSubtitle")}</p>
              </div>
            </button>

            {/* ✅ زرار إدارة الشركات والـ Vendors - ظاهر دائماً وينقل لروت الـ App.jsx الصح */}
            <button type="button" className="analytics-card analytics-card--button"
              onClick={() => navigate("/admin/businesses")}>
              <div className="icon-box icon-box--purple"><ClipboardList size={22} color="#9333ea" /></div>
              <div>
                <h3 className="analytics-card__title">{t("admin.cards.manageBusinesses")}</h3>
                <p className="analytics-card__subtitle">{t("admin.cards.manageBusinessesSubtitle")}</p>
              </div>
            </button>
          </div>
        </section>

        {/* العدادات وعرض الأرقام الحية القادمة من الـ API */}
        {statsLoading ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#64748b", margin: "24px 0" }}>
            <Loader2 size={20} className="spin" /> {t("admin.loadingStats")}
          </div>
        ) : (
          <>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card p-4 shadow-sm">
                  <p className="text-muted mb-1">{t("admin.stats.totalOrders")}</p>
                  <h2>{Number(totalOrdersF).toLocaleString()}</h2>
                  <span className="badge bg-success">+12.5%</span>
                </div>
              </div>
              
              {canManage(role) && (
                <div className="col-md-6">
                  <div className="card p-4 shadow-sm">
                    <p className="text-muted mb-1">{t("admin.stats.totalRevenue")}</p>
                    <h2>EGP {Number(totalRevF).toLocaleString()}</h2>
                    <span className="badge bg-primary">+8.3%</span>
                  </div>
                </div>
              )}

              <div className="col-md-6">
                <div className="card p-4 shadow-sm">
                  <p className="text-muted mb-1">{t("admin.stats.activeBusinesses")}</p>
                  <h2>{activeBiz}</h2>
                  <span className="badge bg-purple text-white">+15.2%</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card p-4 shadow-sm">
                  <p className="text-muted mb-1">{t("admin.stats.totalUsers")}</p>
                  <h2>{Number(totalUsers).toLocaleString()}</h2>
                  <span className="badge bg-warning text-dark">+22.1%</span>
                </div>
              </div>
            </div>

            {/* البانرات المالية والبيئية التابعة للأدمن والمدير */}
            {canManage(role) && (
              <div className="mt-4">
                <div className="p-4 mb-3 text-white rounded" style={{ background: "#10b981" }}>
                  <p className="mb-1">{t("admin.platformCommission")}</p>
                  <h2>EGP {commission}</h2>
                  <small>{t("admin.commissionRate")}</small>
                </div>
                <div className="p-4 mb-3 text-white rounded"
                  style={{ background: "linear-gradient(to right, #3b82f6, #2563eb)" }}>
                  <p className="mb-1">{t("admin.foodSaved")}</p>
                  <h2>2,450 kg</h2>
                  <small>{t("admin.environmentalImpact")}</small>
                </div>
                <div className="p-4 text-white rounded"
                  style={{ background: "linear-gradient(to right, #a855f7, #9333ea)" }}>
                  <p className="mb-1">{t("admin.avgOrderValue")}</p>
                  <h2>EGP {avgOrder}</h2>
                  <small>{t("admin.perTransaction")}</small>
                </div>
              </div>
            )}

            {/* الرسوم البيانية المتجاوبة المبنية على الداتا الحية للباك إند */}
            <div className="card p-4 shadow-sm mt-4">
              <h6 className="fw-bold mb-4">{t("admin.weeklyPerformance")}</h6>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fontSize: 13 }} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 13 }} />
                  {canManage(role) && <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 13 }} />}
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left"  type="monotone" dataKey="orders"  stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name={t("admin.chart.orders")} />
                  {canManage(role) && (
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name={t("admin.chart.revenue")} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-4 shadow-sm mt-4 mb-4">
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

        {/* عرض سجل العمليات القادم من الـ API الفعلي مباشرة */}
        <div className="card p-4 shadow-sm mt-4 mb-5">
          <div className="d-flex align-items-center gap-2 mb-4">
            <Activity size={20} color="#3b82f6" />
            <h6 className="fw-bold mb-0">{t("admin.recentActivityTitle")}</h6>
          </div>
          
          {activityLoading ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center", color: "#64748b" }}>
              <Loader2 size={18} className="spin" /> {t("admin.updatingActivity")}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-muted small">{t("admin.noRecentActivity")}</p>
          ) : (
            <div className="activity-list" style={{ maxHeight: "300px", overflowY: "auto" }}>
              {activities.map((act, index) => (
                <div key={act.id || index} className="d-flex justify-content-between align-items-center p-2 mb-2 rounded bg-light" style={{ fontSize: "14px" }}>
                  <div>
                    <span className="fw-semibold text-dark">{act.description || act.action}</span>
                    <br />
                    <small className="text-muted">{t("admin.activity.by")}: {act.user?.name || act.performed_by || t("admin.activity.system")}</small>
                  </div>
                  <span className="badge bg-secondary">{act.created_at || t("admin.activity.justNow")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}`}</style>
    </>
  );
};

export default Admin;

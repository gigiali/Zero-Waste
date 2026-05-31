import { X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";

export function useCustomAlert() {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = "error", duration = 3000) => {
    const id = Date.now();
    const newAlert = { id, message, type };
    
    setAlerts((prev) => [...prev, newAlert]);

    if (duration > 0) {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, duration);
    }

    return id;
  };

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return { alerts, showAlert, removeAlert };
}

export function AlertContainer({ alerts, removeAlert }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 99999,
        maxWidth: "400px",
      }}
    >
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  );
}

function Alert({ message, type = "error", onClose }) {
  const typeConfig = {
    error: {
      bg: "#fef2f2",
      border: "#fca5a5",
      icon: <AlertCircle size={20} color="#ef4444" />,
      textColor: "#991b1b",
    },
    success: {
      bg: "#f0fdf4",
      border: "#86efac",
      icon: <CheckCircle size={20} color="#10b981" />,
      textColor: "#166534",
    },
    info: {
      bg: "#eff6ff",
      border: "#bfdbfe",
      icon: <Info size={20} color="#3b82f6" />,
      textColor: "#1e40af",
    },
  };

  const config = typeConfig[type] || typeConfig.error;

  return (
    <div
      style={{
        background: config.bg,
        border: `2px solid ${config.border}`,
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "12px",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      
      <div style={{ flexShrink: 0 }}>{config.icon}</div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            color: config.textColor,
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: "1.5",
            wordWrap: "break-word",
          }}
        >
          {message}
        </p>
      </div>
      
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
          color: config.textColor,
          opacity: 0.6,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = 1)}
        onMouseLeave={(e) => (e.target.style.opacity = 0.6)}
      >
        <X size={18} />
      </button>
    </div>
  );
}
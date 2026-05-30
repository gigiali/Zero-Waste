import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const links = [
    { label: "FAQ",               path: "/faq" },
    { label: "Contact Us",        path: "/contact" },
    { label: "Privacy Policy",    path: "/privacy" },
    { label: "Terms & Conditions",path: "/terms" },
  ];

  return (
    <footer style={{
      background: "#f9fafb",
      borderTop: "1px solid #e5e7eb",
      padding: "40px 24px 24px",
      marginTop: "48px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Top row */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "32px", marginBottom: "32px" }}>

          {/* Brand */}
          <div style={{ minWidth: "200px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <img src="/images/e.png" alt="ZeroWaste" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "8px" }} />
              <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#10b981" }}>ZeroWaste</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", maxWidth: "220px", lineHeight: 1.6, margin: 0 }}>
              Reducing food waste, one meal at a time. Save food, save money, save the planet.
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", color: "#9ca3af", marginBottom: "12px", textTransform: "uppercase" }}>
              Quick Links
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {links.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.9rem", color: "#374151", padding: 0, fontWeight: 500, transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", color: "#9ca3af", marginBottom: "12px", textTransform: "uppercase" }}>
              Contact
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <a href="mailto:support@zerowaste.com" style={{ fontSize: "0.88rem", color: "#374151", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}>
                📧 support@zerowaste.com
              </a>
              <a href="tel:+201234567890" style={{ fontSize: "0.88rem", color: "#374151", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}>
                📞 +20 123 456 7890
              </a>
              <p style={{ fontSize: "0.88rem", color: "#6b7280", margin: 0 }}>📍 Cairo, Egypt</p>
            </div>
          </div>

          {/* Social */}
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", color: "#9ca3af", marginBottom: "12px", textTransform: "uppercase" }}>
              Follow Us
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { icon: "𝕏", href: "https://twitter.com" },
                { icon: "in", href: "https://linkedin.com" },
                { icon: "f", href: "https://facebook.com" },
                { icon: "📸", href: "https://instagram.com" },
              ].map((s) => (
                <a key={s.icon} href={s.href} target="_blank" rel="noreferrer"
                  style={{ width: "36px", height: "36px", borderRadius: "8px", background: "white", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", color: "#374151", textDecoration: "none", fontWeight: 700, transition: "border-color 0.2s, color 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.color = "#10b981"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "#9ca3af" }}>
            © {year} ZeroWaste. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>Made with</span>
            <span style={{ color: "#ef4444" }}>♥</span>
            <span style={{ fontSize: "0.82rem", color: "#9ca3af" }}>for a greener planet 🌱</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

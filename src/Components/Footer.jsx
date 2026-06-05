import { useNavigate } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const links = [
    { label: "FAQ", path: "/faq" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms & Conditions", path: "/terms" },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-section footer-brand">
            <div className="footer-logo-group">
              <img 
  src="/images/zerowaste-logo.png"    
  alt="ZeroWaste Logo" 
  className="footer-logo"
  style={{
    width: "140px",
    height: "140px",
  }}
/>
            </div>
            <p className="footer-brand-description">
              Reducing food waste, one meal at a time. Save food, save money, save the planet.
            </p>
          </div>

          <div className="footer-section footer-links">
            <h3 className="footer-section-title">Quick Links</h3>
            <nav className="footer-nav">
              {links.map((link) => (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className="footer-link"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="footer-section footer-contact">
            <h3 className="footer-section-title">Contact</h3>
            <div className="footer-contact-list">
              <a 
                href="mailto:support@zerowaste.com" 
                className="footer-contact-item footer-contact-email"
              >
                <span className="footer-contact-icon">📧</span>
                <span>support@zerowaste.com</span>
              </a>
              <a 
                href="tel:+201234567890" 
                className="footer-contact-item footer-contact-phone"
              >
                <span className="footer-contact-icon">📞</span>
                <span>+20 123 456 7890</span>
              </a>
              <div className="footer-contact-item footer-contact-location">
                <span className="footer-contact-icon">📍</span>
                <span>Cairo, Egypt</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {year} ZeroWaste. All rights reserved.
          </p>
          <div className="footer-tagline">
            <span>Made with</span>
            <span className="footer-heart">♥</span>
            <span>for a greener planet 🌱</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

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
        {/* Top Section */}
        <div className="footer-top">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <div className="footer-logo-group">
              <img 
                src="/images/e.png" 
                alt="ZeroWaste Logo" 
                className="footer-logo"
              />
              <span className="footer-brand-name">ZeroWaste</span>
            </div>
            <p className="footer-brand-description">
              Reducing food waste, one meal at a time. Save food, save money, save the planet.
            </p>
          </div>

          {/* Quick Links Section */}
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

          {/* Contact Section */}
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

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
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

import React, { useState } from "react";
import Navigation from "../Components/Navigation";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction", icon: "📋" },
    { id: "data-collection", title: "Data Collection", icon: "📊" },
    { id: "data-usage", title: "Data Usage", icon: "🔄" },
    { id: "data-protection", title: "Data Protection", icon: "🔐" },
    { id: "data-sharing", title: "Data Sharing", icon: "🤝" },
    { id: "your-rights", title: "Your Rights", icon: "⚖️" },
    { id: "cookies", title: "Cookies", icon: "🍪" },
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navigation />
      <div className="policy-page">
        <div className="policy-header">
          <div className="header-content">
            <h1>Privacy Policy</h1>
            <p>Your privacy is our priority. Learn how we protect your data.</p>
          </div>
          <div className="header-decoration"></div>
        </div>

        <div className="policy-wrapper">
          {/* ── TABLE OF CONTENTS ─────────────────────────────────── */}
          <aside className="table-of-contents">
            <div className="toc-header">
              <h3>📑 Contents</h3>
            </div>
            <nav className="toc-nav">
              {sections.map((section) => (
                <button
                  key={section.id}
                  className={`toc-link ${activeSection === section.id ? "active" : ""}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  <span className="toc-icon">{section.icon}</span>
                  <span className="toc-text">{section.title}</span>
                </button>
              ))}
            </nav>
            <div className="toc-footer">
              <p>Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </aside>

          {/* ── MAIN CONTENT ──────────────────────────────────────── */}
          <main className="policy-content">
            {/* Introduction */}
            <section id="introduction" className="policy-section">
              <h2>
                <span className="section-icon">📋</span> Introduction
              </h2>
              <p>
                Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your 
                personal information when you use our Zero Waste platform. We're committed to transparency and ensuring 
                you have control over your data.
              </p>
              <div className="highlight-box">
                <p>🔒 We never sell your personal information to third parties.</p>
              </div>
            </section>

            {/* Data Collection */}
            <section id="data-collection" className="policy-section">
              <h2>
                <span className="section-icon">📊</span> Data Collection
              </h2>
              <p>We collect information in several ways to improve your experience:</p>
              <div className="data-grid">
                <div className="data-item">
                  <h4>👤 Personal Information</h4>
                  <ul>
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Business details</li>
                  </ul>
                </div>

                <div className="data-item">
                  <h4>🔑 Account Information</h4>
                  <ul>
                    <li>Username</li>
                    <li>Encrypted password</li>
                    <li>User preferences</li>
                    <li>Profile settings</li>
                  </ul>
                </div>

                <div className="data-item">
                  <h4>📈 Usage Data</h4>
                  <ul>
                    <li>Platform interactions</li>
                    <li>Pages visited</li>
                    <li>Features used</li>
                    <li>Time spent</li>
                  </ul>
                </div>

                <div className="data-item">
                  <h4>📍 Location Data</h4>
                  <ul>
                    <li>Business address</li>
                    <li>General location</li>
                    <li>Service coverage area</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section id="data-usage" className="policy-section">
              <h2>
                <span className="section-icon">🔄</span> Data Usage
              </h2>
              <p>We use your data for these specific purposes:</p>
              <div className="checklist">
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>Service Provision</h4>
                    <p>Provide and maintain platform services</p>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>Transactions</h4>
                    <p>Process transactions and manage accounts</p>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>Communication</h4>
                    <p>Communicate with users about services</p>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>Improvement</h4>
                    <p>Improve platform and develop new features</p>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>Analytics</h4>
                    <p>Analyze usage patterns for optimization</p>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>Security</h4>
                    <p>Ensure platform security and prevent fraud</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section id="data-protection" className="policy-section">
              <h2>
                <span className="section-icon">🔐</span> Data Protection
              </h2>
              <p>Your data security is our top priority. We implement:</p>
              <div className="security-features">
                <div className="feature">
                  <div className="feature-icon">🔒</div>
                  <h4>Encryption</h4>
                  <p>End-to-end encryption of sensitive data in transit and storage</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🛡️</div>
                  <h4>Security Audits</h4>
                  <p>Regular security audits and vulnerability assessments</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🔑</div>
                  <h4>Access Control</h4>
                  <p>Strict access controls and authentication systems</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">💾</div>
                  <h4>Secure Storage</h4>
                  <p>Secure data storage and backup procedures</p>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section id="data-sharing" className="policy-section">
              <h2>
                <span className="section-icon">🤝</span> Data Sharing
              </h2>
              <p>
                We do not sell your personal information. We may share your data only in these limited circumstances:
              </p>
              <div className="sharing-list">
                <div className="sharing-item">
                  <span className="sharing-badge">✓ Allowed</span>
                  <p>With trusted service providers (hosting, payment processing)</p>
                </div>
                <div className="sharing-item">
                  <span className="sharing-badge">✓ Allowed</span>
                  <p>When required by law or to protect our rights</p>
                </div>
                <div className="sharing-item">
                  <span className="sharing-badge">✓ Allowed</span>
                  <p>With your explicit consent for specific purposes</p>
                </div>
                <div className="sharing-item">
                  <span className="sharing-badge">✓ Allowed</span>
                  <p>In connection with business transfer or merger</p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section id="your-rights" className="policy-section">
              <h2>
                <span className="section-icon">⚖️</span> Your Rights
              </h2>
              <p>You have the following rights regarding your personal data:</p>
              <div className="rights-grid">
                <div className="right-card">
                  <h4>👁️ Right to Access</h4>
                  <p>Access your personal information anytime</p>
                </div>
                <div className="right-card">
                  <h4>✏️ Right to Correct</h4>
                  <p>Update or correct inaccurate information</p>
                </div>
                <div className="right-card">
                  <h4>🗑️ Right to Delete</h4>
                  <p>Delete your account and personal data</p>
                </div>
                <div className="right-card">
                  <h4>✋ Right to Opt-Out</h4>
                  <p>Opt out of marketing communications</p>
                </div>
                <div className="right-card">
                  <h4>📥 Right to Export</h4>
                  <p>Request a copy of your data</p>
                </div>
                <div className="right-card">
                  <h4>🚫 Right to Restrict</h4>
                  <p>Restrict processing of your data</p>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section id="cookies" className="policy-section">
              <h2>
                <span className="section-icon">🍪</span> Cookies
              </h2>
              <p>We use cookies to enhance your experience. Here's what we use:</p>
              <div className="cookie-types">
                <div className="cookie-type">
                  <h4>🔧 Essential Cookies</h4>
                  <p>Required for platform functionality and security</p>
                  <span className="status required">Required</span>
                </div>
                <div className="cookie-type">
                  <h4>📈 Analytics Cookies</h4>
                  <p>Help us understand usage patterns and improve features</p>
                  <span className="status optional">Optional</span>
                </div>
                <div className="cookie-type">
                  <h4>💾 Preference Cookies</h4>
                  <p>Remember your settings and preferences</p>
                  <span className="status optional">Optional</span>
                </div>
              </div>
              <div className="info-box">
                <p>📌 You can control cookies through your browser settings at any time.</p>
              </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
              <h2>Questions About Privacy?</h2>
              <p>If you have concerns about our privacy practices, please contact us:</p>
              <div className="contact-info">
                <p>📧 privacy@zerowaste.com</p>
                <p>💬 Support Chat: Available 24/7</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

export default PrivacyPolicy;
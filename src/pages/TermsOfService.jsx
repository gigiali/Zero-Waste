import React, { useState } from "react";
import Navigation from "../Components/Navigation";
import "./TermsOfService.css";

function TermsOfService() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction", icon: "📜" },
    { id: "user-responsibilities", title: "User Responsibilities", icon: "👤" },
    { id: "prohibited-activities", title: "Prohibited Activities", icon: "🚫" },
    { id: "account-security", title: "Account Security", icon: "🔐" },
    { id: "liability", title: "Limitation of Liability", icon: "⚠️" },
    { id: "changes", title: "Changes to Terms", icon: "🔄" },
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navigation />
      <div className="terms-page">
        <div className="terms-header">
          <div className="header-content">
            <h1>Terms of Service</h1>
            <p>Our commitment to fair and transparent service terms.</p>
          </div>
          <div className="header-decoration"></div>
        </div>

        <div className="terms-wrapper">
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
          <main className="terms-content">
            {/* Introduction */}
            <section id="introduction" className="terms-section">
              <h2>
                <span className="section-icon">📜</span> Introduction
              </h2>
              <p>
                These Terms of Service ("Terms") govern your use of the Zero Waste platform and all related 
                services, websites, and applications (collectively, the "Platform"). By accessing and using our Platform, 
                you agree to be bound by these Terms.
              </p>
              <div className="highlight-box important">
                <p>⚖️ If you do not agree with any part of these Terms, please do not use our Platform.</p>
              </div>
              <div className="info-section">
                <h4>🎯 Our Mission</h4>
                <p>
                  Zero Waste connects businesses with customers to reduce food waste and promote sustainability. 
                  We're committed to creating a transparent and trustworthy marketplace.
                </p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section id="user-responsibilities" className="terms-section">
              <h2>
                <span className="section-icon">👤</span> User Responsibilities
              </h2>
              <p>As a user of our Platform, you agree to:</p>
              <div className="responsibility-grid">
                <div className="responsibility-item">
                  <div className="resp-icon">✍️</div>
                  <h4>Accurate Information</h4>
                  <p>Provide accurate information when creating an account</p>
                </div>
                <div className="responsibility-item">
                  <div className="resp-icon">🎯</div>
                  <h4>Legitimate Use</h4>
                  <p>Use platform for legitimate purposes only</p>
                </div>
                <div className="responsibility-item">
                  <div className="resp-icon">🤝</div>
                  <h4>Respect Others</h4>
                  <p>Respect rights of other users and businesses</p>
                </div>
                <div className="responsibility-item">
                  <div className="resp-icon">🔑</div>
                  <h4>Secure Password</h4>
                  <p>Keep account credentials secure and confidential</p>
                </div>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section id="prohibited-activities" className="terms-section">
              <h2>
                <span className="section-icon">🚫</span> Prohibited Activities
              </h2>
              <p>You may not engage in the following activities on our Platform:</p>
              <div className="prohibited-list">
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>False Information</h4>
                    <p>Posting false, misleading, or deceptive information</p>
                  </div>
                </div>
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>Illegal Activities</h4>
                    <p>Violating applicable laws, regulations, or rights</p>
                  </div>
                </div>
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>Platform Interference</h4>
                    <p>Interfering with or disrupting platform operations</p>
                  </div>
                </div>
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>Harmful Use</h4>
                    <p>Using platform for harmful, threatening, or abusive purposes</p>
                  </div>
                </div>
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>Fraud</h4>
                    <p>Engaging in fraudulent, suspicious, or unethical activities</p>
                  </div>
                </div>
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>IP Violations</h4>
                    <p>Infringing upon intellectual property rights</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Security */}
            <section id="account-security" className="terms-section">
              <h2>
                <span className="section-icon">🔐</span> Account Security
              </h2>
              <p>
                You are solely responsible for maintaining the confidentiality of your account credentials and 
                for all activities that occur under your account, whether authorized or not.
              </p>
              <div className="security-guidelines">
                <div className="guideline">
                  <h4>🔔 Immediate Notification</h4>
                  <p>Notify us immediately of any unauthorized access or suspicious activity</p>
                </div>
                <div className="guideline">
                  <h4>💻 Account Protection</h4>
                  <p>Use strong, unique passwords and enable two-factor authentication if available</p>
                </div>
                <div className="guideline">
                  <h4>📱 Device Security</h4>
                  <p>Keep your devices and software updated with the latest security patches</p>
                </div>
                <div className="guideline">
                  <h4>🚫 Unauthorized Access</h4>
                  <p>Never share your account with others or allow unauthorized access</p>
                </div>
              </div>
              <div className="highlight-box warning">
                <p>⚠️ We are not liable for unauthorized access if you fail to maintain account security.</p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section id="liability" className="terms-section">
              <h2>
                <span className="section-icon">⚠️</span> Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, Zero Waste and its officers, directors, employees, 
                and agents shall not be liable for:
              </p>
              <div className="liability-list">
                <div className="liability-item">
                  <span className="icon">•</span>
                  <p>Indirect, incidental, or consequential damages</p>
                </div>
                <div className="liability-item">
                  <span className="icon">•</span>
                  <p>Loss of profits, data, or revenue</p>
                </div>
                <div className="liability-item">
                  <span className="icon">•</span>
                  <p>Business interruption or service outages</p>
                </div>
                <div className="liability-item">
                  <span className="icon">•</span>
                  <p>Third-party actions or content</p>
                </div>
              </div>
              <div className="liability-cap">
                <h4>💰 Liability Cap</h4>
                <p>
                  Our total liability shall not exceed the amount you paid to Zero Waste in the past 12 months, 
                  or $100, whichever is greater.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section id="changes" className="terms-section">
              <h2>
                <span className="section-icon">🔄</span> Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon 
                posting to the Platform.
              </p>
              <div className="changes-notice">
                <h4>📢 Your Acknowledgment</h4>
                <p>
                  Your continued use of the Platform following the posting of revised Terms means that you accept 
                  and agree to the changes.
                </p>
              </div>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div>
                    <h4>Notification</h4>
                    <p>We will notify you of significant changes via email</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div>
                    <h4>Review Period</h4>
                    <p>You have 30 days to review changes before they become binding</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div>
                    <h4>Acceptance</h4>
                    <p>Continued use after 30 days constitutes acceptance of new terms</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Terms */}
            <section className="additional-section">
              <h2>Important Additional Terms</h2>
              
              <div className="additional-grid">
                <div className="additional-item">
                  <h4>📋 Intellectual Property</h4>
                  <p>All content on our Platform is our property or licensed content. You may not reproduce without permission.</p>
                </div>
                <div className="additional-item">
                  <h4>🌍 Governing Law</h4>
                  <p>These Terms are governed by applicable laws. Any disputes will be resolved in appropriate courts.</p>
                </div>
                <div className="additional-item">
                  <h4>🤝 Third-Party Services</h4>
                  <p>We are not responsible for third-party services, links, or content on our Platform.</p>
                </div>
                <div className="additional-item">
                  <h4>📞 Contact & Support</h4>
                  <p>Have questions? Contact our support team at support@zerowaste.com</p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
              <h2>Questions About These Terms?</h2>
              <p>If you have any questions or concerns about our Terms of Service, please reach out:</p>
              <div className="contact-info">
                <p>📧 legal@zerowaste.com</p>
                <p>💬 Support Chat: Available 24/7</p>
                <p>📞 Phone Support: Coming Soon</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

export default TermsOfService;
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "../Components/Navigation";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    {
      id: "introduction",
      title: t("privacy.sections.introduction"),
      icon: "📋",
    },
    {
      id: "data-collection",
      title: t("privacy.sections.dataCollection"),
      icon: "📊",
    },
    { id: "data-usage", title: t("privacy.sections.dataUsage"), icon: "🔄" },
    {
      id: "data-protection",
      title: t("privacy.sections.dataProtection"),
      icon: "🔐",
    },
    {
      id: "data-sharing",
      title: t("privacy.sections.dataSharing"),
      icon: "🤝",
    },
    { id: "your-rights", title: t("privacy.sections.yourRights"), icon: "⚖️" },
    { id: "cookies", title: t("privacy.sections.cookies"), icon: "🍪" },
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
            <h1>{t("privacy.title")}</h1>
            <p>{t("privacy.subtitle")}</p>
          </div>
          <div className="header-decoration"></div>
        </div>

        <div className="policy-wrapper">
          {/* ── TABLE OF CONTENTS ─────────────────────────────────── */}
          <aside className="table-of-contents">
            <div className="toc-header">
              <h3>{t("privacy.contentsHeader")}</h3>
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
              <p>
                {t("privacy.lastUpdated")}{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </aside>

          {/* ── MAIN CONTENT ──────────────────────────────────────── */}
          <main className="policy-content">
            {/* Introduction */}
            <section id="introduction" className="policy-section">
              <h2>
                <span className="section-icon">📋</span>{" "}
                {t("privacy.introduction.title")}
              </h2>
              <p>{t("privacy.introduction.description")}</p>
              <div className="highlight-box">
                <p>{t("privacy.introduction.highlight")}</p>
              </div>
            </section>

            {/* Data Collection */}
            <section id="data-collection" className="policy-section">
              <h2>
                <span className="section-icon">📊</span>{" "}
                {t("privacy.dataCollection.title")}
              </h2>
              <p>{t("privacy.dataCollection.description")}</p>
              <div className="data-grid">
                <div className="data-item">
                  <h4>
                    {t("privacy.dataCollection.personalInformation.title")}
                  </h4>
                  <ul>
                    <li>
                      {t(
                        "privacy.dataCollection.personalInformation.items.fullName",
                      )}
                    </li>
                    <li>
                      {t(
                        "privacy.dataCollection.personalInformation.items.email",
                      )}
                    </li>
                    <li>
                      {t(
                        "privacy.dataCollection.personalInformation.items.phone",
                      )}
                    </li>
                    <li>
                      {t(
                        "privacy.dataCollection.personalInformation.items.businessDetails",
                      )}
                    </li>
                  </ul>
                </div>

                <div className="data-item">
                  <h4>
                    {t("privacy.dataCollection.accountInformation.title")}
                  </h4>
                  <ul>
                    <li>
                      {t(
                        "privacy.dataCollection.accountInformation.items.username",
                      )}
                    </li>
                    <li>
                      {t(
                        "privacy.dataCollection.accountInformation.items.encryptedPassword",
                      )}
                    </li>
                    <li>
                      {t(
                        "privacy.dataCollection.accountInformation.items.preferences",
                      )}
                    </li>
                    <li>
                      {t(
                        "privacy.dataCollection.accountInformation.items.profileSettings",
                      )}
                    </li>
                  </ul>
                </div>

                <div className="data-item">
                  <h4>{t("privacy.dataCollection.usageData.title")}</h4>
                  <ul>
                    <li>
                      {t("privacy.dataCollection.usageData.items.interactions")}
                    </li>
                    <li>
                      {t("privacy.dataCollection.usageData.items.pagesVisited")}
                    </li>
                    <li>
                      {t("privacy.dataCollection.usageData.items.featuresUsed")}
                    </li>
                    <li>
                      {t("privacy.dataCollection.usageData.items.timeSpent")}
                    </li>
                  </ul>
                </div>

                <div className="data-item">
                  <h4>{t("privacy.dataCollection.locationData.title")}</h4>
                  <ul>
                    <li>
                      {t(
                        "privacy.dataCollection.locationData.items.businessAddress",
                      )}
                    </li>
                    <li>
                      {t(
                        "privacy.dataCollection.locationData.items.generalLocation",
                      )}
                    </li>
                    <li>
                      {t(
                        "privacy.dataCollection.locationData.items.coverageArea",
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section id="data-usage" className="policy-section">
              <h2>
                <span className="section-icon">🔄</span>{" "}
                {t("privacy.dataUsage.title")}
              </h2>
              <p>{t("privacy.dataUsage.description")}</p>
              <div className="checklist">
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>
                      {t("privacy.dataUsage.items.serviceProvision.title")}
                    </h4>
                    <p>
                      {t(
                        "privacy.dataUsage.items.serviceProvision.description",
                      )}
                    </p>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>{t("privacy.dataUsage.items.transactions.title")}</h4>
                    <p>
                      {t("privacy.dataUsage.items.transactions.description")}
                    </p>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>{t("privacy.dataUsage.items.communication.title")}</h4>
                    <p>
                      {t("privacy.dataUsage.items.communication.description")}
                    </p>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>{t("privacy.dataUsage.items.improvement.title")}</h4>
                    <p>
                      {t("privacy.dataUsage.items.improvement.description")}
                    </p>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>{t("privacy.dataUsage.items.analytics.title")}</h4>
                    <p>{t("privacy.dataUsage.items.analytics.description")}</p>
                  </div>
                </div>
                <div className="check-item">
                  <span className="check-icon">✓</span>
                  <div>
                    <h4>{t("privacy.dataUsage.items.security.title")}</h4>
                    <p>{t("privacy.dataUsage.items.security.description")}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section id="data-protection" className="policy-section">
              <h2>
                <span className="section-icon">🔐</span>{" "}
                {t("privacy.dataProtection.title")}
              </h2>
              <p>{t("privacy.dataProtection.description")}</p>
              <div className="security-features">
                <div className="feature">
                  <div className="feature-icon">🔒</div>
                  <h4>
                    {t("privacy.dataProtection.features.encryption.title")}
                  </h4>
                  <p>
                    {t(
                      "privacy.dataProtection.features.encryption.description",
                    )}
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🛡️</div>
                  <h4>
                    {t("privacy.dataProtection.features.securityAudits.title")}
                  </h4>
                  <p>
                    {t(
                      "privacy.dataProtection.features.securityAudits.description",
                    )}
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🔑</div>
                  <h4>
                    {t("privacy.dataProtection.features.accessControl.title")}
                  </h4>
                  <p>
                    {t(
                      "privacy.dataProtection.features.accessControl.description",
                    )}
                  </p>
                </div>
                <div className="feature">
                  <div className="feature-icon">💾</div>
                  <h4>
                    {t("privacy.dataProtection.features.secureStorage.title")}
                  </h4>
                  <p>
                    {t(
                      "privacy.dataProtection.features.secureStorage.description",
                    )}
                  </p>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section id="data-sharing" className="policy-section">
              <h2>
                <span className="section-icon">🤝</span>{" "}
                {t("privacy.dataSharing.title")}
              </h2>
              <p>{t("privacy.dataSharing.description")}</p>
              <div className="sharing-list">
                <div className="sharing-item">
                  <span className="sharing-badge">
                    ✓ {t("privacy.dataSharing.labels.allowed")}
                  </span>
                  <p>{t("privacy.dataSharing.items.providers")}</p>
                </div>
                <div className="sharing-item">
                  <span className="sharing-badge">
                    ✓ {t("privacy.dataSharing.labels.allowed")}
                  </span>
                  <p>{t("privacy.dataSharing.items.legalRequirements")}</p>
                </div>
                <div className="sharing-item">
                  <span className="sharing-badge">
                    ✓ {t("privacy.dataSharing.labels.allowed")}
                  </span>
                  <p>{t("privacy.dataSharing.items.consent")}</p>
                </div>
                <div className="sharing-item">
                  <span className="sharing-badge">
                    ✓ {t("privacy.dataSharing.labels.allowed")}
                  </span>
                  <p>{t("privacy.dataSharing.items.businessTransfer")}</p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section id="your-rights" className="policy-section">
              <h2>
                <span className="section-icon">⚖️</span>{" "}
                {t("privacy.yourRights.title")}
              </h2>
              <p>{t("privacy.yourRights.description")}</p>
              <div className="rights-grid">
                <div className="right-card">
                  <h4>{t("privacy.yourRights.items.access.title")}</h4>
                  <p>{t("privacy.yourRights.items.access.description")}</p>
                </div>
                <div className="right-card">
                  <h4>{t("privacy.yourRights.items.correct.title")}</h4>
                  <p>{t("privacy.yourRights.items.correct.description")}</p>
                </div>
                <div className="right-card">
                  <h4>{t("privacy.yourRights.items.delete.title")}</h4>
                  <p>{t("privacy.yourRights.items.delete.description")}</p>
                </div>
                <div className="right-card">
                  <h4>{t("privacy.yourRights.items.optOut.title")}</h4>
                  <p>{t("privacy.yourRights.items.optOut.description")}</p>
                </div>
                <div className="right-card">
                  <h4>{t("privacy.yourRights.items.export.title")}</h4>
                  <p>{t("privacy.yourRights.items.export.description")}</p>
                </div>
                <div className="right-card">
                  <h4>{t("privacy.yourRights.items.restrict.title")}</h4>
                  <p>{t("privacy.yourRights.items.restrict.description")}</p>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section id="cookies" className="policy-section">
              <h2>
                <span className="section-icon">🍪</span>{" "}
                {t("privacy.cookies.title")}
              </h2>
              <p>{t("privacy.cookies.description")}</p>
              <div className="cookie-types">
                <div className="cookie-type">
                  <h4>{t("privacy.cookies.items.essential.title")}</h4>
                  <p>{t("privacy.cookies.items.essential.description")}</p>
                  <span className="status required">
                    {t("privacy.cookies.labels.required")}
                  </span>
                </div>
                <div className="cookie-type">
                  <h4>{t("privacy.cookies.items.analytics.title")}</h4>
                  <p>{t("privacy.cookies.items.analytics.description")}</p>
                  <span className="status optional">
                    {t("privacy.cookies.labels.optional")}
                  </span>
                </div>
                <div className="cookie-type">
                  <h4>{t("privacy.cookies.items.preference.title")}</h4>
                  <p>{t("privacy.cookies.items.preference.description")}</p>
                  <span className="status optional">
                    {t("privacy.cookies.labels.optional")}
                  </span>
                </div>
              </div>
              <div className="info-box">
                <p>{t("privacy.cookies.note")}</p>
              </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
              <h2>{t("privacy.contact.title")}</h2>
              <p>{t("privacy.contact.description")}</p>
              <div className="contact-info">
                <p>{t("privacy.contact.email")}</p>
                <p>{t("privacy.contact.chat")}</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

export default PrivacyPolicy;

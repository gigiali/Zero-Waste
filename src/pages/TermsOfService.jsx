import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Navigation from "../Components/Navigation";
import "./TermsOfService.css";

function TermsOfService() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: t("terms.sections.introduction"), icon: "📜" },
    { id: "user-responsibilities", title: t("terms.sections.userResponsibilities"), icon: "👤" },
    { id: "prohibited-activities", title: t("terms.sections.prohibitedActivities"), icon: "🚫" },
    { id: "account-security", title: t("terms.sections.accountSecurity"), icon: "🔐" },
    { id: "liability", title: t("terms.sections.limitationOfLiability"), icon: "⚠️" },
    { id: "changes", title: t("terms.sections.changesToTerms"), icon: "🔄" },
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
            <h1>{t("terms.title")}</h1>
            <p>{t("terms.subtitle")}</p>
          </div>
          <div className="header-decoration"></div>
        </div>

        <div className="terms-wrapper">
          {/* ── TABLE OF CONTENTS ─────────────────────────────────── */}
          <aside className="table-of-contents">
            <div className="toc-header">
              <h3>{t("terms.contentsHeader")}</h3>
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
              <p>{t("terms.lastUpdated")} {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </aside>

          {/* ── MAIN CONTENT ──────────────────────────────────────── */}
          <main className="terms-content">
            {/* Introduction */}
            <section id="introduction" className="terms-section">
              <h2>
                <span className="section-icon">📜</span> {t("terms.introduction.title")}
              </h2>
              <p>{t("terms.introduction.description")}</p>
              <div className="highlight-box important">
                <p>{t("terms.introduction.warning")}</p>
              </div>
              <div className="info-section">
                <h4>{t("terms.introduction.missionTitle")}</h4>
                <p>{t("terms.introduction.missionText")}</p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section id="user-responsibilities" className="terms-section">
              <h2>
                <span className="section-icon">👤</span> {t("terms.userResponsibilities.title")}
              </h2>
              <p>{t("terms.userResponsibilities.description")}</p>
              <div className="responsibility-grid">
                <div className="responsibility-item">
                  <div className="resp-icon">✍️</div>
                  <h4>{t("terms.userResponsibilities.accurateInformation.title")}</h4>
                  <p>{t("terms.userResponsibilities.accurateInformation.text")}</p>
                </div>
                <div className="responsibility-item">
                  <div className="resp-icon">🎯</div>
                  <h4>{t("terms.userResponsibilities.legitimateUse.title")}</h4>
                  <p>{t("terms.userResponsibilities.legitimateUse.text")}</p>
                </div>
                <div className="responsibility-item">
                  <div className="resp-icon">🤝</div>
                  <h4>{t("terms.userResponsibilities.respectOthers.title")}</h4>
                  <p>{t("terms.userResponsibilities.respectOthers.text")}</p>
                </div>
                <div className="responsibility-item">
                  <div className="resp-icon">🔑</div>
                  <h4>{t("terms.userResponsibilities.securePassword.title")}</h4>
                  <p>{t("terms.userResponsibilities.securePassword.text")}</p>
                </div>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section id="prohibited-activities" className="terms-section">
              <h2>
                <span className="section-icon">🚫</span> {t("terms.prohibitedActivities.title")}
              </h2>
              <p>{t("terms.prohibitedActivities.description")}</p>
              <div className="prohibited-list">
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>{t("terms.prohibitedActivities.falseInformation.title")}</h4>
                    <p>{t("terms.prohibitedActivities.falseInformation.text")}</p>
                  </div>
                </div>
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>{t("terms.prohibitedActivities.illegalActivities.title")}</h4>
                    <p>{t("terms.prohibitedActivities.illegalActivities.text")}</p>
                  </div>
                </div>
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>{t("terms.prohibitedActivities.platformInterference.title")}</h4>
                    <p>{t("terms.prohibitedActivities.platformInterference.text")}</p>
                  </div>
                </div>
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>{t("terms.prohibitedActivities.harmfulUse.title")}</h4>
                    <p>{t("terms.prohibitedActivities.harmfulUse.text")}</p>
                  </div>
                </div>
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>{t("terms.prohibitedActivities.fraud.title")}</h4>
                    <p>{t("terms.prohibitedActivities.fraud.text")}</p>
                  </div>
                </div>
                <div className="prohibited-item danger">
                  <span className="icon">❌</span>
                  <div>
                    <h4>{t("terms.prohibitedActivities.ipViolations.title")}</h4>
                    <p>{t("terms.prohibitedActivities.ipViolations.text")}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Security */}
            <section id="account-security" className="terms-section">
              <h2>
                <span className="section-icon">🔐</span> {t("terms.accountSecurity.title")}
              </h2>
              <p>{t("terms.accountSecurity.description")}</p>
              <div className="security-guidelines">
                <div className="guideline">
                  <h4>{t("terms.accountSecurity.immediateNotification.title")}</h4>
                  <p>{t("terms.accountSecurity.immediateNotification.text")}</p>
                </div>
                <div className="guideline">
                  <h4>{t("terms.accountSecurity.accountProtection.title")}</h4>
                  <p>{t("terms.accountSecurity.accountProtection.text")}</p>
                </div>
                <div className="guideline">
                  <h4>{t("terms.accountSecurity.deviceSecurity.title")}</h4>
                  <p>{t("terms.accountSecurity.deviceSecurity.text")}</p>
                </div>
                <div className="guideline">
                  <h4>{t("terms.accountSecurity.unauthorizedAccess.title")}</h4>
                  <p>{t("terms.accountSecurity.unauthorizedAccess.text")}</p>
                </div>
              </div>
              <div className="highlight-box warning">
                <p>{t("terms.accountSecurity.warning")}</p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section id="liability" className="terms-section">
              <h2>
                <span className="section-icon">⚠️</span> {t("terms.limitationOfLiability.title")}
              </h2>
              <p>{t("terms.limitationOfLiability.description")}</p>
              <div className="liability-list">
                <div className="liability-item">
                  <span className="icon">•</span>
                  <p>{t("terms.limitationOfLiability.indirectDamages")}</p>
                </div>
                <div className="liability-item">
                  <span className="icon">•</span>
                  <p>{t("terms.limitationOfLiability.lossOfProfits")}</p>
                </div>
                <div className="liability-item">
                  <span className="icon">•</span>
                  <p>{t("terms.limitationOfLiability.businessInterruption")}</p>
                </div>
                <div className="liability-item">
                  <span className="icon">•</span>
                  <p>{t("terms.limitationOfLiability.thirdPartyActions")}</p>
                </div>
              </div>
              <div className="liability-cap">
                <h4>{t("terms.limitationOfLiability.capTitle")}</h4>
                <p>{t("terms.limitationOfLiability.capDescription")}</p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section id="changes" className="terms-section">
              <h2>
                <span className="section-icon">🔄</span> {t("terms.changesToTerms.title")}
              </h2>
              <p>{t("terms.changesToTerms.description")}</p>
              <div className="changes-notice">
                <h4>{t("terms.changesToTerms.acknowledgmentTitle")}</h4>
                <p>{t("terms.changesToTerms.acknowledgmentText")}</p>
              </div>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div>
                    <h4>{t("terms.changesToTerms.notificationTitle")}</h4>
                    <p>{t("terms.changesToTerms.notificationText")}</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div>
                    <h4>{t("terms.changesToTerms.reviewTitle")}</h4>
                    <p>{t("terms.changesToTerms.reviewText")}</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div>
                    <h4>{t("terms.changesToTerms.acceptanceTitle")}</h4>
                    <p>{t("terms.changesToTerms.acceptanceText")}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Terms */}
            <section className="additional-section">
              <h2>{t("terms.additionalTerms.title")}</h2>
              
              <div className="additional-grid">
                <div className="additional-item">
                  <h4>{t("terms.additionalTerms.intellectualProperty.title")}</h4>
                  <p>{t("terms.additionalTerms.intellectualProperty.text")}</p>
                </div>
                <div className="additional-item">
                  <h4>{t("terms.additionalTerms.governingLaw.title")}</h4>
                  <p>{t("terms.additionalTerms.governingLaw.text")}</p>
                </div>
                <div className="additional-item">
                  <h4>{t("terms.additionalTerms.thirdPartyServices.title")}</h4>
                  <p>{t("terms.additionalTerms.thirdPartyServices.text")}</p>
                </div>
                <div className="additional-item">
                  <h4>{t("terms.additionalTerms.contactSupport.title")}</h4>
                  <p>{t("terms.additionalTerms.contactSupport.text")}</p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
              <h2>{t("terms.contact.title")}</h2>
              <p>{t("terms.contact.description")}</p>
              <div className="contact-info">
                <p>{t("terms.contact.email")}</p>
                <p>{t("terms.contact.chat")}</p>
                <p>{t("terms.contact.phone")}</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

export default TermsOfService;
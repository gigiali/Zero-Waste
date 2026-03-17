import React from "react";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1>Privacy Policy</h1>
        
        <div className="privacy-content">
          <section>
            <h2>Introduction</h2>
            <p>
              Your privacy is important to us. This Privacy Policy explains how we collect, use, 
              and protect your personal information when you use our Zero Waste platform.
            </p>
          </section>

          <section>
            <h2>Data Collection</h2>
            <ul>
              <li><strong>Personal Info:</strong> Name, email, phone, business details</li>
              <li><strong>Account Info:</strong> Username, encrypted password, preferences</li>
              <li><strong>Usage Data:</strong> Platform interactions, pages visited, features used</li>
              <li><strong>Location Data:</strong> Business address and general location</li>
            </ul>
          </section>

          <section>
            <h2>Data Usage</h2>
            <ul>
              <li>Provide and maintain platform services</li>
              <li>Process transactions and manage accounts</li>
              <li>Communicate with users about services</li>
              <li>Improve platform and develop features</li>
              <li>Analyze usage patterns for optimization</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2>Data Protection</h2>
            <ul>
              <li>Encryption of sensitive data in transit and storage</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication systems</li>
              <li>Secure data storage and backup procedures</li>
            </ul>
          </section>

          <section>
            <h2>Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data only:
            </p>
            <ul>
              <li>With service providers (hosting, payment processing)</li>
              <li>When required by law or to protect rights</li>
              <li>With your explicit consent for specific purposes</li>
              <li>In connection with business transfer or merger</li>
            </ul>
          </section>

          <section>
            <h2>Your Rights</h2>
            <ul>
              <li>Access your personal information</li>
              <li>Update or correct inaccurate information</li>
              <li>Delete your account and personal data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2>Cookies</h2>
            <ul>
              <li>Essential cookies for platform functionality</li>
              <li>Analytics cookies to understand usage patterns</li>
              <li>Preference cookies to remember settings</li>
              <li>You can control cookies through browser settings</li>
            </ul>
          </section>
        </div>

        <div className="privacy-footer">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <a href="/signin" className="back-link">Back to Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;

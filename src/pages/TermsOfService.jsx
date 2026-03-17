import React from "react";
import "./TermsOfService.css";

function TermsOfService() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Terms of Service</h1>
        
        <div className="terms-content">
          <section>
            <h2>Introduction</h2>
            <p>
              These Terms of Service govern your use of Zero Waste platform. By accessing our services, 
              you agree to comply with these terms and all applicable laws. Our platform connects 
              businesses with customers to reduce food waste and promote sustainability.
            </p>
          </section>

          <section>
            <h2>User Responsibilities</h2>
            <ul>
              <li>Provide accurate information when creating an account</li>
              <li>Use platform for legitimate purposes only</li>
              <li>Respect rights of other users and businesses</li>
              <li>Keep account credentials secure</li>
              <li>Not engage in fraudulent activities</li>
            </ul>
          </section>

          <section>
            <h2>Prohibited Activities</h2>
            <ul>
              <li>Posting false or misleading information</li>
              <li>Violating applicable laws or regulations</li>
              <li>Interfering with platform operations</li>
              <li>Using platform for harmful purposes</li>
            </ul>
          </section>

          <section>
            <h2>Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and all activities 
              that occur under your account. Notify us immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2>Limitation of Liability</h2>
            <p>
              Zero Waste is not liable for indirect or consequential damages. Our liability is 
              limited to the maximum extent permitted by applicable law.
            </p>
          </section>

          <section>
            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Continued use of the platform 
              constitutes acceptance of updated terms.
            </p>
          </section>
        </div>

        <div className="terms-footer">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <a href="/signin" className="back-link">Back to Sign In</a>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;

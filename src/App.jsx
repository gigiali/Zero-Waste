import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";

// User Pages
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import PaymentMethodPage from "./pages/PaymentMethod";
import MyProfile from "./pages/MyProfile";
import OfferDetail from "./pages/OfferDetail";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";

// Auth Pages
import "./auth-theme.css";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";

// Other Pages
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import BusinessSetup from "./pages/BusinessSetup";
import Business from "./pages/Business";

// Admin
import Admin from "./pages/Admin";
import ReportsIssues from "./pages/ReportsIssues";
import ManageBusinesses from "./pages/ManageBusinesses";
import UserManagement from "./pages/UserManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Static */}
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* User (with Navigation) */}
        <Route path="/home" element={<><Navigation /><HomePage /></>} />
        <Route path="/card" element={<><Navigation /><CartPage /></>} />
        <Route path="/payment" element={<><Navigation /><PaymentMethodPage /></>} />
        <Route path="/order-confirmation" element={<><Navigation /><OrderConfirmation /></>} />
        <Route path="/order-tracking" element={<><Navigation /><OrderTracking /></>} />
        <Route path="/profile" element={<><Navigation /><MyProfile /></>} />
        <Route path="/offer/:id" element={<><Navigation /><OfferDetail /></>} />

        {/* Business */}
        <Route path="/business-setup" element={<BusinessSetup />} />
        <Route path="/business" element={<Business />} />

        {/* Admin */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/reports-issues" element={<ReportsIssues />} />
        <Route path="/admin/businesses" element={<ManageBusinesses />} />
        <Route path="/admin/users" element={<UserManagement />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

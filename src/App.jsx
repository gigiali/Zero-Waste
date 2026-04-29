import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import BusinessSetup from "./pages/BusinessSetup";
import Business from "./pages/Business";
import Navigation from "./Components/Navigation";
import HomePage from "./pages/HomePage";
import Admin from "./pages/Admin";
import ReportsIssues from "./pages/ReportsIssues";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/business-setup" element={<BusinessSetup />} />
        <Route path="/business" element={<Business />} />
        <Route path="/home" element={<><Navigation /><HomePage /></>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/reports-issues" element={<ReportsIssues />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
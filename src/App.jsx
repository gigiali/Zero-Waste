import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocationProvider } from "./Context/LocationContext";

import Navigation from "./Components/Navigation";

// User Pages
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import PaymentMethodPage from "./pages/PaymentMethod";
import UserProfile from "./pages/MyProfileUser";
import OfferDetail from "./pages/OfferDetail";
import RestaurantDetail from "./pages/RestaurantDetail"
import Favorites from "./pages/Favorites";

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
import AddBranch from "./pages/AddBranch";
import BusinessProfile from "./pages/MyProfileBusiness";

// Admin
import Admin from "./pages/Admin";
import ReviewModeration from "./pages/ReviewModeration";
import ManageBusinesses from "./pages/ManageBusinesses";
import UserManagement from "./pages/UserManagement";
import AdminProfile from "./pages/MyProfileAdmin";

function App() {
  return (
    <LocationProvider>
      <BrowserRouter>
        <Routes>

          {/* Auth */}
          <Route path="/"                element={<><Navigation /> <HomePage /></>} />
          <Route path="/signin"          element={<SignIn />} />
          <Route path="/signup"          element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code"     element={<VerifyCode />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* Static */}
          <Route path="/terms"   element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* User (with Navigation) */}
          <Route path="/home"           element={<><Navigation /> <HomePage /></>} />
          <Route path="/card"           element={<><Navigation /> <CartPage /></>} />
          <Route path="/payment"        element={<><Navigation /> <PaymentMethodPage /></>} />
          <Route path="/profile"        element={<><Navigation /> <UserProfile /></>} />
          <Route path="/favorites"      element={<Favorites />} />
          <Route path="/offer/:id"      element={<><Navigation /> <OfferDetail /></>} />
          <Route path="/restaurant/:id" element={<><Navigation /> <RestaurantDetail /></>} />
          {/* Business */}
          <Route path="/business-setup"   element={<BusinessSetup />} />
          <Route path="/business"         element={<Business />} />
          <Route path="/add-branch"       element={<AddBranch />} />
          <Route path="/business/profile" element={<BusinessProfile />} />

          {/* Admin */}
          <Route path="/admin"                     element={<Admin />} />
          <Route path="/admin/review-moderation"   element={<ReviewModeration />} />
          <Route path="/admin/businesses"          element={<ManageBusinesses />} />
          <Route path="/admin/users"               element={<UserManagement />} />
          <Route path="/admin/profile"             element={<AdminProfile />} />

        </Routes>
      </BrowserRouter>
    </LocationProvider>
  );
}

export default App;

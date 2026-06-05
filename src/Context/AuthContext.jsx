import { createContext, useContext, useState } from "react";

const AuthContext = createContext();


export function AuthProvider({ children }) {
const [user, setUser] = useState(() => {
  const token =
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token");
  const role =
    sessionStorage.getItem("user_role") ||
    localStorage.getItem("user_role");
  return token ? { _tokenOnly: true, role_type: role } : null;
});

  const [businessStatus, setBusinessStatus] = useState(null);

  const login = (userData, token, remember = false) => {
    sessionStorage.setItem("token", token);
sessionStorage.setItem("auth_token", token);
sessionStorage.setItem("user_role", userData.role_type ?? userData.role ?? "");
 setUser(userData);
  };

  const updateUser = (updates) => {
    setUser((current) => ({ ...(current || {}), ...updates }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("rememberedPassword");
    localStorage.removeItem("businessStatus");
sessionStorage.removeItem("user_role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("zw_active_order");
    localStorage.removeItem("zw_favorites_count");

    // مسح الـ review data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("review_dismissed_") || key.startsWith("review_submitted_")) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
    setBusinessStatus(null);
  };

  const isLoggedIn = !!user;

  const role = user?.role_type ?? user?.role ?? null;
  const token =
  localStorage.getItem("token") ||
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") || null;

  return (
    <AuthContext.Provider
      value={{
  user,
  login,
  logout,
  isLoggedIn,
  businessStatus,
  setBusinessStatus,
  role,
  updateUser,
  token, // ✅ أضيفي السطر ده
}}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

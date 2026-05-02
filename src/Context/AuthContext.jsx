import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Restore session on page refresh
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (token && stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const login = (userData, token, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("rememberedPassword");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userRole");
    setUser(null);
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
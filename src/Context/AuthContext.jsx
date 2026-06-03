import { createContext, useContext, useState } from "react";

const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    return token ? { _tokenOnly: true } : null;
  });

  const [businessStatus, setBusinessStatus] = useState(null);

  const login = (userData, token, remember = false) => {
    localStorage.setItem("token", token);
localStorage.setItem("auth_token", token);
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
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("auth_token");
    setUser(null);
    setBusinessStatus(null);
  };

  const isLoggedIn = !!user;

  const role = user?.role_type ?? user?.role ?? null;

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

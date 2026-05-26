import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const getStorage = () => {
  if (typeof window === "undefined") return localStorage;
  return localStorage.getItem("token") || localStorage.getItem("auth_token")
    ? localStorage
    : sessionStorage;
};

const saveUserToStorage = (userData) => {
  const storage = getStorage();
  if (userData) storage.setItem("user", JSON.stringify(userData));
  else storage.removeItem("user");
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const stored =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (token && stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [businessStatus, setBusinessStatus] = useState(() => {
    return localStorage.getItem("businessStatus") || null;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    let userId = "guest";
    try { userId = JSON.parse(storedUser)?.id ?? "guest"; } catch {}
    return localStorage.getItem(`darkMode_${userId}`) === "true";
  });
  
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    let userId = "guest";
    try { userId = JSON.parse(storedUser)?.id ?? "guest"; } catch {}
    localStorage.setItem(`darkMode_${userId}`, darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const login = (userData, token, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (updates) => {
    setUser((current) => {
      const next = { ...(current || {}), ...updates };
      saveUserToStorage(next);
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("rememberMe");
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("rememberedPassword");
    localStorage.removeItem("businessStatus");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userRole");
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
      darkMode,
      toggleDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

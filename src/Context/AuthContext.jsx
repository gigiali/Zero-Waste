import { createContext, useContext, useState } from "react";

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
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token"); // زيادة أمان
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

  // ✅ تعديل الـ login لضمان حفظ التوكن بالاسمين وزيادة الأمان
  const login = (userData, token, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;

    // بنحفظ بالاسمين عشان نضمن إن أي الـ Components القديمة والجديدة تقرأه بدون أي Error
    storage.setItem("token", token);
    storage.setItem("auth_token", token);
    storage.setItem("user", JSON.stringify(userData));

    // تحديث الـ State فوراً عشان يسمع في الـ useEffect بتاع البروفايل
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

  // دي الـ الـ حلال المشاكل اللي مربوطة بالـ useEffect في صفحة الـ Profile
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

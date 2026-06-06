import {
  ShoppingCart,
  User,
  MapPin,
  Globe,
  X,
  Search,
  LogIn,
  Heart,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { NotificationsBell } from "./Notificationsdropdown";
import { useLocationContext } from "../Context/LocationContext";
import "./Navigation.css";

export default function Navigation({
  borderBottomColor = "#e5e7eb",
  showShadow = true,
  hideCart = false,
  hideLocation = false,
  hideProfile = false,
}) {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isLoggedIn, logout, user, updateUser } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { locationName, loadingLocation, fetchNearbyAndFee, clearLocation } =
    useLocationContext();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const initial =
      user?.language ||
      localStorage.getItem("language") ||
      i18n.language ||
      "en";
    return (typeof initial === "string" ? initial : "en").toUpperCase();
  });
  const [showMap, setShowMap] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [areaNotAvailable, setAreaNotAvailable] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [showMapSearchResults, setShowMapSearchResults] = useState(false);
  const [favCount, setFavCount] = useState(() =>
    parseInt(localStorage.getItem("zw_favorites_count") || "0"),
  );

  useEffect(() => {
    const handler = () =>
      setFavCount(parseInt(localStorage.getItem("zw_favorites_count") || "0"));
    window.addEventListener("zw-favorites-updated", handler);

    const syncFromAPI = async () => {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("auth_token") ||
        sessionStorage.getItem("token");
      if (!token) return;
      try {
        const lat = localStorage.getItem("userLocationLat") || 30.0444;
        const lng = localStorage.getItem("userLocationLng") || 31.2357;
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const res = await fetch(
          `${apiUrl}/api/favorites?customer_lat=${lat}&customer_long=${lng}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        const raw = data.data || data.favorites || data || [];
        const list = Array.isArray(raw) ? raw : [];
        localStorage.setItem("zw_favorites_count", list.length);
        setFavCount(list.length);
      } catch { }
    };

    syncFromAPI();

    return () => window.removeEventListener("zw-favorites-updated", handler);
  }, []);

  const mapSearchTimeoutRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const notifRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  useEffect(() => {
    if (!showProfileMenu) return;
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProfileMenu]);

  useEffect(() => {
    if (!isLangDropdownOpen) return;
    const handler = (e) => {
      if (!e.target.closest("[data-lang-dropdown]"))
        setIsLangDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isLangDropdownOpen]);

  useEffect(() => {
    const handleLanguageChanged = (lng) =>
      setSelectedLanguage(String(lng).toUpperCase());
    i18n.on("languageChanged", handleLanguageChanged);
    return () => i18n.off("languageChanged", handleLanguageChanged);
  }, [i18n]);

  const getToken = () =>
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("token");

  const updateLanguageOnServer = async (lang) => {
    if (!isLoggedIn || !user) return;
    const token = getToken();
    if (!token) return;
    let route = "/api/customer/profile";
    if (user.role === "vendor") route = "/api/vendor/myprofile/update";
    else if (user.role === "admin") route = "/api/profile";
    try {
      await fetch(route, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ language: lang }),
      });
    } catch (err) {
      console.warn("Language preference update failed:", err);
    }
  };

  const handleLanguageChange = async (code) => {
    const lang = code.toLowerCase();
    setSelectedLanguage(code);
    await i18n.changeLanguage(lang);
    if (updateUser && isLoggedIn) updateUser({ language: lang });
    updateLanguageOnServer(lang);
  };

  const isCairoArea = (input) => {
    const raw = JSON.stringify(input).toLowerCase();
    return (
      raw.includes("cairo") ||
      raw.includes("giza") ||
      raw.includes("qalyubia") ||
      raw.includes("qalyubiyya") ||
      raw.includes("heliopolis") ||
      raw.includes("maadi") ||
      raw.includes("nasr city") ||
      raw.includes("6th of october") ||
      raw.includes("new cairo")
    );
  };

  const applyLocation = (lat, lng, name) => {
    fetchNearbyAndFee(lat, lng, name);
  };

  const handleGetCurrentLocation = (onSuccess) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        )
          .then((res) => res.json())
          .then((data) => {
            const name =
              data.address?.suburb ||
              data.address?.neighbourhood ||
              data.address?.city ||
              data.display_name ||
              "Current Location";
            applyLocation(latitude, longitude, name);
            if (onSuccess) onSuccess(name);
          })
          .catch(() => applyLocation(latitude, longitude, "Current Location"));
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to get your location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleMapSearchInput = (e) => {
    const val = e.target.value;
    setMapSearchQuery(val);
    setAreaNotAvailable(false);
    if (mapSearchTimeoutRef.current) clearTimeout(mapSearchTimeoutRef.current);
    if (val.length < 2) {
      setMapSearchResults([]);
      setShowMapSearchResults(false);
      return;
    }
    mapSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=10&countrycodes=eg&accept-language=en`,
        );
        const data = await res.json();
        setMapSearchResults(data.filter(isCairoArea));
        setShowMapSearchResults(true);
      } catch (err) {
        console.error("Map search failed:", err);
      }
    }, 500);
  };

  const selectMapSearchLocation = (place) => {
    setShowMapSearchResults(false);
    setMapSearchQuery(place.display_name);
    if (!isCairoArea(place)) {
      setAreaNotAvailable(true);
      return;
    }
    setAreaNotAvailable(false);
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    applyLocation(lat, lng, place.display_name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
      const L = window.L;
      if (L) {
        if (mapInstanceRef.current.tempMarker)
          mapInstanceRef.current.removeLayer(mapInstanceRef.current.tempMarker);
        mapInstanceRef.current.tempMarker = L.marker([lat, lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(place.display_name)
          .openPopup();
      }
    }
  };

  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      const L = window.L;
      if (L) {
        const map = L.map(mapRef.current).setView([30.0444, 31.2357], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);
        map.on("click", async (e) => {
          const { lat, lng } = e.latlng;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            );
            const data = await res.json();
            if (!isCairoArea(data)) {
              setAreaNotAvailable(true);
              setTimeout(() => setAreaNotAvailable(false), 4000);
              return;
            }
            const a = data.address || {};
            const name =
              a.suburb ||
              a.neighbourhood ||
              a.city ||
              data.display_name ||
              "Unknown";
            if (mapInstanceRef.current.tempMarker)
              mapInstanceRef.current.removeLayer(
                mapInstanceRef.current.tempMarker,
              );
            window.L.marker([lat, lng])
              .addTo(mapInstanceRef.current)
              .bindPopup("Your location")
              .openPopup();
            applyLocation(lat, lng, name);
            setAreaNotAvailable(false);
            setShowMap(false);
          } catch (err) {
            console.error("Geocoding failed:", err);
          }
        });
        mapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
      }
    }
    if (!showMap && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [showMap]);

  const handleLogoutConfirmed = () => {
  logout();
  clearLocation();
  setShowLogoutConfirm(false);
  setFavCount(0);
  window.location.href = "/home";
};

  return (
    <>
      <nav
        className="navbar"
        style={{
          borderBottom: `1px solid ${borderBottomColor}`,
          boxShadow: showShadow ? "0 2px 16px rgba(0,0,0,0.05)" : "none",
        }}
      >
        {/* ── Brand ── */}
        <div className="nav-brand" onClick={() => navigate("/home")}>
          <img
            src="/images/zerowaste-logo.png"
            alt="Zero Waste"
            className="nav-logo"
            onError={(e) => { e.currentTarget.src = "/images/e.png"; }}
          />
        </div>

        {/* ── Right cluster ── */}
        <div className="nav-items">

          {/* Location */}
          {!hideLocation && (
            <>
              <button
                className={`nav-location ${locationName ? "nav-location--set" : ""}`}
                onClick={() => setShowMap(true)}
                style={{ opacity: loadingLocation ? 0.65 : 1 }}
                title={locationName || t("navigation.location")}
              >
                <MapPin size={15} />
                <span className="nav-location__text">
                  {loadingLocation
                    ? t("navigation.gettingFee")
                    : locationName || t("navigation.location")}
                </span>
                {locationName && !loadingLocation && (
                  <span
                    className="nav-location__clear"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); clearLocation(); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); clearLocation(); } }}
                    title="Clear location"
                  >
                    <X size={12} />
                  </span>
                )}
              </button>
              <div className="nav-divider" />
            </>
          )}

          {/* Cart */}
          {!hideCart && (
            <button
              className="nav-icon-btn"
              onClick={() => navigate("/card")}
              title={t("navigation.cart") || "Cart"}
            >
              <ShoppingCart size={19} />
              {totalItems > 0 && (
                <span className="badge green-badge">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          )}

          {/* Favorites */}
          <button
            className="nav-icon-btn"
            onClick={() => navigate("/favorites")}
            title={t("navigation.favorites") || "Favorites"}
          >
            <Heart size={19} />
            {favCount > 0 && (
              <span className="badge">
                {favCount > 99 ? "99+" : favCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <NotificationsBell
            show={showNotifications}
            onToggle={() => setShowNotifications((v) => !v)}
            notifRef={notifRef}
          />

          <div className="nav-divider" />

          {/* Language switcher */}
          <div className="language-switcher" data-lang-dropdown onClick={() => setIsLangDropdownOpen((v) => !v)}>
            <button className="nav-lang-btn">
              <Globe size={15} />
              <span>{selectedLanguage}</span>
            </button>
            {isLangDropdownOpen && (
              <div className="language-dropdown">
                {[["EN", "🇬🇧", "English"], ["AR", "🇪🇬", "العربية"]].map(([code, flag, label]) => (
                  <div
                    key={code}
                    className={`language-option ${selectedLanguage === code ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLanguageChange(code);
                      setIsLangDropdownOpen(false);
                    }}
                  >
                    <span>{flag} {label}</span>
                    {selectedLanguage === code && <span className="active-dot" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="nav-divider" />

          {/* Profile / Auth */}
          {!hideProfile ? (
            isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  className="nav-icon-btn nav-avatar"
                  onClick={() => navigate("/profile")}
                  title={t("navigation.myProfile") || "My Profile"}
                >
                  <User size={17} />
                </button>
                <button
                  className="nav-logout-btn"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  {t("navigation.logOut")}
                </button>
              </div>
            ) : (
              <button
                className="nav-signin-btn"
                onClick={() => navigate("/signin")}
              >
                <LogIn size={16} />
                <span>{t("navigation.signIn")}</span>
              </button>
            )
          ) : (
            <div ref={profileMenuRef}>
              <button
                className="nav-icon-btn nav-avatar"
                onClick={() => navigate("/profile")}
                title={t("navigation.myProfile") || "My Profile"}
              >
                <User size={17} />
              </button>
            </div>
          )}

        </div>
      </nav>

      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "var(--nav-pill-bg, white)",
              borderRadius: "14px",
              padding: "2rem",
              maxWidth: "360px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
              👋
            </div>
            <h3
              style={{
                margin: "0 0 0.5rem",
                color: "#1f2937",
                fontSize: "1.2rem",
              }}
            >
              {t("navigation.logOutTitle")}
            </h3>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.9rem",
                margin: "0 0 1.5rem",
              }}
            >
              {t("navigation.logOutMessage")}
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: "0.65rem",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "white",
                  color: "#374151",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t("navigation.cancel")}
              </button>
              <button
                onClick={handleLogoutConfirmed}
                style={{
                  flex: 1,
                  padding: "0.65rem",
                  border: "none",
                  borderRadius: "8px",
                  background: "#ef4444",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
               {t("navigation.yesLogOut")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMap && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMap(false);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "800px",
              height: "70vh",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h3 style={{ margin: 0, color: "#1f2937" }}>
                  {t("navigation.setLocation")}
                </h3>
                <button
                  onClick={() => setShowMap(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <Search
                  size={18}
                  style={{
                    position: "absolute",
                    left: isRTL ? "auto" : "12px",
                    right: isRTL ? "12px" : "auto",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <input
                  type="text"
                  placeholder={t("navigation.searchPlaceholder")}
                  value={mapSearchQuery}
                  onChange={handleMapSearchInput}
                  onFocus={() =>
                    mapSearchResults.length > 0 && setShowMapSearchResults(true)
                  }
                  style={{
                    width: "100%",
                    padding: isRTL ? "10px 48px 10px 36px" : "10px 36px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                    direction: isRTL ? "rtl" : "ltr",
                  }}
                />
                {mapSearchQuery && (
                  <X
                    size={16}
                    style={{
                      position: "absolute",
                      right: isRTL ? "auto" : "48px",
                      left: isRTL ? "48px" : "auto",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setMapSearchQuery("");
                      setMapSearchResults([]);
                      setShowMapSearchResults(false);
                    }}
                  />
                )}
                <button
                  onClick={() =>
                    handleGetCurrentLocation((name) => {
                      setMapSearchQuery(name);
                      setMapSearchResults([]);
                      setShowMapSearchResults(false);
                      setShowMap(false);
                    })
                  }
                  title="Use my current location"
                  style={{
                    position: "absolute",
                    right: isRTL ? "auto" : "12px",
                    left: isRTL ? "12px" : "auto",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#22c55e")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#10b981")
                  }
                >
                  📍
                </button>
                {showMapSearchResults && mapSearchResults.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      background: "white",
                      borderRadius: "10px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      border: "1px solid #e5e7eb",
                      zIndex: 10002,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {mapSearchResults.map((place, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectMapSearchLocation(place)}
                        style={{
                          padding: "10px 14px",
                          cursor: "pointer",
                          borderBottom:
                            idx < mapSearchResults.length - 1
                              ? "1px solid #f3f4f6"
                              : "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.85rem",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f9fafb")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "white")
                        }
                      >
                        <MapPin size={14} color="#9ca3af" />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {place.display_name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {areaNotAvailable && (
              <div
                style={{
                  position: "absolute",
                  top: "80px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#fef2f2",
                  color: "#dc2626",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "1px solid #fecaca",
                  fontWeight: 500,
                  zIndex: 10001,
                  whiteSpace: "nowrap",
                }}
              >
                {t("navigation.notAvailable")}
              </div>
            )}
            <div
              ref={mapRef}
              style={{ width: "100%", height: "calc(100% - 120px)" }}
            />
          </div>
        </div>
      )}
    </>
  );
}

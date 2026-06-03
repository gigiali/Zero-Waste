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
        const res = await fetch(
          `/api/favorites?customer_lat=${lat}&customer_long=${lng}`,
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
      } catch {}
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
    if (updateUser) updateUser({ language: lang });
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
    navigate("/home");
  };

  const pillStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    background: "var(--nav-pill-bg, white)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };
  const pillHoverIn = (e) => {
    e.currentTarget.style.background = "#f8fafc";
    e.currentTarget.style.borderColor = "#cbd5e1";
  };
  const pillHoverOut = (e) => {
    e.currentTarget.style.background = "white";
    e.currentTarget.style.borderColor = "#e5e7eb";
  };
  const avatarStyle = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "white",
    border: "2px solid #10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(16,185,129,0.2)",
    transition: "transform 0.15s, box-shadow 0.15s",
  };
  const avatarHoverIn = (e) => {
    e.currentTarget.style.transform = "scale(1.08)";
    e.currentTarget.style.boxShadow = "0 4px 14px rgba(16,185,129,0.35)";
  };
  const avatarHoverOut = (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 2px 8px rgba(16,185,129,0.2)";
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${borderBottomColor}`,
          padding: "0.75rem 2rem",
          background: "var(--nav-bg, #fafafa)",
          boxShadow: showShadow ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
          position: "sticky",
          top: 0,
          zIndex: 200,
        }}
      >
<div
  style={{
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  }}
  onClick={() => navigate("/home")}
>
  <img
    src="/images/zerowaste-logo.png"
    alt="Zero Waste logo"
    onError={(e) => {
      e.currentTarget.src = "/images/e.png";
    }}
    style={{
      width: "160px",
      height: "140px",
      objectFit: "contain",
      marginTop: "-60px",
      marginBottom: "-60px",
      filter: "drop-shadow(0 2px 8px rgba(16,185,129,0.08))",
    }}
  />
</div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          {!hideLocation && (
            <div
              style={{
                ...pillStyle,
                color: locationName ? "#10b981" : "#6b7280",
                fontWeight: locationName ? 600 : 500,
                border: locationName
                  ? "1px solid #22c55e"
                  : "1px solid #e5e7eb",
                background: locationName ? "#f0fdf4" : "white",
                opacity: loadingLocation ? 0.7 : 1,
              }}
              onClick={() => setShowMap(true)}
              onMouseEnter={(e) => {
                if (!locationName) {
                  e.currentTarget.style.background = "#f0fdf4";
                  e.currentTarget.style.borderColor = "#d1fae5";
                }
              }}
              onMouseLeave={(e) => {
                if (!locationName) {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }
              }}
            >
              <MapPin size={18} />
              <span style={{ fontSize: "0.9rem" }}>
                {loadingLocation
                  ? "Getting fee..."
                  : locationName || "Location"}
              </span>
              {locationName && !loadingLocation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearLocation();
                  }}
                  title="Clear location"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    color: "#10b981",
                    border: "none",
                    borderRadius: "50%",
                    padding: "0.1rem",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ef4444")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#10b981")
                  }
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {!hideCart && (
            <div
              style={{ ...pillStyle, position: "relative", color: "#6b7280" }}
              onClick={() => navigate("/card")}
              title="Cart"
              onMouseEnter={pillHoverIn}
              onMouseLeave={pillHoverOut}
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "#22c55e",
                    color: "white",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    border: "2px solid white",
                    boxShadow: "0 2px 4px rgba(34,197,94,0.2)",
                  }}
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </div>
          )}

          <div
            style={{ ...pillStyle, position: "relative", color: "#6b7280" }}
            onClick={() => navigate("/favorites")}
            title="Favorites"
            onMouseEnter={pillHoverIn}
            onMouseLeave={pillHoverOut}
          >
            <Heart size={18} />
            {favCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  border: "2px solid white",
                }}
              >
                {favCount > 99 ? "99+" : favCount}
              </span>
            )}
          </div>

          <NotificationsBell
            show={showNotifications}
            onToggle={() => setShowNotifications((v) => !v)}
            notifRef={notifRef}
          />

          <div
            data-lang-dropdown
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              color: "#374151",
            }}
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
          >
            <Globe size={20} />
            <span>{selectedLanguage}</span>
            {isLangDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "var(--nav-pill-bg, white)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  border: "1px solid #e5e7eb",
                  minWidth: "150px",
                  zIndex: 1000,
                }}
              >
                {[
                  ["EN", "English"],
                  ["AR", "Arabic"],
                ].map(([code, label]) => (
                  <div
                    key={code}
                    style={{
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      backgroundColor:
                        selectedLanguage === code ? "#f0fdf4" : "white",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLanguageChange(code);
                      setIsLangDropdownOpen(false);
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLanguage !== code)
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        selectedLanguage === code ? "#f0fdf4" : "white";
                    }}
                  >
                    <span>{label}</span>
                    {selectedLanguage === code && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "#10b981",
                          borderRadius: "50%",
                          alignSelf: "center",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!hideProfile ? (
            isLoggedIn ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  onClick={() => navigate("/profile")}
                  title="My Profile"
                  style={avatarStyle}
                  onMouseEnter={avatarHoverIn}
                  onMouseLeave={avatarHoverOut}
                >
                  <User size={18} color="#10b981" />
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "none",
                    border: "1.5px solid #ef4444",
                    color: "#ef4444",
                    borderRadius: "8px",
                    padding: "0.4rem 0.8rem",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  background: "#10b981",
                  color: "white",
                  borderRadius: "8px",
                  padding: "0.45rem 1rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
                onClick={() => navigate("/signin")}
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </div>
            )
          ) : (
            <div ref={profileMenuRef} style={{ position: "relative" }}>
              <div
                onClick={() => navigate("/profile")}
                title="My Profile"
                style={avatarStyle}
                onMouseEnter={avatarHoverIn}
                onMouseLeave={avatarHoverOut}
              >
                <User size={18} color="#10b981" />
              </div>
            </div>
          )}
        </div>
      </div>

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
              Log Out?
            </h3>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.9rem",
                margin: "0 0 1.5rem",
              }}
            >
              Are you sure you want to log out?
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
                Cancel
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
                Yes, Log Out
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
                  Set your location
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
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search for a city, area..."
                  value={mapSearchQuery}
                  onChange={handleMapSearchInput}
                  onFocus={() =>
                    mapSearchResults.length > 0 && setShowMapSearchResults(true)
                  }
                  style={{
                    width: "100%",
                    padding: "10px 36px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {mapSearchQuery && (
                  <X
                    size={16}
                    style={{
                      position: "absolute",
                      right: "48px",
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
                    right: "12px",
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
                We are not available in your area yet
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

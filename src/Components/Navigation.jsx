import {
  ShoppingCart, User, MapPin, Globe, X, Search, LogIn,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { NotificationsBell } from "./NotificationsDropdown";

export default function Navigation({
  borderBottomColor = "#e5e7eb",
  showShadow = true,
  hideCart = false,
  hideLocation = false,
  hideProfile = false,
}) {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isLoggedIn, logout } = useAuth();

  const [isLangDropdownOpen, setIsLangDropdownOpen]   = useState(false);
  const [selectedLanguage, setSelectedLanguage]       = useState("EN");
  const [showMap, setShowMap]                         = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm]     = useState(false);
  const [showNotifications, setShowNotifications]     = useState(false);
  const [showProfileMenu, setShowProfileMenu]         = useState(false);
  const [selectedLocation, setSelectedLocation]       = useState(() => localStorage.getItem("userLocationName") || null);
  const [areaNotAvailable, setAreaNotAvailable]       = useState(false);
  const [mapSearchQuery, setMapSearchQuery]           = useState("");
  const [mapSearchResults, setMapSearchResults]       = useState([]);
  const [showMapSearchResults, setShowMapSearchResults] = useState(false);

  const mapSearchTimeoutRef = useRef(null);
  const mapRef              = useRef(null);
  const mapInstanceRef      = useRef(null);
  const notifRef            = useRef(null);
  const profileMenuRef      = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  // Close profile menu when clicking outside
  useEffect(() => {
    if (!showProfileMenu) return;
    const handler = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProfileMenu]);

  // Close lang dropdown when clicking outside
  useEffect(() => {
    if (!isLangDropdownOpen) return;
    const handler = (e) => {
      if (!e.target.closest("[data-lang-dropdown]")) setIsLangDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isLangDropdownOpen]);

  const isCairoArea = (address) => {
    const names = ["cairo","giza","nasr city","maadi","helwan","6th of october","shubra","ain shams","matariya","dokki","mohandessin","agouza","zamalek","heliopolis","misr el gdeda","obour","shorouk","new cairo","madinaty","rehab","tagamo3","katameya"];
    return names.some((n) => JSON.stringify(address).toLowerCase().includes(n));
  };

  const handleMapSearchInput = (e) => {
    const val = e.target.value;
    setMapSearchQuery(val);
    setAreaNotAvailable(false);
    if (mapSearchTimeoutRef.current) clearTimeout(mapSearchTimeoutRef.current);
    if (val.length < 2) { setMapSearchResults([]); setShowMapSearchResults(false); return; }
    mapSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=10&countrycodes=eg&accept-language=en`);
        const data = await res.json();
        setMapSearchResults(data.filter(isCairoArea));
        setShowMapSearchResults(true);
      } catch (err) { console.error("Map search failed:", err); }
    }, 500);
  };

  const selectMapSearchLocation = (place) => {
    setShowMapSearchResults(false);
    setMapSearchQuery(place.display_name);
    if (!isCairoArea(place)) { setAreaNotAvailable(true); return; }
    setAreaNotAvailable(false);
    if (mapInstanceRef.current) {
      const lat = parseFloat(place.lat), lng = parseFloat(place.lon);
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.5 });
      const L = window.L;
      if (L) {
        if (mapInstanceRef.current.tempMarker) mapInstanceRef.current.removeLayer(mapInstanceRef.current.tempMarker);
        mapInstanceRef.current.tempMarker = L.marker([lat, lng]).addTo(mapInstanceRef.current).bindPopup(place.display_name).openPopup();
      }
    }
  };

  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      const L = window.L;
      if (L) {
        const map = L.map(mapRef.current).setView([30.0444, 31.2357], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map);
        L.marker([30.0444, 31.2357]).addTo(map).bindPopup("ZeroWaste - Cairo").openPopup();
        map.on("click", async (e) => {
          const { lat, lng } = e.latlng;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            if (!isCairoArea(data.address)) { setAreaNotAvailable(true); setTimeout(() => setAreaNotAvailable(false), 4000); return; }
            const city = data.address?.city || data.address?.town || data.address?.village || "Unknown";
            const locationName = `${city}, ${data.address?.country || ""}`.trim().replace(/,$/, "");
            if (mapInstanceRef.current.tempMarker) mapInstanceRef.current.removeLayer(mapInstanceRef.current.tempMarker);
            window.L.marker([lat, lng]).addTo(mapInstanceRef.current).bindPopup("Your location").openPopup();
            setSelectedLocation(locationName);
            localStorage.setItem("userLocationName", locationName);
            localStorage.setItem("userLocationLat", String(lat));
            localStorage.setItem("userLocationLng", String(lng));
            setAreaNotAvailable(false);
            setShowMap(false);
          } catch (err) { console.error("Geocoding failed:", err); }
        });
        mapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
      }
    }
    if (!showMap && mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
  }, [showMap]);

  const handleLogoutConfirmed = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/home");
  };

  /* ── Shared profile avatar style: white bg + green border + green icon ── */
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

  const avatarHoverIn  = (e) => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(16,185,129,0.35)"; };
  const avatarHoverOut = (e) => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.boxShadow = "0 2px 8px rgba(16,185,129,0.2)";  };

  return (
    <>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1rem 2rem", background: "white",
        borderBottom: `1px solid ${borderBottomColor}`,
        boxShadow: showShadow ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
        position: "sticky", top: 0, zIndex: 200,
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
          onClick={() => navigate("/home")}>
          <img src="/images/e.png" alt="ZeroWaste Logo" style={{ width: "56px", height: "56px", objectFit: "contain" }} />
          <h1 style={{ color: "#10b981", fontSize: "1.4rem", fontWeight: "bold", margin: 0 }}>ZeroWaste</h1>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>

          {/* Location */}
          {!hideLocation && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: selectedLocation ? "#10b981" : "#374151", fontWeight: selectedLocation ? 600 : 400 }}
              onClick={() => setShowMap(true)}>
              <MapPin size={20} />
              <span>{selectedLocation || "Location"}</span>
            </div>
          )}

          {/* Cart */}
          {!hideCart && (
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer", color: "#374151", position: "relative" }}
              onClick={() => navigate("/card")} title="Cart">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span style={{
                  position: "absolute", top: "-8px", right: "-8px",
                  background: "#10b981", color: "white", borderRadius: "50%",
                  width: "18px", height: "18px", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "0.7rem", fontWeight: "bold",
                }}>{totalItems > 99 ? "99+" : totalItems}</span>
              )}
            </div>
          )}

          {/* Notifications bell */}
          <NotificationsBell
            show={showNotifications}
            onToggle={() => setShowNotifications((v) => !v)}
            notifRef={notifRef}
          />

          {/* Language */}
          <div data-lang-dropdown style={{ position: "relative", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#374151" }}
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}>
            <Globe size={20} />
            <span>{selectedLanguage}</span>
            {isLangDropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "white", borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "1px solid #e5e7eb",
                minWidth: "150px", zIndex: 1000,
              }}>
                {[["EN", "English"], ["AR", "Arabic"]].map(([code, label]) => (
                  <div key={code}
                    style={{ padding: "0.75rem 1rem", cursor: "pointer", backgroundColor: selectedLanguage === code ? "#f0fdf4" : "white", display: "flex", justifyContent: "space-between" }}
                    onClick={(e) => { e.stopPropagation(); setSelectedLanguage(code); setIsLangDropdownOpen(false); }}
                    onMouseEnter={(e) => { if (selectedLanguage !== code) e.currentTarget.style.backgroundColor = "#f9fafb"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = selectedLanguage === code ? "#f0fdf4" : "white"; }}>
                    <span>{label}</span>
                    {selectedLanguage === code && <div style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", alignSelf: "center" }} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile avatar — white bg + green border on ALL pages */}
          {hideProfile ? (
            /* Admin nav */
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
          ) : (
            isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  onClick={() => navigate("/profile")}
                  title="My Profile"
                  style={avatarStyle}
                  onMouseEnter={avatarHoverIn}
                  onMouseLeave={avatarHoverOut}
                >
                  <User size={18} color="#10b981" />
                </div>
                <button onClick={() => setShowLogoutConfirm(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    background: "none", border: "1.5px solid #ef4444", color: "#ef4444",
                    borderRadius: "8px", padding: "0.4rem 0.8rem", cursor: "pointer",
                    fontSize: "0.85rem", fontWeight: 600,
                  }}>
                  Log Out
                </button>
              </div>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer",
                background: "#10b981", color: "white", borderRadius: "8px",
                padding: "0.45rem 1rem", fontWeight: 600, fontSize: "0.9rem",
              }} onClick={() => navigate("/signin")}>
                <LogIn size={18} />
                <span>Sign In</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Logout popup */}
      {showLogoutConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "14px", padding: "2rem", maxWidth: "360px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👋</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#1f2937", fontSize: "1.2rem" }}>Log Out?</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>Are you sure you want to log out of your account?</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleLogoutConfirmed}
                style={{ flex: 1, padding: "0.65rem", border: "none", borderRadius: "8px", background: "#ef4444", color: "white", fontWeight: 600, cursor: "pointer" }}>
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMap && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowMap(false); }}>
          <div style={{ background: "white", borderRadius: "12px", width: "90%", maxWidth: "800px", height: "70vh", position: "relative", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, color: "#1f2937" }}>📍 Set your location</h3>
                <button onClick={() => setShowMap(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><X size={20} /></button>
              </div>
              <div style={{ position: "relative" }}>
                <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                <input type="text" placeholder="Search for a city, area..." value={mapSearchQuery} onChange={handleMapSearchInput}
                  onFocus={() => mapSearchResults.length > 0 && setShowMapSearchResults(true)}
                  style={{ width: "100%", padding: "10px 36px", border: "1px solid #e5e7eb", borderRadius: "10px", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
                {mapSearchQuery && <X size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", cursor: "pointer" }}
                  onClick={() => { setMapSearchQuery(""); setMapSearchResults([]); setShowMapSearchResults(false); }} />}
                {showMapSearchResults && mapSearchResults.length > 0 && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "white", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb", zIndex: 10002, maxHeight: "200px", overflowY: "auto" }}>
                    {mapSearchResults.map((place, idx) => (
                      <div key={idx} onClick={() => selectMapSearchLocation(place)}
                        style={{ padding: "10px 14px", cursor: "pointer", borderBottom: idx < mapSearchResults.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "white")}>
                        <MapPin size={14} color="#9ca3af" />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{place.display_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {areaNotAvailable && (
              <div style={{ position: "absolute", top: "80px", left: "50%", transform: "translateX(-50%)", background: "#fef2f2", color: "#dc2626", padding: "12px 24px", borderRadius: "8px", border: "1px solid #fecaca", fontWeight: 500, zIndex: 10001, whiteSpace: "nowrap" }}>
                🚫 We are not available in your area yet
              </div>
            )}
            <div ref={mapRef} style={{ width: "100%", height: "calc(100% - 120px)" }} />
          </div>
        </div>
      )}
    </>
  );
}

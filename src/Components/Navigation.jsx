import { ShoppingCart, Bell, User, MapPin, Globe, X, Search } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

export default function Navigation({
  borderBottomColor = "#e5e7eb",
  showShadow = true,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('userLocationName') || null;
  });
  const [areaNotAvailable, setAreaNotAvailable] = useState(false);

  // Map search state
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [showMapSearchResults, setShowMapSearchResults] = useState(false);
  const mapSearchTimeoutRef = useRef(null);

  const isCairoArea = (address) => {
    const cairoNames = ['cairo', 'giza', 'nasr city', 'maadi', 'helwan', '6th of october', 'shubra', 'ain shams', 'matariya', 'dokki', 'mohandessin', 'agouza', 'zamalek', 'helipolis', 'misr el gdeda', 'obour', 'shorouk', 'new cairo', 'madinaty', 'rehab', 'tagamo3', 'katameya'];
    const text = JSON.stringify(address).toLowerCase();
    return cairoNames.some(name => text.includes(name));
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
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=10&countrycodes=eg&accept-language=en`
        );
        const data = await res.json();
        // Filter to only show Cairo area locations
        const filtered = data.filter(place => isCairoArea(place));
        setMapSearchResults(filtered);
        setShowMapSearchResults(true);
      } catch (err) {
        console.error('Map search geocoding failed:', err);
      }
    }, 500);
  };

  const selectMapSearchLocation = async (place) => {
    setShowMapSearchResults(false);
    setMapSearchQuery(place.display_name);

    if (!isCairoArea(place)) {
      setAreaNotAvailable(true);
      setSelectedLocation(null);
      localStorage.removeItem('userLocationName');
      localStorage.removeItem('userLocationLat');
      localStorage.removeItem('userLocationLng');
      return;
    }

    setAreaNotAvailable(false);

    // Fly to the selected location on the map
    if (mapInstanceRef.current) {
      const lat = parseFloat(place.lat);
      const lng = parseFloat(place.lon);
      mapInstanceRef.current.flyTo([lat, lng], 14, {
        duration: 1.5
      });

      // Add a temporary marker
      const L = window.L;
      if (L) {
        // Remove existing temporary marker if any
        if (mapInstanceRef.current.tempMarker) {
          mapInstanceRef.current.removeLayer(mapInstanceRef.current.tempMarker);
        }
        const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current)
          .bindPopup(place.display_name)
          .openPopup();
        mapInstanceRef.current.tempMarker = marker;
      }
    }
  };
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      const L = window.L;
      if (L) {
        const map = L.map(mapRef.current).setView([30.0444, 31.2357], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        L.marker([30.0444, 31.2357]).addTo(map)
          .bindPopup('ZeroWaste - Cairo')
          .openPopup();

        // (isCairoArea already defined above)

        // Click to select exact location (after search)
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown Location';
            const country = data.address?.country || '';
            const locationName = country ? `${city}, ${country}` : city;

            if (!isCairoArea(data.address)) {
              setAreaNotAvailable(true);
              setTimeout(() => setAreaNotAvailable(false), 4000);
              return;
            }

            // Remove temporary marker
            if (mapInstanceRef.current.tempMarker) {
              mapInstanceRef.current.removeLayer(mapInstanceRef.current.tempMarker);
            }

            // Add permanent marker
            const L = window.L;
            if (L) {
              L.marker([lat, lng]).addTo(mapInstanceRef.current)
                .bindPopup('Your selected location')
                .openPopup();
            }

            setSelectedLocation(locationName);
            localStorage.setItem('userLocationName', locationName);
            localStorage.setItem('userLocationLat', String(lat));
            localStorage.setItem('userLocationLng', String(lng));
            setAreaNotAvailable(false);
            setShowMap(false);
          } catch (err) {
            console.error('Geocoding failed:', err);
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
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "white",
        borderBottom: `1px solid ${borderBottomColor}`,
        boxShadow: showShadow ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <img
  src="/images/e.png"
  alt="ZeroWaste Logo"
  style={{
    width: "72px",
    height: "72px",
    objectFit: "contain"
  }}
/>
        <h1
          style={{
            color: "#10b981",
            fontSize: "1.5rem",
            fontWeight: "bold",
            margin: 0,
          }}
        >
          ZeroWaste
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            color: selectedLocation ? "#10b981" : "#374151",
            fontWeight: selectedLocation ? 600 : 400,
          }}
          onClick={() => setShowMap(true)}
          title={selectedLocation || "Click to select your location"}
        >
          <MapPin size={20} />
          <span>{selectedLocation || "Location"}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            color: "#374151",
            position: "relative",
          }}
        >
          <ShoppingCart size={20} />
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              background: "#10b981",
              color: "white",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            3
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            color: "#374151",
            position: "relative",
          }}
        >
          <Bell size={20} />
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "bold",
            }}
          >
            3
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            color: "#374151",
            position: "relative",
          }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Globe size={20} />
          <span>{selectedLanguage}</span>
          
          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.5rem",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                border: "1px solid #e5e7eb",
                minWidth: "150px",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  borderBottom: "1px solid #f3f4f6",
                  backgroundColor: "#f0fdf4",
                }}
              >
                <span>English</span>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "#10b981",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                ></div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              >
                <span>Arabic</span>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            color: "#374151",
          }}
        >
          <User size={20} />
          <span>My Profile</span>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
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
                background: "white",
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
                <h3 style={{ margin: 0, color: "#1f2937", fontSize: "1.1rem" }}>
                  📍 Set your location
                </h3>
                <button
                  onClick={() => setShowMap(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    padding: "4px",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Map Search Bar */}
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
                  onFocus={() => mapSearchResults.length > 0 && setShowMapSearchResults(true)}
                  style={{
                    width: "100%",
                    padding: "10px 36px 10px 36px",
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
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setMapSearchQuery("");
                      setMapSearchResults([]);
                      setShowMapSearchResults(false);
                      setAreaNotAvailable(false);
                    }}
                  />
                )}
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
                      overflow: "hidden",
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
                          borderBottom: idx < mapSearchResults.length - 1 ? "1px solid #f3f4f6" : "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.85rem",
                          color: "#374151",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                      >
                        <MapPin size={14} color="#9ca3af" />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                🚫 We are not available in your area yet
              </div>
            )}
            <div
              ref={mapRef}
              style={{
                width: "100%",
                height: "calc(100% - 60px)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

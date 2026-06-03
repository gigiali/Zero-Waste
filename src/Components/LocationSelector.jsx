import { useState, useEffect } from "react";
import { MapPin, X, Search } from "lucide-react";
import { useLocationContext } from "../Context/LocationContext";

export default function LocationSelector() {
  const {
    locationName,
    mapSearchQuery,
    mapSearchResults,
    showMapSearchResults,
    locationError,
    selectedCoordinates,
    mapRef,
    mapInstanceRef,
    handleMapSearchChange,
    handleSelectMapSuggestion,
    handleGeolocation,
    initializeMap,
    destroyMap,
    setShowMapSearchResults,
    setLocationError,
  } = useLocationContext();

  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (showMap) {
      initializeMap();
    }
    return () => {
      if (!showMap) {
        destroyMap();
      }
    };
  }, [showMap]);

  const handleCloseMap = () => {
    setShowMap(false);
    destroyMap();
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
          color: locationName ? "#10b981" : "#374151",
          fontWeight: locationName ? 600 : 400,
        }}
        onClick={() => setShowMap(true)}
        title={locationName || "Click to select your location"}
      >
        <MapPin size={20} />
        <span>{locationName || "Location"}</span>
      </div>

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
            if (e.target === e.currentTarget) handleCloseMap();
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "900px",
              height: "75vh",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
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
                  📍 Select Your Location
                </h3>
                <button
                  onClick={handleCloseMap}
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

              <div style={{ position: "relative", marginBottom: "8px" }}>
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
                  onChange={(e) => handleMapSearchChange(e.target.value)}
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
                      handleMapSearchChange("");
                      setShowMapSearchResults(false);
                      setLocationError("");
                    }}
                  />
                )}

                {/* Search Results Dropdown */}
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
                    {mapSearchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectMapSuggestion(result)}
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
                          {result.display_name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleGeolocation}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  color: "#374151",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                }}
              >
                📍 Use My Current Location
              </button>
            </div>

            {locationError && (
              <div
                style={{
                  position: "absolute",
                  top: "130px",
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
                {locationError}
              </div>
            )}

            <div
              ref={mapRef}
              style={{
                width: "100%",
                height: "100%",
                flex: 1,
              }}
            />

            {selectedCoordinates.lat !== null && selectedCoordinates.lng !== null && (
              <div
                style={{
                  padding: "12px 1.5rem",
                  borderTop: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  fontSize: "0.85rem",
                  color: "#6b7280",
                }}
              >
                📍 Lat: {selectedCoordinates.lat.toFixed(6)} | Lng: {selectedCoordinates.lng.toFixed(6)}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

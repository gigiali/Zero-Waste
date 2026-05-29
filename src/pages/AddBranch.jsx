import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../auth-theme.css";
import "./BusinessSetup.css";
import "./AddBranch.css";

const CAIRO_BOUNDS = { north: 30.25, south: 29.85, east: 31.65, west: 31.05 };
const CAIRO_CENTER = { lat: 30.0444, lng: 31.2357 };

function isWithinCairo(lat, lng) {
  return (
    lat >= CAIRO_BOUNDS.south &&
    lat <= CAIRO_BOUNDS.north &&
    lng >= CAIRO_BOUNDS.west &&
    lng <= CAIRO_BOUNDS.east
  );
}

export default function AddBranch() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [branch, setBranch] = useState({
    fullAddress: "",
    locationPin: "",
    workingFrom: "",
    workingTo: "",
    lat: null,
    lng: null,
    branchName: "",
    branchType: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [errors, setErrors] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState({
    lat: null,
    long: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [customType, setCustomType] = useState("");

  const searchTimeoutRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const handleChange = (field, value) => {
    setBranch((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!branch.branchName.trim())
      e.branchName = t("addBranch.errors.branchNameRequired");
    if (!branch.branchType)
      e.branchType = t("addBranch.errors.branchTypeRequired");
    if (branch.branchType === "others" && !customType.trim())
      e.branchType = t("addBranch.errors.branchTypeOtherRequired");
    if (!branch.fullAddress.trim())
      e.fullAddress = t("addBranch.errors.branchAddressRequired");
    if (!branch.locationPin.trim())
      e.locationPin = t("addBranch.errors.locationRequired");
    if (!branch.workingFrom || !branch.workingTo)
      e.workingHours = t("addBranch.errors.workingHoursRequired");
    if (!branch.contactEmail.trim())
      e.contactEmail = t("addBranch.errors.contactEmailRequired");
    if (!branch.contactPhone.trim())
      e.contactPhone = t("addBranch.errors.contactPhoneRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      // Multi-source token retrieval (Doc 1 logic)
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const body = new FormData();
      body.append("branch_name", branch.branchName);
      body.append(
        "branch_type",
        branch.branchType === "others" ? customType : branch.branchType,
      );
      body.append("store_address", branch.fullAddress);
      body.append("location_pin", branch.locationPin);
      body.append(
        "opening_hours",
        `${branch.workingFrom} - ${branch.workingTo}`,
      );
      body.append("contact_email", branch.contactEmail);
      body.append("contact_phone", branch.contactPhone);
      if (branch.lat !== null) body.append("lat", branch.lat);
      if (branch.lng !== null) body.append("long", branch.lng);

      const response = await fetch(
        "https://zero-waste-production.up.railway.app/api/branches",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage(t("addBranch.success.branchAdded"));
        setTimeout(() => navigate("/business"), 1500);
      } else {
        setSubmitMessage(data.message || t("addBranch.errors.genericError"));
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage(t("addBranch.errors.networkError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setLocationError("");
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!val.trim() || val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => fetchSuggestions(val), 400);
  };

  const fetchSuggestions = async (query) => {
    setIsSearching(true);
    try {
      const vb = `${CAIRO_BOUNDS.west},${CAIRO_BOUNDS.south},${CAIRO_BOUNDS.east},${CAIRO_BOUNDS.north}`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + " Cairo Egypt")}&limit=6&addressdetails=1&accept-language=en&viewbox=${vb}&bounded=1`,
        { headers: { "User-Agent": "ZeroWasteApp/1.0" } },
      );
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      const results = json.filter((r) =>
        isWithinCairo(parseFloat(r.lat), parseFloat(r.lon)),
      );
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    setSearchQuery(result.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    setLocationError("");

    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.setView([lat, lon], 17);
    if (markerRef.current)
      mapInstanceRef.current.removeLayer(markerRef.current);

    const marker = L.marker([lat, lon], { draggable: true }).addTo(
      mapInstanceRef.current,
    );
    marker.bindPopup(result.display_name).openPopup();
    markerRef.current = marker;

    marker.on("dragend", function (ev) {
      const dlat = ev.target.getLatLng().lat;
      const dlng = ev.target.getLatLng().lng;
      if (!isWithinCairo(dlat, dlng)) {
        setLocationError(t("addBranch.errors.notAvailableInArea"));
        marker.setLatLng([lat, lon]);
        return;
      }
      setLocationError("");
      setBranch((prev) => ({ ...prev, lat: dlat, lng: dlng }));
      setSelectedCoordinates({ lat: dlat, long: dlng });
    });

    setBranch((prev) => ({
      ...prev,
      lat,
      lng: lon,
      locationPin: result.display_name,
    }));
    setSelectedCoordinates({ lat, long: lon });
  };

  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [CAIRO_CENTER.lat, CAIRO_CENTER.lng],
        zoom: 12,
        minZoom: 10,
      });

      const osmLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap contributors", maxZoom: 19 },
      );
      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri", maxZoom: 19 },
      );
      osmLayer.addTo(map);
      L.control
        .layers({ "Street Map": osmLayer, Satellite: satelliteLayer })
        .addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      L.control.scale().addTo(map);

      L.rectangle(
        [
          [CAIRO_BOUNDS.south, CAIRO_BOUNDS.west],
          [CAIRO_BOUNDS.north, CAIRO_BOUNDS.east],
        ],
        {
          color: "#28a745",
          weight: 2,
          fill: false,
          dashArray: "6 4",
          opacity: 0.6,
        },
      ).addTo(map);

      map.on("click", function (ev) {
        const { lat, lng } = ev.latlng;
        if (!isWithinCairo(lat, lng)) {
          setLocationError(t("addBranch.errors.notAvailableInArea"));
          return;
        }
        setLocationError("");
        if (markerRef.current) map.removeLayer(markerRef.current);

        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.bindPopup(t("addBranch.locationPin")).openPopup();
        markerRef.current = marker;

        marker.on("dragend", function (ev2) {
          const dlat = ev2.target.getLatLng().lat;
          const dlng = ev2.target.getLatLng().lng;
          if (!isWithinCairo(dlat, dlng)) {
            setLocationError(t("addBranch.errors.notAvailableInArea"));
            marker.setLatLng([lat, lng]);
            return;
          }
          setLocationError("");
          setBranch((prev) => ({ ...prev, lat: dlat, lng: dlng }));
          setSelectedCoordinates({ lat: dlat, long: dlng });
        });

        setBranch((prev) => ({ ...prev, lat, lng }));
        setSelectedCoordinates({ lat, long: lng });

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        )
          .then((r) => r.json())
          .then((data) => {
            const address =
              data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setBranch((prev) => ({ ...prev, locationPin: address }));
            setShowMap(false);
          })
          .catch(() => {
            setBranch((prev) => ({
              ...prev,
              locationPin: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            }));
            setShowMap(false);
          });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (!showMap && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap]);

  return (
    <div className="business-setup-page">
      <div className="business-setup-container">
        <div className="business-setup-header">
          <h2 style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}>
            {t("addBranch.title")}
          </h2>
          <p>{t("addBranch.subtitle")}</p>
        </div>

        <div className="business-setup-form-section">
          <form className="business-setup-form" onSubmit={handleSubmit}>
            <div className="branch-section">
              <div className="branch-header">
                <h4>{t("addBranch.sectionTitle")}</h4>
              </div>

              {/* Branch Name */}
              <div className="form-group">
                <label>{t("addBranch.branchName")}</label>
                <input
                  type="text"
                  placeholder={t("addBranch.branchNamePlaceholder")}
                  className="form-input"
                  value={branch.branchName}
                  onChange={(e) => handleChange("branchName", e.target.value)}
                />
                {errors.branchName && (
                  <span className="error-text">{errors.branchName}</span>
                )}
              </div>

              {/* Branch Type */}
              <div className="form-group">
                <label>{t("addBranch.branchType")}</label>
                <select
                  className="form-input"
                  value={branch.branchType}
                  onChange={(e) => handleChange("branchType", e.target.value)}
                >
                  <option value="">{t("addBranch.selectBranchType")}</option>
                  <option value="restaurant">
                    {t("addBranch.type.restaurant")}
                  </option>
                  <option value="supermarket">
                    {t("addBranch.type.supermarket")}
                  </option>
                  <option value="hotel">{t("addBranch.type.hotel")}</option>
                  <option value="bakery">{t("addBranch.type.bakery")}</option>
                  <option value="cafe">{t("addBranch.type.cafe")}</option>
                  <option value="dessert-shop">
                    {t("addBranch.type.dessertShop")}
                  </option>
                  <option value="others">{t("addBranch.type.others")}</option>
                </select>
                {branch.branchType === "others" && (
                  <input
                    type="text"
                    placeholder={t("addBranch.branchTypeOtherPlaceholder")}
                    className="form-input"
                    style={{ marginTop: "8px" }}
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                  />
                )}
                {errors.branchType && (
                  <span className="error-text">{errors.branchType}</span>
                )}
              </div>

              {/* Contact Email */}
              <div className="form-group">
                <label>{t("addBranch.contactEmail")}</label>
                <input
                  type="email"
                  placeholder={t("addBranch.contactEmailPlaceholder")}
                  className="form-input"
                  value={branch.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                />
                {errors.contactEmail && (
                  <span className="error-text">{errors.contactEmail}</span>
                )}
              </div>

              {/* Contact Phone */}
              <div className="form-group">
                <label>{t("addBranch.contactPhone")}</label>
                <input
                  type="tel"
                  placeholder={t("addBranch.contactPhonePlaceholder")}
                  className="form-input"
                  value={branch.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                />
                {errors.contactPhone && (
                  <span className="error-text">{errors.contactPhone}</span>
                )}
              </div>

              {/* Full Address */}
              <div className="form-group">
                <label>{t("addBranch.fullAddress")}</label>
                <input
                  type="text"
                  placeholder={t("addBranch.fullAddressPlaceholder")}
                  className="form-input"
                  value={branch.fullAddress}
                  onChange={(e) => handleChange("fullAddress", e.target.value)}
                />
                {errors.fullAddress && (
                  <span className="error-text">{errors.fullAddress}</span>
                )}
              </div>

              {/* Location Pin */}
              <div className="form-group">
                <label>{t("addBranch.locationPin")}</label>
                <button
                  type="button"
                  className="map-button"
                  onClick={() => setShowMap(true)}
                >
                  📍 {t("addBranch.selectOnMap")}
                </button>
                <button
                  type="button"
                  className="map-button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          if (!isWithinCairo(latitude, longitude)) {
                            setLocationError(
                              t("addBranch.errors.notAvailableInArea"),
                            );
                            return;
                          }
                          fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                          )
                            .then((res) => res.json())
                            .then((data) => {
                              const address =
                                data.display_name ||
                                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                              setBranch((prev) => ({
                                ...prev,
                                lat: latitude,
                                lng: longitude,
                                locationPin: address,
                              }));
                              setSelectedCoordinates({
                                lat: latitude,
                                long: longitude,
                              });
                              setLocationError("");
                            })
                            .catch(() => {
                              setBranch((prev) => ({
                                ...prev,
                                lat: latitude,
                                lng: longitude,
                                locationPin: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                              }));
                              setSelectedCoordinates({
                                lat: latitude,
                                long: longitude,
                              });
                              setLocationError("");
                            });
                        },
                        () => {
                          setLocationError(
                            t("addBranch.errors.enableLocation"),
                          );
                        },
                      );
                    } else {
                      setLocationError(
                        t("addBranch.errors.geolocationUnsupported"),
                      );
                    }
                  }}
                >
                  📍 {t("addBranch.useCurrentLocation")}
                </button>
                {branch.locationPin && (
                  <div className="selected-location">
                    📍 {t("addBranch.locationSelected")}: {branch.locationPin}
                  </div>
                )}
                {errors.locationPin && (
                  <span className="error-text">{errors.locationPin}</span>
                )}
              </div>

              {/* Working Hours */}
              <div className="form-group">
                <label>{t("addBranch.workingHours")}</label>
                <div
                  className={`working-hours-wrapper ${errors.workingHours ? "error" : ""}`}
                >
                  <div className="working-hours-slot">
                    <span>{t("addBranch.from")}</span>
                    <input
                      type="time"
                      value={branch.workingFrom}
                      onChange={(e) => {
                        handleChange("workingFrom", e.target.value);
                        if (errors.workingHours)
                          setErrors((prev) => ({ ...prev, workingHours: "" }));
                      }}
                    />
                  </div>
                  <div className="working-hours-divider" />
                  <div className="working-hours-slot">
                    <span>{t("addBranch.to")}</span>
                    <input
                      type="time"
                      value={branch.workingTo}
                      onChange={(e) => {
                        handleChange("workingTo", e.target.value);
                        if (errors.workingHours)
                          setErrors((prev) => ({ ...prev, workingHours: "" }));
                      }}
                    />
                  </div>
                </div>
                {errors.workingHours && (
                  <span className="error-text">{errors.workingHours}</span>
                )}
              </div>
            </div>

            {submitMessage && (
              <div
                className={`submit-message ${
                  submitMessage.includes("successfully")
                    ? "success"
                    : submitMessage.includes("error") ||
                        submitMessage.includes("failed")
                      ? "error"
                      : "warning"
                }`}
              >
                {submitMessage}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="add-branch-btn"
                onClick={() => navigate("/business")}
              >
                ← {t("common.cancel")}
              </button>
              <button
                type="submit"
                className={`save-branch-btn ${isSubmitting ? "disabled" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("addBranch.saving")
                  : t("addBranch.saveBranch")}
              </button>
            </div>
          </form>

          {showMap && (
            <div className="map-modal">
              <div className="map-modal-content">
                <div className="map-modal-header">
                  <h3>{t("addBranch.mapModalTitle")}</h3>
                  <button
                    className="close-map-btn"
                    onClick={() => setShowMap(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="map-search-container">
                  <div className="search-autocomplete-wrapper">
                    <div className="search-input-group">
                      <input
                        type="text"
                        placeholder={t("addBranch.searchAddressPlaceholder")}
                        className="search-input"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() =>
                          suggestions.length > 0 && setShowSuggestions(true)
                        }
                        autoComplete="off"
                      />
                      {isSearching && (
                        <span className="search-spinner">⏳</span>
                      )}
                    </div>
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="autocomplete-dropdown">
                        {suggestions.map((result, i) => (
                          <li
                            key={i}
                            className="autocomplete-item"
                            onMouseDown={() => handleSelectSuggestion(result)}
                          >
                            <span className="autocomplete-icon">📍</span>
                            <span className="autocomplete-text">
                              {result.display_name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="cairo-only-hint">
                    🟢 Only locations within Cairo are selectable. The green
                    dashed border shows the available area.
                  </p>
                </div>

                {locationError && (
                  <div className="location-outside-error">{locationError}</div>
                )}

                <div className="map-container">
                  <div ref={mapRef} className="real-map"></div>
                </div>

                <div className="coordinate-display">
                  {selectedCoordinates.lat !== null &&
                  selectedCoordinates.long !== null ? (
                    <div className="coordinates-info">
                      <div className="coordinate-values">
                        <div className="coordinate-item">
                          <label>lat:</label>
                          <span>{selectedCoordinates.lat.toFixed(6)}</span>
                        </div>
                        <div className="coordinate-item">
                          <label>long:</label>
                          <span>{selectedCoordinates.long.toFixed(6)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="coordinate-warning">
                      ⚠️ Click anywhere inside the green border to select your
                      location.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="back-prompt">
            <a href="/business">← Back to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}

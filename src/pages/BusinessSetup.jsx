import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import "../auth-theme.css";
import "./BusinessSetup.css";

// Cairo bounding box
const CAIRO_BOUNDS = {
  north: 30.25,
  south: 29.85,
  east: 31.65,
  west: 31.05,
};

const CAIRO_CENTER = { lat: 30.0444, lng: 31.2357 };

function isWithinCairo(lat, lng) {
  return (
    lat >= CAIRO_BOUNDS.south &&
    lat <= CAIRO_BOUNDS.north &&
    lng >= CAIRO_BOUNDS.west &&
    lng <= CAIRO_BOUNDS.east
  );
}

function BusinessSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    businessDescription: "",
    businessLogo: null,
    branches: [
      {
        id: 1,
        fullAddress: "",
        locationPin: "",
        openingHours: "",
        closingHours: "",
        lat: null,
        lng: null,
      },
    ],
  });
  const [errors, setErrors] = useState({});
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [activeBranchId, setActiveBranchId] = useState(1);

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState({
    lat: null,
    long: null,
  });
  const [locationError, setLocationError] = useState("");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.businessName.trim())
      newErrors.businessName = "Business name is required";
    if (!formData.businessType)
      newErrors.businessType = "Business type is required";
    if (!formData.businessDescription.trim())
      newErrors.businessDescription = "Business description is required";
    if (!formData.businessLogo)
      newErrors.businessLogo = "Business logo is required";

    const branch1 = formData.branches[0];
    if (!branch1.fullAddress.trim())
      newErrors[`branch_${branch1.id}_address`] = "Branch address is required";
    if (!branch1.locationPin.trim())
      newErrors[`branch_${branch1.id}_location`] =
        "Location selection is required";
    if (!branch1.openingHours)
      newErrors[`branch_${branch1.id}_opening`] = "Opening hours are required";
    if (!branch1.closingHours)
      newErrors[`branch_${branch1.id}_closing`] = "Closing hours are required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitMessage("");
      try {
        const branch = formData.branches[0];
        const submitData = new FormData();
        if (formData.businessName)
          submitData.append("business_name", formData.businessName);
        if (formData.businessType)
          submitData.append("vendor_type", formData.businessType);
        if (branch.openingHours)
          submitData.append("opening_hours", branch.openingHours);
        if (branch.fullAddress)
          submitData.append("store_address", branch.fullAddress);
        if (formData.businessLogo)
          submitData.append("logo", formData.businessLogo);
        if (branch.lat !== null && branch.lng !== null) {
          submitData.append("lat", branch.lat);
          submitData.append("long", branch.lng);
        }

        const token = localStorage.getItem("auth_token");
        if (!token) {
          setSubmitMessage("Please login to continue");
          setIsSubmitting(false);
          return;
        }

        const response = await fetch(
          "https://stagnate-deferred-pork.ngrok-free.dev/api/vendor/complete-setup",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: submitData,
          },
        );

        const responseData = await response.json();

        if (response.ok) {
          setSubmitMessage("Vendor setup completed successfully!");
          setTimeout(() => navigate("/signin"), 2000);
        } else {
          if (response.status === 401) {
            setSubmitMessage("Please login to continue");
          } else if (response.status === 403) {
            setSubmitMessage(
              responseData.message ||
                "Access denied. Your account may be pending or rejected.",
            );
          } else if (response.status === 422) {
            if (responseData.errors) {
              const newErrors = {};
              Object.keys(responseData.errors).forEach((field) => {
                newErrors[field] = responseData.errors[field][0];
              });
              setErrors(newErrors);
            }
            setSubmitMessage(
              responseData.message || "Please fix the errors below",
            );
          } else {
            setSubmitMessage(
              responseData.message || "An error occurred. Please try again.",
            );
          }
        }
      } catch (error) {
        console.error("Submit error:", error);
        setSubmitMessage(
          "Network error. Please check your connection and try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleBranchInputChange = (branchId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.map((branch) =>
        branch.id === branchId ? { ...branch, [field]: value } : branch,
      ),
    }));
    const errorKey = `branch_${branchId}_${
      field === "fullAddress"
        ? "address"
        : field === "locationPin"
          ? "location"
          : field === "openingHours"
            ? "opening"
            : "closing"
    }`;
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: "" }));
  };

  const handleBranchCoordinates = (branchId, lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.map((branch) =>
        branch.id === branchId ? { ...branch, lat, lng } : branch,
      ),
    }));
    setSelectedCoordinates({ lat, long: lng });
  };

  // ── AUTOCOMPLETE SEARCH ────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setLocationError("");

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!value.trim() || value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);
  };

  const fetchSuggestions = async (query) => {
    setIsSearching(true);
    try {
      const viewbox = `${CAIRO_BOUNDS.west},${CAIRO_BOUNDS.south},${CAIRO_BOUNDS.east},${CAIRO_BOUNDS.north}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + " Cairo Egypt")}&limit=6&addressdetails=1&accept-language=en&viewbox=${viewbox}&bounded=1`,
        { headers: { "User-Agent": "ZeroWasteApp/1.0" } },
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      const cairResults = data.filter((r) =>
        isWithinCairo(parseFloat(r.lat), parseFloat(r.lon)),
      );
      setSuggestions(cairResults);
      setShowSuggestions(cairResults.length > 0);
    } catch (err) {
      console.error("Autocomplete error:", err);
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

    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    const marker = L.marker([lat, lon], { draggable: true }).addTo(
      mapInstanceRef.current,
    );
    marker.bindPopup(result.display_name).openPopup();
    markerRef.current = marker;

    marker.on("dragend", function (e) {
      const dragLat = e.target.getLatLng().lat;
      const dragLng = e.target.getLatLng().lng;
      if (!isWithinCairo(dragLat, dragLng)) {
        setLocationError("We are not available in this area yet.");
        marker.setLatLng([lat, lon]);
        return;
      }
      setLocationError("");
      handleBranchCoordinates(activeBranchId, dragLat, dragLng);
      marker
        .bindPopup(
          `Selected Location<br>Lat: ${dragLat.toFixed(6)}<br>Long: ${dragLng.toFixed(6)}`,
        )
        .openPopup();
    });

    handleBranchCoordinates(activeBranchId, lat, lon);
    handleBranchInputChange(activeBranchId, "locationPin", result.display_name);
  };

  const addBranch = () => {
    const newBranchId = Math.max(...formData.branches.map((b) => b.id)) + 1;
    setFormData((prev) => ({
      ...prev,
      branches: [
        ...prev.branches,
        {
          id: newBranchId,
          fullAddress: "",
          locationPin: "",
          openingHours: "",
          closingHours: "",
          lat: null,
          lng: null,
        },
      ],
    }));
  };

  const removeBranch = (branchId) => {
    if (formData.branches.length > 1) {
      setFormData((prev) => ({
        ...prev,
        branches: prev.branches.filter((branch) => branch.id !== branchId),
      }));
    }
  };

  const openMapForBranch = (branchId) => {
    setActiveBranchId(branchId);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setLocationError("");
    setShowMap(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, businessLogo: file }));
      if (errors.businessLogo) setErrors((prev) => ({ ...prev, businessLogo: "" }));
    }
  };

  // ── MAP INIT ───────────────────────────────────────────────────────────────
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
      L.control.layers({ "Street Map": osmLayer, Satellite: satelliteLayer }).addTo(map);
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

      map.on("click", function (e) {
        const { lat, lng } = e.latlng;

        if (!isWithinCairo(lat, lng)) {
          setLocationError("We are not available in this area yet.");
          return;
        }

        setLocationError("");

        if (markerRef.current) map.removeLayer(markerRef.current);

        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.bindPopup("Business Location").openPopup();
        markerRef.current = marker;

        marker.on("dragend", function (e) {
          const dragLat = e.target.getLatLng().lat;
          const dragLng = e.target.getLatLng().lng;
          if (!isWithinCairo(dragLat, dragLng)) {
            setLocationError("We are not available in this area yet.");
            marker.setLatLng([lat, lng]);
            return;
          }
          setLocationError("");
          handleBranchCoordinates(activeBranchId, dragLat, dragLng);
          marker
            .bindPopup(
              `Business Location<br>Lat: ${dragLat.toFixed(6)}<br>Long: ${dragLng.toFixed(6)}`,
            )
            .openPopup();
        });

        handleBranchCoordinates(activeBranchId, lat, lng);

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        )
          .then((r) => r.json())
          .then((data) => {
            const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            handleBranchInputChange(activeBranchId, "locationPin", address);
            setShowMap(false);
          })
          .catch(() => {
            handleBranchInputChange(
              activeBranchId,
              "locationPin",
              `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            );
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
  }, [showMap, activeBranchId]);

  return (
    <div className="business-setup-page">
      <div className="business-setup-container">
        <div className="business-setup-header">
          <h2>Complete your business profile</h2>
          <p>Tell us about your business to get started</p>
        </div>

        <div className="business-setup-form-section">
          <form className="business-setup-form" onSubmit={handleSubmit}>
            {/* Business Information */}
            <div className="form-section">
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  placeholder="Enter your business name"
                  className="form-input"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                />
                {errors.businessName && (
                  <span className="error-text">{errors.businessName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Business Type</label>
                <select
                  className="form-input"
                  value={formData.businessType}
                  onChange={(e) => handleInputChange("businessType", e.target.value)}
                >
                  <option value="">Select business type</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="coffee-shop">Coffee Shop</option>
                  <option value="hotel">Hotel</option>
                  <option value="bakery">Bakery</option>
                  <option value="dessert-shop">Dessert Shop</option>
                </select>
                {errors.businessType && (
                  <span className="error-text">{errors.businessType}</span>
                )}
              </div>

              <div className="form-group">
                <label>Business Description</label>
                <textarea
                  placeholder="Describe your business..."
                  className="form-input"
                  value={formData.businessDescription}
                  onChange={(e) =>
                    handleInputChange("businessDescription", e.target.value)
                  }
                  rows="4"
                />
                {errors.businessDescription && (
                  <span className="error-text">{errors.businessDescription}</span>
                )}
              </div>

              <div className="form-group">
                <label>Business Logo</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <div className="file-upload-label">
                    {formData.businessLogo
                      ? formData.businessLogo.name
                      : "Choose logo file"}
                  </div>
                </div>
                {errors.businessLogo && (
                  <span className="error-text">{errors.businessLogo}</span>
                )}
              </div>
            </div>

            {/* Branch Details */}
            <div className="branches-section">
              <h3 className="branches-title">Branch Details</h3>

              {formData.branches.map((branch, index) => (
                <div key={branch.id} className="branch-section">
                  <div className="branch-header">
                    <h4>Branch {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        className="remove-branch-btn"
                        onClick={() => removeBranch(branch.id)}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Full Address</label>
                    <input
                      type="text"
                      placeholder="Enter your full address"
                      className="form-input"
                      value={branch.fullAddress}
                      onChange={(e) =>
                        handleBranchInputChange(branch.id, "fullAddress", e.target.value)
                      }
                    />
                    {errors[`branch_${branch.id}_address`] && (
                      <span className="error-text">
                        {errors[`branch_${branch.id}_address`]}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Location Pin</label>
                    <button
                      type="button"
                      className="map-button"
                      onClick={() => openMapForBranch(branch.id)}
                    >
                      📍 Select on Map
                    </button>
                    {branch.locationPin && (
                      <div className="selected-location">
                        📍 Location selected: {branch.locationPin}
                      </div>
                    )}
                    {errors[`branch_${branch.id}_location`] && (
                      <span className="error-text">
                        {errors[`branch_${branch.id}_location`]}
                      </span>
                    )}
                  </div>

                  <div className="time-inputs">
                    <div className="form-group">
                      <label>Opening Hours</label>
                      <input
                        type="time"
                        className="form-input"
                        value={branch.openingHours}
                        onChange={(e) =>
                          handleBranchInputChange(branch.id, "openingHours", e.target.value)
                        }
                      />
                      {errors[`branch_${branch.id}_opening`] && (
                        <span className="error-text">
                          {errors[`branch_${branch.id}_opening`]}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Closing Hours</label>
                      <input
                        type="time"
                        className="form-input"
                        value={branch.closingHours}
                        onChange={(e) =>
                          handleBranchInputChange(branch.id, "closingHours", e.target.value)
                        }
                      />
                      {errors[`branch_${branch.id}_closing`] && (
                        <span className="error-text">
                          {errors[`branch_${branch.id}_closing`]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="add-branch-btn" onClick={addBranch}>
                + Add Another Branch
              </button>
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

            <Button
              text={isSubmitting ? "Submitting..." : "Complete Setup"}
              variant="success"
              className="complete-setup-btn"
              disabled={isSubmitting}
            />
          </form>

          {/* ── MAP MODAL ─────────────────────────────────────────────────── */}
          {showMap && (
            <div className="map-modal">
              <div className="map-modal-content">
                <div className="map-modal-header">
                  <h3>Select Location — Cairo Only</h3>
                  <button className="close-map-btn" onClick={() => setShowMap(false)}>
                    ✕
                  </button>
                </div>

                <div className="map-search-container">
                  <div className="search-autocomplete-wrapper">
                    <div className="search-input-group">
                      <input
                        type="text"
                        placeholder="Search for an address in Cairo..."
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
            <a href="/signup">← Back to Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessSetup;
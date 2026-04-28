import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import "./BusinessSetup.css";

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
        lng: null
      }
    ]
  });
  const [errors, setErrors] = useState({});
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [activeBranchId, setActiveBranchId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState({ lat: null, long: null });
  
  // Feature flags
  const ENABLE_CAIRO_CHECK = false; // Set to true to enable Cairo location warning

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Business type is required";
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = "Business description is required";
    }

    if (!formData.businessLogo) {
      newErrors.businessLogo = "Business logo is required";
    }

    // Validate Branch 1 (required)
    const branch1 = formData.branches[0];
    if (!branch1.fullAddress.trim()) {
      newErrors[`branch_${branch1.id}_address`] = "Branch address is required";
    }

    if (!branch1.locationPin.trim()) {
      newErrors[`branch_${branch1.id}_location`] = "Location selection is required";
    }

    if (!branch1.openingHours) {
      newErrors[`branch_${branch1.id}_opening`] = "Opening hours are required";
    }

    if (!branch1.closingHours) {
      newErrors[`branch_${branch1.id}_closing`] = "Closing hours are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitMessage("");
      
      try {
        // Get the first branch for vendor setup
        const branch = formData.branches[0];
        
        // Create FormData for file upload
        const submitData = new FormData();
        
        // Add business fields
        if (formData.businessName) submitData.append('business_name', formData.businessName);
        if (formData.businessType) submitData.append('vendor_type', formData.businessType);
        if (branch.openingHours) submitData.append('opening_hours', branch.openingHours);
        if (branch.fullAddress) submitData.append('store_address', branch.fullAddress);
        if (formData.businessLogo) submitData.append('logo', formData.businessLogo);
        
        // Add coordinates (IMPORTANT: backend expects "long", not "lng")
        if (branch.lat !== null && branch.lng !== null) {
          submitData.append('lat', branch.lat);
          submitData.append('long', branch.lng);
        }
        
        // Add optional fields if they exist in your form
        // You can uncomment these if you have these fields in your form
        // if (formData.taxNumber) submitData.append('tax_number', formData.taxNumber);
        // if (formData.contactEmail) submitData.append('contact_email', formData.contactEmail);
        // if (formData.contactPhone) submitData.append('contact_phone', formData.contactPhone);
        // if (formData.commercialRegister) submitData.append('commercial_register', formData.commercialRegister);
        // if (formData.taxCard) submitData.append('tax_card', formData.taxCard);
        
        // Get auth token from localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setSubmitMessage("Please login to continue");
          setIsSubmitting(false);
          return;
        }
        
        // Console log for debugging (excluding file content)
        const debugPayload = {};
        for (let [key, value] of submitData.entries()) {
          if (value instanceof File) {
            debugPayload[key] = `File: ${value.name} (${value.size} bytes)`;
          } else {
            debugPayload[key] = value;
          }
        }
        console.log('Outgoing payload:', debugPayload);
        
        // Make API call
        const response = await fetch('http://127.0.0.1:8000/api/vendor/complete-setup', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: submitData
        });
        
        console.log('Response status:', response.status);
        
        const responseData = await response.json();
        console.log('Response data:', responseData);
        
        if (response.ok) {
          // Success (200)
          setSubmitMessage("Vendor setup completed successfully!");
          // Redirect to login after successful setup
          setTimeout(() => {
            navigate('/signin');
          }, 2000);
        } else {
          // Handle different error statuses
          if (response.status === 401) {
            setSubmitMessage("Please login to continue");
            // Redirect to login
            // window.location.href = '/login';
          } else if (response.status === 403) {
            setSubmitMessage(responseData.message || "Access denied. Your account may be pending or rejected.");
          } else if (response.status === 422) {
            // Validation errors - show field-specific errors
            if (responseData.errors) {
              const newErrors = {};
              Object.keys(responseData.errors).forEach(field => {
                newErrors[field] = responseData.errors[field][0];
              });
              setErrors(newErrors);
            }
            setSubmitMessage(responseData.message || "Please fix the errors below");
          } else {
            setSubmitMessage(responseData.message || "An error occurred. Please try again.");
          }
        }
      } catch (error) {
        console.error('Submit error:', error);
        setSubmitMessage("Network error. Please check your connection and try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleBranchInputChange = (branchId, field, value) => {
    setFormData(prev => ({
      ...prev,
      branches: prev.branches.map(branch =>
        branch.id === branchId ? { ...branch, [field]: value } : branch
      )
    }));
    // Clear error when user starts typing
    const errorKey = `branch_${branchId}_${field === 'fullAddress' ? 'address' : field === 'locationPin' ? 'location' : field === 'openingHours' ? 'opening' : 'closing'}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }));
    }
  };

  const handleBranchCoordinates = (branchId, lat, lng) => {
    setFormData(prev => ({
      ...prev,
      branches: prev.branches.map(branch =>
        branch.id === branchId ? { ...branch, lat, lng } : branch
      )
    }));
    
    // Update selected coordinates for display
    setSelectedCoordinates({ lat, long: lng });
    
    // Check if location is within Cairo bounds (if feature is enabled)
    if (ENABLE_CAIRO_CHECK && !isWithinCairo(lat, lng)) {
      console.warn('Selected location is outside Cairo bounds:', { lat, lng });
    }
    
    console.log(`Updated branch ${branchId} coordinates:`, { lat, lng });
    console.log('Selected coordinates for display:', { lat, long: lng });
  };

  const isWithinCairo = (lat, lng) => {
    // Cairo approximate bounds (can be adjusted)
    const cairoBounds = {
      north: 30.2,
      south: 29.8,
      east: 31.5,
      west: 31.1
    };
    
    return lat >= cairoBounds.south && lat <= cairoBounds.north &&
           lng >= cairoBounds.west && lng <= cairoBounds.east;
  };

  const minimizeToCairo = (lat, lng) => {
    // If outside Cairo bounds, return Cairo center
    if (!isWithinCairo(lat, lng)) {
      return { lat: 30.0444, lng: 31.2357 };
    }
    // If within Cairo, return as-is
    return { lat, lng };
  };

  const copyCoordinates = () => {
    if (selectedCoordinates.lat === null || selectedCoordinates.long === null) {
      alert('Please select a location on the map first.');
      return;
    }

    const coordinatesJson = JSON.stringify({
      lat: selectedCoordinates.lat,
      long: selectedCoordinates.long
    }, null, 2);

    navigator.clipboard.writeText(coordinatesJson).then(() => {
      console.log('Copied coordinates payload:', coordinatesJson);
      alert('Coordinates copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy coordinates:', err);
      alert('Failed to copy coordinates. Please try again.');
    });
  };

  const generateBackendMessage = () => {
    if (selectedCoordinates.lat === null || selectedCoordinates.long === null) {
      alert('Please select a location on the map first.');
      return;
    }

    const message = `lat: ${selectedCoordinates.lat}\nlong: ${selectedCoordinates.long}`;
    
    navigator.clipboard.writeText(message).then(() => {
      console.log('Generated backend message:', message);
      alert('Backend message copied to clipboard!\n\n' + message);
    }).catch(err => {
      console.error('Failed to copy message:', err);
      alert('Failed to copy message. Please try again.');
    });
  };

  const addBranch = () => {
    const newBranchId = Math.max(...formData.branches.map(b => b.id)) + 1;
    setFormData(prev => ({
      ...prev,
      branches: [...prev.branches, {
        id: newBranchId,
        fullAddress: "",
        locationPin: "",
        openingHours: "",
        closingHours: "",
        lat: null,
        lng: null
      }]
    }));
  };

  const removeBranch = (branchId) => {
    if (formData.branches.length > 1) {
      setFormData(prev => ({
        ...prev,
        branches: prev.branches.filter(branch => branch.id !== branchId)
      }));
    }
  };

  const openMapForBranch = (branchId) => {
    setActiveBranchId(branchId);
    setSearchQuery(""); // Reset search when opening map
    setShowMap(true);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    
    try {
      // Use Nominatim API for geocoding with better parameters (global search)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'ZeroWasteApp/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        // Move map to searched location
        mapInstanceRef.current.setView([lat, lon], 16);
        
        // Remove existing marker if any
        if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
        }
        
        // Add new marker at searched location with drag functionality
        const marker = L.marker([lat, lon], {
          draggable: true
        }).addTo(mapInstanceRef.current);
        marker.bindPopup(result.display_name).openPopup();
        markerRef.current = marker;
        
        // Add drag event handler
        marker.on('dragend', function(e) {
          const draggedLat = e.target.getLatLng().lat;
          const draggedLng = e.target.getLatLng().lng;
          
          // Update coordinates when marker is dragged
          handleBranchCoordinates(activeBranchId, draggedLat, draggedLng);
          
          // Update popup with new coordinates
          marker.bindPopup(`${result.display_name}<br>Lat: ${draggedLat.toFixed(6)}<br>Long: ${draggedLng.toFixed(6)}`).openPopup();
          
          console.log('Marker dragged to new coordinates:', { lat: draggedLat, long: draggedLng });
        });
        
        // Store coordinates for the active branch
        handleBranchCoordinates(activeBranchId, lat, lon);
        
        // Minimize to Cairo if outside bounds (when feature is enabled)
        const finalCoords = ENABLE_CAIRO_CHECK ? minimizeToCairo(lat, lon) : { lat, lon };
        setSelectedCoordinates(finalCoords);
        
        // Update the active branch with the searched location
        handleBranchInputChange(activeBranchId, 'locationPin', result.display_name);
      } else {
        alert('Location not found. Please try a more specific search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try clicking on the map directly to select your location.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, businessLogo: file }));
      if (errors.businessLogo) {
        setErrors(prev => ({ ...prev, businessLogo: "" }));
      }
    }
  };

  // Initialize map when modal opens
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      // Initialize the map centered on Cairo (default view)
      const map = L.map(mapRef.current).setView([30.0444, 31.2357], 11);

      // Add multiple tile layers for better detail
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
      });

      // Add OpenStreetMap by default
      osmLayer.addTo(map);

      // Add layer control for switching between map types
      L.control.layers({
        "Street Map": osmLayer,
        "Satellite": satelliteLayer
      }).addTo(map);

      // Add zoom control
      L.control.zoom({
        position: 'topright'
      }).addTo(map);

      // Add scale control
      L.control.scale().addTo(map);

      // Add click handler to map
      map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker if any
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        
        // Add new marker with popup and drag functionality
        const marker = L.marker([lat, lng], {
          draggable: true
        }).addTo(map);
        marker.bindPopup('Business Location').openPopup();
        markerRef.current = marker;
        
        // Add drag event handler
        marker.on('dragend', function(e) {
          const draggedLat = e.target.getLatLng().lat;
          const draggedLng = e.target.getLatLng().lng;
          
          // Update coordinates when marker is dragged
          handleBranchCoordinates(activeBranchId, draggedLat, draggedLng);
          
          // Update popup with new coordinates
          marker.bindPopup(`Business Location<br>Lat: ${draggedLat.toFixed(6)}<br>Long: ${draggedLng.toFixed(6)}`).openPopup();
          
          console.log('Marker dragged to new coordinates:', { lat: draggedLat, long: draggedLng });
        });
        
        // Store coordinates for the active branch
        handleBranchCoordinates(activeBranchId, lat, lng);
        
        // Get detailed address from coordinates (reverse geocoding)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
          .then(response => response.json())
          .then(data => {
            // Get detailed address components
            const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            const detailedAddress = {
              full: address,
              city: data.address?.city || data.address?.town || data.address?.village || '',
              state: data.address?.state || data.address?.county || '',
              country: data.address?.country || '',
              postcode: data.address?.postcode || '',
              road: data.address?.road || '',
              house_number: data.address?.house_number || ''
            };
            
            // Format detailed address for display
            let formattedAddress = address;
            if (detailedAddress.road && detailedAddress.house_number) {
              formattedAddress = `${detailedAddress.house_number} ${detailedAddress.road}, ${detailedAddress.city || detailedAddress.state}, ${detailedAddress.country}`;
            }
            
            // Update the active branch with the selected location
            handleBranchInputChange(activeBranchId, 'locationPin', formattedAddress);
            setShowMap(false);
          })
          .catch(error => {
            console.error('Geocoding error:', error);
            // Fallback to coordinates if geocoding fails
            handleBranchInputChange(activeBranchId, 'locationPin', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            setShowMap(false);
          });
      });

      mapInstanceRef.current = map;
    }

    // Cleanup map when modal closes
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
        {/* Header Section */}
        <div className="business-setup-header">
          <h2>Complete your business profile</h2>
          <p>Tell us about your business to get started</p>
        </div>

        {/* Form Section */}
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
                {errors.businessName && <span className="error-text">{errors.businessName}</span>}
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
                {errors.businessType && <span className="error-text">{errors.businessType}</span>}
              </div>

              <div className="form-group">
                <label>Business Description</label>
                <textarea
                  placeholder="Describe your business..."
                  className="form-input"
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                  rows="4"
                />
                {errors.businessDescription && <span className="error-text">{errors.businessDescription}</span>}
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
                    {formData.businessLogo ? formData.businessLogo.name : "Choose logo file"}
                  </div>
                </div>
                {errors.businessLogo && <span className="error-text">{errors.businessLogo}</span>}
              </div>
            </div>

            {/* Branch Details Section */}
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
                      onChange={(e) => handleBranchInputChange(branch.id, "fullAddress", e.target.value)}
                    />
                    {errors[`branch_${branch.id}_address`] && <span className="error-text">{errors[`branch_${branch.id}_address`]}</span>}
                  </div>

                  <div className="form-group">
                    <label>Location Pin</label>
                    <button type="button" className="map-button" onClick={() => openMapForBranch(branch.id)}>
                      📍 Select on Map
                    </button>
                    {branch.locationPin && (
                      <div className="selected-location">
                        📍 Location selected: {branch.locationPin}
                      </div>
                    )}
                    {errors[`branch_${branch.id}_location`] && <span className="error-text">{errors[`branch_${branch.id}_location`]}</span>}
                  </div>

                  <div className="time-inputs">
                    <div className="form-group">
                      <label>Opening Hours</label>
                      <input
                        type="time"
                        className="form-input"
                        value={branch.openingHours}
                        onChange={(e) => handleBranchInputChange(branch.id, "openingHours", e.target.value)}
                      />
                      {errors[`branch_${branch.id}_opening`] && <span className="error-text">{errors[`branch_${branch.id}_opening`]}</span>}
                    </div>

                    <div className="form-group">
                      <label>Closing Hours</label>
                      <input
                        type="time"
                        className="form-input"
                        value={branch.closingHours}
                        onChange={(e) => handleBranchInputChange(branch.id, "closingHours", e.target.value)}
                      />
                      {errors[`branch_${branch.id}_closing`] && <span className="error-text">{errors[`branch_${branch.id}_closing`]}</span>}
                    </div>
                  </div>
                </div>
              ))}

              <button type="button" className="add-branch-btn" onClick={addBranch}>
                + Add Another Branch
              </button>
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`submit-message ${submitMessage.includes('successfully') ? 'success' : submitMessage.includes('error') || submitMessage.includes('failed') ? 'error' : 'warning'}`}>
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

          {/* Map Modal */}
          {showMap && (
            <div className="map-modal">
              <div className="map-modal-content">
                <div className="map-modal-header">
                  <h3>Select Location</h3>
                  <button className="close-map-btn" onClick={() => setShowMap(false)}>
                    ✕
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="map-search-container">
                  <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group">
                      <input
                        type="text"
                        placeholder="Search for an address or place..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        className="search-btn"
                        disabled={isSearching}
                      >
                        {isSearching ? '🔍' : '🔍'}
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="map-container">
                  <div ref={mapRef} className="real-map"></div>
                </div>
                
                {/* Coordinate Display Section */}
                <div className="coordinate-display">
                  {selectedCoordinates.lat !== null && selectedCoordinates.long !== null ? (
                    <div className="coordinates-info">
                      <div className="coordinate-values">
                        <div className="coordinate-item">
                          <label>lat:</label>
                          <span>{selectedCoordinates.lat}</span>
                        </div>
                        <div className="coordinate-item">
                          <label>long:</label>
                          <span>{selectedCoordinates.long}</span>
                        </div>
                      </div>
                      
                      {/* Cairo Warning (only shown if feature is enabled and location is outside Cairo) */}
                      {ENABLE_CAIRO_CHECK && !isWithinCairo(selectedCoordinates.lat, selectedCoordinates.long) && (
                        <div className="cairo-warning">
                          ⚠️ Note: This location is outside Cairo. Please verify this is correct for your business location.
                        </div>
                      )}
                      
                      <div className="coordinate-buttons">
                        <button type="button" className="copy-coordinates-btn" onClick={copyCoordinates}>
                          📋 Copy Coordinates
                        </button>
                        <button type="button" className="generate-message-btn" onClick={generateBackendMessage}>
                          📝 Generate Backend Message
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="coordinate-warning">
                      ⚠️ Please select a location on the map first.
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

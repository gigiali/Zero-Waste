import { createContext, useContext, useState, useRef } from "react";

const LocationContext = createContext();

const BASE = "https://zero-waste-production.up.railway.app";

const CAIRO_BOUNDS = { north: 30.35, south: 29.75, east: 31.90, west: 30.80 };
const CAIRO_CENTER = { lat: 30.0444, lng: 31.2357 };

function isWithinCairo(lat, lng) {
  return (
    lat >= CAIRO_BOUNDS.south &&
    lat <= CAIRO_BOUNDS.north &&
    lng >= CAIRO_BOUNDS.west &&
    lng <= CAIRO_BOUNDS.east
  );
}

const getToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  sessionStorage.getItem("token");

const getSessionId = () => {
  let sessionId = localStorage.getItem("location_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("location_session_id", sessionId);
  }
  return sessionId;
};

export function LocationProvider({ children }) {
  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem("userLocationName") || null;
  });
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [nearbyBranches, setNearbyBranches] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [userLat, setUserLat] = useState(() => {
    const lat = localStorage.getItem("userLocationLat");
    return lat ? parseFloat(lat) : null;
  });
  const [userLng, setUserLng] = useState(() => {
    const lng = localStorage.getItem("userLocationLng");
    return lng ? parseFloat(lng) : null;
  });

  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [showMapSearchResults, setShowMapSearchResults] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState({ lat: null, lng: null });

  const mapSearchTimeoutRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const fetchNearbyAndFee = (lat, lng, name) => {
    setLocationName(name);
    setUserLat(lat);
    setUserLng(lng);
    setNearbyBranches([]);
    setDeliveryFee(null);

    localStorage.setItem("userLocationLat", String(lat));
    localStorage.setItem("userLocationLng", String(lng));
    localStorage.setItem("userLocationName", name);
  };

  const calculateDeliveryFee = async (offerId) => {
    const lat = userLat ?? parseFloat(localStorage.getItem("userLocationLat"));
    const lng = userLng ?? parseFloat(localStorage.getItem("userLocationLng"));

    if (!lat || !lng || !offerId) return;

    setLoadingLocation(true);
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/api/orders/calculate-fee`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ customer_lat: lat, customer_long: lng, offer_id: offerId }),
      });
      const data = await res.json();
      if (res.ok) setDeliveryFee(data.delivery_fee);
    } catch {
      setDeliveryFee(null);
    } finally {
      setLoadingLocation(false);
    }
  };
  
  const clearLocation = () => {
    setLocationName(null);
    setDeliveryFee(null);
    setNearbyBranches([]);
    setUserLat(null);
    setUserLng(null);
    setSelectedCoordinates({ lat: null, lng: null });
    localStorage.removeItem("userLocationLat");
    localStorage.removeItem("userLocationLng");
    localStorage.removeItem("userLocationName");
  };

  const handleMapSearchChange = (query) => {
    setMapSearchQuery(query);
    setLocationError("");

    if (mapSearchTimeoutRef.current) clearTimeout(mapSearchTimeoutRef.current);

    if (!query.trim() || query.length < 3) {
      setMapSearchResults([]);
      setShowMapSearchResults(false);
      return;
    }

    mapSearchTimeoutRef.current = setTimeout(() => fetchMapSuggestions(query), 400);
  };

  const fetchMapSuggestions = async (query) => {
    try {
      const vb = `${CAIRO_BOUNDS.west},${CAIRO_BOUNDS.south},${CAIRO_BOUNDS.east},${CAIRO_BOUNDS.north}`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + " Cairo Egypt")}&limit=6&addressdetails=1&accept-language=en&viewbox=${vb}&bounded=1`,
        { headers: { "User-Agent": "ZeroWasteApp/1.0" } }
      );

      if (!res.ok) throw new Error("Search failed");

      const json = await res.json();
      const results = json.filter((r) => isWithinCairo(parseFloat(r.lat), parseFloat(r.lon)));
      setMapSearchResults(results);
      setShowMapSearchResults(results.length > 0);
    } catch {
      setMapSearchResults([]);
      setShowMapSearchResults(false);
    }
  };

  const handleSelectMapSuggestion = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    setMapSearchQuery(result.display_name);
    setMapSearchResults([]);
    setShowMapSearchResults(false);
    setLocationError("");

    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.setView([lat, lon], 17);
    if (markerRef.current) mapInstanceRef.current.removeLayer(markerRef.current);

    const marker = L.marker([lat, lon], { draggable: true }).addTo(mapInstanceRef.current);
    marker.bindPopup(result.display_name).openPopup();
    markerRef.current = marker;

    marker.on("dragend", function (ev) {
      const dlat = ev.target.getLatLng().lat;
      const dlng = ev.target.getLatLng().lng;
      if (!isWithinCairo(dlat, dlng)) {
        setLocationError("⚠️ Location is outside Cairo. Please select a location within Cairo.");
        marker.setLatLng([lat, lon]);
        return;
      }
      setLocationError("");
      setUserLat(dlat);
      setUserLng(dlng);
      setSelectedCoordinates({ lat: dlat, lng: dlng });
    });

    setUserLat(lat);
    setUserLng(lon);
    setLocationName(result.display_name);
    setSelectedCoordinates({ lat, lng: lon });
  };

  const handleMapClick = (lat, lng) => {
    if (!isWithinCairo(lat, lng)) {
      setLocationError("⚠️ Location is outside Cairo. Please select a location within Cairo.");
      return;
    }

    setLocationError("");

    if (markerRef.current) mapInstanceRef.current.removeLayer(markerRef.current);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current);
    marker.bindPopup("Selected Location").openPopup();
    markerRef.current = marker;

    marker.on("dragend", function (ev) {
      const dlat = ev.target.getLatLng().lat;
      const dlng = ev.target.getLatLng().lng;
      if (!isWithinCairo(dlat, dlng)) {
        setLocationError("⚠️ Location is outside Cairo. Please select a location within Cairo.");
        marker.setLatLng([lat, lng]);
        return;
      }
      setLocationError("");
      setUserLat(dlat);
      setUserLng(dlng);
      setSelectedCoordinates({ lat: dlat, lng: dlng });
    });

    setUserLat(lat);
    setUserLng(lng);
    setSelectedCoordinates({ lat, lng });

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
      .then((r) => r.json())
      .then((data) => {
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setLocationName(address);
      })
      .catch(() => {
        setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      });
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (!isWithinCairo(latitude, longitude)) {
            setLocationError("⚠️ Your location is outside Cairo. Please enable location or select manually.");
            return;
          }
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then((res) => res.json())
            .then((data) => {
              const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setLocationName(address);
              setUserLat(latitude);
              setUserLng(longitude);
              setSelectedCoordinates({ lat: latitude, lng: longitude });
              setLocationError("");
            })
            .catch(() => {
              setLocationName(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
              setUserLat(latitude);
              setUserLng(longitude);
              setSelectedCoordinates({ lat: latitude, lng: longitude });
              setLocationError("");
            });
        },
        () => {
          setLocationError("❌ Please enable location permission.");
        }
      );
    } else {
      setLocationError("❌ Geolocation is not supported by your browser.");
    }
  };

  const initializeMap = () => {
    if (showMap && mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [CAIRO_CENTER.lat, CAIRO_CENTER.lng],
        zoom: 12,
        minZoom: 10,
      });

      const osmLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap contributors", maxZoom: 19 }
      );
      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri", maxZoom: 19 }
      );

      osmLayer.addTo(map);
      L.control.layers({ "Street Map": osmLayer, Satellite: satelliteLayer }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      L.control.scale().addTo(map);

      L.rectangle(
        [[CAIRO_BOUNDS.south, CAIRO_BOUNDS.west], [CAIRO_BOUNDS.north, CAIRO_BOUNDS.east]],
        { color: "#28a745", weight: 2, fill: false, dashArray: "6 4", opacity: 0.6 }
      ).addTo(map);

      map.on("click", function (ev) {
        const { lat, lng } = ev.latlng;
        handleMapClick(lat, lng);
      });

      mapInstanceRef.current = map;
    }
  };

  const destroyMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        locationName,
        deliveryFee,
        nearbyBranches,
        loadingLocation,
        userLat,
        userLng,
        mapSearchQuery,
        mapSearchResults,
        showMapSearchResults,
        locationError,
        selectedCoordinates,
        mapRef,
        mapInstanceRef,
        markerRef,
        fetchNearbyAndFee,
        calculateDeliveryFee,
        clearLocation,
        handleMapSearchChange,
        handleSelectMapSuggestion,
        handleGeolocation,
        initializeMap,
        destroyMap,
        setShowMapSearchResults,
        setLocationError,
        CAIRO_BOUNDS,
        CAIRO_CENTER,
        isWithinCairo,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocationContext = () => useContext(LocationContext);

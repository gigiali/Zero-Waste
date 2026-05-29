import { createContext, useContext, useState } from "react";

const LocationContext = createContext();

const BASE = "https://zero-waste-production.up.railway.app";

const getToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  sessionStorage.getItem("token");

// Generate a unique session ID and persist it
const getSessionId = () => {
  let sessionId = localStorage.getItem("location_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("location_session_id", sessionId);
  }
  return sessionId;
};

export function LocationProvider({ children }) {
  const [locationName, setLocationName]       = useState(null);
  const [deliveryFee, setDeliveryFee]         = useState(null);
  const [nearbyBranches, setNearbyBranches]   = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [userLat, setUserLat]                 = useState(null);
  const [userLng, setUserLng]                 = useState(null);

  const fetchNearbyAndFee = async (lat, lng, name) => {
    setLocationName(name);
    setUserLat(lat);
    setUserLng(lng);
    setLoadingLocation(true);

    // Save to localStorage for other components (e.g. PaymentMethod)
    localStorage.setItem("userLocationLat",  String(lat));
    localStorage.setItem("userLocationLng",  String(lng));
    localStorage.setItem("userLocationName", name);

    try {
      const token     = getToken();
      const sessionId = getSessionId();

      const params = new URLSearchParams({
        lat:        String(lat),
        long:       String(lng),
        radius:     "10",          // 10 km radius
        session_id: sessionId,
      });

      const headers = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res  = await fetch(`${BASE}/api/branches/nearby?${params.toString()}`, { headers });
      const data = await res.json();

      if (!res.ok) {
        setNearbyBranches([]);
        setDeliveryFee(25);
        return;
      }

      const branches = data.data || data.branches || [];
      setNearbyBranches(branches);

      if (data.delivery_fee !== undefined) {
        setDeliveryFee(data.delivery_fee);
      } else if (branches[0]?.distance !== undefined) {
        const distance = branches[0].distance;
        setDeliveryFee(Math.round(10 + distance * 5));
      } else {
        setDeliveryFee(25);
      }
    } catch {
      setDeliveryFee(25);
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
    localStorage.removeItem("userLocationLat");
    localStorage.removeItem("userLocationLng");
    localStorage.removeItem("userLocationName");
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
        fetchNearbyAndFee,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocationContext = () => useContext(LocationContext);
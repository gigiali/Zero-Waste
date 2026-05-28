import { createContext, useContext, useState } from "react";

const LocationContext = createContext();

const getToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  sessionStorage.getItem("token");

export function LocationProvider({ children }) {
  const [locationName, setLocationName] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [nearbyBranches, setNearbyBranches] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  const fetchNearbyAndFee = async (lat, lng, name) => {
    setLocationName(name);
    setUserLat(lat);
    setUserLng(lng);
    setLoadingLocation(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/branches/nearby?lat=${lat}&lng=${lng}`, {
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const data = await res.json();
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

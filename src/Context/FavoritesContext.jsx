import React, { createContext, useContext, useState, useCallback } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favCount, setFavCount] = useState(
    parseInt(localStorage.getItem("zw_favorites_count") || "0")
  );
  const [favorites, setFavorites] = useState(new Set());

  const syncFavoritesFromAPI = useCallback(async () => {
    const token = 
      localStorage.getItem("auth_token") || 
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token") || 
      sessionStorage.getItem("token");

    if (!token) return;

    try {
      const lat = localStorage.getItem("userLocationLat") || 30.0444;
      const lng = localStorage.getItem("userLocationLng") || 31.2357;

      const response = await fetch(
        `/api/favorites?customer_lat=${lat}&customer_long=${lng}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      let favList = Array.isArray(data) ? data : (data.data || data.favorites || []);
      const ids = favList.map(f => f.id || f.restaurant_id).filter(Boolean);
      
      setFavorites(new Set(ids));
      setFavCount(ids.length);
      localStorage.setItem("zw_favorites_count", ids.length);
    } catch (err) {
      console.error("❌ Sync error:", err);
    }
  }, []);

  const toggleFavorite = useCallback(async (restaurantId) => {
    const token = 
      localStorage.getItem("auth_token") || 
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token") || 
      sessionStorage.getItem("token");

    if (!token) {
      alert("عليك تسجيل الدخول أولاً");
      return false;
    }

    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/favorite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        const newFavorites = new Set(favorites);
        
        if (data.is_favorited) {
          newFavorites.add(restaurantId);
          setFavCount(prev => prev + 1);
          
        } else {
          newFavorites.delete(restaurantId);
          setFavCount(prev => Math.max(0, prev - 1));
          
        }

        setFavorites(newFavorites);
        localStorage.setItem("zw_favorites_count", newFavorites.size);
        return data.is_favorited;
      }
    } catch (err) {
      console.error("❌ Toggle error:", err);
    }
    return null;
  }, [favorites]);

  const isFavorite = useCallback((restaurantId) => {
    return favorites.has(restaurantId);
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favCount, toggleFavorite, isFavorite, syncFavoritesFromAPI }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites يجب أن يكون دzاخل FavoritesProvider");
  }
  return context;
}

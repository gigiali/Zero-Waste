import React, { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem("zw_favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("zw_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (offer) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === offer.id);
      if (exists) return prev.filter((f) => f.id !== offer.id);
      return [...prev, offer];
    });
  };

  const isFavorite = (id) => favorites.some((f) => f.id === Number(id));

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
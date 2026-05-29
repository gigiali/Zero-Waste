const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "").replace(/\/api$/i, "");

export function apiUrl(path) {
  if (!path || typeof path !== "string") return path;
  if (!path.startsWith("/api")) return path;
  if (import.meta.env.DEV) return path;
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

export function installApiFetch() {
  if (typeof window === "undefined" || window.__zeroWasteApiFetchInstalled) return;

  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === "string") {
      return nativeFetch(apiUrl(input), init);
    }

    return nativeFetch(input, init);
  };

  window.__zeroWasteApiFetchInstalled = true;
}

export const getFavorites = async (token, lat, lng) => {
  const params = new URLSearchParams();
  if (lat) params.set("customer_lat", lat);
  if (lng) params.set("customer_long", lng);

  const query = params.toString();
  const response = await fetch(`/api/favorites${query ? `?${query}` : ""}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return { ok: response.ok, data };
};

export const toggleFavorite = async (token, restaurantId) => {
  const response = await fetch("/api/favorites/toggle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ restaurant_id: restaurantId }),
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
};

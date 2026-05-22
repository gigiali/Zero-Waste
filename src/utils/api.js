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

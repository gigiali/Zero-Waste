import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Trash2, Clock } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import Navigation from "../Components/Navigation";

export default function Favorites() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () =>
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("token");

  const getLat = () => localStorage.getItem("userLocationLat") || 30.0444;
  const getLng = () => localStorage.getItem("userLocationLng") || 31.2357;

  const syncCount = (list) => {
    localStorage.setItem("zw_favorites_count", list.length);
    window.dispatchEvent(new Event("zw-favorites-updated"));
  };

  const fetchFavorites = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) { navigate("/signin"); return; }
      const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const res = await fetch(
        `${apiUrl}/api/favorites?customer_lat=${getLat()}&customer_long=${getLng()}`,
        { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (res.ok) {
        const raw = data.data || data.favorites || data || [];
        const list = Array.isArray(raw) ? raw : [];
        setFavorites(list);
        syncCount(list);
      } else {
        setError(data.message || "Failed to load favorites.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (vendorId) => {
  
    const newList = favorites.filter((v) => v.id !== vendorId);
    setFavorites(newList);
    syncCount(newList); 

    try {
      const token = getToken();
      const res = await fetch(`/api/favorites/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vendor_id: vendorId }),
      });
      if (!res.ok) fetchFavorites();
    } catch {
      fetchFavorites();
    }
  };

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "customer") {
      navigate("/signin");
      return;
    }
    fetchFavorites();
  }, [isLoggedIn]);

  const getDistance = (vendor) => {
    const dist = vendor.branches?.[0]?.distance;
    return dist ? `${dist.toFixed(1)} km` : null;
  };

  const getFirstOfferId = (vendor) =>
    vendor.branches?.[0]?.offers?.[0]?.id || null;

  const countOffers = (vendor) =>
    vendor.branches?.reduce((sum, b) => sum + (b.offers?.length || 0), 0) || 0;

  return (
    <>
      <Navigation />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <Heart size={28} color="#ef4444" fill="#ef4444" />
          <h1 style={{ fontSize: "1.77rem", fontWeight: 700, color: "#1f2937", margin: 0 }}>
            My Favorites
          </h1>
          {!isLoading && favorites.length > 0 && (
            <span style={{ marginLeft: "auto", color: "#6b7280", fontSize: "0.9rem" }}>
              {favorites.length} restaurant{favorites.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <div style={{
              width: "40px", height: "40px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #10b981",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!isLoading && error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "10px", padding: "1rem 1.5rem",
            color: "#dc2626", display: "flex",
            justifyContent: "space-between", alignItems: "center",
          }}>
            <span>{error}</span>
            <button onClick={fetchFavorites} style={{
              background: "#dc2626", color: "white", border: "none",
              borderRadius: "6px", padding: "6px 14px",
              cursor: "pointer", fontSize: "0.85rem",
            }}>Retry</button>
          </div>
        )}

        {!isLoading && !error && favorites.length === 0 && (
          <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <Heart size={64} color="#e5e7eb" style={{ marginBottom: "1rem" }} />
            <h2 style={{ color: "#6b7280", fontWeight: 600, marginBottom: "0.5rem" }}>
              No favorites yet
            </h2>
            <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>
              Start adding restaurants you love!
            </p>
            <button onClick={() => navigate("/home")} style={{
              background: "#10b981", color: "white", border: "none",
              borderRadius: "8px", padding: "0.75rem 1.5rem",
              fontWeight: 600, cursor: "pointer", fontSize: "0.95rem",
            }}>
              Explore Restaurants
            </button>
          </div>
        )}

        {!isLoading && !error && favorites.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}>
            {favorites.map((vendor) => {
              const firstOfferId = getFirstOfferId(vendor);
              const distance = getDistance(vendor);
              const offersCount = countOffers(vendor);

              return (
                <div key={vendor.id}
                  style={{
                    background: "white", borderRadius: "12px",
                    border: "1px solid #e5e7eb", overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                  }}
                >
                  <div
                    style={{ position: "relative" }}
                    onClick={() => firstOfferId ? navigate(`/restaurant/${firstOfferId}`) : null}
                  >
                    <img
                      src={vendor.logo || "/images/placeholder.png"}
                      alt={vendor.business_name}
                      style={{ width: "100%", height: "160px", objectFit: "cover" }}
                      onError={(e) => { e.target.src = "/images/placeholder.png"; }}
                    />

                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(vendor.id); }}
                      style={{
                        position: "absolute", top: "10px", right: "10px",
                        background: "white", border: "none", borderRadius: "50%",
                        width: "34px", height: "34px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>

                    {offersCount > 0 && (
                      <span style={{
                        position: "absolute", bottom: "10px", left: "10px",
                        background: "#10b981", color: "white",
                        borderRadius: "6px", padding: "3px 8px",
                        fontSize: "0.75rem", fontWeight: 600,
                      }}>
                        {offersCount} offer{offersCount !== 1 ? "s" : ""} available
                      </span>
                    )}
                  </div>

                  <div
                    style={{ padding: "1rem" }}
                    onClick={() => firstOfferId ? navigate(`/restaurant/${firstOfferId}`) : null}
                  >
                    <h3 style={{ margin: "0 0 0.4rem", fontSize: "1rem", fontWeight: 700, color: "#1f2937" }}>
                      {vendor.business_name || "-"}
                    </h3>
                    {vendor.vendor_type && (
                      <span style={{
                        display: "inline-block", background: "#f0fdf4",
                        color: "#10b981", borderRadius: "6px",
                        padding: "2px 8px", fontSize: "0.78rem",
                        fontWeight: 600, marginBottom: "0.5rem",
                      }}>
                        {vendor.vendor_type}
                      </span>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                      {distance && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6b7280", fontSize: "0.85rem" }}>
                          <MapPin size={13} /> {distance}
                        </div>
                      )}
                      {offersCount === 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#9ca3af", fontSize: "0.82rem" }}>
                          <Clock size={13} /> No active offers
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

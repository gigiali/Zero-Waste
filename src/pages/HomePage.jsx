import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Heart,
  Clock,
  MapPin,
  AlertCircle,
  Package,
} from "lucide-react";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ["All", "Restaurant", "Bakery", "Supermarket", "Hotel"];

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        // For demo/testing purposes, use mock data if no token
        if (!token) {
          // Mock data for testing
          const mockOffers = [
            {
              id: 1,
              title: "Fresh Pasta Special",
              description:
                "Delicious homemade pasta with tomato sauce and basil",
              image: "/images/e.png",
              discount: 60,
              originalPrice: 25.99,
              discountedPrice: 10.39,
              quantity: 5,
              pickupTime: "Today 6:00 PM",
              location: "Downtown Restaurant",
              isLiked: false,
            },
            {
              id: 2,
              title: "Bakery Fresh Croissants",
              description: "Buttery croissants baked fresh this morning",
              image: "/images/e.png",
              discount: 63,
              originalPrice: 18.99,
              discountedPrice: 7.02,
              quantity: 12,
              pickupTime: "Today 5:30 PM",
              location: "City Center Bakery",
              isLiked: true,
            },
            {
              id: 3,
              title: "Pizza Deal Combo",
              description: "Large pizza with 2 toppings and garlic bread",
              image: "/images/e.png",
              discount: 45,
              originalPrice: 32.99,
              discountedPrice: 18.14,
              quantity: 8,
              pickupTime: "Today 7:00 PM",
              location: "Main Street Pizzeria",
              isLiked: false,
            },
            {
              id: 4,
              title: "Cake & Coffee Set",
              description: "Fresh cake with premium coffee beans",
              image: "/images/e.png",
              discount: 70,
              originalPrice: 45.99,
              discountedPrice: 13.8,
              quantity: 3,
              pickupTime: "Today 4:00 PM",
              location: "Sweet Corner Cafe",
              isLiked: false,
            },
          ];

          setOffers(mockOffers);
          return;
        }

        const res = await fetch("https://stagnate-deferred-pork.ngrok-free.dev/api/vendor/myoffers", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Please login to view offers");
          } else if (res.status === 403) {
            throw new Error("Access denied. Vendor privileges required.");
          } else {
            throw new Error("Failed to fetch offers");
          }
        }

        const data = await res.json();
        setOffers(data?.data || []);
      } catch (error) {
        console.error("Offers fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Handle like/favorite for offers
  const toggleLike = (offerId) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === offerId ? { ...offer, isLiked: !offer.isLiked } : offer,
      ),
    );
  };

  return (
    <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #d4f4dd 0%, #e8f5e8 100%)",
          padding: "3rem 2rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "1rem",
          }}
        >
          Save Food, Save Money
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#6b7280",
            marginBottom: "2rem",
            maxWidth: "600px",
            margin: "0 auto 2rem",
          }}
        >
          Discover surplus food from local businesses at discounted prices
        </p>

        <div
          style={{
            position: "relative",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <Search
            size={20}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          />
          <input
            type="text"
            placeholder="Search for food..."
            style={{
              width: "100%",
              padding: "1rem 1rem 1rem 3rem",
              border: "1px solid #e5e7eb",
              borderRadius: "50px",
              fontSize: "1rem",
              outline: "none",
            }}
          />
        </div>
      </section>

      {/* Filter Section */}
      <section
        style={{
          backgroundColor: "white",
          padding: "1.5rem 2rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              <Filter size={16} />
              <span>Filter:</span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    backgroundColor:
                      selectedCategory === category ? "#10b981" : "white",
                    color: selectedCategory === category ? "white" : "#6b7280",
                    borderColor:
                      selectedCategory === category ? "#10b981" : "#e5e7eb",
                    transition: "all 0.2s",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              <span>Sort by:</span>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Distance
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section style={{ padding: "2rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "1.5rem",
          }}
        >
          My Offers
        </h2>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #10b981",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <p style={{ color: "#6b7280" }}>Loading offers...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              textAlign: "center",
            }}
          >
            <AlertCircle
              size={48}
              style={{ color: "#ef4444", marginBottom: "1rem" }}
            />
            <h3 style={{ color: "#1f2937", marginBottom: "1rem" }}>
              Error Loading Offers
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "1rem" }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && offers.length === 0 && (
          <div
            style={{
              backgroundColor: "white",
              padding: "3rem",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              textAlign: "center",
            }}
          >
            <Package
              size={64}
              style={{ color: "#d1d5db", marginBottom: "1rem" }}
            />
            <h3 style={{ color: "#1f2937", marginBottom: "1rem" }}>
              No Offers Yet
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
              You haven't created any offers yet. Start by adding your first
              offer!
            </p>
            <button
              style={{
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Create Your First Offer
            </button>
          </div>
        )}

        {/* Offers Grid */}
        {!loading && !error && offers.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {offers.map((offer) => (
              <div
                key={offer.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-4px)";
                  e.target.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
              >
                {/* Offer Image */}
                <div
                  style={{
                    position: "relative",
                    height: "180px",
                    backgroundColor: "#f3f4f6",
                    overflow: "hidden",
                  }}
                >
                  {offer.image ? (
                    <img
                      src={offer.image}
                      alt={offer.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "3rem",
                        color: "#9ca3af",
                      }}
                    >
                      🍽️
                    </div>
                  )}

                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(offer.id)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.transform = "scale(1.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.transform = "scale(1)")
                    }
                  >
                    <Heart
                      size={18}
                      style={{
                        color: offer.isLiked ? "#ef4444" : "#9ca3af",
                        fill: offer.isLiked ? "#ef4444" : "none",
                      }}
                    />
                  </button>

                  {/* Discount Badge */}
                  {offer.discount && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        backgroundColor: "#10b981",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.875rem",
                        fontWeight: "bold",
                      }}
                    >
                      -{offer.discount}%
                    </div>
                  )}
                </div>

                {/* Offer Content */}
                <div style={{ padding: "1.25rem" }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#1f2937",
                      marginBottom: "0.5rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {offer.title || "Untitled Offer"}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      marginBottom: "1rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {offer.description || "No description available"}
                  </p>

                  {/* Offer Details */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {offer.originalPrice && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span
                          style={{
                            color: "#9ca3af",
                            textDecoration: "line-through",
                          }}
                        >
                          ${offer.originalPrice}
                        </span>
                        <span style={{ color: "#10b981", fontWeight: "600" }}>
                          ${offer.discountedPrice || offer.price}
                        </span>
                      </div>
                    )}

                    {offer.quantity && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                          color: "#6b7280",
                        }}
                      >
                        <Package size={14} />
                        <span>{offer.quantity} items available</span>
                      </div>
                    )}

                    {offer.pickupTime && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                          color: "#6b7280",
                        }}
                      >
                        <Clock size={14} />
                        <span>Pickup: {offer.pickupTime}</span>
                      </div>
                    )}

                    {offer.location && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                          color: "#6b7280",
                        }}
                      >
                        <MapPin size={14} />
                        <span>{offer.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      style={{
                        flex: 1,
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#059669")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#10b981")
                      }
                    >
                      Edit Offer
                    </button>
                    <button
                      style={{
                        backgroundColor: "#f3f4f6",
                        color: "#6b7280",
                        border: "1px solid #e5e7eb",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#e5e7eb")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#f3f4f6")
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
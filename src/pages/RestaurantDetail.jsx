import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Phone, Mail, Star, Navigation as NavigationIcon } from 'lucide-react';
import './RestaurantDetail.css';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const restaurantsData = {
    1: {
      id: 1,
      name: "Downtown Restaurant",
      description: "A cozy restaurant in the heart of downtown Cairo, serving delicious homemade pasta and Italian cuisine with fresh ingredients from local farms.",
      image: "/images/e.png",
      rating: 4.5,
      totalReviews: 234,
      phone: "+20 2 12345678",
      email: "contact@downtown.com",
      hours: "11:00 AM - 10:00 PM",
      location: "123 Main Street, Downtown Cairo",
      distance: "0.8km away",
      category: "Restaurant",
      offers: [
        {
          id: 1,
          title: "Fresh Pasta Special",
          description: "Delicious homemade pasta with tomato sauce and basil",
          discount: 30,
          originalPrice: 189.99,
          discountedPrice: 159.99,
          quantity: 5,
          pickupTime: "Today 6:00 PM"
        }
      ]
    },
    2: {
      id: 2,
      name: "City Center Bakery",
      description: "Traditional French bakery offering fresh croissants, pastries, and artisan breads baked daily using traditional techniques.",
      image: "/images/e.png",
      rating: 4.8,
      totalReviews: 456,
      phone: "+20 2 87654321",
      email: "hello@citybakery.com",
      hours: "6:00 AM - 8:00 PM",
      location: "45 Bakery Street, City Center",
      distance: "1.2km away",
      category: "Bakery",
      offers: [
        {
          id: 2,
          title: "Bakery Fresh Croissants",
          description: "Buttery croissants baked fresh this morning",
          discount: 30,
          originalPrice: 115.99,
          discountedPrice: 85.99,
          quantity: 12,
          pickupTime: "Today 5:30 PM"
        }
      ]
    },
    3: {
      id: 3,
      name: "Pizza Paradise",
      description: "Authentic Italian pizza made with fresh dough and premium ingredients, offering a variety of toppings and combos.",
      image: "/images/e.png",
      rating: 4.7,
      totalReviews: 312,
      phone: "+1 (555) 123-4567",
      email: "contact@pizzaparadise.com",
      hours: "8:00 AM - 10:00 PM",
      location: "78 Pizza Avenue, Zamalek",
      distance: "0.5km away",
      category: "Restaurant",
      offers: [
        {
          id: 3,
          title: "Pizza Deal Combo",
          description: "Large pizza with 2 toppings and garlic bread",
          discount: 60,
          originalPrice: 229.99,
          discountedPrice: 199.99,
          quantity: 15,
          pickupTime: "Today 7:00 PM"
        }
      ]
    },
    4: {
      id: 4,
      name: "Sweet Corner Cafe",
      description: "Charming cafe offering fresh cakes, premium coffee, and afternoon tea sets perfect for dessert lovers.",
      image: "/images/e.png",
      rating: 4.6,
      totalReviews: 189,
      phone: "+20 2 12345678",
      email: "hello@sweetcorner.com",
      hours: "7:00 AM - 10:00 PM",
      location: "22 Cafe Lane, Maadi",
      distance: "2.1km away",
      category: "Bakery",
      offers: [
        {
          id: 4,
          title: "Cake & Coffee Set",
          description: "Fresh cake with premium coffee beans",
          discount: 30,
          originalPrice: 139.99,
          discountedPrice: 109.99,
          quantity: 3,
          pickupTime: "Today 4:00 PM"
        }
      ]
    }
  };

  const restaurant = restaurantsData[id];

  if (!restaurant) {
    return (
      <div className="restaurant-detail-container">
        <div className="not-found">
          <h2>Restaurant not found</h2>
          <button onClick={() => navigate('/')} className="back-btn">← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-detail-container">

      {/* ── Back Bar ── */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* ── Hero ── */}
      <div className="detail-hero">
        <img src={restaurant.image} alt={restaurant.name} className="detail-hero-image" />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <div className="detail-hero-text">
            <h1>{restaurant.name}</h1>
            <div className="detail-hero-meta">
              <span><MapPin size={14} /> {restaurant.location} · {restaurant.distance}</span>
              <span className="hero-rating">⭐ {restaurant.rating} ({restaurant.totalReviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Strip ── */}
      <div className="detail-info-strip">
        <div className="detail-info-strip-inner">
          <div className="info-strip-item">
            <div className="info-strip-icon"><Clock size={18} /></div>
            <div>
              <div className="info-strip-label">Open Hours</div>
              <div className="info-strip-value">{restaurant.hours}</div>
            </div>
          </div>
          <div className="info-strip-item">
            <div className="info-strip-icon"><Phone size={18} /></div>
            <div>
              <div className="info-strip-label">Phone</div>
              <div className="info-strip-value">{restaurant.phone}</div>
            </div>
          </div>
          <div className="info-strip-item">
            <div className="info-strip-icon"><Mail size={18} /></div>
            <div>
              <div className="info-strip-label">Email</div>
              <div className="info-strip-value">{restaurant.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">

        {/* Description */}
        <div className="description-section">
          <h2>About {restaurant.name}</h2>
          <p className="restaurant-description">{restaurant.description}</p>
        </div>

        {/* Offers */}
        <div className="offers-section">
          <h2>Available Offers ({restaurant.offers.length})</h2>
          {restaurant.offers.map((offer) => (
            <div key={offer.id} className="offer-card" onClick={() => navigate(`/offer/${offer.id}`)}>
              <img src={restaurant.image} alt={offer.title} className="offer-card-image" />
              <div className="offer-card-body">
                <div className="offer-card-top">
                  <span className="offer-card-title">{offer.title}</span>
                  <span className="offer-badge">-{offer.discount}%</span>
                </div>
                <p className="offer-card-desc">{offer.description}</p>
                <div className="offer-card-bottom">
                  <div className="offer-prices">
                    <span className="offer-original">EGP {offer.originalPrice}</span>
                    <span className="offer-discounted">EGP {offer.discountedPrice}</span>
                  </div>
                  <div className="offer-meta">
                    <span className="offer-quantity">{offer.quantity} left</span>
                    <span className="offer-time"><Clock size={12} /> {offer.pickupTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Button */}
        <div className="navigation-section">
          <button
            className="navigate-btn"
            onClick={() => {
              const query = encodeURIComponent(restaurant.location);
              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
            }}
          >
            <NavigationIcon size={18} />
            Get Directions
          </button>
        </div>

      </div>
    </div>
  );
}

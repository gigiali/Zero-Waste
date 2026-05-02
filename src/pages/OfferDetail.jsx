import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Heart, Share2, Phone, Mail, ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../Context/CartContext';
import { useFavorites } from '../Context/FavoritesContext';
import './OfferDetail.css';

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const offersData = {
    1: {
      id: 1,
      title: "Fresh Pasta Special",
      description: "Delicious homemade pasta with tomato sauce and basil, made with fresh ingredients from local farms. Perfect for a quick and satisfying meal.",
      image: "/src/assets/images/e.png",
      discount: 30,
      originalPrice: 189.99,
      discountedPrice: 159.99,
      quantity: 5,
      pickupTime: "Today 6:00 PM",
      location: "123 Main Street, Downtown Cairo",
      category: "Restaurant",
      restaurantName: "Downtown Restaurant",
      restaurantPhone: "+20 2 12345678",
      restaurantEmail: "contact@downtown.com",
      restaurantRating: 4.5,
      restaurantHours: "11:00 AM - 10:00 PM",
      distance: "0.8km away",
    },
    2: {
      id: 2,
      title: "Bakery Fresh Croissants",
      description: "Buttery croissants baked fresh this morning using traditional French techniques. Perfect with coffee or tea.",
      image: "/src/assets/images/e.png",
      discount: 30,
      originalPrice: 115.99,
      discountedPrice: 85.99,
      quantity: 12,
      pickupTime: "Today 5:30 PM",
      location: "45 Bakery Street, City Center",
      category: "Bakery",
      restaurantName: "City Center Bakery",
      restaurantPhone: "+20 2 87654321",
      restaurantEmail: "hello@citybakery.com",
      restaurantRating: 4.8,
      restaurantHours: "6:00 AM - 8:00 PM",
      distance: "1.2km away",
    },
    3: {
      id: 3,
      title: "Pizza Deal Combo",
      description: "Large pizza with 2 toppings and garlic bread. Made with fresh dough and premium ingredients.",
      image: "/src/assets/images/e.png",
      discount: 60,
      originalPrice: 229.99,
      discountedPrice: 199.99,
      quantity: 15,
      pickupTime: "Today 7:00 PM",
      location: "78 Pizza Avenue, Zamalek",
      category: "Restaurant",
      restaurantName: "Pizza Paradise",
      restaurantPhone: "+1 (555) 123-4567",
      restaurantEmail: "contact@pizzaparadise.com",
      restaurantRating: 4.7,
      restaurantHours: "8:00 AM - 10:00 PM",
      distance: "0.5km away",
    },
    4: {
      id: 4,
      title: "Cake & Coffee Set",
      description: "Fresh cake with premium coffee beans. Perfect for afternoon tea or dessert lovers.",
      image: "/src/assets/images/e.png",
      discount: 30,
      originalPrice: 139.99,
      discountedPrice: 109.99,
      quantity: 3,
      pickupTime: "Today 4:00 PM",
      location: "22 Cafe Lane, Maadi",
      category: "Bakery",
      restaurantName: "Sweet Corner Cafe",
      restaurantPhone: "+20 2 12345678",
      restaurantEmail: "hello@sweetcorner.com",
      restaurantRating: 4.6,
      restaurantHours: "7:00 AM - 10:00 PM",
      distance: "2.1km away",
    },
  };

  const offer = offersData[id];
  const liked = isFavorite(id);

  const handleAddToCart = () => {
    addToCart(offer, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!offer) {
    return (
      <div className="offer-detail-container">
        <div className="not-found">
          <h2>Offer not found</h2>
          <button onClick={() => navigate('/')} className="back-btn">← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="offer-detail-container">

      {/* ── Back Bar ── */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} />
          Back
        </button>
        <button className="share-btn">
          <Share2 size={18} />
        </button>
      </div>

      {/* ── Hero ── */}
      <div className="detail-hero">
        <img src={offer.image} alt={offer.title} className="detail-hero-image" />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <div className="detail-hero-text">
            <h1>{offer.restaurantName}</h1>
            <div className="detail-hero-meta">
              <span><MapPin size={14} /> {offer.location} · {offer.distance}</span>
              <span className="hero-rating">⭐ {offer.restaurantRating}</span>
            </div>
          </div>

          {/* Heart button — now connected to FavoritesContext */}
          <button
            onClick={() => toggleFavorite(offer)}
            className={`detail-like-btn ${liked ? 'liked' : ''}`}
            title={liked ? "Remove from favorites" : "Add to favorites"}
            style={{
              transform: liked ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.2s, background 0.2s",
            }}
          >
            <Heart
              size={20}
              fill={liked ? 'currentColor' : 'none'}
              style={{ transition: "fill 0.2s" }}
            />
          </button>
        </div>
      </div>

      {/* ── Info Strip ── */}
      <div className="detail-info-strip">
        <div className="detail-info-strip-inner">
          <div className="info-strip-item">
            <div className="info-strip-icon"><Clock size={18} /></div>
            <div>
              <div className="info-strip-label">Open Hours</div>
              <div className="info-strip-value">{offer.restaurantHours}</div>
            </div>
          </div>
          <div className="info-strip-item">
            <div className="info-strip-icon"><Phone size={18} /></div>
            <div>
              <div className="info-strip-label">Phone</div>
              <div className="info-strip-value">{offer.restaurantPhone}</div>
            </div>
          </div>
          <div className="info-strip-item">
            <div className="info-strip-icon"><Mail size={18} /></div>
            <div>
              <div className="info-strip-label">Email</div>
              <div className="info-strip-value">{offer.restaurantEmail}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="detail-body">

        {/* Left — Offers */}
        <div className="offers-section">
          <h2>Available Offers (1)</h2>

          <div className="offer-card">
            <img src={offer.image} alt={offer.title} className="offer-card-image" />
            <div className="offer-card-body">
              <div className="offer-card-top">
                <span className="offer-card-title">{offer.title}</span>
                <span className="offer-badge">-{offer.discount}%</span>
              </div>
              <p className="offer-card-desc">{offer.description}</p>
              <div className="offer-card-pricing">
                <span className="price-new">EGP {offer.discountedPrice}</span>
                <span className="price-old">EGP {offer.originalPrice}</span>
              </div>
              <div className="offer-card-footer">
                <div className="offer-meta">
                  <span>📦 {offer.quantity} left in stock</span>
                  <span><Clock size={13} /> Pickup: {offer.pickupTime}</span>
                </div>
                <div className="offer-card-actions">
                  <select
                    className="qty-select"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  >
                    {[...Array(Math.min(offer.quantity, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Qty: {i + 1}</option>
                    ))}
                  </select>
                  <button
                    className={`reserve-btn ${added ? 'reserve-btn-added' : ''}`}
                    onClick={handleAddToCart}
                  >
                    {added ? <><Check size={15} /> Added!</> : <><ShoppingCart size={15} /> Add to Cart</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Sidebar */}
        <div className="detail-sidebar">
          <div className="sidebar-card">
            <h3>Restaurant Info</h3>
            <div className="sidebar-row">
              <span className="sidebar-label">Name</span>
              <span className="sidebar-value">{offer.restaurantName}</span>
            </div>
            <div className="sidebar-row">
              <span className="sidebar-label">Category</span>
              <span className="sidebar-value">{offer.category}</span>
            </div>
            <div className="sidebar-row">
              <span className="sidebar-label">Rating</span>
              <span className="sidebar-value">⭐ {offer.restaurantRating} / 5.0</span>
            </div>
            <div className="sidebar-row">
              <span className="sidebar-label">Distance</span>
              <span className="sidebar-value">{offer.distance}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

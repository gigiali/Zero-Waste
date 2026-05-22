import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import "./CartPage.css";
import { useCart } from "../Context/CartContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.discountedPrice ?? item.discountPrice ?? 0) * Number(item.quantity || 0),
    0
  );
  const deliveryFee = selectedDelivery === "delivery" ? 25 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div className="cart-header-inner">
          <div className="cart-header-title">
            <ShoppingCart size={32} />
            <h1>Shopping Cart</h1>
          </div>
          <p className="cart-header-subtitle">Review your items before checkout</p>
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={48} color="#d1d5db" />
              <h3>Your cart is empty</h3>
              <p>Add some offers to get started!</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image}
                  alt={item.title}
                  className="cart-item-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="cart-item-placeholder" style={{ display: "none" }}>
                  🍽️
                </div>

                <div className="cart-item-info">
                  <h3>{item.title}</h3>
                  <p className="cart-item-location">{item.location}</p>
                  <div className="cart-item-prices">
                    <span className="cart-item-price">
                      EGP {Number(item.discountedPrice ?? item.discountPrice ?? 0).toFixed(2)}
                    </span>
                    <span className="cart-item-original-price">
                      EGP {Number(item.originalPrice ?? item.original_price ?? 0).toFixed(2)}
                    </span>
                  </div>
                  {item.pickupTime && (
                    <p className="cart-item-expiry">Pickup: {item.pickupTime}</p>
                  )}
                </div>

                <button className="cart-item-delete" onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={20} />
                </button>

                <div className="cart-item-quantity">
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                  <span className="qty-number">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>EGP {subtotal.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>EGP {deliveryFee.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>EGP {total.toFixed(2)}</span>
          </div>

          <div className="delivery-options">
            <h3>Choose Delivery Method</h3>
            <div className="delivery-buttons">
              <button
                className={`delivery-btn pickup-btn ${selectedDelivery === "pickup" ? "selected" : ""}`}
                onClick={() => setSelectedDelivery("pickup")}
              >
                <span className="delivery-icon">🏪</span>
                <div className="delivery-info">
                  <span className="delivery-title">Pickup from Restaurant</span>
                  <span className="delivery-desc">Collect your order directly</span>
                </div>
                {selectedDelivery === "pickup" && <span className="selected-indicator">✓</span>}
              </button>
              <button
                className={`delivery-btn delivery-home-btn ${selectedDelivery === "delivery" ? "selected" : ""}`}
                onClick={() => setSelectedDelivery("delivery")}
              >
                <span className="delivery-icon">🚚</span>
                <div className="delivery-info">
                  <span className="delivery-title">Home Delivery</span>
                  <span className="delivery-desc">Get it delivered to your door</span>
                </div>
                <span className="delivery-fee">+25 EGP</span>
                {selectedDelivery === "delivery" && <span className="selected-indicator">✓</span>}
              </button>
            </div>
            {selectedDelivery && (
              <div className="delivery-confirmation">
                <small className="selected-text">
                  {selectedDelivery === "pickup" ? "🏪 Pickup selected" : "🚚 Delivery selected"}
                </small>
                <button
                  className="confirm-delivery-btn"
                  onClick={() => navigate(`/payment?method=${selectedDelivery}`)}
                >
                  Continue to Payment
                </button>
              </div>
            )}
          </div>

          <button className="continue-btn" onClick={() => navigate("/home")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Trash2 } from "lucide-react";
import "./CartPage.css";
import { useCart } from "../Context/CartContext";
import { useLocationContext } from "../Context/LocationContext";

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { locationName, deliveryFee: ctxFee, loadingLocation } = useLocationContext();
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const deliveryFee = selectedDelivery === "delivery" ? (ctxFee ?? 25) : 0;

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.discountedPrice ?? item.discountPrice ?? 0) *
        Number(item.quantity || 0),
    0,
  );
  const total = subtotal + deliveryFee;

  const handleDeliverySelect = (method) => {
    setSelectedDelivery(method);
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div className="cart-header-inner">
          <div className="cart-header-title">
            <ShoppingCart size={32} />
            <h1>{t("cart.title")}</h1>
          </div>
          <p className="cart-header-subtitle">{t("cart.subtitle")}</p>
        </div>
      </div>

      <div className="cart-content">
        {/* Cart Items */}
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={48} color="#d1d5db" />
              <h3>{t("cart.emptyTitle")}</h3>
              <p>{t("cart.emptyMessage")}</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.title} className="cart-item-image"
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                <div className="cart-item-placeholder" style={{ display: "none" }}>🍽️</div>
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
                    <p className="cart-item-expiry">{t("cart.pickupPrefix")}: {item.pickupTime}</p>
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

        {/* Order Summary */}
        <div className="order-summary">
          <h2>{t("cart.summaryTitle")}</h2>
          <div className="summary-rows">
            <div className="summary-row">
              <span>{t("cart.subtotal")}</span>
              <span>EGP {subtotal.toFixed(2)}</span>
            </div>
            {selectedDelivery === "delivery" && (
              <div className="summary-row">
                <span>{t("cart.deliveryFee")}</span>
                <span>
                  {loadingLocation ? "Calculating..." : `EGP ${deliveryFee.toFixed(2)}`}
                </span>
              </div>
            )}
          </div>
          <div className="summary-total">
            <span>{t("cart.total")}</span>
            <span>EGP {total.toFixed(2)}</span>
          </div>

          {/* Delivery Options */}
          <div className="delivery-options">
            <h3>{t("cart.chooseDeliveryMethod")}</h3>
            <div className="delivery-buttons">
              {/* Pickup */}
              <button
                className={`delivery-btn pickup-btn ${selectedDelivery === "pickup" ? "selected" : ""}`}
                onClick={() => handleDeliverySelect("pickup")}>
                <span className="delivery-icon">🏪</span>
                <div className="delivery-info">
                  <span className="delivery-title">{t("cart.pickupTitle")}</span>
                  <span className="delivery-desc">{t("cart.pickupDescription")}</span>
                </div>
                {selectedDelivery === "pickup" && <span className="selected-indicator">✓</span>}
              </button>

              {/* Home Delivery */}
              <button
                className={`delivery-btn delivery-home-btn ${selectedDelivery === "delivery" ? "selected" : ""}`}
                onClick={() => handleDeliverySelect("delivery")}>
                <span className="delivery-icon">🚚</span>
                <div className="delivery-info">
                  <span className="delivery-title">{t("cart.deliveryTitle")}</span>
                  <span className="delivery-desc">{t("cart.deliveryDescription")}</span>
                </div>
                <span className="delivery-fee">
                  {loadingLocation
                    ? "..."
                    : ctxFee !== null
                    ? `+${ctxFee} EGP`
                    : "+? EGP"}
                </span>
                {selectedDelivery === "delivery" && <span className="selected-indicator">✓</span>}
              </button>
            </div>

            {/* No location warning */}
            {selectedDelivery === "delivery" && !locationName && (
              <div style={{
                marginTop: "10px", padding: "10px 14px",
                background: "#fef3c7", border: "1px solid #fcd34d",
                borderRadius: "8px", fontSize: "0.85rem", color: "#92400e",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                📍 Set your location from the navbar for accurate delivery fee
              </div>
            )}

            {selectedDelivery && (
              <div className="delivery-confirmation">
                <small className="selected-text">
                  {selectedDelivery === "pickup" ? t("cart.pickupSelected") : t("cart.deliverySelected")}
                </small>
                <button
                  className="confirm-delivery-btn"
                  disabled={loadingLocation}
                  onClick={() => navigate(`/payment?method=${selectedDelivery}&fee=${deliveryFee}`)}>
                  {loadingLocation ? "Calculating fee..." : t("cart.continueToPayment")}
                </button>
              </div>
            )}
          </div>

          <button className="continue-btn" onClick={() => navigate("/home")}>
            {t("cart.continueShopping")}Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

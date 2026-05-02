import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ArrowLeft, Home, Clock, MapPin, Package } from "lucide-react";
import "./OrderConfirmation.css";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deliveryMethod = searchParams.get('method') || 'pickup';
  const cartTotal = parseFloat(searchParams.get('total')) || 0;
  const deliveryFee = deliveryMethod === 'delivery' ? 25 : 0;
  const total = cartTotal + deliveryFee;

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleTrackOrder = () => {
    navigate(`/order-tracking?method=${deliveryMethod}`);
  };

  return (
    <div className="confirmation-container">
      {/* Header */}
      <div className="confirmation-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="header-content">
          <div className="success-icon">
            <Check size={48} />
          </div>
          <h1>Order Confirmed!</h1>
          <p>Your order has been successfully placed</p>
        </div>
      </div>

      {/* Content */}
      <div className="confirmation-content">
        {/* Order Details */}
        <div className="order-details-card">
          <h2>Order Details</h2>
          <div className="order-info">
            <div className="info-row">
              <span className="info-label">Order Number</span>
              <span className="info-value">#ORD-2026-001</span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Time</span>
              <span className="info-value">{new Date().toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Delivery Method</span>
              <span className="info-value">
                {deliveryMethod === 'delivery' ? '🚚 Home Delivery' : '🏪 Pickup from Restaurant'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Estimated Time</span>
              <span className="info-value">
                {deliveryMethod === 'delivery' ? '30-45 minutes' : '15-20 minutes'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-card">
          <h2>Order Summary</h2>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>EGP {cartTotal.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>EGP {deliveryFee.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total</span>
            <span>EGP {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery/Pickup Info */}
        <div className="delivery-info-card">
          <h2>
            {deliveryMethod === 'delivery' ? 'Delivery Information' : 'Pickup Information'}
          </h2>
          <div className="delivery-details">
            {deliveryMethod === 'delivery' ? (
              <>
                <div className="delivery-item">
                  <MapPin size={20} />
                  <div>
                    <strong>Delivery Address</strong>
                    <p>Your saved address will be used for delivery</p>
                  </div>
                </div>
                <div className="delivery-item">
                  <Clock size={20} />
                  <div>
                    <strong>Delivery Time</strong>
                    <p>30-45 minutes from now</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="delivery-item">
                  <MapPin size={20} />
                  <div>
                    <strong>Pickup Location</strong>
                    <p>Restaurant address will be shown in app</p>
                  </div>
                </div>
                <div className="delivery-item">
                  <Clock size={20} />
                  <div>
                    <strong>Pickup Time</strong>
                    <p>15-20 minutes from now</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="track-order-btn" onClick={handleTrackOrder}>
            <Package size={20} />
            Track Order
          </button>
          <button className="home-btn" onClick={handleBackToHome}>
            <Home size={20} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  CreditCard, Banknote, ArrowLeft, Package, MapPin,
  Clock, CheckCircle, X, ChevronRight, Truck, ShoppingBag, Phone
} from "lucide-react";
import "./PaymentMethod.css";
import { useCart } from "../Context/CartContext";
import { useLocationContext } from "../Context/LocationContext";

// 🔑 Initialize Stripe
const stripePromise = loadStripe("pk_test_51TNOJp6iphBSh3uRkoU7koyZS3lQo7iDuplR8SEeghZesr5A2MGhWp2oh0Nm1vBSmEQwvh33fxSRb1bu4kxZohbS00rs5joZTi");

// 💳 Card Payment Form Component
function CardPaymentForm({ onSubmit, isSubmitting, total }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleCardPayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
      return;
    }

    setError(null);
    const paymentMethodId = paymentMethod.id;
    await onSubmit(paymentMethodId);
  };

  return (
    <form onSubmit={handleCardPayment} style={{ marginTop: "1.5rem" }}>
      <div style={{
        padding: "1rem",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        marginBottom: "1rem",
        backgroundColor: "#f9fafb"
      }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": { color: "#aab7c4" },
              },
              invalid: { color: "#fa755a" },
            },
          }}
        />
      </div>

      {error && (
        <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor: isSubmitting ? "#d1d5db" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? "Processing..." : `Pay EGP ${total.toFixed(2)}`}
      </button>
    </form>
  );
}

// 📋 Order Review Modal
function OrderReviewModal({ 
  cartItems, 
  deliveryMethod, 
  cartTotal, 
  deliveryFee, 
  commission, 
  total, 
  onConfirm, 
  onCancel, 
  isSubmitting, 
  onTrackOrder, 
  businessPhone, 
  orderSuccess, 
  selectedMethod 
}) {
  const [phase, setPhase] = useState(1);
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (orderSuccess) setConfirmed(true);
  }, [orderSuccess]);

  useEffect(() => {
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      const phaseProgress = (elapsed % 10000) / 10000 * 100;
      setProgress(phaseProgress);
      if (elapsed === 10000) { 
        setPhase(2); 
        setProgress(0); 
      }
      else if (elapsed === 20000) { 
        setPhase(3); 
        setProgress(100); 
        clearInterval(interval); 
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleConfirm = () => { 
    setConfirmed(true); 
    onConfirm(selectedMethod === "card" ? null : null); 
  };

  return (
    <div className="orm-overlay">
      <div className="orm-modal">
        {/* Header */}
        <div className="orm-header">
          <div className="orm-header-icon"><Package size={20} /></div>
          <div className="orm-header-text"><h2>Review Your Order</h2></div>
          {phase < 3 && (
            <button className="orm-skip-btn" onClick={() => {
              if (phase === 1) { 
                setPhase(2); 
                setProgress(0); 
              }
              else { 
                setPhase(3); 
                setProgress(100); 
              }
            }}>
              Skip <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {phase < 3 && (
          <div className="orm-progress-wrap">
            <div className="orm-progress-track">
              <div className="orm-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="orm-progress-label">{phase === 1 ? "Order Details" : "Order Summary"}</span>
          </div>
        )}

        {/* Steps Indicator */}
        <div className="orm-steps">
          {["Order Details", "Order Summary", "Confirm"].map((label, idx) => {
            const stepNum = idx + 1;
            const done = phase > stepNum;
            const active = phase === stepNum;
            return (
              <div key={label} className={`orm-step ${done ? "done" : active ? "active" : "pending"}`}>
                <div className="orm-step-node">
                  {done ? <CheckCircle size={13} /> : <span>{stepNum}</span>}
                </div>
                <span className="orm-step-label">{label}</span>
                {idx < 2 && <div className={`orm-step-line ${done ? "done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {/* Phase 1: Order Details */}
        {phase === 1 && (
          <div className="orm-body orm-fade-in">
            <h3 className="orm-section-title">Order Details</h3>
            <div className="orm-detail-row">
              <div className="orm-detail-icon">
                {deliveryMethod === "delivery" ? <Truck size={16} /> : <ShoppingBag size={16} />}
              </div>
              <div>
                <span className="orm-detail-label">Delivery Method</span>
                <span className="orm-detail-value">
                  {deliveryMethod === "delivery" ? "Home Delivery" : "Pickup from Restaurant"}
                </span>
              </div>
            </div>
            <div className="orm-detail-row">
              <div className="orm-detail-icon"><Clock size={16} /></div>
              <div>
                <span className="orm-detail-label">Estimated Time</span>
                <span className="orm-detail-value">
                  {deliveryMethod === "delivery" ? "30-45 minutes" : "15-20 minutes"}
                </span>
              </div>
            </div>
            <div className="orm-detail-row">
              <div className="orm-detail-icon"><MapPin size={16} /></div>
              <div>
                <span className="orm-detail-label">
                  {deliveryMethod === "delivery" ? "Delivery Address" : "Pickup Location"}
                </span>
                <span className="orm-detail-value">
                  {deliveryMethod === "delivery" ? "Your saved address" : "Restaurant address shown in app"}
                </span>
              </div>
            </div>
            <div className="orm-detail-row">
              <div className="orm-detail-icon"><Package size={16} /></div>
              <div>
                <span className="orm-detail-label">Items</span>
                <span className="orm-detail-value">
                  {cartItems.reduce((sum, i) => sum + i.quantity, 0)} item(s)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Order Summary */}
        {phase === 2 && (
          <div className="orm-body orm-fade-in">
            <h3 className="orm-section-title">Order Summary</h3>
            <div className="orm-items-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="orm-item-row">
                  <div className="orm-item-left">
                    <span className="orm-item-qty">{item.quantity}x</span>
                    <span className="orm-item-name">{item.title}</span>
                  </div>
                  <span className="orm-item-price">
                    EGP {(Number(item.discountedPrice ?? item.discountPrice ?? 0) * Number(item.quantity || 0)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="orm-totals">
              <div className="orm-total-row">
                <span>Subtotal</span>
                <span>EGP {cartTotal.toFixed(2)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="orm-total-row">
                  <span>Delivery Fee</span>
                  <span>EGP {deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="orm-total-row">
                <span>Service Fee (6%)</span>
                <span>EGP {commission.toFixed(2)}</span>
              </div>
              <div className="orm-total-divider" />
              <div className="orm-total-row orm-total-final">
                <span>Total</span>
                <span>EGP {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Confirmation */}
        {phase === 3 && !confirmed && (
          <div className="orm-body orm-fade-in">
            <div className="orm-confirm-icon"><CheckCircle size={40} /></div>
            <h3 className="orm-confirm-title">Everything looks good?</h3>
            <p className="orm-confirm-subtitle">
              Total: <strong>EGP {total.toFixed(2)}</strong> · {deliveryMethod === "delivery" ? "Home Delivery" : "Pickup"}
            </p>
            
            {selectedMethod === "card" ? (
              <CardPaymentForm onSubmit={onConfirm} isSubmitting={isSubmitting} total={total} />
            ) : (
              <div className="orm-actions">
                <button className="orm-cancel-btn" onClick={onCancel} disabled={isSubmitting}>
                  <X size={16} /> Cancel
                </button>
                <button className="orm-confirm-btn" onClick={handleConfirm} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><span className="orm-spinner" /> Placing Order...</>
                  ) : (
                    <><CheckCircle size={16} /> Confirm Order</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Success State */}
        {(confirmed || orderSuccess) && (
          <div className="orm-body orm-fade-in">
            <div className="orm-confirm-icon orm-success"><CheckCircle size={48} /></div>
            <h3 className="orm-confirm-title">Order Confirmed!</h3>
            <p className="orm-confirm-subtitle">Your order has been placed successfully</p>
            <div className="orm-success-details">
              <div className="orm-success-row">
                <span>Subtotal</span>
                <strong>EGP {cartTotal.toFixed(2)}</strong>
              </div>
              <div className="orm-success-row">
                <span>Service Fee (6%)</span>
                <strong>EGP {commission.toFixed(2)}</strong>
              </div>
              {deliveryFee > 0 && (
                <div className="orm-success-row">
                  <span>Delivery Fee</span>
                  <strong>EGP {deliveryFee.toFixed(2)}</strong>
                </div>
              )}
              <div className="orm-success-row">
                <span>Total</span>
                <strong>EGP {total.toFixed(2)}</strong>
              </div>
              <div className="orm-success-row">
                <span>Payment</span>
                <strong>{selectedMethod === "card" ? "Card Payment" : `Cash on ${deliveryMethod === "delivery" ? "Delivery" : "Pickup"}`}</strong>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button className="orm-track-btn" onClick={onTrackOrder}>
                <MapPin size={18} /> Track Order
              </button>
              {businessPhone && (
                <a 
                  href={`tel:${businessPhone}`} 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "1rem",
                    borderRadius: "12px",
                    background: "#f3f4f6",
                    color: "#374151",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    border: "1.5px solid #e5e7eb"
                  }}
                >
                  <Phone size={18} />
                  <span>Contact: {businessPhone}</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 🛒 Main Payment Method Page
export default function PaymentMethodPage({ onBack, cartTotal: propCartTotal }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, clearCart } = useCart();
  const { userLat, userLng } = useLocationContext();

  // State Management
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Refs for data preservation
  const orderDataRef = React.useRef(null);
  const frozenCartItemsRef = React.useRef([]);
  const serverOrderRef = React.useRef(null);

  // Calculate totals
  const deliveryMethod = searchParams.get("method") || "pickup";
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.discountedPrice ?? item.discountPrice ?? 0) * Number(item.quantity || 0),
    0
  );
  const deliveryFee = deliveryMethod === "delivery" 
    ? (parseFloat(searchParams.get("fee")) || 25)
    : 0;
  const cartTotal = propCartTotal || subtotal;
  const commission = parseFloat((cartTotal * 0.06).toFixed(2)); // 6% service fee
  const total = cartTotal + deliveryFee + commission;

  // Payment Methods Configuration
  const paymentMethods = deliveryMethod === "delivery"
    ? [
        { id: "card", icon: <CreditCard size={24} color="#6b7280" />, title: "Card Payment", desc: "Pay securely with your credit or debit card" },
        { id: "cash", icon: <Banknote size={24} color="#6b7280" />, title: "Cash on Delivery", desc: "Pay with cash when your order is delivered" },
      ]
    : [
        { id: "card", icon: <CreditCard size={24} color="#6b7280" />, title: "Card Payment", desc: "Pay securely with your credit or debit card" },
        { id: "cash", icon: <Banknote size={24} color="#6b7280" />, title: "Cash on Pickup", desc: "Pay with cash when you collect your order" },
      ];

  // Handlers
  const handleConfirmClick = () => {
    if (!selectedMethod) { 
      setSubmitError("Please select a payment method"); 
      return; 
    }
    if (cartItems.length === 0) { 
      setSubmitError("Your cart is empty"); 
      return; 
    }
    setSubmitError("");
    setShowReviewModal(true);
  };

  const handleCardSubmit = async (paymentMethodId) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = 
        localStorage.getItem("auth_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("auth_token") ||
        sessionStorage.getItem("token");

      if (!token) { 
        setSubmitError("Please login to continue"); 
        setIsSubmitting(false); 
        return; 
      }

      const submitBody = {
        items: cartItems.map((item) => ({ 
          offer_id: item.id, 
          quantity: item.quantity 
        })),
        payment_method: "card",
        payment_method_id: paymentMethodId,
        delivery_type: deliveryMethod,
        ...(deliveryMethod === "delivery" && { 
          customer_lat: userLat, 
          customer_long: userLng 
        }),
      };

      const response = await fetch("https://zero-waste-production.up.railway.app/api/orders", {
        method: "POST",
        headers: { 
          Accept: "application/json", 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(submitBody),
      });

      const data = await response.json();

      if (response.ok) {
        serverOrderRef.current = data.order;
        const firstItem = cartItems[0];
        const businessName = firstItem?.location || firstItem?.businessName || firstItem?.vendor_name || "The Restaurant";
        const businessPhone = firstItem?.phone || firstItem?.vendor_phone || data.order?.vendor_phone || "";

        orderDataRef.current = { deliveryMethod, cartTotal, deliveryFee, commission, total, businessName, businessPhone };
        frozenCartItemsRef.current = [...cartItems];
        clearCart();
        setOrderSuccess(true);
        window.dispatchEvent(new Event("order-placed"));
      } else {
        if (response.status === 422 && data.errors) {
          setSubmitError(Object.values(data.errors).flat().join("\n") || "Please fix the errors below");
        } else if (response.status === 401) {
          setSubmitError("Please login to continue");
        } else {
          setSubmitError(data.message || "Failed to create order");
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Order submission error:", error);
      setSubmitError("Network error. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  const handleCashSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = 
        localStorage.getItem("auth_token") || 
        localStorage.getItem("token");
      
      if (!token) { 
        setSubmitError("Please login to continue"); 
        setIsSubmitting(false); 
        return; 
      }

      const submitBody = {
        items: cartItems.map((item) => ({ 
          offer_id: item.id, 
          quantity: item.quantity 
        })),
        payment_method: "cash",
        delivery_type: deliveryMethod,
        ...(deliveryMethod === "delivery" && {
          customer_lat: userLat,
          customer_long: userLng,
        }),
      };

      const response = await fetch("https://zero-waste-production.up.railway.app/api/orders", {
        method: "POST",
        headers: { 
          Accept: "application/json", 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(submitBody),
      });

      const data = await response.json();

      if (response.ok) {
        serverOrderRef.current = data.order;
        const firstItem = cartItems[0];
        const businessName = firstItem?.location || firstItem?.businessName || firstItem?.vendor_name || "The Restaurant";
        const businessPhone = firstItem?.phone || firstItem?.vendor_phone || data.order?.vendor_phone || "";

        orderDataRef.current = { deliveryMethod, cartTotal, deliveryFee, commission, total, businessName, businessPhone };
        frozenCartItemsRef.current = [...cartItems];
        clearCart();
        setOrderSuccess(true);
        window.dispatchEvent(new Event("order-placed"));
      } else {
        setSubmitError(data.message || "Error creating order");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Order submission error:", error);
      setSubmitError("Network error. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  const handleModalCancel = () => { 
    if (!orderSuccess) setShowReviewModal(false); 
  };

  const handleFinalConfirm = selectedMethod === "card" 
    ? handleCardSubmit 
    : handleCashSubmit;

  return (
    <Elements stripe={stripePromise}>
      <div className="payment-container">
        {/* Header */}
        <div className="payment-header">
          <div className="payment-header-inner">
            <button className="payment-back-btn" onClick={onBack}>
              <ArrowLeft size={18} /> Back to Cart
            </button>
            <div className="payment-header-title">
              <CreditCard size={32} />
              <h1>Payment Method</h1>
            </div>
            <p className="payment-header-subtitle">Choose how you'd like to pay</p>
          </div>
        </div>

        {/* Content */}
        <div className="payment-content">
          {submitError && (
            <div style={{
              color: "#ef4444",
              marginBottom: "16px",
              padding: "12px",
              background: "#fef2f2",
              borderRadius: "8px",
              fontSize: "0.9rem"
            }}>
              {submitError}
            </div>
          )}

          {/* Payment Methods Selection */}
          <div>
            <p className="payment-section-title">Select Payment Method</p>
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`payment-method-card ${selectedMethod === method.id ? "selected" : ""}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="payment-method-icon">{method.icon}</div>
                  <div className="payment-method-info">
                    <h3>{method.title}</h3>
                    <p>{method.desc}</p>
                  </div>
                  <div className="payment-radio">
                    <div className="payment-radio-dot" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-box">
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
              <div className="summary-row">
                <span>Service Fee (6%)</span>
                <span>EGP {commission.toFixed(2)}</span>
              </div>
            </div>
            <hr className="summary-divider" />
            <div className="summary-total">
              <span>Total</span>
              <span>EGP {total.toFixed(2)}</span>
            </div>
            <button
              className="continue-btn"
              disabled={!selectedMethod || isSubmitting}
              onClick={handleConfirmClick}
            >
              {isSubmitting ? "Placing Order..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {(showReviewModal || orderSuccess) && (
        <OrderReviewModal
          cartItems={orderSuccess ? frozenCartItemsRef.current : cartItems}
          deliveryMethod={deliveryMethod}
          cartTotal={orderDataRef.current?.cartTotal ?? cartTotal}
          deliveryFee={orderDataRef.current?.deliveryFee ?? deliveryFee}
          commission={orderDataRef.current?.commission ?? commission}
          total={orderDataRef.current?.total ?? total}
          onConfirm={handleFinalConfirm}
          onCancel={handleModalCancel}
          orderSuccess={orderSuccess}
          selectedMethod={selectedMethod}
          onTrackOrder={() => {
            setShowReviewModal(false);
            navigate("/home", {
              state: {
                trackingActive: true,
                orderNumber: serverOrderRef.current?.id || "ORD-2026-001",
                deliveryMethod,
                total: orderDataRef.current?.total ?? total,
                orderTime: new Date().toISOString(),
                offerId: frozenCartItemsRef.current[0]?.id || 1,
              },
            });
          }}
          isSubmitting={isSubmitting}
          businessPhone={cartItems[0]?.phone || "01234567890"}
        />
      )}
    </Elements>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard, Banknote, ArrowLeft, Package, MapPin,
  Clock, CheckCircle, X, ChevronRight, Truck, ShoppingBag, Phone
} from "lucide-react";
import "./PaymentMethod.css";
import { useCart } from "../Context/CartContext";

// ── Animated Order Review Modal ───────────────────────────────────────────────
function OrderReviewModal({ cartItems, deliveryMethod, cartTotal, deliveryFee, total, onConfirm, onCancel, isSubmitting, onTrackOrder, businessPhone }) {
  const [phase, setPhase] = useState(1); // 1 = order details, 2 = order summary, 3 = actions, 4 = confirmed
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  // Auto-advance through phases (10 seconds each)
  useEffect(() => {
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      const phaseProgress = (elapsed % 10000) / 10000 * 100;
      setProgress(phaseProgress);

      if (elapsed === 10000) {
        setPhase(2);
        setProgress(0);
      } else if (elapsed === 20000) {
        setPhase(3);
        setProgress(100);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm();
  };

  return (
    <div className="orm-overlay">
      <div className="orm-modal">

        {/* Header */}
        <div className="orm-header">
          <div className="orm-header-icon">
            <Package size={20} />
          </div>
          <div className="orm-header-text">
            <h2>Review Your Order</h2>
          </div>
          {phase < 3 && (
            <button className="orm-skip-btn" onClick={() => {
              if (phase === 1) { setPhase(2); setProgress(0); }
              else { setPhase(3); setProgress(100); }
            }}>
              Skip <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Progress bar */}
        {phase < 3 && (
          <div className="orm-progress-wrap">
            <div className="orm-progress-track">
              <div className="orm-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="orm-progress-label">
              {phase === 1 ? "Order Details" : "Order Summary"}
            </span>
          </div>
        )}

        {/* Step indicators */}
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

        {/* ── Phase 1: Order Details ── */}
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
                  {deliveryMethod === "delivery" ? "30–45 minutes" : "15–20 minutes"}
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
                  {deliveryMethod === "delivery"
                    ? "Your saved address"
                    : "Restaurant address shown in app"}
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

        {/* ── Phase 2: Order Summary ── */}
        {phase === 2 && (
          <div className="orm-body orm-fade-in">
            <h3 className="orm-section-title">Order Summary</h3>

            <div className="orm-items-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="orm-item-row">
                  <div className="orm-item-left">
                    <span className="orm-item-qty">{item.quantity}×</span>
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
              <div className="orm-total-divider" />
              <div className="orm-total-row orm-total-final">
                <span>Total</span>
                <span>EGP {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Phase 3: Confirm / Cancel ── */}
        {phase === 3 && !confirmed && (
          <div className="orm-body orm-fade-in">
            <div className="orm-confirm-icon">
              <CheckCircle size={40} />
            </div>
            <h3 className="orm-confirm-title">Everything looks good?</h3>
            <p className="orm-confirm-subtitle">
              Total: <strong>EGP {total.toFixed(2)}</strong> ·{" "}
              {deliveryMethod === "delivery" ? "Home Delivery" : "Pickup"}
            </p>

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
          </div>
        )}

        {/* ── Phase 4: Order Confirmed ── */}
        {confirmed && (
          <div className="orm-body orm-fade-in">
            <div className="orm-confirm-icon orm-success">
              <CheckCircle size={48} />
            </div>
            <h3 className="orm-confirm-title">Order Confirmed!</h3>
            <p className="orm-confirm-subtitle">
              Your order has been placed successfully
            </p>

            <div className="orm-success-details">
              <div className="orm-success-row">
                <span>Order ID</span>
                <strong>ORD-2026-001</strong>
              </div>
              <div className="orm-success-row">
                <span>Total</span>
                <strong>EGP {total.toFixed(2)}</strong>
              </div>
              <div className="orm-success-row">
                <span>Payment</span>
                <strong>Cash on {deliveryMethod === "delivery" ? "Delivery" : "Pickup"}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="orm-track-btn" onClick={onTrackOrder}>
                <MapPin size={18} /> Track Order
              </button>

              {businessPhone && (
                <a
                  href={`tel:${businessPhone}`}
                  className="orm-contact-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: '#f3f4f6',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    animation: 'orm-slide-up 0.4s ease',
                    border: '1.5px solid #e5e7eb'
                  }}
                >
                  <Phone size={18} />
                  <span>Contact Restaurant: {businessPhone}</span>
                  <span style={{
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>Call</span>
                </a>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── PaymentMethodPage ─────────────────────────────────────────────────────────
const saveUserOrder = ({
  orderId,
  cartItems,
  deliveryMethod,
  selectedMethod,
  cartTotal,
  deliveryFee,
  total,
  businessName,
  businessPhone,
}) => {
  const orderNumber = String(orderId || `ORD-${Date.now()}`);
  const storedOrders = JSON.parse(localStorage.getItem("zw_user_orders") || "[]");
  const orderSnapshot = {
    id: orderNumber,
    orderNumber,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
    deliveryMethod,
    paymentMethod: selectedMethod === "card" ? "Card Payment" : "Cash",
    businessName: businessName || cartItems[0]?.location || "The Restaurant",
    businessPhone: businessPhone || cartItems[0]?.phone || cartItems[0]?.vendor_phone || "",
    subtotal: cartTotal,
    deliveryFee,
    total,
    items: cartItems.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.discountedPrice || item.discountPrice || 0,
      price: Number(item.discountedPrice ?? item.discountPrice ?? 0) * Number(item.quantity || 0),
      location: item.location,
      category: item.category,
    })),
  };

  localStorage.setItem("zw_user_orders", JSON.stringify([orderSnapshot, ...storedOrders]));
  window.dispatchEvent(new Event("zw-user-orders-updated"));
  return orderSnapshot;
};

export default function PaymentMethodPage({ onBack, cartTotal: propCartTotal }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const deliveryMethod = searchParams.get("method") || "pickup";

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.discountedPrice ?? item.discountPrice ?? 0) * Number(item.quantity || 0),
    0
  );
  const deliveryFee = deliveryMethod === "delivery" ? 25 : 0;
  const cartTotal = propCartTotal || subtotal;
  const total = cartTotal + deliveryFee;

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const paymentMethods =
    deliveryMethod === "delivery"
      ? [
          { id: "card", icon: <CreditCard size={24} color="#6b7280" />, title: "Card Payment", desc: "Pay securely with your credit or debit card" },
          { id: "cash", icon: <Banknote size={24} color="#6b7280" />, title: "Cash on Delivery", desc: "Pay with cash when your order is delivered" },
        ]
      : [
          { id: "card", icon: <CreditCard size={24} color="#6b7280" />, title: "Card Payment", desc: "Pay securely with your credit or debit card" },
          { id: "cash", icon: <Banknote size={24} color="#6b7280" />, title: "Cash on Pickup", desc: "Pay with cash when you collect your order" },
        ];

  const handleCardInput = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "cardNumber")
      formatted = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (name === "expiry") {
      formatted = value.replace(/\D/g, "").slice(0, 4);
      if (formatted.length >= 2) formatted = formatted.slice(0, 2) + "/" + formatted.slice(2);
    }
    if (name === "cvv") formatted = value.replace(/\D/g, "").slice(0, 3);
    setCardDetails((prev) => ({ ...prev, [name]: formatted }));
  };

  const canContinue =
    selectedMethod === "cash" ||
    (selectedMethod === "card" &&
      cardDetails.cardNumber.length === 19 &&
      cardDetails.cardName &&
      cardDetails.expiry.length === 5 &&
      cardDetails.cvv.length === 3);

  // Opens the review modal instead of submitting directly
  const handleConfirmClick = () => {
    if (!selectedMethod) { setSubmitError("Please select a payment method"); return; }
    if (cartItems.length === 0) { setSubmitError("Your cart is empty"); return; }
    setSubmitError("");
    setShowReviewModal(true);
  };

  // Called when user hits "Confirm Order" inside the modal
  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    // ========== DEMO MODE: Skip API & Login ==========
    const DEMO_MODE = false; // Set to false when backend is ready

    if (DEMO_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      saveUserOrder({
        orderId: `ORD-${Date.now()}`,
        cartItems,
        deliveryMethod,
        selectedMethod,
        cartTotal,
        subtotal: cartTotal,
        deliveryFee,
        total,
        businessName: cartItems[0]?.location,
        businessPhone: cartItems[0]?.phone || cartItems[0]?.vendor_phone,
      });

      // Stay on modal - don't navigate away
      setIsSubmitting(false);
      return;
    }
    // ========== END DEMO MODE ==========

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) { setSubmitError("Please login to continue"); setIsSubmitting(false); return; }

      const customerLat = localStorage.getItem("userLocationLat");
      const customerLong = localStorage.getItem("userLocationLng");

      const items = cartItems.map((item) => ({ offer_id: item.id, quantity: item.quantity }));

      const submitData = new FormData();
      submitData.append("items", JSON.stringify(items));
      submitData.append("payment_method", selectedMethod);
      submitData.append("delivery_type", deliveryMethod);

      if (deliveryMethod === "delivery") {
        if (!customerLat || !customerLong) {
          setSubmitError("Please set your location first");
          setIsSubmitting(false);
          return;
        }
        submitData.append("customer_lat", customerLat);
        submitData.append("customer_long", customerLong);
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        const firstItem = cartItems[0];
        const businessName =
          firstItem?.location || firstItem?.businessName || firstItem?.vendor_name || "The Restaurant";
        const businessPhone =
          firstItem?.phone || firstItem?.vendor_phone || data.order?.vendor_phone || "";

        const itemsSnapshot = cartItems.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: Number(item.discountedPrice ?? item.discountPrice ?? 0) * Number(item.quantity || 0),
          location: item.location,
          category: item.category,
        }));

        const savedOrder = saveUserOrder({
          orderId: data.order?.id || "ORD-2026-001",
          cartItems,
          deliveryMethod,
          selectedMethod,
          cartTotal,
          deliveryFee,
          total,
          businessName,
          businessPhone,
        });

        clearCart();

        navigate("/order-confirmation", {
          state: {
            deliveryMethod,
            cartTotal,
            deliveryFee,
            total,
            orderId: savedOrder.orderNumber,
            items: itemsSnapshot,
            businessName,
            businessPhone,
          },
        });
      } else {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join("\n");
          setSubmitError(errorMessages || "Please fix the errors below");
        } else if (response.status === 401) {
          setSubmitError("Please login to continue");
        } else {
          setSubmitError(data.message || "Failed to place order. Please try again.");
        }
        setIsSubmitting(false);
        setShowReviewModal(false);
      }
    } catch (error) {
      console.error("Order submission error:", error);
      setSubmitError("Network error. Please check your connection and try again.");
      setIsSubmitting(false);
      setShowReviewModal(false);
    }
  };

  // Cancel inside modal → just close modal, stay on payment page
  const handleModalCancel = () => {
    setShowReviewModal(false);
  };

  return (
    <>
      <div className="payment-container">
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

        <div className="payment-content">
          {submitError && (
            <div style={{ color: "#ef4444", marginBottom: "16px", padding: "12px", background: "#fef2f2", borderRadius: "8px", fontSize: "0.9rem" }}>
              {submitError}
            </div>
          )}

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

            {selectedMethod === "card" && (
              <div className="card-form">
                <div className="form-group">
                  <label>Card Number</label>
                  <input type="text" name="cardNumber" placeholder="1234 5678 9012 3456" value={cardDetails.cardNumber} onChange={handleCardInput} />
                </div>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input type="text" name="cardName" placeholder="John Doe" value={cardDetails.cardName} onChange={handleCardInput} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" name="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={handleCardInput} />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="text" name="cvv" placeholder="123" value={cardDetails.cvv} onChange={handleCardInput} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="order-summary-box">
            <h2>Order Summary</h2>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal</span><span>EGP {cartTotal.toFixed(2)}</span></div>
              {deliveryFee > 0 && <div className="summary-row"><span>Delivery Fee</span><span>EGP {deliveryFee.toFixed(2)}</span></div>}
            </div>
            <hr className="summary-divider" />
            <div className="summary-total"><span>Total</span><span>EGP {total.toFixed(2)}</span></div>
            <button className="continue-btn" disabled={!canContinue || isSubmitting} onClick={handleConfirmClick}>
              {isSubmitting ? "Placing Order..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </div>

      {/* Animated Review Modal */}
      {showReviewModal && (
        <OrderReviewModal
          cartItems={cartItems}
          deliveryMethod={deliveryMethod}
          cartTotal={cartTotal}
          deliveryFee={deliveryFee}
          total={total}
          onConfirm={handleFinalConfirm}
          onCancel={handleModalCancel}
          onTrackOrder={() => {
            const latestOrder = JSON.parse(localStorage.getItem("zw_user_orders") || "[]")[0];
            navigate("/home", {
              state: {
                trackingActive: true,
                orderNumber: latestOrder?.orderNumber || "ORD-2026-001",
                deliveryMethod,
                total,
                orderTime: latestOrder?.createdAt || new Date().toISOString(),
                offerId: cartItems[0]?.id || 1,
              },
            });
          }}
          isSubmitting={isSubmitting}
          businessPhone={cartItems[0]?.phone || "01234567890"}
        />
      )}
    </>
  );
}

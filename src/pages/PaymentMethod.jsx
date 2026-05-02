import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Banknote, ArrowLeft } from "lucide-react";
import "./PaymentMethod.css";

export default function PaymentMethodPage({ onBack, cartTotal = 21.00 }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const deliveryMethod = searchParams.get('method') || 'pickup';
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const deliveryFee = deliveryMethod === 'delivery' ? 25 : 0;
  const total = cartTotal + deliveryFee;

  const paymentMethods = deliveryMethod === 'delivery' ? [
    {
      id: "card",
      icon: <CreditCard size={24} color="#6b7280" />,
      title: "Card Payment",
      desc: "Pay securely with your credit or debit card",
    },
    {
      id: "cash",
      icon: <Banknote size={24} color="#6b7280" />,
      title: "Cash on Delivery",
      desc: "Pay with cash when your order is delivered",
    },
  ] : [
    {
      id: "card",
      icon: <CreditCard size={24} color="#6b7280" />,
      title: "Card Payment",
      desc: "Pay securely with your credit or debit card",
    },
    {
      id: "cash",
      icon: <Banknote size={24} color="#6b7280" />,
      title: "Cash on Pickup",
      desc: "Pay with cash when you collect your order",
    },
  ];

  const handleCardInput = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === "cardNumber") {
      formatted = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    }
    if (name === "expiry") {
      formatted = value.replace(/\D/g, "").slice(0, 4);
      if (formatted.length >= 2) formatted = formatted.slice(0, 2) + "/" + formatted.slice(2);
    }
    if (name === "cvv") {
      formatted = value.replace(/\D/g, "").slice(0, 3);
    }

    setCardDetails((prev) => ({ ...prev, [name]: formatted }));
  };

  const canContinue =
    selectedMethod === "cash" ||
    (selectedMethod === "card" &&
      cardDetails.cardNumber.length === 19 &&
      cardDetails.cardName &&
      cardDetails.expiry.length === 5 &&
      cardDetails.cvv.length === 3);

  const handleContinue = () => {
    // Navigate to order confirmation page
    navigate(`/order-confirmation?method=${deliveryMethod}&total=${cartTotal}`);
  };

  return (
    <div className="payment-container">
      {/* Header */}
      <div className="payment-header">
        <div className="payment-header-inner">
          <button className="payment-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            Back to Cart
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

        {/* Payment Methods */}
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

          {/* Card Form */}
          {selectedMethod === "card" && (
            <div className="card-form">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={handleCardInput}
                />
              </div>
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  name="cardName"
                  placeholder="John Doe"
                  value={cardDetails.cardName}
                  onChange={handleCardInput}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={handleCardInput}
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={handleCardInput}
                  />
                </div>
              </div>
            </div>
          )}
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
          </div>
          <hr className="summary-divider" />
          <div className="summary-total">
            <span>Total</span>
            <span>EGP {total.toFixed(2)}</span>
          </div>

          <button className="continue-btn" disabled={!canContinue} onClick={handleContinue}>
            Confirm Order
          </button>
        </div>

      </div>
    </div>
  );
}
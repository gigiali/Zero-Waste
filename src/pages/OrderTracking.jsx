import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Package, CheckCircle, Truck, User, Phone } from "lucide-react";
import "./OrderTracking.css";

export default function OrderTracking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deliveryMethod = searchParams.get('method') || 'pickup';
  const [currentStep, setCurrentStep] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    // Simulate order progress
    const timer = setTimeout(() => {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }, 3000);

    // Set estimated time based on delivery method
    setEstimatedTime(deliveryMethod === 'delivery' ? '30-45 minutes' : '15-20 minutes');

    return () => clearTimeout(timer);
  }, [currentStep, deliveryMethod]);

  const orderSteps = deliveryMethod === 'delivery' ? [
    { id: 1, title: 'Order Confirmed', desc: 'Your order has been received', icon: <CheckCircle size={20} />, completed: true },
    { id: 2, title: 'Preparing Order', desc: 'Restaurant is preparing your food', icon: <Package size={20} />, completed: currentStep >= 2 },
    { id: 3, title: 'On the Way', desc: 'Your order is being delivered', icon: <Truck size={20} />, completed: currentStep >= 3 },
    { id: 4, title: 'Delivered', desc: 'Order has been delivered', icon: <CheckCircle size={20} />, completed: currentStep >= 4 }
  ] : [
    { id: 1, title: 'Order Confirmed', desc: 'Your order has been received', icon: <CheckCircle size={20} />, completed: true },
    { id: 2, title: 'Preparing Order', desc: 'Restaurant is preparing your food', icon: <Package size={20} />, completed: currentStep >= 2 },
    { id: 3, title: 'Ready for Pickup', desc: 'Your order is ready to collect', icon: <CheckCircle size={20} />, completed: currentStep >= 3 },
    { id: 4, title: 'Picked Up', desc: 'Order has been collected', icon: <CheckCircle size={20} />, completed: currentStep >= 4 }
  ];

  return (
    <div className="tracking-container">
      {/* Header */}
      <div className="tracking-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="header-content">
          <h1>Track Your Order</h1>
          <p>Order #ORD-2026-001</p>
        </div>
      </div>

      {/* Content */}
      <div className="tracking-content">
        {/* Order Status */}
        <div className="status-card">
          <h2>Order Status</h2>
          <div className="status-timeline">
            {orderSteps.map((step, index) => (
              <div key={step.id} className={`timeline-item ${step.completed ? 'completed' : 'pending'}`}>
                <div className="timeline-marker">
                  <div className="timeline-icon">{step.icon}</div>
                  {index < orderSteps.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="timeline-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  {step.completed && <span className="completed-time">Just now</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="delivery-info-card">
          <h2>
            {deliveryMethod === 'delivery' ? 'Delivery Information' : 'Pickup Information'}
          </h2>
          <div className="info-grid">
            <div className="info-item">
              <MapPin size={20} />
              <div>
                <strong>
                  {deliveryMethod === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
                </strong>
                <p>
                  {deliveryMethod === 'delivery' 
                    ? '123 Main Street, Downtown Cairo, Egypt'
                    : 'Artisan Bakery, 45 Food Street, Cairo'
                  }
                </p>
              </div>
            </div>
            <div className="info-item">
              <Clock size={20} />
              <div>
                <strong>Estimated Time</strong>
                <p>{estimatedTime}</p>
              </div>
            </div>
            <div className="info-item">
              <User size={20} />
              <div>
                <strong>
                  {deliveryMethod === 'delivery' ? 'Delivery Partner' : 'Contact'}
                </strong>
                <p>
                  {deliveryMethod === 'delivery' 
                    ? 'Ahmed Mohamed (Delivery Partner)'
                    : 'Restaurant Staff'
                  }
                </p>
              </div>
            </div>
            <div className="info-item">
              <Phone size={20} />
              <div>
                <strong>Phone Number</strong>
                <p>+20 2 12345678</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-card">
          <h2>Order Summary</h2>
          <div className="summary-items">
            <div className="summary-item">
              <span>Fresh Baked Bread Bundle</span>
              <span>2x EGP 145.00</span>
            </div>
            <div className="summary-item">
              <span>Gourmet Salad Box</span>
              <span>1x EGP 165.00</span>
            </div>
          </div>
          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total</span>
            <span>EGP 455.00</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="contact-btn">
            <Phone size={20} />
            Contact Restaurant
          </button>
          <button className="home-btn" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

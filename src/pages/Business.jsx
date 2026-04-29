import React, { useState } from "react";
import Navigation from "../Components/Navigation";
import "./Business.css";

const Business = () => {
  const [showModal, setShowModal] = useState(false);
  const [offers, setOffers] = useState([
    {
      id: 1,
      title: "Fresh Bread & Pastries Box",
      description: "Assorted fresh bread and pastries from today",
      originalPrice: 15.99,
      discountPrice: 5.99,
      quantity: 8,
      expiresIn: "2h 30m",
      status: "Active",
    },
    {
      id: 2,
      title: "Croissant Bundle",
      description: "6 butter croissants",
      originalPrice: 12.0,
      discountPrice: 4.99,
      quantity: 0,
      expiresIn: "3h",
      status: "Expired",
    },
  ]);

  const [orders] = useState([
    {
      id: "ORD123",
      offer: "Fresh Bread Bundle",
      customer: "John Doe",
      amount: "$5.99",
      status: "Completed",
    },
    {
      id: "ORD124",
      offer: "Fresh Bread Bundle",
      customer: "John Doe",
      amount: "$5.99",
      status: "Completed",
    },
    {
      id: "ORD125",
      offer: "Fresh Bread Bundle",
      customer: "John Doe",
      amount: "$5.99",
      status: "Completed",
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    originalPrice: 0,
    discountPrice: 0,
    quantity: 0,
    expiresIn: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "originalPrice" || name === "discountPrice" || name === "quantity" || name === "expiresIn" ? parseFloat(value) : value,
    }));
  };

  const handleCreateOffer = () => {
    if (formData.title && formData.description) {
      const newOffer = {
        id: offers.length + 1,
        ...formData,
        status: "Active",
      };
      setOffers([...offers, newOffer]);
      setFormData({
        title: "",
        description: "",
        originalPrice: 0,
        discountPrice: 0,
        quantity: 0,
        expiresIn: 0,
      });
      setShowModal(false);
    }
  };

  const handleDeleteOffer = (id) => {
    setOffers(offers.filter((offer) => offer.id !== id));
  };

  return (
    <>
      <Navigation />

      <div className="business-container">

        {/* ── WELCOME SECTION ───────────────────────────────────────────── */}
        <div className="welcome-section">
          <div>
            <h1 className="welcome-title">Welcome back, Artisan Bakery! 👋</h1>
            <p className="welcome-subtitle">Manage your surplus food offers and reduce waste</p>
          </div>
          <div className="impact-card">
            <p className="impact-label">Your impact this month</p>
            <h2 className="impact-value">142 kg food saved</h2>
          </div>
        </div>

        {/* ── BUSINESS DASHBOARD ───────────────────────────────────────── */}
        <div className="dashboard-section">
          <div className="dashboard-header">
            <div>
              <h2 className="dashboard-title">Business Dashboard</h2>
              <p className="dashboard-subtitle">Manage your offers and track orders</p>
            </div>
            <button 
              className="btn-add-offer"
              onClick={() => setShowModal(true)}
            >
              + Add New Offer
            </button>
          </div>

          {/* ── DASHBOARD CARDS ───────────────────────────────────────── */}
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <p className="card-label">Active Offers</p>
              <h3 className="card-value">
                {offers.filter((o) => o.status === "Active").length}
              </h3>
              <div className="card-icon icon-green">📦</div>
            </div>

            <div className="dashboard-card">
              <p className="card-label">Total Orders</p>
              <h3 className="card-value">{orders.length}</h3>
              <div className="card-icon icon-blue">🛒</div>
            </div>

            <div className="dashboard-card">
              <p className="card-label">Today's Revenue</p>
              <h3 className="card-value">$287.50</h3>
              <div className="card-icon icon-orange">🎯</div>
            </div>
          </div>
        </div>

        {/* ── MY OFFERS ─────────────────────────────────────────────────── */}
        <div className="offers-section">
          <h2 className="section-title">My Offers</h2>

          {offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <div className="offer-header">
                <div>
                  <h3 className="offer-title">{offer.title}</h3>
                  <p className="offer-description">{offer.description}</p>
                </div>
                <span
                  className={`offer-status ${
                    offer.status === "Active" ? "status-active" : "status-expired"
                  }`}
                >
                  {offer.status === "Active" ? "✓" : "○"} {offer.status}
                </span>
              </div>

              <div className="offer-details">
                <div>
                  <span className="price-discount">${offer.discountPrice.toFixed(2)}</span>
                  <span className="price-original">${offer.originalPrice.toFixed(2)}</span>
                </div>
                <span className="quantity-text">Quantity: {offer.quantity}</span>
                <span className="expires-text">
                  ⏱ Expires in {offer.expiresIn}
                </span>
              </div>

              <div className="offer-actions">
                <button className="btn-edit">✏️ Edit</button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDeleteOffer(offer.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── RECENT ORDERS ─────────────────────────────────────────────── */}
        <div className="orders-section">
          <h2 className="section-title">Recent Orders</h2>

          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>OFFER</th>
                  <th>CUSTOMER</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="table-id">{order.id}</td>
                    <td>{order.offer}</td>
                    <td>{order.customer}</td>
                    <td className="table-amount">{order.amount}</td>
                    <td>
                      <span className="status-badge status-completed">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── ADD OFFER MODAL ────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Add New Offer</h2>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Fresh Bread Bundle"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Describe your offer..."
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Original Price</label>
                <div className="form-input-prefix">
                  $
                  <input
                    type="number"
                    name="originalPrice"
                    placeholder="0.00"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Discount Price</label>
                <div className="form-input-prefix">
                  $
                  <input
                    type="number"
                    name="discountPrice"
                    placeholder="0.00"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Expires In (hours)</label>
                <input
                  type="number"
                  name="expiresIn"
                  placeholder="0"
                  value={formData.expiresIn}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-create"
                onClick={handleCreateOffer}
              >
                Create Offer
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Business;
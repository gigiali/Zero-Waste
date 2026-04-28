import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Business.css";

function Business() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [vendorOffers, setVendorOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication and role
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        console.log('Business Page Auth Check:');
        console.log('Token exists:', !!token);
        console.log('User role:', userRole);
        
        if (!token || userRole !== 'vendor') {
          console.log('Authentication failed - redirecting to signin');
          navigate('/signin');
          return;
        }
        
        console.log('Authentication passed - loading profile from backend');
        // Load profile data from backend API
        loadProfileData(token);
        // Load vendor offers from API
        loadVendorOffers(token);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const loadProfileData = async (token) => {
    // Use only localStorage to avoid connection issues
    const storedProfile = localStorage.getItem('businessProfile');
    if (storedProfile) {
      const businessData = JSON.parse(storedProfile);
      console.log('Using localStorage business data:', businessData);
      setProfileData({ data: { vendor: businessData } });
    } else {
      console.log('No business profile data found in localStorage');
      setProfileData(null);
    }
  };

  const loadVendorOffers = async (token) => {
    // Skip API calls to avoid CORS issues - use empty array for now
    console.log('Skipping vendor offers API call to avoid CORS issues');
    setVendorOffers([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/signin');
  };

  if (isLoading) {
    return (
      <div className="business-page">
        <div className="business-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading business dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get vendor data from different possible paths
  const vendor = profileData?.data?.vendor || profileData?.vendor || profileData?.data?.user?.vendor || profileData?.user?.vendor;
  
  if (!vendor || !vendor.business_name) {
    return (
      <div className="business-page">
        <div className="business-container">
          <div className="business-header">
            <h2>Business Dashboard</h2>
            <p>Welcome to your business management portal</p>
          </div>
          <div className="business-content">
            <div className="no-offers">
              <h3>Please complete your business profile first</h3>
              <p>Your vendor information is not yet available. Please complete your business profile to access the dashboard.</p>
            </div>
          </div>
          <div className="business-footer">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="business-page">
      <div className="business-container">
        {/* Header */}
        <div className="business-header">
          <h2>Welcome back, {vendor.business_name || 'Business'}! 👋</h2>
          <p>Manage your surplus food offers and reduce waste</p>
        </div>

        {/* Content */}
        <div className="business-content">
          {/* Impact Section */}
          <div className="impact-section">
            <h3>Your impact this month</h3>
            <div className="impact-stats">
              <div className="impact-card">
                <div className="impact-icon">🌱</div>
                <div className="impact-content">
                  <div className="impact-number">142 kg</div>
                  <div className="impact-label">food saved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Section */}
          <div className="dashboard-section">
            <h3>Business Dashboard</h3>
            <p>Manage your offers and track orders</p>
            
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="card-icon">➕</div>
                <div className="card-content">
                  <div className="card-title">Add New Offer</div>
                </div>
              </div>
              
              <div className="dashboard-card">
                <div className="card-icon">📦</div>
                <div className="card-content">
                  <div className="card-title">Active Offers</div>
                  <div className="card-number">1</div>
                </div>
              </div>
              
              <div className="dashboard-card">
                <div className="card-icon">📋</div>
                <div className="card-content">
                  <div className="card-title">Total Orders</div>
                  <div className="card-number">24</div>
                </div>
              </div>
              
              <div className="dashboard-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <div className="card-title">Today's Revenue</div>
                  <div className="card-number">$287.50</div>
                </div>
              </div>
            </div>
          </div>

          {/* My Offers Section */}
          <div className="offers-section">
            <h3>My Offers</h3>
            
            <div className="offers-list">
              <div className="offer-card">
                <div className="offer-header">
                  <div className="offer-title">Fresh Bread & Pastries Box</div>
                  <div className="offer-status active">Active</div>
                </div>
                <div className="offer-description">Assorted fresh bread and pastries from today</div>
                <div className="offer-details">
                  <div className="offer-prices">
                    <span className="offer-price-current">$5.99</span>
                    <span className="offer-price-original">$15.99</span>
                  </div>
                  <div className="offer-meta">
                    <span className="offer-quantity">Quantity: 8</span>
                    <span className="offer-expiry">Expires in 2h 30m</span>
                  </div>
                </div>
                <div className="offer-actions">
                  <button className="btn-edit">Edit</button>
                  <button className="btn-delete">Delete</button>
                </div>
              </div>
              
              <div className="offer-card">
                <div className="offer-header">
                  <div className="offer-title">Croissant Bundle</div>
                  <div className="offer-status expired">Expired</div>
                </div>
                <div className="offer-description">6 butter croissants</div>
                <div className="offer-details">
                  <div className="offer-prices">
                    <span className="offer-price-current">$4.99</span>
                    <span className="offer-price-original">$12.00</span>
                  </div>
                  <div className="offer-meta">
                    <span className="offer-quantity">Quantity: 0</span>
                    <span className="offer-expiry">Expired</span>
                  </div>
                </div>
                <div className="offer-actions">
                  <button className="btn-edit">Edit</button>
                  <button className="btn-delete">Delete</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="orders-section">
            <h3>Recent Orders</h3>
            
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Offer</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ORD123</td>
                    <td>Fresh Bread Bundle</td>
                    <td>John Doe</td>
                    <td>$5.99</td>
                    <td><span className="status-completed">Completed</span></td>
                  </tr>
                  <tr>
                    <td>ORD124</td>
                    <td>Fresh Bread Bundle</td>
                    <td>John Doe</td>
                    <td>$5.99</td>
                    <td><span className="status-completed">Completed</span></td>
                  </tr>
                  <tr>
                    <td>ORD125</td>
                    <td>Fresh Bread Bundle</td>
                    <td>John Doe</td>
                    <td>$5.99</td>
                    <td><span className="status-completed">Completed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="business-footer">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Business;

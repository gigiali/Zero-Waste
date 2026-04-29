import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import "./SignUp.css";

function SignUp() {
  const [activeRole, setActiveRole] = useState("customer");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    accepted_terms: false,
    role: "customer"
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.accepted_terms) {
      newErrors.accepted_terms = "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Prepare form data for API
        const submitData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password,
          address: formData.address,
          phone: formData.phone,
          role: formData.role,
          accepted_terms: formData.accepted_terms
        };

        console.log("Submitting registration data:", submitData);

        // Make API call to backend
        const response = await fetch('https://stagnate-deferred-pork.ngrok-free.dev/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(submitData)
        });

        console.log('Response status:', response.status);
        
        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (response.ok) {
          // Success
          if (responseData.token) {
            localStorage.setItem('token', responseData.token);
          }
          
          // Store user data
          if (responseData.user) {
            localStorage.setItem('user', JSON.stringify(responseData.user));
            localStorage.setItem('userRole', responseData.user.role);
          }
          
          // Redirect based on role
          console.log('Checking redirect - formData.role:', formData.role);
          console.log('Checking redirect - activeRole:', activeRole);
          
          if (formData.role === 'vendor') {
            console.log('Redirecting vendor to business-setup');
            navigate('/business-setup'); // Vendor goes to Business Setup first
          } else {
            console.log('Redirecting customer to home');
            navigate('/home'); // Customer goes to home page
          }
        } else {
          // Handle errors
          if (response.status === 422) {
            // Validation errors
            if (responseData.errors) {
              const newErrors = {};
              Object.keys(responseData.errors).forEach(field => {
                newErrors[field] = responseData.errors[field][0];
              });
              setErrors(newErrors);
            } else {
              setErrors({ general: responseData.message || "Validation failed. Please check your inputs." });
            }
          } else {
            // Other errors
            setErrors({ general: responseData.message || "Registration failed. Please try again." });
          }
        }
        
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ general: "Registration failed. Please check your connection and try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setFormData(prev => ({ ...prev, role: role === "business" ? "vendor" : "customer" }));
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Green Header Section */}
        <div className="signup-header-section">
          <div className="header-content">
            <h2>Create Account</h2>
            <p>{activeRole === "business" ? "List your business and connect with customers" : "Join our community today"}</p>
          </div>
        </div>

        {/* White Form Section */}
        <div className="signup-form-section">
          {/* Form */}
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="form-input"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a strong password"
                className="form-input"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                placeholder="Enter your address"
                className="form-input"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            {/* I am a Section */}
            <div className="role-selection">
              <h3 className="role-selection-title">I am a</h3>
              <div className="role-buttons">
                <button 
                  type="button" // Fix: Add type="button" to prevent form submission
                  className={`role-select-btn ${activeRole === "business" ? "active-business" : ""}`}
                  onClick={() => handleRoleChange("business")}
                >
                  Business
                </button>
                <button 
                  type="button" // Fix: Add type="button" to prevent form submission
                  className={`role-select-btn ${activeRole === "customer" ? "active-customer" : ""}`}
                  onClick={() => handleRoleChange("customer")}
                >
                  Customer
                </button>
              </div>
            </div>

            {/* Terms & Policy - last before Create Account */}
            <div className="form-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={formData.accepted_terms}
                  onChange={(e) => handleInputChange("accepted_terms", e.target.checked)}
                />
                <span>
                  I agree to <a href="/terms" className="terms-link">Terms of Service</a> and <a href="/privacy" className="privacy-link">Privacy Policy</a>
                </span>
              </label>
            </div>
            {errors.accepted_terms && <span className="error-text">{errors.accepted_terms}</span>}
            
            {/* General Error Display */}
            {errors.general && <div className="general-error">{errors.general}</div>}

            <Button text={isLoading ? "Creating Account..." : "Create Account"} variant="success" className="signup-btn" disabled={isLoading} />

          </form>

          <div className="signin-prompt">
            Already have an account? <a href="/signin">Sign In</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

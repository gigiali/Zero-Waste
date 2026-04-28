import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Components/Button";
import "./SignIn.css";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare form data for API
      const submitData = {
        email: email,
        password: password
      };

      console.log("Submitting login data:", submitData);

      // Make API call to backend
      const response = await fetch('https://stagnate-deferred-pork.ngrok-free.dev/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(submitData).toString()
      });

      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        console.log('Login successful:', responseData);
        
        // Save ONLY token and role in localStorage
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('userRole', responseData.user.role);
        
        // Redirect based on role
        if (responseData.user.role === 'vendor') {
          navigate('/business');
        } else if (responseData.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // Handle errors
        if (response.status === 401) {
          setErrors({ general: "Invalid email or password. Please try again." });
        } else if (response.status === 403) {
          setErrors({ general: "Access denied. Please contact support." });
        } else {
          setErrors({ general: responseData.message || "Login failed. Please try again." });
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: "Login failed. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        {/* Title */}
        <div className="signin-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        {/* Form */}
        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          {/* General Error Display */}
          {errors.general && <div className="general-error">{errors.general}</div>}

          <Button text={isLoading ? "Signing In..." : "Sign In"} variant="success" className="signin-btn" disabled={isLoading} />

        </form>

        <div className="signup-prompt">
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
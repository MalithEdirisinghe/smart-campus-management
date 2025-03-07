import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import campusLogo from '../../assets/campus-logo.png';

// Font loader component for Abhaya Libre font
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  return null;
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!adminId.trim()) {
      newErrors.adminId = 'Admin/Lecturer ID is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // API call to authenticate admin
        const response = await fetch('http://localhost:8080/api/auth/admin/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email, 
            adminId, 
            password 
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Authentication failed');
        }
        
        // Store authentication data
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          adminId: data.adminId
        }));
        
        // Navigate based on role
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.role === 'lecturer') {
          navigate('/lecturer/dashboard');
        }
      } catch (error) {
        setErrors({
          ...errors,
          form: error.message
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <FontLoader />
      <div className="admin-login-container">
        <div className="admin-login-left-panel">
          <div className="logo-container">
            <img src={campusLogo} alt="Campus Logo" className="campus-logo" />
            <h1 className="system-title">
              Imperial Campus
              <br />
              Management
              <br />
              System
            </h1>
          </div>
        </div>
        
        <div className="admin-login-right-panel">
          <div className="admin-login-form-container">
            <h2 className="admin-login-heading">Login Form</h2>
            
            <form onSubmit={handleSubmit} className="admin-login-form">
              {errors.form && <div className="form-error">{errors.form}</div>}
              
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  disabled={isLoading}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Admin / Lecturer ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className={`form-input ${errors.adminId ? 'input-error' : ''}`}
                  disabled={isLoading}
                />
                {errors.adminId && <span className="error-message">{errors.adminId}</span>}
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  disabled={isLoading}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              
              <div className="forgot-password">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              
              <button 
                type="submit" 
                className="admin-login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              
              {/* Add this if you want to show default credentials for testing */}
              <div className="default-credentials">
                <p>Default admin credentials:</p>
                <p>Email: admin@imperial.edu</p>
                <p>Admin ID: ADMIN001</p>
                <p>Password: admin123</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;

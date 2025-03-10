import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import campusLogo from '../../assets/campus-logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store authentication data in localStorage
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        studentId: data.studentId
      }));

      // Navigate based on user role
      if (data.role === 'student') {
        navigate('/student/profile');
      } else if (data.role === 'admin') {
        alert("This account is admin account. So please switch the user");
      } else if (data.role === 'lecturer') {
        alert("This account is lecture account. So please switch the user");
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchUser = () => {
    navigate('/admin/login');
  };

  return (
    <div className="login-container">
      <div className="login-left-panel">
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
      
      <div className="login-right-panel">
        <div className="login-form-container">
          <h2 className="login-heading">Login Form</h2>
          
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message login-error">{error}</div>}
            
            <div className="form-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                disabled={isLoading}
              />
            </div>
            
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="register-link">
              Don't have an account? <Link to="/register">Register</Link>
            </div>
          </form>
          
          <div className="switch-user">
            <button 
              className="switch-user-button" 
              onClick={handleSwitchUser}
              disabled={isLoading}
            >
              <span className="user-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              Switch User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
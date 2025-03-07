import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StudentSignup.css';
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

const StudentSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
    department: '',
    batch: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([
    { id: 'COM', name: 'Computing' },
    { id: 'BUS', name: 'Business' },
    { id: 'ENG', name: 'Engineering' }
  ]);
  
  const [batches, setBatches] = useState({
    'COM': [{ id: 'COM12', name: 'COM12 (2022-2026)' }, { id: 'COM13', name: 'COM13 (2023-2027)' }],
    'BUS': [{ id: 'BUS10', name: 'BUS10 (2022-2026)' }, { id: 'BUS11', name: 'BUS11 (2023-2027)' }],
    'ENG': [{ id: 'ENG15', name: 'ENG15 (2022-2026)' }, { id: 'ENG16', name: 'ENG16 (2023-2027)' }]
  });
  
  const [availableBatches, setAvailableBatches] = useState([]);

  useEffect(() => {
    // When department changes, update available batches
    if (formData.department) {
      setAvailableBatches(batches[formData.department] || []);
      
      // Reset batch selection if changing department
      if (!batches[formData.department]?.some(b => b.id === formData.batch)) {
        setFormData(prev => ({
          ...prev,
          batch: ''
        }));
      }
    } else {
      setAvailableBatches([]);
    }
  }, [formData.department]);

  // Load departments and batches from API (commented out for now)
  /*
  useEffect(() => {
    const fetchDepartmentsAndBatches = async () => {
      try {
        // Fetch departments
        const deptResponse = await fetch('http://localhost:8080/api/departments');
        const departmentsData = await deptResponse.json();
        setDepartments(departmentsData);
        
        // Fetch batches
        const batchResponse = await fetch('http://localhost:8080/api/batches');
        const batchesData = await batchResponse.json();
        
        // Organize batches by department
        const batchesByDept = {};
        batchesData.forEach(batch => {
          if (!batchesByDept[batch.departmentId]) {
            batchesByDept[batch.departmentId] = [];
          }
          batchesByDept[batch.departmentId].push(batch);
        });
        
        setBatches(batchesByDept);
      } catch (error) {
        console.error('Error fetching departments and batches:', error);
      }
    };
    
    fetchDepartmentsAndBatches();
  }, []);
  */
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate student ID
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate department selection
    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }
    
    // Validate batch selection
    if (!formData.batch) {
      newErrors.batch = 'Please select a batch';
    }

    setErrors(newErrors);

    // Return true if there are no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Set loading state
        setIsLoading(true);

        // Prepare the data for the API
        const registrationData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          studentId: formData.studentId,
          password: formData.password,
          department: formData.department,
          batch: formData.batch
        };

        // Send registration request to the backend
        const response = await fetch('http://localhost:8080/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData)
        });

        const data = await response.json();

        if (!response.ok) {
          console.log('JSON: ', registrationData);
          throw new Error(data.message || 'Registration failed');
        }

        // Registration successful
        alert('Registration successful! You can now login.');
        navigate('/login');
      } catch (error) {
        // Handle errors
        setErrors({
          ...errors,
          form: error.message
        });
      } finally {
        // Clear loading state
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <FontLoader />
      <div className="signup-container">
        <div className="signup-left-panel">
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

        <div className="signup-right-panel">
          <div className="signup-form-container">
            <h2 className="signup-heading">Registration Form</h2>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="studentId"
                  placeholder="Student ID"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={`form-input ${errors.studentId ? 'input-error' : ''}`}
                />
                {errors.studentId && <span className="error-message">{errors.studentId}</span>}
              </div>
              
              <div className="form-group">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`form-input ${errors.department ? 'input-error' : ''}`}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.department && <span className="error-message">{errors.department}</span>}
              </div>
              
              <div className="form-group">
                <select
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  className={`form-input ${errors.batch ? 'input-error' : ''}`}
                  disabled={!formData.department}
                >
                  <option value="">Select Batch</option>
                  {availableBatches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
                {errors.batch && <span className="error-message">{errors.batch}</span>}
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              {errors.form && <div className="form-error">{errors.form}</div>}

              <button
                type="submit"
                className="signup-button"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>

              <div className="login-link">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentSignup;
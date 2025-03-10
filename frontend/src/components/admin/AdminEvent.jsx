import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminEvent.css'; // You'll need to create this CSS file
import defaultProfileImage from '../../assets/default-profile.png';

const AdminEvent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    timeAMPM: 'AM',
    location: '',
    venue: '',
    description: '',
    targetAudience: {
      student: true,
      lecturer: true,
      admin: false
    },
    sendNotifications: {
      student: true,
      lecturer: true,
      admin: false
    }
  });

  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);

        // Get auth token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Use cached user data if available
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');

        // Fetch admin profile data
        const response = await fetch('http://localhost:8080/api/admin/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-access-token': token
          }
        });

        if (!response.ok) {
          // If API request fails but we have cached data, use that temporarily
          if (cachedUser && cachedUser.role === 'admin') {
            setAdmin({
              firstName: cachedUser.firstName || '',
              lastName: cachedUser.lastName || '',
              adminId: cachedUser.adminId || '',
              role: 'Admin',
              department: cachedUser.department || 'Computing',
              profileImage: null
            });

            setIsLoading(false);
            return;
          }

          // Handle HTTP errors if no cached data
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const adminData = await response.json();

        // Set admin profile data
        setAdmin({
          firstName: adminData.firstName || '',
          lastName: adminData.lastName || '',
          adminId: adminData.adminId || '',
          role: adminData.role || 'Admin',
          department: adminData.department || '',
          profileImage: adminData.profileImage || null
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setIsLoading(false);

        // If unauthorized, redirect to login
        if (error.message.includes('401') || error.message.includes('Authentication')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin/login');
        }
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (group, type) => {
    setFormData({
      ...formData,
      [group]: {
        ...formData[group],
        [type]: !formData[group][type]
      }
    });
  };

  const handleTimeAMPMChange = (value) => {
    setFormData({
      ...formData,
      timeAMPM: value
    });
  };

  const handleDiscard = () => {
    // Clear form data
    setFormData({
      name: '',
      date: '',
      time: '',
      timeAMPM: 'AM',
      location: '',
      venue: '',
      description: '',
      targetAudience: {
        student: true,
        lecturer: true,
        admin: false
      },
      sendNotifications: {
        student: true,
        lecturer: true,
        admin: false
      }
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare data for API
      const eventData = {
        name: formData.name,
        date: formData.date,
        time: `${formData.time} ${formData.timeAMPM}`,
        location: formData.location,
        venue: formData.venue,
        description: formData.description,
        targetAudience: Object.keys(formData.targetAudience).filter(key => formData.targetAudience[key]),
        sendNotifications: Object.keys(formData.sendNotifications).filter(key => formData.sendNotifications[key])
      };
      
      // Send event/announcement to the API
      const response = await fetch('http://localhost:8080/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      
      // Success
      alert('Event/Announcement created successfully!');
      
      // Clear form
      handleDiscard();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating event/announcement:', error);
      setIsLoading(false);
      alert(`Failed to create event/announcement: ${error.message}`);
    }
  };

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-event-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="profile-summary">
          <div className="profile-image-container">
            {admin.profileImage ? (
              <img
                src={admin.profileImage}
                alt="Profile"
                className="profile-image"
                onError={(e) => {
                  console.error("Error loading profile image");
                  e.target.onerror = null;
                  e.target.src = defaultProfileImage;
                }}
              />
            ) : (
              <img
                src={defaultProfileImage}
                alt="Default Profile"
                className="profile-image"
              />
            )}
          </div>
          <div className="profile-info">
            <div className="role">{admin.role}</div>
            <div className="name">{admin.firstName} {admin.lastName}</div>
            <div className="id-display">ID: {admin.adminId}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li onClick={() => handleNavigate('/admin/dashboard')}>Dashboard</li>
            <li onClick={() => handleNavigate('/admin/users')}>Users</li>
            <li className="active" onClick={() => handleNavigate('/admin/events')}>Events/Announcements</li>
            <li onClick={() => handleNavigate('/admin/resources')}>Resources</li>
            <li onClick={() => handleNavigate('/admin/communication')}>Communication</li>
            <li onClick={() => handleNavigate('/admin/reports')}>Reports</li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <div className="notification-icons">
            <div className="notification-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div
              className="profile-icon"
              onClick={() => handleNavigate('/admin/profile')}
              style={{ cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>

        <div className="event-content">
          <h1 className="page-title">Create an Event/Announcement</h1>

          <div className="event-form">
            <div className="form-group">
              <label>Target User Audience:</label>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="target-student"
                    checked={formData.targetAudience.student}
                    onChange={() => handleCheckboxChange('targetAudience', 'student')}
                  />
                  <label htmlFor="target-student">Student</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="target-lecturer"
                    checked={formData.targetAudience.lecturer}
                    onChange={() => handleCheckboxChange('targetAudience', 'lecturer')}
                  />
                  <label htmlFor="target-lecturer">Lecturer</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="target-admin"
                    checked={formData.targetAudience.admin}
                    onChange={() => handleCheckboxChange('targetAudience', 'admin')}
                  />
                  <label htmlFor="target-admin">Admin</label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Send Notifications To:</label>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="notify-student"
                    checked={formData.sendNotifications.student}
                    onChange={() => handleCheckboxChange('sendNotifications', 'student')}
                  />
                  <label htmlFor="notify-student">Student</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="notify-lecturer"
                    checked={formData.sendNotifications.lecturer}
                    onChange={() => handleCheckboxChange('sendNotifications', 'lecturer')}
                  />
                  <label htmlFor="notify-lecturer">Lecturer</label>
                </div>
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="notify-admin"
                    checked={formData.sendNotifications.admin}
                    onChange={() => handleCheckboxChange('sendNotifications', 'admin')}
                  />
                  <label htmlFor="notify-admin">Admin</label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="event-name">Event/Announcement Name</label>
              <input
                type="text"
                id="event-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="event-date">Date</label>
                <div className="date-input-container">
                  <input
                    type="date"
                    id="event-date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                  <div className="calendar-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="form-group half">
                <label htmlFor="event-time">Time</label>
                <div className="time-input-container">
                  <input
                    type="time"
                    id="event-time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                  <div className="ampm-dropdown">
                    <select
                      value={formData.timeAMPM}
                      onChange={(e) => handleTimeAMPMChange(e.target.value)}
                      className="ampm-select"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                    <div className="dropdown-arrow">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="event-location">Location</label>
              <input
                type="text"
                id="event-location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-venue">Venue</label>
              <input
                type="text"
                id="event-venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-description">Description</label>
              <textarea
                id="event-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control textarea"
                rows="5"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-discard" onClick={handleDiscard}>
                Discard
              </button>
              <button type="button" className="btn-send" onClick={handleSubmit}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEvent;
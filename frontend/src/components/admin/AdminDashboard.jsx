import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import defaultProfileImage from '../../assets/default-profile.png';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedModule, setSelectedModule] = useState('Networking');
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [resourceUsage, setResourceUsage] = useState({
    classrooms: { available: 16, total: 35 },
    computers: { available: 32, total: 68 },
    tablets: { available: 11, total: 20 },
    projectors: { available: 4, total: 8 }
  });
  const [attendanceData, setAttendanceData] = useState({
    attended: 16,
    total: 35
  });

  useEffect(() => {
    // Simulate fetching admin data
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be an API call
        // For now, we'll simulate loading data
        setTimeout(() => {
          setAdmin({
            firstName: 'Ranuga',
            lastName: 'Wijethunga',
            adminId: 'A001',
            role: 'Admin',
            department: 'Computing',
            profileImage: null
          });
          
          // Mock event data
          setOngoingEvents([
            {
              name: 'Hackathon 2025',
              date: '03/03/2025',
              time: '9.00 A.M',
              location: 'Colombo',
              venue: 'Campus premises',
              description: 'The Hackathon bringing together innovative minds to solve real-world campus challenges. Get ready for a competitive yet fun experience where innovation meets practicality!'
            }
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setIsLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    // Make sure we have a valid Date object
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }
    
    // Format as MM/DD/YYYY
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="profile-summary">
          <div className="profile-image-container">
            {admin.profileImage ? (
              <img
                src={admin.profileImage}
                alt="Profile"
                className="profile-image"
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
            <li className="active" onClick={() => handleNavigate('/admin/dashboard')}>Dashboard</li>
            <li onClick={() => handleNavigate('/admin/users')}>Users</li>
            <li onClick={() => handleNavigate('/admin/events')}>Events/Announcements</li>
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
            <div className="profile-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Ongoing Events Section */}
          <section className="dashboard-section">
            <h2 className="section-title">Ongoing Events</h2>
            <div className="section-header">
              <div className="sort-container">
                <label>Sort by:</label>
                <select className="sort-select">
                  <option>Latest</option>
                  <option>Oldest</option>
                  <option>Alphabetical</option>
                </select>
              </div>
              <div className="navigation-buttons">
                <button className="nav-button prev-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button className="nav-button next-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
            
            {ongoingEvents.length > 0 ? (
              <div className="events-container">
                {ongoingEvents.map((event, index) => (
                  <div key={index} className="event-card">
                    <div className="event-details">
                      <p><strong>Name:</strong> {event.name}</p>
                      <p><strong>Date:</strong> {event.date}</p>
                      <p><strong>Time:</strong> {event.time}</p>
                      <p><strong>Location:</strong> {event.location}</p>
                      <p><strong>Venue:</strong> {event.venue}</p>
                      <p><strong>Description:</strong></p>
                      <p className="event-description">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-events">No ongoing events at this time.</div>
            )}
          </section>

          {/* Resource Usage Section */}
          <section className="dashboard-section">
            <h2 className="section-title">Resource Usage</h2>
            <div className="resource-cards">
              <div className="resource-card">
                <div className="resource-info">
                  <h3>Classrooms</h3>
                  <p>{resourceUsage.classrooms.available}/{resourceUsage.classrooms.total} Available</p>
                </div>
                <button className="resource-options-btn">
                  <MoreVertIcon />
                </button>
              </div>
              
              <div className="resource-card">
                <div className="resource-info">
                  <h3>Computers</h3>
                  <p>{resourceUsage.computers.available}/{resourceUsage.computers.total} Available</p>
                </div>
                <button className="resource-options-btn">
                  <MoreVertIcon />
                </button>
              </div>
              
              <div className="resource-card">
                <div className="resource-info">
                  <h3>Tablets</h3>
                  <p>{resourceUsage.tablets.available}/{resourceUsage.tablets.total} Available</p>
                </div>
                <button className="resource-options-btn">
                  <MoreVertIcon />
                </button>
              </div>
              
              <div className="resource-card">
                <div className="resource-info">
                  <h3>Projectors</h3>
                  <p>{resourceUsage.projectors.available}/{resourceUsage.projectors.total} Available</p>
                </div>
                <button className="resource-options-btn">
                  <MoreVertIcon />
                </button>
              </div>
            </div>
          </section>

          {/* Attendance Section */}
          <section className="dashboard-section">
            <h2 className="section-title">Attendance</h2>
            
            <div className="attendance-filters">
              <div className="date-filter">
                <label>Date</label>
                <div className="date-input-container">
                  <input
                    type="text"
                    value={formatDate(selectedDate)}
                    readOnly
                    className="date-input"
                  />
                  <button className="calendar-button">
                    <CalendarTodayIcon />
                  </button>
                </div>
              </div>
              
              <div className="module-filter">
                <label>Select Module:</label>
                <select 
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="module-select"
                >
                  <option value="Networking">Networking</option>
                  <option value="Database">Database</option>
                  <option value="Programming">Programming</option>
                  <option value="WebDevelopment">Web Development</option>
                </select>
              </div>
            </div>
            
            <div className="attendance-summary">
              <div className="attendance-card">
                <h3>Students</h3>
                <p>{attendanceData.attended}/{attendanceData.total} Attended</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminReport.css';
import defaultProfileImage from '../../assets/default-profile.png';

const AdminReport = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  // State for student report section
  const [studentIdSearch, setStudentIdSearch] = useState('');
  const [studentReports, setStudentReports] = useState([]);
  const [filteredStudentReports, setFilteredStudentReports] = useState([]);

  // State for lecturer report section
  const [lecturerIdSearch, setLecturerIdSearch] = useState('');
  const [lecturerReports, setLecturerReports] = useState([]);
  const [filteredLecturerReports, setFilteredLecturerReports] = useState([]);

  // Fetch admin profile and report data when component mounts
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);

        // Get auth token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Try to get cached user data first
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
              firstName: cachedUser.firstName || 'Ranuga',
              lastName: cachedUser.lastName || 'Wijethunga',
              adminId: cachedUser.adminId || 'A001',
              role: 'Admin',
              department: cachedUser.department || 'Computing',
              profileImage: null
            });

            // Load mock data for demonstration
            // loadMockData();
            setIsLoading(false);
            return;
          }

          // Handle HTTP errors if no cached data
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const adminData = await response.json();
        console.log("Received admin profile data:", adminData);

        // Set admin profile data
        setAdmin({
          firstName: adminData.firstName || '',
          lastName: adminData.lastName || '',
          adminId: adminData.adminId || '',
          role: adminData.role || 'Admin',
          department: adminData.department || '',
          profileImage: adminData.profileImage || null
        });

        // Fetch report data
        await fetchReportData(token);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching admin data:', error);

        // Load mock data as fallback
        // loadMockData();
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

  // Function to fetch report data from API
  const fetchReportData = async (token) => {
    try {
      // Fetch student reports
      const studentResponse = await fetch('http://localhost:8080/api/admin/reports/students', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        }
      });

      if (!studentResponse.ok) {
        throw new Error('Failed to fetch student reports');
      }

      const studentData = await studentResponse.json();
      setStudentReports(studentData);
      setFilteredStudentReports(studentData);

      // Fetch lecturer reports
      const lecturerResponse = await fetch('http://localhost:8080/api/admin/reports/lecturers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        }
      });

      if (!lecturerResponse.ok) {
        throw new Error('Failed to fetch lecturer reports');
      }

      const lecturerData = await lecturerResponse.json();
      setLecturerReports(lecturerData);
      setFilteredLecturerReports(lecturerData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Load mock data if API fails
      // loadMockData();
    }
  };

  // Handle student ID search
  const handleStudentIdSearch = (e) => {
    const searchTerm = e.target.value;
    setStudentIdSearch(searchTerm);

    if (searchTerm.trim() === '') {
      setFilteredStudentReports(studentReports);
    } else {
      const filtered = studentReports.filter(report =>
        report.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudentReports(filtered);
    }
  };

  // Handle lecturer ID search
  const handleLecturerIdSearch = (e) => {
    const searchTerm = e.target.value;
    setLecturerIdSearch(searchTerm);

    if (searchTerm.trim() === '') {
      setFilteredLecturerReports(lecturerReports);
    } else {
      const filtered = lecturerReports.filter(report =>
        report.lecturerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLecturerReports(filtered);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="admin-report-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="profile-summary">
          <div className="profile-image-container">
            {admin?.profileImage ? (
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
            <div className="role">{admin?.role}</div>
            <div className="name">{admin?.firstName} {admin?.lastName}</div>
            <div className="id-display">ID: {admin?.adminId}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li onClick={() => handleNavigate('/admin/dashboard')}>Dashboard</li>
            <li onClick={() => handleNavigate('/admin/users')}>Users</li>
            <li onClick={() => handleNavigate('/admin/events')}>Events/Announcements</li>
            <li onClick={() => handleNavigate('/admin/resources')}>Resources</li>
            <li onClick={() => handleNavigate('/admin/communication')}>Communication</li>
            <li className="active" onClick={() => handleNavigate('/admin/reports')}>Reports</li>
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>

        <div className="report-content">
          {/* Student Reports Section */}
          <section className="student-reports-section">
            <h2 className="section-title">Student Reports</h2>

            <div className="search-container">
              <label htmlFor="student-search">User ID:</label>
              <div className="search-input-wrapper">
                <input
                  id="student-search"
                  type="text"
                  placeholder="S001"
                  value={studentIdSearch}
                  onChange={handleStudentIdSearch}
                  className="search-input"
                />
                <span className="search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
              </div>
            </div>

            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Batch No.</th>
                    <th>Module</th>
                    <th>Results</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentReports && filteredStudentReports.length > 0 ? (
                    filteredStudentReports.map((report, index) => (
                      <tr key={index}>
                        <td>{report.studentName || "N/A"}</td>
                        <td>{report.batchNo || "N/A"}</td>
                        <td>{report.module || "N/A"}</td>
                        <td>{report.results || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data-message">No student reports found</td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </section>

          {/* Lecturer Reports Section */}
          <section className="lecturer-reports-section">
            <h2 className="section-title">Lecturer Reports</h2>

            <div className="search-container">
              <label htmlFor="lecturer-search">User ID:</label>
              <div className="search-input-wrapper">
                <input
                  id="lecturer-search"
                  type="text"
                  placeholder="L001"
                  value={lecturerIdSearch}
                  onChange={handleLecturerIdSearch}
                  className="search-input"
                />
                <span className="search-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
              </div>
            </div>

            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Lecturer Name</th>
                    <th>Batch No.</th>
                    <th>Module</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLecturerReports && filteredLecturerReports.length > 0 ? (
                    filteredLecturerReports.map((report, index) => (
                      <tr key={index}>
                        <td>{report.lecturerName || "N/A"}</td>
                        <td>{report.batchNo || "N/A"}</td>
                        <td>{report.module || "N/A"}</td>
                        <td>{report.startDate ? new Date(report.startDate).toLocaleDateString() : "N/A"}</td>
                        <td>{report.endDate ? new Date(report.endDate).toLocaleDateString() : "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data-message">No lecturer reports found</td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminReport;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LecturerMyClasses.css';
import defaultProfileImage from '../../assets/default-profile.png';

const LecturerMyClasses = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lecturer, setLecturer] = useState(null);
  const [selectedModule, setSelectedModule] = useState('Networking');
  const [selectedBatch, setSelectedBatch] = useState('COM12');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Mock data for classes
  const [classData, setClassData] = useState([
    {
      batch: 'COM12',
      startDate: '11/01/2024',
      endDate: '02/02/2025',
      classroom: 'C05'
    },
    {
      batch: 'COM07',
      startDate: '09/14/2024',
      endDate: '12/31/2025',
      classroom: 'C13'
    },
    {
      batch: 'COM13',
      startDate: '02/16/2025',
      endDate: '-',
      classroom: 'C04'
    }
  ]);

  // Mock data for attendance
  const [attendanceData, setAttendanceData] = useState([
    {
      studentId: 'S001',
      firstName: 'Kavindu',
      lastName: 'Perera',
      date: '02/22/2025',
      attendance: 'Yes',
      classroom: 'C05'
    },
    {
      studentId: 'S002',
      firstName: 'Chathura',
      lastName: 'Lakshan',
      date: '02/22/2025',
      attendance: 'No',
      classroom: 'C13'
    },
    {
      studentId: 'S003',
      firstName: 'Mohammed',
      lastName: 'Shazi',
      date: '02/22/2025',
      attendance: 'Yes',
      classroom: 'C04'
    }
  ]);

  // Available modules
  const modules = ['Networking', 'Database Management', 'Programming'];
  
  // Available batches
  const batches = ['COM12', 'COM07', 'COM13'];

  useEffect(() => {
    // Handle clicks outside the date picker to close it
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [datePickerRef]);

  useEffect(() => {
    const fetchLecturerData = async () => {
      try {
        setIsLoading(true);

        // Get auth token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Use cached user data if available
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');

        // In a real app, fetch lecturer profile from API
        // For now, use mock data or cached user data
        if (cachedUser && cachedUser.role === 'lecturer') {
          setLecturer({
            firstName: cachedUser.firstName || 'Jon',
            lastName: cachedUser.lastName || 'Smith',
            lecturerId: cachedUser.lecturerId || 'L001',
            role: 'Lecturer',
            department: cachedUser.department || 'Computing',
            profileImage: cachedUser.profileImage || null
          });
        } else {
          // Mock lecturer data
          setLecturer({
            firstName: 'Jon',
            lastName: 'Smith',
            lecturerId: 'L001',
            role: 'Lecturer',
            department: 'Computing',
            profileImage: null
          });
        }

        // Fetch class data from API (implement when API is ready)
        // For now, use mock data defined above

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching lecturer data:', error);
        setIsLoading(false);

        // If unauthorized, redirect to login
        if (error.message.includes('401') || error.message.includes('Authentication')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/admin/login');
        }
      }
    };

    fetchLecturerData();
  }, [navigate]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleModuleChange = (e) => {
    setSelectedModule(e.target.value);
  };

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Get date in YYYY-MM-DD format for input[type="date"]
  const getISODate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  // View, Add, Edit, Delete, Save handlers for class management
  const handleViewClass = () => {
    console.log('View class clicked');
  };

  const handleAddClass = () => {
    console.log('Add class clicked');
  };

  const handleEditClass = () => {
    console.log('Edit class clicked');
  };

  const handleDeleteClass = () => {
    console.log('Delete class clicked');
  };

  const handleSaveClass = () => {
    console.log('Save class clicked');
  };

  // View, Add, Edit, Delete, Save handlers for attendance
  const handleViewAttendance = () => {
    console.log('View attendance clicked');
  };

  const handleAddAttendance = () => {
    console.log('Add attendance clicked');
  };

  const handleEditAttendance = () => {
    console.log('Edit attendance clicked');
  };

  const handleDeleteAttendance = () => {
    console.log('Delete attendance clicked');
  };

  const handleSaveAttendance = () => {
    console.log('Save attendance clicked');
  };

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading class data...</p>
      </div>
    );
  }

  return (
    <div className="lecturer-classes-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="profile-summary">
          <div className="profile-image-container">
            {lecturer.profileImage ? (
              <img
                src={lecturer.profileImage}
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
            <div className="role">{lecturer.role}</div>
            <div className="name">{lecturer.firstName} {lecturer.lastName}</div>
            <div className="id-display">ID: {lecturer.lecturerId}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className="active" onClick={() => handleNavigate('/lecturer/classes')}>My Classes</li>
            <li onClick={() => handleNavigate('/lecturer/students')}>Student Management</li>
            <li onClick={() => handleNavigate('/lecturer/events')}>Events/Announcements</li>
            <li onClick={() => handleNavigate('/lecturer/assignments')}>Assignments</li>
            <li onClick={() => handleNavigate('/lecturer/resources')}>Resources</li>
            <li onClick={() => handleNavigate('/lecturer/communication')}>Communication</li>
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
              onClick={() => handleNavigate('/lecturer/profile')}
              style={{ cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>

        <div className="class-management-content">
          {/* Class Management Section */}
          <section className="class-management-section">
            <h1 className="section-title">Class Management</h1>
            
            <div className="module-selection">
              <label>Select Module:</label>
              <select 
                value={selectedModule} 
                onChange={handleModuleChange}
                className="module-select"
              >
                {modules.map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>
            
            <div className="action-buttons">
              <button className="action-button" onClick={handleViewClass}>View</button>
              <button className="action-button" onClick={handleAddClass}>Add</button>
              <button className="action-button" onClick={handleEditClass}>Edit</button>
              <button className="action-button" onClick={handleDeleteClass}>Delete</button>
              <button className="action-button" onClick={handleSaveClass}>Save</button>
            </div>
            
            {/* Class Table */}
            <div className="class-table-container">
              <table className="class-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Classroom</th>
                  </tr>
                </thead>
                <tbody>
                  {classData.map((classItem, index) => (
                    <tr key={`class-${index}`}>
                      <td>{classItem.batch}</td>
                      <td>{classItem.startDate}</td>
                      <td>{classItem.endDate}</td>
                      <td>{classItem.classroom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          
          {/* Class Attendance Section */}
          <section className="class-attendance-section">
            <h1 className="section-title">Class Attendance</h1>
            
            <div className="attendance-filters">
              <div className="filter-group">
                <label>Select Module:</label>
                <select 
                  value={selectedModule} 
                  onChange={handleModuleChange}
                  className="module-select"
                >
                  {modules.map(module => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Select Batch:</label>
                <select 
                  value={selectedBatch} 
                  onChange={handleBatchChange}
                  className="batch-select"
                >
                  {batches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Select date:</label>
                <div className="date-picker-wrapper">
                  <input
                    type="date"
                    value={getISODate(selectedDate)}
                    onChange={handleDateChange}
                    className="date-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="action-buttons">
              <button className="action-button" onClick={handleViewAttendance}>View</button>
              <button className="action-button" onClick={handleAddAttendance}>Add</button>
              <button className="action-button" onClick={handleEditAttendance}>Edit</button>
              <button className="action-button" onClick={handleDeleteAttendance}>Delete</button>
              <button className="action-button" onClick={handleSaveAttendance}>Save</button>
            </div>
            
            {/* Attendance Table */}
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>First name</th>
                    <th>Last name</th>
                    <th>Date</th>
                    <th>Attendance</th>
                    <th>Classroom</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((student, index) => (
                    <tr key={`attendance-${index}`}>
                      <td>{student.studentId}</td>
                      <td>{student.firstName}</td>
                      <td>{student.lastName}</td>
                      <td>{student.date}</td>
                      <td>{student.attendance}</td>
                      <td>{student.classroom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LecturerMyClasses;
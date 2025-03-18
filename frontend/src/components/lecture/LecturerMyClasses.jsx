import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./LecturerMyClasses.css";
import defaultProfileImage from "../../assets/default-profile.png";

const LecturerMyClasses = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lecturer, setLecturer] = useState(null);
  const [error, setError] = useState(null);

  // State for Class Management and Attendance filters
  const [selectedClassModule, setSelectedClassModule] = useState("Networking");
  const [selectedClassBatch, setSelectedClassBatch] = useState("COM12");
  const [selectedAttendanceModule, setSelectedAttendanceModule] = useState("Networking");
  const [selectedAttendanceBatch, setSelectedAttendanceBatch] = useState("COM12");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State for fetched data from backend
  const [classData, setClassData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  // Modal state for Add Module functionality
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModuleData, setNewModuleData] = useState({
    batch: "",
    startDate: "",
    endDate: "",
    classroom: ""
  });

  // Modal state for Add Attendance functionality
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  const [newAttendanceData, setNewAttendanceData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    attendance: "",
    classroom: ""
  });

  const datePickerRef = useRef(null);

  // Available modules and batches
  const batches = ["COM12", "COM13", "BUS12", "BUS13", "ENG12", "ENG13"];

  const getModulesForBatch = (batch) => {
    switch (batch) {
      case "COM12":
      case "COM13":
        return ["Networking", "Programming"];
      case "BUS12":
      case "BUS13":
        return ["Marketing", "Finance"];
      case "ENG12":
      case "ENG13":
        return ["Mechanics", "Electronic"];
      default:
        return [];
    }
  };

  // Handlers for Class Management filters
  const handleClassModuleChange = (e) => {
    setSelectedClassModule(e.target.value);
  };

  const handleClassBatchChange = (e) => {
    setSelectedClassModule(getModulesForBatch(e.target.value)[0]);
    setSelectedClassBatch(e.target.value);
  };

  // Handlers for Attendance filters
  const handleAttendanceModuleChange = (e) => {
    setSelectedAttendanceModule(e.target.value);
  };

  const handleAttendanceBatchChange = (e) => {
    setSelectedAttendanceModule(getModulesForBatch(e.target.value)[0]);
    setSelectedAttendanceBatch(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  // Helper: Format Date as YYYY-MM-DD for input[type="date"]
  const getISODate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  };

  // Fetch classes from backend using filters (for class management)
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");
      const response = await fetch("http://localhost:8080/api/lecturer/classes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-access-token": token,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch classes");
      }
      const data = await response.json();
      setClassData(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError(error.message);
    }
  };

  // Fetch attendance data from backend using attendance filters
  const fetchAttendance = async () => {
    // try {
    //   const token = localStorage.getItem("token");
    //   if (!token) throw new Error("Authentication token not found");
    //   const formattedDate = getISODate(selectedDate);
    //   const response = await fetch(
    //     `http://localhost:8080/api/lecturer/attendance?module=${encodeURIComponent(
    //       selectedAttendanceModule
    //     )}&batch=${encodeURIComponent(selectedAttendanceBatch)}&date=${formattedDate}`,
    //     {
    //       method: "GET",
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //         "x-access-token": token,
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );
    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || "Failed to fetch attendance");
    //   }
    //   const data = await response.json();
    //   console.log("Attendance data fetched:", data);
    //   setAttendanceData(data);
    // } catch (error) {
    //   console.error("Error fetching attendance data:", error);
    //   setError(error.message);
    // }
  };

  // Navigation handler for sidebar links
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Helper to get profile image source.
  const getProfileImageSrc = () => {
    if (lecturer && lecturer.profileImage) {
      return lecturer.profileImage;
    }
    return defaultProfileImage;
  };

  // Fetch lecturer profile data from the backend
  useEffect(() => {
    const fetchLecturerData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }
        const response = await fetch("http://localhost:8080/api/lecturer/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-access-token": token,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch lecturer profile");
        }
        const data = await response.json();
        console.log("Lecturer profile fetched:", data);
        setLecturer({
          firstName: data.firstName || "Jon",
          lastName: data.lastName || "Smith",
          lecturerId: data.lecturerId || "L001",
          role: data.role || "Lecturer",
          department: data.department || "Computing",
          profileImage: data.profileImage || null,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching lecturer data:", error);
        setIsLoading(false);
        if (error.message.includes("401") || error.message.includes("Authentication")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/admin/login");
        }
      }
    };

    fetchLecturerData();
  }, [navigate]);

  // Automatically fetch classes and attendance data on mount or when filters change
  useEffect(() => {
    fetchClasses();
    fetchAttendance();
  }, [selectedClassModule, selectedClassBatch, selectedAttendanceModule, selectedAttendanceBatch, selectedDate]);

  // Modal handlers for Add Module functionality
  const openAddModal = () => {
    setNewModuleData({
      batch: "",
      startDate: "",
      endDate: "",
      classroom: "",
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setNewModuleData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddModuleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      // Use the selected module from the class management filter (no need to send moduleName)
      const payload = {
        batch: newModuleData.batch,
        module: selectedClassModule, // Use selectedClassModule
        startDate: newModuleData.startDate,
        endDate: newModuleData.endDate,
        classroom: newModuleData.classroom,
      };

      const response = await fetch("http://localhost:8080/api/lecturer/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-access-token": token,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add module");
      }
      const data = await response.json();
      console.log("Module added:", data);
      // Update classData state to include the newly added class.
      setClassData((prev) => [...prev, data]);
      closeAddModal();
    } catch (error) {
      console.error("Error adding module:", error);
      setError(error.message);
    }
  };

  // Modal handlers for Add Attendance functionality
  const openAddAttendanceModal = () => {
    setNewAttendanceData({
      studentId: "",
      firstName: "",
      lastName: "",
      attendance: "",
      classroom: "",
    });
    setShowAddAttendanceModal(true);
  };

  const closeAddAttendanceModal = () => {
    setShowAddAttendanceModal(false);
  };

  const handleAttendanceModalInputChange = (e) => {
    const { name, value } = e.target;
    setNewAttendanceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const payload = {
        studentId: newAttendanceData.studentId,
        firstName: newAttendanceData.firstName,
        lastName: newAttendanceData.lastName,
        attendance: newAttendanceData.attendance,
        classroom: newAttendanceData.classroom,
        module: selectedAttendanceModule,
        batch: selectedAttendanceBatch,
        date: getISODate(selectedDate),
      };

      const response = await fetch("http://localhost:8080/api/lecturer/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-access-token": token,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add attendance");
      }
      const data = await response.json();
      console.log("Attendance added:", data);
      // Update attendanceData state to include the newly added attendance record.
      setAttendanceData((prev) => [...prev, data]);
      closeAddAttendanceModal();
    } catch (error) {
      console.error("Error adding attendance:", error);
      setError(error.message);
    }
  };

  // Dummy handler functions for Edit, Delete, and Save actions for classes and attendance.
  const handleEditClass = () => {
    console.log("Edit class clicked");
  };

  const handleDeleteClass = () => {
    console.log("Delete class clicked");
  };

  const handleSaveClass = () => {
    console.log("Save class clicked");
  };

  const handleEditAttendance = () => {
    console.log("Edit attendance clicked");
  };

  const handleDeleteAttendance = () => {
    console.log("Delete attendance clicked");
  };

  const handleSaveAttendance = () => {
    console.log("Save attendance clicked");
  };

  // Compute filtered class data based on selected module for class management
  const filteredClassData = classData.filter(
    (classItem) =>
      classItem.module.trim().toLowerCase() === selectedClassModule.trim().toLowerCase()
  );

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
            <img
              src={getProfileImageSrc()}
              alt="Profile"
              className="profile-image"
              onError={(e) => {
                console.error("Error loading profile image");
                e.target.onerror = null;
                e.target.src = defaultProfileImage;
              }}
            />
          </div>
          <div className="profile-info">
            <div className="role">{lecturer.role}</div>
            <div className="name">
              {lecturer.firstName} {lecturer.lastName}
            </div>
            <div className="id-display">ID: {lecturer.lecturerId}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li
              className="active"
              onClick={() => handleNavigate("/lecturer/classes")}
            >
              My Classes
            </li>
            <li onClick={() => handleNavigate("/lecturer/students")}>
              Student Management
            </li>
            <li onClick={() => handleNavigate("/lecturer/events")}>
              Events/Announcements
            </li>
            <li onClick={() => handleNavigate("/lecturer/assignments")}>
              Assignments
            </li>
            <li onClick={() => handleNavigate("/lecturer/resources")}>
              Resources
            </li>
            <li onClick={() => handleNavigate("/lecturer/communication")}>
              Communication
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <div className="notification-icons">
            <div className="notification-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div
              className="profile-icon"
              onClick={() => handleNavigate("/lecturer/profile")}
              style={{ cursor: "pointer" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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
              <label>Select Batch:</label>
              <select
                value={selectedClassBatch}
                onChange={handleClassBatchChange}
                className="batch-select"
              >
                {batches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            <div className="module-selection">
              <label>Select Module:</label>
              <select
                value={selectedClassModule}
                onChange={handleClassModuleChange}
                className="module-select"
              >
                {getModulesForBatch(selectedClassBatch).map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>

            <div className="action-buttons">
              <button className="action-button" onClick={fetchClasses}>
                View
              </button>
              <button className="action-button" onClick={openAddModal}>
                Add
              </button>
              <button className="action-button" onClick={handleEditClass}>
                Edit
              </button>
              <button className="action-button" onClick={handleDeleteClass}>
                Delete
              </button>
              <button className="action-button" onClick={handleSaveClass}>
                Save
              </button>
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
                  {filteredClassData.length ? (
                    filteredClassData.map((classItem, index) => (
                      <tr key={`class-${index}`}>
                        <td>{classItem.batch}</td>
                        <td>{new Date(classItem.start_date).toISOString().substring(0, 10)}</td>
                        <td>{new Date(classItem.end_date).toISOString().substring(0, 10)}</td>
                        <td>{classItem.classroom}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No classes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Class Attendance Section */}
          <section className="class-attendance-section">
            <h1 className="section-title">Class Attendance</h1>

            <div className="attendance-filters">
              <div className="filter-group">
                <label>Select Batch:</label>
                <select
                  value={selectedAttendanceBatch}
                  onChange={handleAttendanceBatchChange}
                  className="batch-select"
                >
                  {batches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Select Module:</label>
                <select
                  value={selectedAttendanceModule}
                  onChange={handleAttendanceModuleChange}
                  className="module-select"
                >
                  {getModulesForBatch(selectedAttendanceBatch).map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Select Date:</label>
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
              <button className="action-button" onClick={fetchAttendance}>
                View
              </button>
              <button className="action-button" onClick={openAddAttendanceModal}>
                Add
              </button>
              <button className="action-button" onClick={handleEditAttendance}>
                Edit
              </button>
              <button className="action-button" onClick={handleDeleteAttendance}>
                Delete
              </button>
              <button className="action-button" onClick={handleSaveAttendance}>
                Save
              </button>
            </div>

            {/* Attendance Table */}
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Date</th>
                    <th>Attendance</th>
                    <th>Classroom</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.length ? (
                    attendanceData.map((record, index) => (
                      <tr key={`attendance-${index}`}>
                        <td>{record.studentId}</td>
                        <td>{record.firstName}</td>
                        <td>{record.lastName}</td>
                        <td>{record.date}</td>
                        <td>{record.attendance}</td>
                        <td>{record.classroom}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">No attendance records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Add Module Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Classes</h2>
            <form onSubmit={handleAddModuleSubmit}>
              {/* Display selected module instead of input */}
              <div className="form-group">
                <label>Module:</label>
                <div className="selected-module">{selectedClassModule}</div>
              </div>
              <div className="form-group">
                <label htmlFor="batch">Batch:</label>
                <input
                  type="text"
                  id="batch"
                  name="batch"
                  value={newModuleData.batch}
                  onChange={handleModalInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={newModuleData.startDate}
                  onChange={handleModalInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={newModuleData.endDate}
                  onChange={handleModalInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="classroom">Classroom:</label>
                <input
                  type="text"
                  id="classroom"
                  name="classroom"
                  value={newModuleData.classroom}
                  onChange={handleModalInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeAddModal}>
                  Cancel
                </button>
                <button type="submit">
                  Add Classes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Attendance Modal */}
      {showAddAttendanceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Attendance</h2>
            <form onSubmit={handleAddAttendanceSubmit}>
              <div className="form-group">
                <label htmlFor="studentId">Student ID:</label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={newAttendanceData.studentId}
                  onChange={handleAttendanceModalInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={newAttendanceData.firstName}
                  onChange={handleAttendanceModalInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name:</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={newAttendanceData.lastName}
                  onChange={handleAttendanceModalInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="attendance">Attendance:</label>
                <input
                  type="text"
                  id="attendance"
                  name="attendance"
                  value={newAttendanceData.attendance}
                  onChange={handleAttendanceModalInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="classroom">Classroom:</label>
                <input
                  type="text"
                  id="classroom"
                  name="classroom"
                  value={newAttendanceData.classroom}
                  onChange={handleAttendanceModalInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeAddAttendanceModal}>
                  Cancel
                </button>
                <button type="submit">
                  Add Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerMyClasses;
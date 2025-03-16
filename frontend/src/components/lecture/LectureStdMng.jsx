import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LectureStdMng.css";
import defaultProfileImage from "../../assets/default-profile.png";

const LectureStdMng = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [lecturer, setLecturer] = useState(null);
    const token = localStorage.getItem("token");

    // Define batch options based on department selection
    const batchOptions = {
        Computing: ["COM12", "COM13"],
        Business: ["BUS12", "BUS13"],
        Engineer: ["ENG12", "ENG13"]
    };

    useEffect(() => {
        fetchProfile();
        if (selectedBatch) {
            fetchStudents();
        }
    }, [selectedBatch]);

    const fetchProfile = async () => {
        try {
            if (!token) throw new Error("Authentication token not found");
            const response = await fetch("http://localhost:8080/api/lecturer/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch profile");
            const data = await response.json();
            setLecturer(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchStudents = async () => {
        try {
            if (!token) {
                alert("Authentication token missing. Please log in again.");
                return;
            }

            const response = await fetch(
                `http://localhost:8080/api/lecturer/students?batch=${selectedBatch}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch students");

            let data = await response.json();
            console.log("Student details:", data);

            if (data && !Array.isArray(data)) {
                data = [data];
            }

            setStudents(data);
            console.log("Student array:", data);
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]);
        }
    };

    const getProfileImageSrc = () => {
        return lecturer?.profileImage || defaultProfileImage;
    };

    // ✅ Handle department change and reset batch selection
    const handleDepartmentChange = (event) => {
        const department = event.target.value;
        setSelectedDepartment(department);
        setSelectedBatch(""); // Reset batch when department changes
    };

    return (
        <div className="student-management-container">
            <div className="sidebar">
                <div className="profile-summary">
                    <div className="profile-image-container">
                        <img
                            src={getProfileImageSrc()}
                            alt="Profile"
                            className="profile-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultProfileImage;
                            }}
                        />
                    </div>
                    <div className="profile-info">
                        <div className="role">{lecturer?.role || "Lecturer"}</div>
                        <div className="name">{lecturer?.firstName || "Jon"} {lecturer?.lastName || "Smith"}</div>
                        <div className="id-display">ID: {lecturer?.lecturerId || "L001"}</div>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li onClick={() => navigate("/lecturer/classes")}>My Classes</li>
                        <li className="active">Student Management</li>
                        <li onClick={() => navigate("/lecturer/events")}>Events/Announcements</li>
                        <li onClick={() => navigate("/lecturer/assignments")}>Assignments</li>
                        <li onClick={() => navigate("/lecturer/resources")}>Resources</li>
                        <li onClick={() => navigate("/lecturer/communication")}>Communication</li>
                    </ul>
                </nav>
            </div>
            <div className="main-content">
                <h1>Student Management</h1>
                <div className="filters">
                    <label>Select Department:</label>
                    <select value={selectedDepartment} onChange={handleDepartmentChange}>
                        <option value="">Select Department</option>
                        <option value="Computing">Computing</option>
                        <option value="Business">Business</option>
                        <option value="Engineer">Engineer</option>
                    </select>

                    <label>Select Batch:</label>
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        disabled={!selectedDepartment} // Disable batch dropdown until department is selected
                    >
                        <option value="">Select Batch</option>
                        {selectedDepartment &&
                            batchOptions[selectedDepartment].map((batch) => (
                                <option key={batch} value={batch}>
                                    {batch}
                                </option>
                            ))}
                    </select>
                </div>
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Batch</th>
                            <th>Contact No.</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr key={student.studentId}>
                                    <td>{student.studentId}</td>
                                    <td>{student.firstName}</td>
                                    <td>{student.lastName}</td>
                                    <td>{student.batch}</td>
                                    <td>{student.contact || "-"}</td>
                                    <td>{student.email || "-"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6">No students found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LectureStdMng;

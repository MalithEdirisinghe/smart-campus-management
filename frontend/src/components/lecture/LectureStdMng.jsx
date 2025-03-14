import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LectureStdMng.css";
import defaultProfileImage from "../../assets/default-profile.png";

const LectureStdMng = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [selectedModule, setSelectedModule] = useState("Networking");
    const [selectedBatch, setSelectedBatch] = useState("COM12");
    const [lecturer, setLecturer] = useState(null);

    useEffect(() => {
        fetchProfile();
        fetchStudents();
    }, [selectedModule, selectedBatch]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
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
            const response = await fetch(
                `http://localhost:8080/api/lecturer/students?module=${selectedModule}&batch=${selectedBatch}`
            );
            if (!response.ok) throw new Error("Failed to fetch students");
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const getProfileImageSrc = () => {
        if (lecturer && lecturer.profileImage) {
            return lecturer.profileImage;
        }
        return defaultProfileImage;
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
                                console.error("Error loading profile image");
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
                    <label>Select Module:</label>
                    <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
                        <option value="Networking">Networking</option>
                        <option value="Database">Database</option>
                        <option value="Programming">Programming</option>
                    </select>
                    <label>Select Batch:</label>
                    <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                        <option value="COM12">COM12</option>
                        <option value="COM07">COM07</option>
                        <option value="COM13">COM13</option>
                    </select>
                </div>
                <div className="actions">
                    <button onClick={fetchStudents}>View</button>
                    <button>Add</button>
                    <button>Edit</button>
                    <button>Delete</button>
                    <button>Save</button>
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
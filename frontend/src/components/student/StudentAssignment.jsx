import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import "./StudentAssignment.css";
import Sidebar from "../common/sidebar";

const StudentAssignment = () => {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [userId, setUserId] = useState(null);
    const [studentId, setStudentId] = useState(null);
    const [batch, setBatch] = useState(""); // Store student's batch
    const [moduleOptions, setModuleOptions] = useState([]); // Store module options dynamically

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.studentId || decodedToken.id);
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchStudentData(userId);
        }
    }, [userId]);

    useEffect(() => {
        if (selectedModule) {
            fetchAssignmentByModule(selectedModule);
        }
    }, [selectedModule]);

    // Fetch Student ID and Batch from backend using userId
    const fetchStudentData = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch('http://localhost:8080/api/student/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            const studentData = await response.json();
            setStudentId(studentData.studentId);
            setBatch(studentData.batch); // Set student's batch
            updateModuleOptions(studentData.batch); // Update module options based on batch

        } catch (error) {
            console.error('Error fetching student data:', error);

            if (error.message.includes('403') || error.message.includes('Forbidden')) {
                alert('Access denied. Administrator privileges required for this operation.');
            } else if (error.message.includes('401') || error.message.includes('Authentication')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/admin/login');
            }
        }
    };

    // Function to update module options based on batch
    const updateModuleOptions = (batch) => {
        let options = [];
        if (["COM12", "COM13"].includes(batch)) {
            options = ["Networking", "Programming"];
        } else if (["BUS12", "BUS13"].includes(batch)) {
            options = ["Marketing", "Finance"];
        } else if (["ENG12", "ENG13"].includes(batch)) {
            options = ["Mechanics", "Electronics"];
        }
        setModuleOptions(options);
    };

    // Fetch latest assignment file for selected module
    const fetchAssignmentByModule = async (module) => {
        try {
            const response = await fetch(`http://localhost:8080/api/assignments/latest?module=${module}`);
            if (!response.ok) throw new Error("Failed to fetch assignment");

            const blob = await response.blob();
            const fileURL = window.URL.createObjectURL(blob);

            setAssignment({ fileURL, fileName: `Assignment_${module}.pdf` });

        } catch (error) {
            console.error("Error fetching assignment:", error);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Submit assignment with student ID
    const handleSubmit = async () => {
        if (!selectedFile || !selectedModule || !studentId) {
            alert("Please select a file, a module, and ensure student ID is available.");
            return;
        }
    
        try {
            console.log("Submitting with values:", {
                file: selectedFile.name,
                module: selectedModule,
                studentId: studentId
            });
            
            const token = localStorage.getItem("token");
            if (!token) throw new Error("User not authenticated.");
    
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("module", selectedModule);
            formData.append("studentId", studentId);
            formData.append("userId", userId);
    
            const response = await fetch("http://localhost:8080/api/assignments/submit", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to submit: ${errorData.message || response.statusText}`);
            }
    
            const result = await response.json();
            alert("Assignment submitted successfully!");
    
        } catch (error) {
            console.error("Error submitting assignment:", error);
            alert(`Error: ${error.message || "An error occurred while submitting the assignment."}`);
        }
    };

    return (
        <div className="student-assignment-container">
            <Sidebar user={student} role="student" setUserId={setUserId} />

            <div className="main-content">
                <div className="assignment-section">
                    <h2>Assignments</h2>
                    <div className="assignment-form">
                        <select
                            name="module"
                            className="module-select"
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            disabled={!moduleOptions.length} // Disable if no modules available
                        >
                            <option value="">Select Module</option>
                            {moduleOptions.map((module, index) => (
                                <option key={index} value={module}>{module}</option>
                            ))}
                        </select>

                        {assignment ? (
                            <a href={assignment.fileURL} download={assignment.fileName} className="assignment-link">
                                {assignment.fileName}
                            </a>
                        ) : (
                            <p>No Assignment Available</p>
                        )}

                        <input type="file" name="file" onChange={handleFileChange} className="file-input" />
                        <button className="submit-button" onClick={handleSubmit}>Submit</button>
                    </div>
                </div>

                <div className="results-section">
                    <h2>Results</h2>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th>Module</th>
                                <th>Marks %</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignment ? (
                                <tr>
                                    <td>{assignment.module}</td>
                                    <td>{assignment.marks || "-"}</td>
                                    <td>{assignment.grade || "-"}</td>
                                </tr>
                            ) : (
                                <tr>
                                    <td colSpan="3">No Results Available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentAssignment;

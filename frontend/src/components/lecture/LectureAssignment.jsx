import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LectureAssignment.css";
import defaultProfileImage from "../../assets/default-profile.png";
import AddMarksModal from "../common/AddMarksModal";

const LectureAssignment = () => {
    const navigate = useNavigate();
    const [lecturer, setLecturer] = useState(null);
    const [departments, setDepartments] = useState({
        Computing: { batches: ["COM12", "COM13"], modules: ["Networking", "Programming"] },
        Business: { batches: ["BUS12", "BUS13"], modules: ["Marketing", "Finance"] },
        Engineering: { batches: ["ENG12", "ENG13"], modules: ["Mechanics", "Electronics"] }
    });
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedModules, setSelectedModules] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [students, setStudents] = useState();
    const [assignmentData, setAssignmentData] = useState({
        name: "",
        module: "",
        batch: "",
        releaseDate: "",
        deadline: "",
        file: null
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

    // New state variables for Mark Assignments section
    const [markSelectedDepartment, setMarkSelectedDepartment] = useState("");
    const [markSelectedBatch, setMarkSelectedBatch] = useState("");
    const [markSelectedModule, setMarkSelectedModule] = useState("");
    const [markSelectedModules, setMarkSelectedModules] = useState([]);

    useEffect(() => {
        fetchProfile();
        fetchAssignments();
    }, []);

    useEffect(() => {
        if (selectedBatch) {
            // fetchStudentsByBatch(selectedBatch);
            fetchSubmittedAssignments();
        }
    }, [selectedBatch]);

    useEffect(() => {
        if (markSelectedBatch && markSelectedModule) {
            fetchSubmittedAssignments(markSelectedBatch, markSelectedModule);
        }
    }, [markSelectedBatch, markSelectedModule]);

    // Fetch Lecturer Profile
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

    // Fetch Assignments
    const fetchAssignments = async () => {
        // try {
        //     const response = await fetch("http://localhost:8080/api/assignments");
        //     if (!response.ok) throw new Error("Failed to fetch assignments");
        //     const data = await response.json();
        //     setAssignments(data);
        // } catch (error) {
        //     console.error("Error fetching assignments:", error);
        // }
    };

    const fetchSubmittedAssignments = async (batch, module) => {
        try {
            const response = await fetch(`http://localhost:8080/api/assignments/submitted?batch=${batch}&module=${module}`);
            if (!response.ok) throw new Error("Failed to fetch submitted assignments");

            const data = await response.json();
            console.log("🚀 Submitted Assignments (Raw):", data); // Log raw data

            // Assuming data is an array of assignment objects
            setStudents(data);

            console.log('student data:', students);
        } catch (error) {
            console.error("Error fetching submitted assignments:", error);
        }
    };

    // Handle Input Changes
    const handleChange = (e) => {
        if (e.target.name === "file") {
            setAssignmentData({ ...assignmentData, file: e.target.files[0] });
        } else {
            setAssignmentData({ ...assignmentData, [e.target.name]: e.target.value });
        }
    };

    // Handle Assignment Submission with File Upload
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");

            const formData = new FormData();
            formData.append("name", assignmentData.name);
            formData.append("module", assignmentData.module);
            formData.append("batch", selectedBatch); // Use selectedBatch here
            formData.append("releaseDate", assignmentData.releaseDate);
            formData.append("deadline", assignmentData.deadline);
            formData.append("file", assignmentData.file);

            const response = await fetch("http://localhost:8080/api/assignments/create", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                alert("Assignment created successfully!");
                fetchAssignments();
            } else {
                alert("Failed to create assignment: " + data.message);
            }
        } catch (error) {
            console.error("Error creating assignment:", error);
        }
    };

    // Update modules based on selected department and batch
    useEffect(() => {
        if (selectedDepartment && selectedBatch) {
            const modules = departments[selectedDepartment].modules;
            setSelectedModules(modules);
            setAssignmentData(prevData => ({ ...prevData, batch: selectedBatch })); // Update batch in assignmentData
        }
    }, [selectedDepartment, selectedBatch]);

    // Update mark modules based on selected mark department and batch
    useEffect(() => {
        if (markSelectedDepartment && markSelectedBatch) {
            const modules = departments[markSelectedDepartment].modules;
            setMarkSelectedModules(modules);
        }
    }, [markSelectedDepartment, markSelectedBatch]);

    // Handle Save Marks
    const handleSaveMarks = async (marksData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");

            const response = await fetch("http://localhost:8080/api/marks/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(marksData),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Marks added successfully!");
                fetchAssignments();
            } else {
                alert("Failed to add marks: " + data.message);
            }
        } catch (error) {
            console.error("Error adding marks:", error);
        }
    };

    // Open Modal
    const openModal = (studentId, assignmentId) => {
        setSelectedStudentId(studentId);
        setSelectedAssignmentId(assignmentId);
        setIsModalOpen(true);
    };

    return (
        <div className="assignment-management-container">
            <div className="sidebar">
                <div className="profile-summary">
                    <div className="profile-image-container">
                        <img src={lecturer?.profileImage || defaultProfileImage} alt="Profile" />
                    </div>
                    <div className="profile-info">
                        <div className="role">Lecturer</div>
                        <div className="name">{lecturer?.firstName || "Jon"} {lecturer?.lastName || "Smith"}</div>
                        <div className="id-display">ID: {lecturer?.lecturerId || "L001"}</div>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li onClick={() => navigate("/lecturer/classes")}>My Classes</li>
                        <li onClick={() => navigate("/lecturer/students")}>Student Management</li>
                        <li onClick={() => navigate("/lecturer/events")}>Events/Announcements</li>
                        <li className="active">Assignments</li>
                        <li onClick={() => navigate("/lecturer/resources")}>Resources</li>
                        <li onClick={() => navigate("/lecturer/communication")}>Communication</li>
                    </ul>
                </nav>
            </div>

            <div className="main-content">
                <h1>Create an Assignment</h1>
                <div className="assignment-form">
                    <input type="text" name="name" placeholder="Assignment Name" value={assignmentData.name} onChange={handleChange} />
                    <input type="file" name="file" onChange={handleChange} />

                    <select name="department" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                        <option value="">Select Department</option>
                        {Object.keys(departments).map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                        ))}
                    </select>

                    <select name="batch" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                        <option value="">Select Batch</option>
                        {selectedDepartment && departments[selectedDepartment].batches.map((batch, index) => (
                            <option key={index} value={batch}>{batch}</option>
                        ))}
                    </select>

                    <select name="module" value={assignmentData.module} onChange={handleChange}>
                        <option value="">Select Module</option>
                        {selectedModules.map((mod, index) => (
                            <option key={index} value={mod}>{mod}</option>
                        ))}
                    </select>

                    <div className="date-input-container">
                        <label className="date-input-label" htmlFor="releaseDate">Release Date</label>
                        <input
                            type="date"
                            id="releaseDate"
                            name="releaseDate"
                            value={assignmentData.releaseDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="date-input-container">
                        <label className="date-input-label" htmlFor="deadline">Deadline</label>
                        <input
                            type="date"
                            id="deadline"
                            name="deadline"
                            value={assignmentData.deadline}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="button-group">
                    <button className="discard">Discard</button>
                    <button className="send" onClick={handleSubmit}>Send</button>
                </div>

                <h2>Mark Assignments</h2>
                <div className="marking-section">
                    <select value={markSelectedDepartment} onChange={(e) => setMarkSelectedDepartment(e.target.value)}>
                        <option value="">Select Department</option>
                        {Object.keys(departments).map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <select value={markSelectedBatch} onChange={(e) => setMarkSelectedBatch(e.target.value)}>
                        <option value="">Select Batch</option>
                        {markSelectedDepartment && departments[markSelectedDepartment].batches.map((batch, index) => (
                            <option key={index} value={batch}>{batch}</option>
                        ))}
                    </select>
                    <select value={markSelectedModule} onChange={(e) => setMarkSelectedModule(e.target.value)}>
                        <option value="">Select Module</option>
                        {markSelectedModules.map((mod, index) => (
                            <option key={index} value={mod}>{mod}</option>
                        ))}
                    </select>
                    <button onClick={() => openModal(null, null)}>Add</button>
                    <button>Edit</button>
                    <button>Delete</button>
                    <button>Save</button>
                </div>

                <table className="assignment-table">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>File (Click to Download)</th>
                            <th>Marks %</th>
                            <th>Grade</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(students) && students.length > 0 ? (
                            students.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.batch}</td>
                                    <td>{student.first_name || "-"}</td>
                                    <td>{student.last_name || "-"}</td>
                                    <td>
                                        <a
                                            href={`http://localhost:8080/api/assignments/download/${student.id}`}
                                            download={student.file_name}
                                            className="assignment-download-link"
                                        >
                                            {student.file_name || "No File"}
                                        </a>
                                    </td>
                                    <td>{student.marks || "-"}</td>
                                    <td>{student.grade || "-"}</td>
                                    <td>
                                        <button onClick={() => openModal(student.student_user_id, student.id)}>Add Marks</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No submitted assignments available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <AddMarksModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMarks}
                studentId={selectedStudentId}
                assignmentId={selectedAssignmentId}
            />
        </div>
    );
};

export default LectureAssignment;

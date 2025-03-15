// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "./StudentAssignment.css";
// import defaultProfileImage from "../../assets/default-profile.png";
// import Sidebar from "../common/sidebar"

// const StudentAssignment = () => {
//     const navigate = useNavigate();
//     const [student, setStudent] = useState({
//         id: "S001",
//         name: "Kavindu Perera",
//         profileImage: defaultProfileImage
//     });
//     const [assignment, setAssignment] = useState(null);
//     const [selectedModule, setSelectedModule] = useState("");
//     const [selectedFile, setSelectedFile] = useState(null);

//     useEffect(() => {
//         if (selectedModule) {
//             fetchAssignmentByModule(selectedModule);
//         }
//     }, [selectedModule]);

//     const fetchAssignmentByModule = async (module) => {
//         try {
//             const response = await fetch(`http://localhost:8080/api/assignments/latest?module=${module}`);
//             if (!response.ok) throw new Error("Failed to fetch assignment");

//             const blob = await response.blob(); // Get binary data as Blob
//             const fileURL = window.URL.createObjectURL(blob);

//             const contentDisposition = response.headers.get("Content-Disposition");
//             let fileName = "downloaded_file.pdf"; // Default filename

//             if (contentDisposition) {
//                 const match = contentDisposition.match(/filename="(.+)"/);
//                 if (match) fileName = match[1];
//             }

//             setAssignment({ fileURL, fileName });

//         } catch (error) {
//             console.error("Error fetching assignment:", error);
//         }
//     };

//     const handleFileChange = (e) => {
//         setSelectedFile(e.target.files[0]);
//     };

//     const handleSubmit = async () => {
//         if (!selectedFile || !selectedModule) {
//             alert("Please select a file and a module before submitting.");
//             return;
//         }
    
//         const formData = new FormData();
//         formData.append("file", selectedFile);
//         formData.append("module", selectedModule);
    
//         try {
//             const response = await fetch("http://localhost:8080/api/assignments/submit", {
//                 method: "POST",
//                 body: formData,
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming you store JWT in localStorage
//                 },
//             });
    
//             if (!response.ok) {
//                 const errorData = await response.json(); // Parse error response as JSON
//                 console.error("Error response:", errorData);
//                 alert(`Failed to submit assignment: ${errorData.message}`);
//                 return;
//             }
    
//             const data = await response.json();
//             alert("Assignment submitted successfully!");
//         } catch (error) {
//             console.error("Error submitting assignment:", error);
//             alert("An error occurred while submitting the assignment.");
//         }
//     };      

//     return (
//         <div className="student-assignment-container">
//             <Sidebar user={student} role="student" />

//             <div className="main-content">
//                 <div className="assignment-section">
//                     <h2>Assignments</h2>
//                     <div className="assignment-form">
//                         <select
//                             name="module"
//                             className="module-select"
//                             value={selectedModule}
//                             onChange={(e) => setSelectedModule(e.target.value)}
//                         >
//                             <option value="">Select Module</option>
//                             <option value="Networking">Networking</option>
//                             <option value="Programming">Programming</option>
//                             <option value="Prototyping">Prototyping</option>
//                         </select>
//                         {/* Display file from database */}
//                         {assignment ? (
//                             <a href={assignment.fileURL} download={assignment.fileName} className="assignment-link">
//                                 {assignment.fileName}
//                             </a>
//                         ) : (
//                             <p>No Assignment Available</p>
//                         )}

//                         {/* Choose file option */}
//                         <input type="file" name="file" onChange={handleFileChange} className="file-input" />
//                         <button className="submit-button" onClick={handleSubmit}>Submit</button>
//                     </div>
//                 </div>

//                 <div className="results-section">
//                     <h2>Results</h2>
//                     <table className="results-table">
//                         <thead>
//                             <tr>
//                                 <th>Module</th>
//                                 <th>Marks %</th>
//                                 <th>Grade</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {assignment ? (
//                                 <tr>
//                                     <td>{assignment.module}</td>
//                                     <td>{assignment.marks || "-"}</td>
//                                     <td>{assignment.grade || "-"}</td>
//                                 </tr>
//                             ) : (
//                                 <tr>
//                                     <td colSpan="3">No Results Available</td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default StudentAssignment;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import "./StudentAssignment.css";
import defaultProfileImage from "../../assets/default-profile.png";
import Sidebar from "../common/sidebar";

const StudentAssignment = () => {
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [selectedModule, setSelectedModule] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [userId, setUserId] = useState(null);

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
        if (selectedModule) {
            fetchAssignmentByModule(selectedModule);
        }
    }, [selectedModule]);

    const fetchAssignmentByModule = async (module) => {
        try {
            const response = await fetch(`http://localhost:8080/api/assignments/latest?module=${module}`);
            if (!response.ok) throw new Error("Failed to fetch assignment");

            const blob = await response.blob(); // Get binary data as Blob
            const fileURL = window.URL.createObjectURL(blob);

            const contentDisposition = response.headers.get("Content-Disposition");
            let fileName = "downloaded_file.pdf"; // Default filename

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match) fileName = match[1];
            }

            setAssignment({ fileURL, fileName });

        } catch (error) {
            console.error("Error fetching assignment:", error);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!selectedFile || !selectedModule) {
            alert("Please select a file and a module before submitting.");
            return;
        }
    
        const token = localStorage.getItem("token");
        if (!token) {
            alert("User not authenticated.");
            return;
        }
    
        let extractedUserId = null;
        try {
            const decodedToken = jwtDecode(token);
            console.log("Decoded Token:", decodedToken); // Debugging
            extractedUserId = decodedToken.studentId || decodedToken.id; // Ensure correct key is used
            console.log("Extract UID:",extractedUserId);
        } catch (error) {
            console.error("Error decoding token:", error);
        }
    
        if (!extractedUserId) {
            alert("User ID not available. Please refresh the page or log in again.");
            return;
        }
    
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("module", selectedModule);
        formData.append("userId", extractedUserId);
    
        try {
            const response = await fetch("http://localhost:8080/api/assignments/submit", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response:", errorData);
                alert(`Failed to submit assignment: ${errorData.message}`);
                return;
            }
    
            alert("Assignment submitted successfully!");
        } catch (error) {
            console.error("Error submitting assignment:", error);
            alert("An error occurred while submitting the assignment.");
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
                        >
                            <option value="">Select Module</option>
                            <option value="Networking">Networking</option>
                            <option value="Programming">Programming</option>
                            <option value="Prototyping">Prototyping</option>
                        </select>
                        {/* Display file from database */}
                        {assignment ? (
                            <a href={assignment.fileURL} download={assignment.fileName} className="assignment-link">
                                {assignment.fileName}
                            </a>
                        ) : (
                            <p>No Assignment Available</p>
                        )}

                        {/* Choose file option */}
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
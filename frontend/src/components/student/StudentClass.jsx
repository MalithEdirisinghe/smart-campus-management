// import React, { useState, useEffect } from 'react';
// import Sidebar from '../common/sidebar'; // Ensure this is the correct path
// import axios from 'axios';
// import './StudentClass.css'; // Create a CSS file for styling

// const StudentClass = () => {
//     const [myClasses, setMyClasses] = useState([]);
//     const [modules, setModules] = useState([]);
//     const [selectedModule, setSelectedModule] = useState('');

//     useEffect(() => {
//         fetchMyClasses();
//         fetchAvailableModules();
//     }, []);

//     const fetchMyClasses = async () => {
//         try {
//             const response = await axios.get('/api/student/classes'); // Adjust endpoint accordingly
//             setMyClasses(response.data);
//         } catch (error) {
//             console.error('Error fetching classes:', error);
//         }
//     };

//     const fetchAvailableModules = async () => {
//         try {
//             const response = await axios.get('/api/student/available-modules'); // Adjust endpoint accordingly
//             setModules(response.data);
//         } catch (error) {
//             console.error('Error fetching available modules:', error);
//         }
//     };

//     const handleRegister = async () => {
//         if (!selectedModule) return;
//         try {
//             await axios.post('/api/student/register-class', { module: selectedModule });
//             alert('Registration request sent successfully!');
//             fetchMyClasses(); // Refresh registered classes
//         } catch (error) {
//             console.error('Error registering for module:', error);
//         }
//     };

//     return (
//         <div className="student-class-container">
//             <Sidebar role={"student"} />
//             <div className="content">
//                 <h2>My Classes</h2>
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Module</th>
//                             <th>Starting Date</th>
//                             <th>Classroom</th>
//                             <th>Time</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {myClasses.map((cls, index) => (
//                             <tr key={index}>
//                                 <td>{cls.module}</td>
//                                 <td>{cls.startingDate}</td>
//                                 <td>{cls.classroom}</td>
//                                 <td>{cls.time}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//                 <h2>Register Classes</h2>
//                 <div className="register-section">
//                     <select onChange={(e) => setSelectedModule(e.target.value)} value={selectedModule}>
//                         <option value="">Select Module</option>
//                         {modules.map((mod, index) => (
//                             <option key={index} value={mod.id}>{mod.name}</option>
//                         ))}
//                     </select>
//                     <button onClick={handleRegister}>Send Registration Request</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default StudentClass;

import React, { useState, useEffect } from 'react';
import Sidebar from '../common/sidebar';
import axios from 'axios';
import './StudentClass.css';

const StudentClass = () => {
    const [myClasses, setMyClasses] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState('');
    const [studentBatch, setStudentBatch] = useState(null); // Set to null initially

    // Fetch Profile on Component Mount
    useEffect(() => {
        fetchProfile();
    }, []);

    // Fetch My Classes & Modules only after studentBatch is set
    useEffect(() => {
        if (studentBatch) {
            fetchMyClasses(studentBatch);
            fetchAvailableModules(studentBatch);
        }
    }, [studentBatch]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");

            const response = await fetch("http://localhost:8080/api/student/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch profile");
            
            const data = await response.json();
            console.log("Profile:", data);

            setStudentBatch(data.batch); // Ensure batch ID is correctly extracted
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchMyClasses = async (batchId) => {
        try {
            const response = await axios.get(`/api/student/classes/${batchId}`);
            setMyClasses(response.data);
            console.log("My Classes Data:", response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchAvailableModules = async (batchId) => {
        try {
            const response = await axios.get(`/api/student/available-modules/${batchId}`);
            setModules(response.data);
        } catch (error) {
            console.error('Error fetching available modules:', error);
        }
    };

    const handleRegister = async () => {
        if (!selectedModule || !studentBatch) return;

        try {
            await axios.post('/api/student/register-class', { batchId: studentBatch, module: selectedModule });
            alert('Registration request sent successfully!');
            fetchMyClasses(studentBatch);
        } catch (error) {
            console.error('Error registering for module:', error);
        }
    };

    return (
        <div className="student-class-container">
            <Sidebar role={"student"} />
            <div className="content">
                <h2>My Classes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Module</th>
                            <th>Starting Date</th>
                            <th>Classroom</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myClasses.length > 0 ? (
                            myClasses.map((cls, index) => (
                                <tr key={index}>
                                    <td>{cls.module_name}</td>
                                    <td>{cls.starting_date}</td>
                                    <td>{cls.classroom}</td>
                                    <td>{cls.time}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No registered classes found</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <h2>Register Classes</h2>
                <div className="register-section">
                    <select onChange={(e) => setSelectedModule(e.target.value)} value={selectedModule}>
                        <option value="">Select Module</option>
                        {modules.map((mod, index) => (
                            <option key={index} value={mod.id}>{mod.name}</option>
                        ))}
                    </select>
                    <button onClick={handleRegister}>Send Registration Request</button>
                </div>
            </div>
        </div>
    );
};

export default StudentClass;
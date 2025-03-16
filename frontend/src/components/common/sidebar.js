import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import "./Sidebar.css";
import defaultProfileImage from "../../assets/default-profile.png";

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const location = useLocation(); // ✅ Get current page location
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");

            let apiUrl = "";
            if (role === "student") apiUrl = "http://localhost:8080/api/student/profile";
            else if (role === "lecturer") apiUrl = "http://localhost:8080/api/lecturer/profile";
            else if (role === "admin") apiUrl = "http://localhost:8080/api/admin/profile";
            else throw new Error("Invalid role specified");

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "x-access-token": token
                }
            });

            if (!response.ok) throw new Error("Failed to fetch profile");
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const menuItems = {
        admin: [
            { name: "Dashboard", path: "/admin/dashboard" },
            { name: "User Management", path: "/admin/users" },
            { name: "Events/Announcements", path: "/admin/events" },
            { name: "Resources", path: "/admin/resources" },
            { name: "Reports", path: "/admin/reports" },
        ],
        lecturer: [
            { name: "My Classes", path: "/lecturer/classes" },
            { name: "Student Management", path: "/lecturer/students" },
            { name: "Events/Announcements", path: "/lecturer/events" },
            { name: "Assignments", path: "/lecturer/assignments" },
            { name: "Resources", path: "/lecturer/resources" },
            { name: "Communication", path: "/lecturer/communication" },
        ],
        student: [
            { name: "My Classes", path: "/student/classes" },
            { name: "Events/Announcements", path: "/student/events" },
            { name: "Assignments", path: "/student/assignments" },
            { name: "Resources", path: "/student/resources" },
            { name: "Communication", path: "/student/communication" },
        ]
    };

    return (
        <div className="sidebar">
            <div className="profile-summary">
                <div className="profile-image-container">
                    <img src={user?.profileImage || defaultProfileImage} alt="Profile" />
                </div>
                <div className="profile-info">
                    <div className="role">{role.charAt(0).toUpperCase() + role.slice(1)}</div>
                    <div className="name">{user?.firstName || "John"} {user?.lastName || "Doe"}</div>
                    <div className="id-display">ID: {user?.id || user?.studentId || user?.lecturerId || user?.adminId || "0001"}</div>
                </div>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems[role]?.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={location.pathname === item.path ? "active" : ""} // ✅ Highlight active menu item
                        >
                            {item.name}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;

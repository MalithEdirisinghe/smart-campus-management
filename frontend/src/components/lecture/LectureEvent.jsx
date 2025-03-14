import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LectureEvent.css";
import defaultProfileImage from "../../assets/default-profile.png";

const LectureEvent = () => {
    const navigate = useNavigate();
    const [lecturer, setLecturer] = useState(null);
    const [events, setEvents] = useState([]);
    const [sortBy, setSortBy] = useState("Latest");

    useEffect(() => {
        console.log("Fetching profile...");
        fetchProfile();
        console.log("Fetching events...");
        fetchEvents();
    }, [sortBy]);

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
            console.log("Profile data received:", data);
            setLecturer(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");

            const response = await fetch(`http://localhost:8080/api/events`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            console.log("API Response Data:", data);
            console.log("Token:", token);

            if (!Array.isArray(data)) {
                throw new Error("Invalid response format");
            }

            // Sort events
            if (sortBy === "Latest") {
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
            }

            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const getProfileImageSrc = () => {
        if (lecturer && lecturer.profileImage) {
            return lecturer.profileImage;
        }
        return defaultProfileImage;
    };

    return (
        <div className="event-management-container">
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
                        <li onClick={() => navigate("/lecturer/students")}>Student Management</li>
                        <li className="active">Events/Announcements</li>
                        <li onClick={() => navigate("/lecturer/assignments")}>Assignments</li>
                        <li onClick={() => navigate("/lecturer/resources")}>Resources</li>
                        <li onClick={() => navigate("/lecturer/communication")}>Communication</li>
                    </ul>
                </nav>
            </div>
            <div className="main-content">
                <h1>Upcoming Events/Announcements</h1>
                <div className="filter-sort">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="Latest">Latest</option>
                        <option value="Oldest">Oldest</option>
                    </select>
                </div>
                <div className="events-list">
                    {events.length > 0 ? (
                        events.map((event, index) => {
                            console.log("Rendering event:", event); // Debugging line
                            return (
                                <div key={index} className="event-card">
                                    <p><strong>Name:</strong> {event.name}</p>
                                    <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                                    <p><strong>Time:</strong> {event.time}</p>
                                    <p><strong>Location:</strong> {event.location}</p>
                                    <p><strong>Venue:</strong> {event.venue}</p>
                                    <p><strong>Description:</strong> {event.description}</p>
                                </div>
                            );
                        })
                    ) : (
                        <p>No events available.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LectureEvent;
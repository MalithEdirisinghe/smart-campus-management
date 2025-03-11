import React, { useState, useEffect } from "react";
import "./LectureProfile.css";
import { useNavigate } from "react-router-dom";
import defaultProfileImage from "../../assets/default-profile.png";

const LectureProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Using standardized field names that match backend expectations:
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    email: "",
    contactNumber: "",
    profileImage: null, // either a URL string (from DB) or a File object
  });
  const [originalProfileData, setOriginalProfileData] = useState(null);

  // Fetch lecturer profile data from the backend when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in again.");
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
          throw new Error(errorData.message || "Failed to fetch profile data");
        }

        const data = await response.json();
        console.log("Profile fetched:", data);

        // Set both formData and originalProfileData using standardized keys
        const fetchedData = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString('en-CA') : "",
          gender: data.gender || "",
          address: data.address || "",
          email: data.email || "",
          contactNumber: data.contactNumber || "",
          profileImage: data.profileImage || null,
          lecturerId: data.lecturerId || "NULL",
        };

        setFormData(fetchedData);
        setOriginalProfileData(fetchedData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image upload handler; updates profileImage with a File object
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profileImage: file }));
    }
  };

  // Submit handler - using PUT to update profile in the database
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Prepare FormData for sending data to the server
      const form = new FormData();
      form.append("firstName", formData.firstName);
      form.append("lastName", formData.lastName);
      form.append("dateOfBirth", formData.dateOfBirth);
      form.append("gender", formData.gender);
      form.append("address", formData.address);
      form.append("contactNumber", formData.contactNumber);
      // Email is read-only and thus not sent

      // Append the profile image file if a new one is uploaded
      if (formData.profileImage instanceof File) {
        form.append("profileImage", formData.profileImage);
      }

      const response = await fetch("http://localhost:8080/api/lecturer/profile/update", {
        method: "PUT", // Using PUT to update profile
        headers: {
          Authorization: `Bearer ${token}`,
          "x-access-token": token,
          // Do not set Content-Type header when sending FormData
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedData = await response.json();
      console.log("Profile updated:", updatedData);

      // Update both original and current state after successful save
      const newProfile = {
        ...formData,
        ...updatedData,
      };
      setOriginalProfileData(newProfile);
      setFormData(newProfile);

      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    }
  };

  // Discard changes and revert to original profile data
  const handleDiscard = () => {
    if (originalProfileData) {
      setFormData({
        ...originalProfileData,
      });
    }
  };

  // Navigation handler for sidebar links
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Helper function to determine the correct profile image source.
  // If profileImage is a File, create a temporary URL; if it's a string, use it.
  const getProfileImageSrc = () => {
    if (formData.profileImage) {
      if (formData.profileImage instanceof File) {
        return URL.createObjectURL(formData.profileImage);
      }
      return formData.profileImage;
    }
    return defaultProfileImage;
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="lecture-profile-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="profile-summary">
          <div className="profile-image-container">
            <img src={getProfileImageSrc()} alt="Profile" className="profile-image" />
          </div>
          <div className="profile-info">
            <div className="role">Lecturer</div>
            <div className="name">{formData.firstName} {formData.lastName}</div>
            <div className="id-display">ID: {formData.lecturerId}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active" onClick={() => handleNavigate("/lecturer/classes")}>
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
          {/* Optionally, add notification icons or header elements here */}
        </div>
        <div className="profile-content">
          <div className="profile-header">
            <div className="photo-upload-container">
              <div className="photo-upload">
                <input
                  type="file"
                  id="profile-photo-upload"
                  className="photo-upload-input"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <label htmlFor="profile-photo-upload" className="photo-upload-label">
                  <img
                    src={getProfileImageSrc()}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </label>
              </div>
            </div>
            <div className="department-info">
              <h2>Lecturer: Computing</h2>
            </div>
          </div>

          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-control-student"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lastName">Last Name:</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-control-student"
                />
              </div>
            </div>

            <div className="form-row split">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth:</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="form-control-student"
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender:</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-control-student"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-control-student"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  className="form-control-student"
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number:</label>
                <input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="form-control-student"
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-discard" onClick={handleDiscard}>
                Discard
              </button>
              <button type="submit" onClick={handleSubmit} className="btn-save">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureProfile;

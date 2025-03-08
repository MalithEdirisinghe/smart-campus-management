import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProfile.css';
import defaultProfileImage from '../../assets/default-profile.png';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const datePickerRef = useRef(null);
    const [originalProfileData, setOriginalProfileData] = useState(null);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        // Fetch admin profile data
        const fetchAdminProfile = async () => {
            try {
                setIsLoading(true);

                // Get token from localStorage
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Authentication token not found');
                }

                // Try to get cached user data first
                const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');

                // Fetch admin profile data from API
                const response = await fetch('http://localhost:8080/api/admin/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-access-token': token
                    }
                });

                // Check the raw response size
                const rawText = await response.clone().text();
                console.log("Raw response size:", rawText.length, "bytes");
                console.log("Does raw response contain image data:",
                    rawText.includes("data:image/jpeg;base64,"));

                if (!response.ok) {
                    // If API request fails but we have cached data, use that temporarily
                    if (cachedUser && cachedUser.role === 'admin') {
                        // Parse date of birth if available
                        let dateOfBirth = null;
                        if (cachedUser.dateOfBirth) {
                            dateOfBirth = new Date(cachedUser.dateOfBirth);
                        }

                        const userData = {
                            firstName: cachedUser.firstName || 'Ranuga',
                            lastName: cachedUser.lastName || 'Wijethunga',
                            adminId: cachedUser.adminId || 'A001',
                            role: 'Admin',
                            department: cachedUser.department || 'Computing',
                            dateOfBirth: dateOfBirth || new Date('2001-06-18'),
                            gender: cachedUser.gender || 'Male',
                            address: cachedUser.address || '633 1/2, Meththarama Rd, Kottawa',
                            email: cachedUser.email || 'Ranuga100@gmail.com',
                            contactNumber: cachedUser.contactNumber || '0718868557',
                            profileImage: cachedUser.profileImage || null
                        };

                        setProfileData(userData);
                        setOriginalProfileData(userData);
                        setIsLoading(false);
                        return;
                    }

                    // Handle HTTP errors if no cached data
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }

                const adminData = await response.json();
                console.log("Received admin profile data:", adminData);

                // Parse date of birth if available
                let dateOfBirth = null;
                if (adminData.dateOfBirth) {
                    const dateObj = new Date(adminData.dateOfBirth);
                    dateOfBirth = new Date(
                        dateObj.getFullYear(),
                        dateObj.getMonth(),
                        dateObj.getDate(),
                        12, 0, 0 // Set to noon to avoid timezone issues
                    );
                }

                // Set admin profile data
                const userData = {
                    firstName: adminData.firstName || '',
                    lastName: adminData.lastName || '',
                    adminId: adminData.adminId || '',
                    role: adminData.role || 'Admin',
                    department: adminData.department || 'Computing',
                    dateOfBirth: dateOfBirth || null,
                    gender: adminData.gender || '',
                    address: adminData.address || '',
                    email: adminData.email || '',
                    contactNumber: adminData.contactNumber || '',
                    profileImage: adminData.profileImage || null
                };

                setProfileData(userData);
                setOriginalProfileData(userData);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching admin profile:', error);
                setIsLoading(false);

                // If unauthorized, redirect to login
                if (error.message.includes('401') || error.message.includes('Authentication')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/admin/login');
                }
            }
        };

        fetchAdminProfile();
    }, [navigate]);

    useEffect(() => {
        // Handle clicks outside the calendar to close it
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [datePickerRef]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    const handleDateChange = (date) => {
        if (date) {
            // Create a new date at noon to avoid timezone issues
            const adjustedDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                12, 0, 0
            );

            setProfileData({
                ...profileData,
                dateOfBirth: adjustedDate
            });
        } else {
            setProfileData({
                ...profileData,
                dateOfBirth: null
            });
        }
        setIsCalendarOpen(false);
    };

    const toggleCalendar = (e) => {
        e.stopPropagation();
        setIsCalendarOpen(!isCalendarOpen);
    };

    const formatDate = (date) => {
        if (!date) return '';

        // Make sure we have a valid Date object
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            console.error("Invalid date provided to formatDate:", date);
            return '';
        }

        // Format as MM/DD/YYYY
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
            if (!validImageTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, or GIF)');
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                alert('File size exceeds 5MB. Please select a smaller image.');
                return;
            }

            // Store the file for later upload when save button is clicked
            setProfileData({
                ...profileData,
                profileImageFile: file
            });

            // Preview the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prevData => ({
                    ...prevData,
                    profileImagePreview: reader.result
                }));
                console.log("Image preview loaded successfully:", file.name);
            };
            reader.onerror = () => {
                console.error("Error reading file:", file.name);
                alert('Error reading the selected file. Please try again with a different image.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDiscard = () => {
        // Reset form to original data
        setProfileData({
            ...originalProfileData,
            profileImageFile: null,
            profileImagePreview: null
        });
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);

            // Get token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Create a FormData object for the profile update
            const formData = new FormData();

            // Add all profile fields to form data
            formData.append('firstName', profileData.firstName || '');
            formData.append('lastName', profileData.lastName || '');
            formData.append('adminId', profileData.adminId || '');

            // Format date correctly for the server
            if (profileData.dateOfBirth) {
                const formattedDate = new Date(
                    profileData.dateOfBirth.getFullYear(),
                    profileData.dateOfBirth.getMonth(),
                    profileData.dateOfBirth.getDate(),
                    12, 0, 0  // Use noon to avoid timezone issues
                ).toISOString();
                formData.append('dateOfBirth', formattedDate);
            }

            formData.append('gender', profileData.gender || '');
            formData.append('address', profileData.address || '');
            formData.append('contactNumber', profileData.contactNumber || '');
            formData.append('department', profileData.department || '');

            // Append the profile image file if a new one was selected
            if (profileData.profileImageFile) {
                formData.append('profileImage', profileData.profileImageFile);
                console.log('Adding image file to form data:', profileData.profileImageFile.name);
            }

            // Log form data for debugging
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
            }

            // Send the complete profile update with the image
            const response = await fetch('http://localhost:8080/api/admin/profile/update', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token,
                    // Do not set Content-Type header for FormData
                },
                body: formData
            });

            if (!response.ok) {
                // Try to parse error message from response
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Profile update response:', responseData);

            // Update profile data with the response from the server
            const updatedProfileData = {
                ...profileData,
                ...responseData,
                dateOfBirth: profileData.dateOfBirth, // Keep Date object for UI
                profileImageFile: null,  // Clear the file after successful upload
                profileImagePreview: null  // Clear the preview
            };

            if (responseData.profileImage) {
                updatedProfileData.profileImage = responseData.profileImage;
            }

            // Update localStorage with the new user data
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = {
                ...user,
                firstName: updatedProfileData.firstName,
                lastName: updatedProfileData.lastName,
                profileImage: updatedProfileData.profileImage,
                dateOfBirth: updatedProfileData.dateOfBirth ? updatedProfileData.dateOfBirth.toISOString() : null,
                gender: updatedProfileData.gender,
                address: updatedProfileData.address,
                contactNumber: updatedProfileData.contactNumber,
                department: updatedProfileData.department
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setOriginalProfileData(updatedProfileData);
            setProfileData(updatedProfileData);

            setIsLoading(false);

            alert('Profile saved successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            setIsLoading(false);

            // Provide a more user-friendly error message
            if (error.message.includes('413')) {
                alert('Failed to save profile: The image file is too large. Please select a smaller image.');
            } else if (error.message.includes('415')) {
                alert('Failed to save profile: The selected file type is not supported.');
            } else {
                alert(`Failed to save profile: ${error.message}`);
            }

            // If unauthorized, redirect to login
            if (error.message.includes('401') || error.message.includes('Authentication')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/admin/login');
            }
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    // If still loading, show loading spinner
    if (isLoading && !profileData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading profile data...</p>
            </div>
        );
    }

    // If data is not yet loaded (fallback)
    if (!profileData) {
        return null;
    }

    return (
        <div className="admin-profile-container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Saving changes...</p>
                </div>
            )}

            {/* Left Sidebar */}
            <div className="sidebar">
                <div className="profile-summary">
                    <div className="profile-image-container">
                        {profileData.profileImagePreview ? (
                            <img
                                src={profileData.profileImagePreview}
                                alt="Profile Preview"
                                className="profile-image"
                                onError={(e) => {
                                    console.error("Error loading preview image");
                                    e.target.onerror = null;
                                    e.target.src = defaultProfileImage;
                                }}
                            />
                        ) : profileData.profileImage ? (
                            <img
                                src={profileData.profileImage}
                                alt="Profile"
                                className="profile-image"
                                onLoad={() => console.log("Profile image loaded successfully")}
                                onError={(e) => {
                                    console.error("Error loading profile image:",
                                        profileData.profileImage ?
                                            `Image string starts with: ${profileData.profileImage.substring(0, 30)}...` :
                                            "No image data available");
                                    e.target.onerror = null;
                                    e.target.src = defaultProfileImage;
                                }}
                            />
                        ) : (
                            <img
                                src={defaultProfileImage}
                                alt="Default Profile"
                                className="profile-image"
                                onError={(e) => {
                                    console.error("Error loading default image");
                                    e.target.onerror = null;
                                    e.target.src = defaultProfileImage;
                                }}
                            />
                        )}
                    </div>
                    <div className="profile-info">
                        <div className="role">{profileData.role}</div>
                        <div className="name">{profileData.firstName} {profileData.lastName}</div>
                        <div className="id-display">ID: {profileData.adminId}</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li onClick={() => handleNavigate('/admin/dashboard')}>Dashboard</li>
                        <li onClick={() => handleNavigate('/admin/users')}>Users</li>
                        <li onClick={() => handleNavigate('/admin/events')}>Events/Announcements</li>
                        <li onClick={() => handleNavigate('/admin/resources')}>Resources</li>
                        <li onClick={() => handleNavigate('/admin/communication')}>Communication</li>
                        <li onClick={() => handleNavigate('/admin/reports')}>Reports</li>
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="top-bar">
                    <div className="notification-icons">
                        <div className="notification-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </div>
                        <div className="profile-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                    </div>
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
                                    {profileData.profileImagePreview ? (
                                        <img
                                            src={profileData.profileImagePreview}
                                            alt="Profile Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : profileData.profileImage ? (
                                        <img
                                            src={profileData.profileImage}
                                            alt="Profile"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                            <span>Upload a photo</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                        <div className="department-info">
                            <h2>Admin: {profileData.department}</h2>
                        </div>
                    </div>

                    <div className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First name:</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={profileData.firstName}
                                    onChange={handleInputChange}
                                    className="form-control-student"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="lastName">Last name:</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={profileData.lastName}
                                    onChange={handleInputChange}
                                    className="form-control-student"
                                />
                            </div>
                        </div>

                        <div className="form-row split">
                            <div className="form-group">
                                <label htmlFor="dateOfBirth">Date of birth:</label>
                                <div className="date-input-container-student">
                                    <input
                                        type="text"
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        value={formatDate(profileData.dateOfBirth)}
                                        readOnly
                                        className="form-control-student"
                                        onClick={toggleCalendar}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="calendar-button-student"
                                    onClick={toggleCalendar}
                                >
                                    <CalendarTodayIcon fontSize="large" />
                                </button>

                                {isCalendarOpen && (
                                    <div className="date-picker-container" ref={datePickerRef}>
                                        <DatePicker
                                            selected={profileData.dateOfBirth}
                                            onChange={handleDateChange}
                                            inline
                                            peekNextMonth
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            yearDropdownItemNumber={100}
                                            minDate={new Date(1940, 0, 1)}
                                            maxDate={new Date()}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender">Gender:</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={profileData.gender}
                                    onChange={handleInputChange}
                                    className="form-control-student-gender"
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
                                    value={profileData.address}
                                    onChange={handleInputChange}
                                    className="form-control-student"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email address:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={profileData.email}
                                    className="form-control-student"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="contactNumber">Contact number:</label>
                                <input
                                    type="text"
                                    id="contactNumber"
                                    name="contactNumber"
                                    value={profileData.contactNumber}
                                    onChange={handleInputChange}
                                    className="form-control-student"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn-discard" onClick={handleDiscard}>Discard</button>
                            <button className="btn-save" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
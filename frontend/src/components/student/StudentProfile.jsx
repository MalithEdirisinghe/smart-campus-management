import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import 'react-datepicker/dist/react-datepicker.css';
import './StudentProfile.css';
import defaultProfileImage from '../../assets/default-profile.png';

// Fallback image URL in case the import doesn't work
const fallbackImageUrl = '/images/default-profile.png';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const datePickerRef = useRef(null);

  // Log default image path for debugging
  useEffect(() => {
    console.log("Default profile image path:", defaultProfileImage);
  }, []);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Fetch student profile
        const response = await fetch('http://localhost:8080/api/student/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-access-token': token
          }
        });
        
        if (!response.ok) {
          // Try to parse error message from response
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log("Received profile data:", {
          ...userData,
          profileImage: userData.profileImage ? 
            `${userData.profileImage.substring(0, 50)}...` : 'No image'
        });
        
        // Transform data if needed and set it to state
        // Handle date with care to avoid timezone issues
        let dateOfBirth = null;
        if (userData.dateOfBirth) {
          const dateObj = new Date(userData.dateOfBirth);
          dateOfBirth = new Date(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate(),
            12, 0, 0 // Set to noon to avoid timezone issues
          );
          console.log("Original date from server:", userData.dateOfBirth);
          console.log("Parsed date:", dateObj);
          console.log("Adjusted date for display:", dateOfBirth);
        }
        
        const formattedUserData = {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          studentId: userData.studentId || '',
          department: userData.department || '',
          batch: userData.batch || '',
          dateOfBirth: dateOfBirth,
          gender: userData.gender || '',
          address: userData.address || '',
          email: userData.email || '',
          contactNumber: userData.contactNumber || '',
          profileImage: userData.profileImage || null
        };
        
        setProfileData(formattedUserData);
        setOriginalProfileData(formattedUserData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError(err.message);
        setIsLoading(false);
        
        // If unauthorized, redirect to login
        if (err.message.includes('401') || err.message.includes('Authentication')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };
    
    fetchUserProfile();
  }, [navigate]);

  // Handle clicks outside the calendar to close it
  useEffect(() => {
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
      
      console.log("Original selected date:", date);
      console.log("Adjusted date for state:", adjustedDate);
      
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
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create a single form data object for the entire profile update
      const formData = new FormData();
      
      // Add all profile fields to form data
      formData.append('firstName', profileData.firstName || '');
      formData.append('lastName', profileData.lastName || '');
      
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
      
      // Append the profile image file if a new one was selected
      if (profileData.profileImageFile) {
        formData.append('profileImage', profileData.profileImageFile);
        console.log('Adding image file to form data:', profileData.profileImageFile.name);
      }
      
      // Log form data contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }
      
      // Send the complete profile update with the image
      const response = await fetch('http://localhost:8080/api/student/profile/update', {
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
      console.log('Profile update response:', {
        ...responseData,
        profileImage: responseData.profileImage ? 
          `${responseData.profileImage.substring(0, 50)}...` : 'No image'
      });
      
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
      
      setOriginalProfileData(updatedProfileData);
      setProfileData(updatedProfileData);
      
      setIsEditing(false);
      setIsLoading(false);
      
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setIsLoading(false);
      alert(`Failed to save profile: ${err.message}`);
      
      // If unauthorized, redirect to login
      if (err.message.includes('401') || err.message.includes('Authentication')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const handleNavigation = (path) => {
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
  
  // If there's an error, show error message
  if (error && !profileData) {
    return (
      <div className="error-container">
        <h2>Failed to load profile</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Return to Login</button>
      </div>
    );
  }
  
  // If data is not yet loaded (fallback)
  if (!profileData) {
    return null;
  }

  return (
    <div className="student-profile-container">
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
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onLoad={() => console.log("Preview image loaded successfully")}
                onError={(e) => {
                  console.error("Error loading preview image");
                  e.target.onerror = null;
                  e.target.src = fallbackImageUrl;
                }}
              />
            ) : profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="profile-image"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onLoad={() => console.log("Profile image loaded successfully")}
                onError={(e) => {
                  console.error("Error loading profile image");
                  e.target.onerror = null;
                  e.target.src = fallbackImageUrl;
                }}
              />
            ) : (
              <img
                src={defaultProfileImage}
                alt="Default Profile"
                className="profile-image"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  console.error("Error loading default image");
                  e.target.onerror = null;
                  e.target.src = fallbackImageUrl;
                }}
              />
            )}
          </div>
          <div className="profile-info">
            <div className="role">Student</div>
            <div className="name">{profileData.firstName} {profileData.lastName}</div>
            <div className="id-display">ID: {profileData.studentId}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li onClick={() => handleNavigation('/student/classes')}>My Classes</li>
            <li onClick={() => handleNavigation('/student/events')}>Events/Announcements</li>
            <li onClick={() => handleNavigation('/student/assignments')}>Assignments</li>
            <li onClick={() => handleNavigation('/student/resources')}>Resources</li>
            <li onClick={() => handleNavigation('/student/communication')}>Communication</li>
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
                  onChange={(e) => {
                    handleImageUpload(e);
                  }}
                />
                <label htmlFor="profile-photo-upload" className="photo-upload-label">
                  {profileData.profileImagePreview ? (
                    <img 
                      src={profileData.profileImagePreview} 
                      alt="Profile Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onLoad={() => console.log("Preview image in upload area loaded successfully")}
                      onError={(e) => {
                        console.error("Error loading preview image in upload area");
                        e.target.onerror = null;
                        e.target.src = fallbackImageUrl;
                      }}
                    />
                  ) : profileData.profileImage ? (
                    <img 
                      src={profileData.profileImage} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onLoad={() => console.log("Profile image in upload area loaded successfully")}
                      onError={(e) => {
                        console.error("Error loading profile image in upload area");
                        e.target.onerror = null;
                        e.target.src = fallbackImageUrl;
                      }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                      <img 
                        src={defaultProfileImage} 
                        alt="Default Profile" 
                        style={{ width: '80%', height: '80%', objectFit: 'contain' }} 
                        onError={(e) => {
                          console.error("Error loading default image in upload area");
                          e.target.onerror = null;
                          e.target.src = fallbackImageUrl;
                        }}
                      />
                      <div className="upload-text" style={{ marginTop: '10px' }}>Upload a photo</div>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <div className="department-info">
              <div className="department-text">Student: {profileData.department}</div>
              <div className="batch-text">Batch: {profileData.batch}</div>
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
            {/* Remaining form fields */}
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
                  onChange={handleInputChange}
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

export default StudentProfile;
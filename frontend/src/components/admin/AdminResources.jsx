import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminResources.css';
import defaultProfileImage from '../../assets/default-profile.png';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminResources = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [admin, setAdmin] = useState(null);

    // States for Classrooms section
    const [classroomDate, setClassroomDate] = useState(formatDateForInput(new Date()));
    const [classroomTime, setClassroomTime] = useState('09.00');
    const [classroomTimeAMPM, setClassroomTimeAMPM] = useState('AM');
    const [classrooms, setClassrooms] = useState([]);
    const [classroomPage, setClassroomPage] = useState(0);
    const [totalClassroomPages, setTotalClassroomPages] = useState(1);

    // States for Equipment section
    const [equipmentDate, setEquipmentDate] = useState(formatDateForInput(new Date()));
    const [equipmentTime, setEquipmentTime] = useState('09.00');
    const [equipmentTimeAMPM, setEquipmentTimeAMPM] = useState('AM');
    const [equipmentType, setEquipmentType] = useState('Computers');
    const [equipment, setEquipment] = useState([]);
    const [equipmentPage, setEquipmentPage] = useState(0);
    const [totalEquipmentPages, setTotalEquipmentPages] = useState(1);

    // Modal states
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, left: 0 });
    const [selectedResource, setSelectedResource] = useState(null);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showClassroomCalendar, setShowClassroomCalendar] = useState(false);
    const [showEquipmentCalendar, setShowEquipmentCalendar] = useState(false);
    const classroomDatePickerRef = useRef(null);
    const equipmentDatePickerRef = useRef(null);

    // Add these functions to handle calendar toggling
    const toggleClassroomCalendar = (e) => {
        e.stopPropagation();
        setShowClassroomCalendar(!showClassroomCalendar);
        setShowEquipmentCalendar(false); // Close the other calendar if open
    };

    const toggleEquipmentCalendar = (e) => {
        e.stopPropagation();
        setShowEquipmentCalendar(!showEquipmentCalendar);
        setShowClassroomCalendar(false); // Close the other calendar if open
    };

    const [showEditReservationModal, setShowEditReservationModal] = useState(false);
    const [currentReservation, setCurrentReservation] = useState(null);

    // Add an effect to handle clicks outside the calendar to close it
    useEffect(() => {
        function handleClickOutside(event) {
            if (classroomDatePickerRef.current && !classroomDatePickerRef.current.contains(event.target)) {
                setShowClassroomCalendar(false);
            }
            if (equipmentDatePickerRef.current && !equipmentDatePickerRef.current.contains(event.target)) {
                setShowEquipmentCalendar(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [classroomDatePickerRef, equipmentDatePickerRef]);


    // Add these functions to handle date selection
    const handleClassroomDatePickerChange = (date) => {
        if (date) {
            // Format the date as MM/DD/YYYY
            const formattedDate = formatDateForInput(date);
            setClassroomDate(formattedDate);
            setClassroomPage(0); // Reset to first page when changing date
        }
        setShowClassroomCalendar(false);
    };

    const handleEquipmentDatePickerChange = (date) => {
        if (date) {
            // Format the date as MM/DD/YYYY
            const formattedDate = formatDateForInput(date);
            setEquipmentDate(formattedDate);
            setEquipmentPage(0); // Reset to first page when changing date
        }
        setShowEquipmentCalendar(false);
    };

    // Helper function to format date for input
    function formatDateForInput(date) {
        if (!date) return '';

        // Check if date is a valid Date object, if not, try to create one
        let d = date;
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            try {
                d = new Date(date);
                if (isNaN(d.getTime())) {
                    console.error("Invalid date:", date);
                    return '';
                }
            } catch (error) {
                console.error("Error parsing date:", error);
                return '';
            }
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${month}/${day}/${year}`;
    }

    // Fetch admin profile data
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setIsLoading(true);

                // Get auth token from localStorage
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Authentication token not found');
                }

                // Use cached user data if available
                const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');

                // Fetch admin profile data
                const response = await fetch('http://localhost:8080/api/admin/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-access-token': token
                    }
                });

                if (!response.ok) {
                    // If API request fails but we have cached data, use that temporarily
                    if (cachedUser && cachedUser.role === 'admin') {
                        setAdmin({
                            firstName: cachedUser.firstName || '',
                            lastName: cachedUser.lastName || '',
                            adminId: cachedUser.adminId || '',
                            role: 'Admin',
                            department: cachedUser.department || 'Computing',
                            profileImage: null
                        });

                        setIsLoading(false);
                        return;
                    }

                    // Handle HTTP errors if no cached data
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }

                const adminData = await response.json();

                // Set admin profile data
                setAdmin({
                    firstName: adminData.firstName || '',
                    lastName: adminData.lastName || '',
                    adminId: adminData.adminId || '',
                    role: adminData.role || 'Admin',
                    department: adminData.department || '',
                    profileImage: adminData.profileImage || null
                });

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching admin data:', error);
                setIsLoading(false);

                // If unauthorized, redirect to login
                if (error.message.includes('401') || error.message.includes('Authentication')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/admin/login');
                }
            }
        };

        fetchAdminData();
    }, [navigate]);

    // Fetch classrooms based on date and time selections
    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Authentication token not found');
                }

                // Build URL with query parameters
                const url = new URL('http://localhost:8080/api/resources/classrooms');
                url.searchParams.append('page', classroomPage);
                url.searchParams.append('includeReserved', 'true');

                if (classroomDate && classroomTime) {
                    url.searchParams.append('date', classroomDate);
                    url.searchParams.append('time', classroomTime);
                    url.searchParams.append('ampm', classroomTimeAMPM);
                }

                // Fetch classrooms from API
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-access-token': token
                    }
                });

                if (!response.ok) {
                    // Handle HTTP errors
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }

                const data = await response.json();

                setClassrooms(data.classrooms);
                setTotalClassroomPages(data.pagination.totalPages);
            } catch (error) {
                console.error('Error fetching classrooms:', error);
                setClassrooms([]);

                // If unauthorized, redirect to login
                if (error.message.includes('401') || error.message.includes('Authentication')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/admin/login');
                }
            }
        };

        if (!isLoading) {
            fetchClassrooms();
        }
    }, [classroomPage, classroomDate, classroomTime, classroomTimeAMPM, isLoading, navigate]);

    // Fetch equipment based on type, date, and time selections
    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                // Get token from localStorage
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Authentication token not found');
                }

                // Build URL with query parameters
                const url = new URL('http://localhost:8080/api/resources/equipment');
                url.searchParams.append('type', equipmentType);
                url.searchParams.append('page', equipmentPage);
                url.searchParams.append('includeReserved', 'true');

                if (equipmentDate && equipmentTime) {
                    url.searchParams.append('date', equipmentDate);
                    url.searchParams.append('time', equipmentTime);
                    url.searchParams.append('ampm', equipmentTimeAMPM);
                }

                // Fetch equipment from API
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-access-token': token
                    }
                });

                if (!response.ok) {
                    // Handle HTTP errors
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }

                const data = await response.json();

                setEquipment(data.equipment);
                setTotalEquipmentPages(data.pagination.totalPages);
            } catch (error) {
                console.error('Error fetching equipment:', error);
                setEquipment([]);

                // If unauthorized, redirect to login
                if (error.message.includes('401') || error.message.includes('Authentication')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/admin/login');
                }
            }
        };

        if (!isLoading) {
            fetchEquipment();
        }
    }, [equipmentPage, equipmentType, equipmentDate, equipmentTime, equipmentTimeAMPM, isLoading, navigate]);

    const fetchReservationDetails = async (resourceType, resourceId) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            const url = new URL(`http://localhost:8080/api/resources/reservation-details`);
            url.searchParams.append('resourceType', resourceType);
            url.searchParams.append('resourceId', resourceId);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch reservation details');
            }

            const data = await response.json();
            return data.reservation;
        } catch (error) {
            console.error('Error fetching reservation details:', error);
            alert(`Failed to fetch reservation details: ${error.message}`);
            return null;
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleClassroomDateChange = (e) => {
        setClassroomDate(e.target.value);
        setClassroomPage(0); // Reset to first page when changing date
    };

    const handleClassroomTimeChange = (e) => {
        setClassroomTime(e.target.value);
        setClassroomPage(0); // Reset to first page when changing time
    };

    const handleClassroomTimeAMPMChange = (value) => {
        setClassroomTimeAMPM(value);
        setClassroomPage(0); // Reset to first page when changing AM/PM
    };

    const handleEquipmentDateChange = (e) => {
        setEquipmentDate(e.target.value);
        setEquipmentPage(0); // Reset to first page when changing date
    };

    const handleEquipmentTimeChange = (e) => {
        setEquipmentTime(e.target.value);
        setEquipmentPage(0); // Reset to first page when changing time
    };

    const handleEquipmentTimeAMPMChange = (value) => {
        setEquipmentTimeAMPM(value);
        setEquipmentPage(0); // Reset to first page when changing AM/PM
    };

    const handleEquipmentTypeChange = (e) => {
        setEquipmentType(e.target.value);
        setEquipmentPage(0); // Reset to first page when changing equipment type
    };

    const handlePreviousClassroomPage = () => {
        if (classroomPage > 0) {
            setClassroomPage(classroomPage - 1);
        }
    };

    const handleNextClassroomPage = () => {
        if (classroomPage < totalClassroomPages - 1) {
            setClassroomPage(classroomPage + 1);
        }
    };

    const handlePreviousEquipmentPage = () => {
        if (equipmentPage > 0) {
            setEquipmentPage(equipmentPage - 1);
        }
    };

    const handleNextEquipmentPage = () => {
        if (equipmentPage < totalEquipmentPages - 1) {
            setEquipmentPage(equipmentPage + 1);
        }
    };

    const handleActionMenuToggle = (e, resource, type) => {
        e.stopPropagation();

        // Position the menu relative to the button
        const rect = e.currentTarget.getBoundingClientRect();

        setActionMenuPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX - 100 // Adjust left position
        });

        setSelectedResource({ ...resource, type });
        setShowActionMenu(true);
    };

    const handleResourceAction = async (action) => {
        setShowActionMenu(false);

        if (action === 'reserve') {
            setShowReservationModal(true);
        } else if (action === 'release') {
            releaseResource();
        } else if (action === 'edit') {
            if (!selectedResource.available) {
                // Resource is reserved, fetch reservation details
                const reservation = await fetchReservationDetails(
                    selectedResource.type === 'classroom' ? 'classroom' : 'equipment',
                    selectedResource.id
                );

                if (reservation) {
                    setCurrentReservation(reservation);
                    setShowEditReservationModal(true);
                }
            } else {
                // Resource is available, show regular edit option (not implemented yet)
                alert(`Editing resource ${selectedResource.id}`);
            }
        }
    };

    const updateReservation = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Get form data
            const assignTo = e.target.elements.assignTo.value;
            const purpose = e.target.elements.purpose?.value || '';

            const response = await fetch('http://localhost:8080/api/resources/update-reservation', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                },
                body: JSON.stringify({
                    reservationId: currentReservation.reservationId,
                    resourceType: selectedResource.type === 'classroom' ? 'classroom' : 'equipment',
                    resourceId: selectedResource.id,
                    reservedBy: assignTo,
                    purpose: purpose
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update reservation');
            }

            // Process the response
            await response.json();

            // Update local state for the UI
            if (selectedResource.type === 'classroom') {
                // Create a copy of the classrooms array
                const updatedClassrooms = [...classrooms];

                // Find the index of the classroom that was updated
                const classroomIndex = updatedClassrooms.findIndex(c => c.id === selectedResource.id);

                // If the classroom exists in our array, update it
                if (classroomIndex !== -1) {
                    updatedClassrooms[classroomIndex] = {
                        ...updatedClassrooms[classroomIndex],
                        batch: assignTo
                    };

                    // Update the state with the modified array
                    setClassrooms(updatedClassrooms);
                }
            } else {
                // Same logic for equipment
                const updatedEquipment = [...equipment];
                const equipmentIndex = updatedEquipment.findIndex(e => e.id === selectedResource.id);

                if (equipmentIndex !== -1) {
                    updatedEquipment[equipmentIndex] = {
                        ...updatedEquipment[equipmentIndex],
                        assignedTo: assignTo
                    };

                    setEquipment(updatedEquipment);
                }
            }

            alert(`Reservation for ${selectedResource.id} updated successfully`);
            setShowEditReservationModal(false);
        } catch (error) {
            console.error('Error updating reservation:', error);
            alert(`Failed to update reservation: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const releaseResource = async () => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch('http://localhost:8080/api/resources/release', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                },
                body: JSON.stringify({
                    resourceType: selectedResource.type === 'classroom' ? 'classroom' : 'equipment',
                    resourceId: selectedResource.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to release resource');
            }

            // Process the response
            await response.json();

            // Update local state for the UI
            if (selectedResource.type === 'classroom') {
                // Create a copy of the classrooms array
                const updatedClassrooms = [...classrooms];

                // Find the index of the classroom that was released
                const classroomIndex = updatedClassrooms.findIndex(c => c.id === selectedResource.id);

                // If the classroom exists in our array, update it
                if (classroomIndex !== -1) {
                    updatedClassrooms[classroomIndex] = {
                        ...updatedClassrooms[classroomIndex],
                        available: true,
                        batch: null
                    };

                    // Update the state with the modified array
                    setClassrooms(updatedClassrooms);
                }
            } else {
                // Same logic for equipment
                const updatedEquipment = [...equipment];
                const equipmentIndex = updatedEquipment.findIndex(e => e.id === selectedResource.id);

                if (equipmentIndex !== -1) {
                    updatedEquipment[equipmentIndex] = {
                        ...updatedEquipment[equipmentIndex],
                        available: true,
                        assignedTo: null
                    };

                    setEquipment(updatedEquipment);
                }
            }

            alert(`Resource ${selectedResource.id} has been released.`);
        } catch (error) {
            console.error('Error releasing resource:', error);
            alert(`Failed to release resource: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReservationSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Get form data
            const assignTo = e.target.elements.assignTo.value;
            const purpose = e.target.elements.purpose?.value || '';

            const response = await fetch('http://localhost:8080/api/resources/reserve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                },
                body: JSON.stringify({
                    resourceType: selectedResource.type === 'classroom' ? 'classroom' : 'equipment',
                    resourceId: selectedResource.id,
                    reservedBy: assignTo,
                    date: selectedResource.type === 'classroom' ? classroomDate : equipmentDate,
                    time: selectedResource.type === 'classroom' ? classroomTime : equipmentTime,
                    ampm: selectedResource.type === 'classroom' ? classroomTimeAMPM : equipmentTimeAMPM,
                    purpose: purpose
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to reserve resource');
            }

            // Process the response
            await response.json();

            // Update local state for the UI
            if (selectedResource.type === 'classroom') {
                // Create a copy of the classrooms array
                const updatedClassrooms = [...classrooms];

                // Find the index of the classroom that was reserved
                const classroomIndex = updatedClassrooms.findIndex(c => c.id === selectedResource.id);

                // If the classroom exists in our array, update it
                if (classroomIndex !== -1) {
                    updatedClassrooms[classroomIndex] = {
                        ...updatedClassrooms[classroomIndex],
                        available: false,
                        batch: assignTo
                    };

                    // Update the state with the modified array
                    setClassrooms(updatedClassrooms);
                }
            } else {
                // Same logic for equipment
                const updatedEquipment = [...equipment];
                const equipmentIndex = updatedEquipment.findIndex(e => e.id === selectedResource.id);

                if (equipmentIndex !== -1) {
                    updatedEquipment[equipmentIndex] = {
                        ...updatedEquipment[equipmentIndex],
                        available: false,
                        assignedTo: assignTo
                    };

                    setEquipment(updatedEquipment);
                }
            }

            alert(`Resource ${selectedResource.id} reserved for ${assignTo}`);
            setShowReservationModal(false);
        } catch (error) {
            console.error('Error reserving resource:', error);
            alert(`Failed to reserve resource: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setShowReservationModal(false);
    };

    // If still loading, show loading spinner
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading resource management...</p>
            </div>
        );
    }

    return (
        <div className="admin-resources-container">
            {/* Left Sidebar */}
            <div className="sidebar">
                <div className="profile-summary">
                    <div className="profile-image-container">
                        {admin.profileImage ? (
                            <img
                                src={admin.profileImage}
                                alt="Profile"
                                className="profile-image"
                                onError={(e) => {
                                    console.error("Error loading profile image");
                                    e.target.onerror = null;
                                    e.target.src = defaultProfileImage;
                                }}
                            />
                        ) : (
                            <img
                                src={defaultProfileImage}
                                alt="Default Profile"
                                className="profile-image"
                            />
                        )}
                    </div>
                    <div className="profile-info">
                        <div className="role">{admin.role}</div>
                        <div className="name">{admin.firstName} {admin.lastName}</div>
                        <div className="id-display">ID: {admin.adminId}</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li onClick={() => handleNavigate('/admin/dashboard')}>Dashboard</li>
                        <li onClick={() => handleNavigate('/admin/users')}>Users</li>
                        <li onClick={() => handleNavigate('/admin/events')}>Events/Announcements</li>
                        <li className="active" onClick={() => handleNavigate('/admin/resources')}>Resources</li>
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
                        <div
                            className="profile-icon"
                            onClick={() => handleNavigate('/admin/profile')}
                            style={{ cursor: 'pointer' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="resources-content">
                    {/* Classrooms Section */}
                    <section className="classrooms-section">
                        <h2 className="section-title">Classrooms & Labs</h2>

                        <div className="resource-filters">
                            <div className="filter-group">
                                <label htmlFor="classroom-date">Date</label>
                                <div className="date-input-container">
                                    <input
                                        type="text"
                                        id="classroom-date"
                                        value={classroomDate}
                                        onChange={handleClassroomDateChange}
                                        className="date-input"
                                    />
                                    <button
                                        type="button"
                                        className="calendar-button"
                                        onClick={toggleClassroomCalendar}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </button>
                                    {showClassroomCalendar && (
                                        <div className="date-picker-container" ref={classroomDatePickerRef}>
                                            <DatePicker
                                                selected={new Date(classroomDate)}
                                                onChange={handleClassroomDatePickerChange}
                                                inline
                                                peekNextMonth
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                yearDropdownItemNumber={10}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label htmlFor="classroom-time">Time</label>
                                <div className="time-input-container">
                                    <input
                                        type="text"
                                        id="classroom-time"
                                        value={classroomTime}
                                        onChange={handleClassroomTimeChange}
                                        className="time-input"
                                    />
                                    <div className="time-suffix">
                                        <select
                                            value={classroomTimeAMPM}
                                            onChange={(e) => handleClassroomTimeAMPMChange(e.target.value)}
                                            className="ampm-select"
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="resource-grid">
                            <button
                                className="nav-button prev"
                                onClick={handlePreviousClassroomPage}
                                disabled={classroomPage === 0}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>

                            <div className="resources-grid">
                                {classrooms.length > 0 ? (
                                    classrooms.map(classroom => (
                                        <div
                                            key={classroom.id}
                                            className={`resource-card ${!classroom.available ? 'reserved' : ''}`}
                                        >
                                            <div className="resource-info">
                                                <h3>{classroom.id}</h3>
                                                <p>{classroom.available ? 'Available' : `Status: ${classroom.status || 'Reserved'}`}</p>
                                            </div>
                                            <div className="action-icon-container">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="vertical-dots-icon"
                                                    onClick={(e) => handleActionMenuToggle(e, classroom, 'classroom')}
                                                >
                                                    <circle cx="12" cy="5" r="2"></circle>
                                                    <circle cx="12" cy="12" r="2"></circle>
                                                    <circle cx="12" cy="19" r="2"></circle>
                                                </svg>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-resources-message">
                                        No classrooms available for the selected time and date.
                                    </div>
                                )}
                            </div>

                            <button
                                className="nav-button next"
                                onClick={handleNextClassroomPage}
                                disabled={classroomPage >= totalClassroomPages - 1}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </section>

                    {/* Equipment Section */}
                    <section className="equipment-section">
                        <h2 className="section-title">Equipments</h2>

                        <div className="resource-filters">
                            <div className="filter-group">
                                <label htmlFor="equipment-date">Date</label>
                                <div className="date-input-container">
                                    <input
                                        type="text"
                                        id="equipment-date"
                                        value={equipmentDate}
                                        onChange={handleEquipmentDateChange}
                                        className="date-input"
                                    />
                                    <button
                                        type="button"
                                        className="calendar-button"
                                        onClick={toggleEquipmentCalendar}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                    </button>

                                    {showEquipmentCalendar && (
                                        <div className="date-picker-container" ref={equipmentDatePickerRef}>
                                            <DatePicker
                                                selected={new Date(equipmentDate)}
                                                onChange={handleEquipmentDatePickerChange}
                                                inline
                                                peekNextMonth
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                yearDropdownItemNumber={10}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="filter-group">
                                <label htmlFor="equipment-time">Time</label>
                                <div className="time-input-container">
                                    <input
                                        type="text"
                                        id="equipment-time"
                                        value={equipmentTime}
                                        onChange={handleEquipmentTimeChange}
                                        className="time-input"
                                    />
                                    <div className="time-suffix">
                                        <select
                                            value={equipmentTimeAMPM}
                                            onChange={(e) => handleEquipmentTimeAMPMChange(e.target.value)}
                                            className="ampm-select"
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="equipment-type">
                            <label htmlFor="equipment-type-select">Equipment Type</label>
                            <select
                                id="equipment-type-select"
                                value={equipmentType}
                                onChange={handleEquipmentTypeChange}
                                className="type-select"
                            >
                                <option value="Computers">Computers</option>
                                <option value="Projectors">Projectors</option>
                                <option value="Tablets">Tablets</option>
                            </select>
                        </div>

                        <div className="resource-grid">
                            <button
                                className="nav-button prev"
                                onClick={handlePreviousEquipmentPage}
                                disabled={equipmentPage === 0}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>

                            <div className="resources-grid">
                                {equipment.length > 0 ? (
                                    equipment.map(item => (
                                        <div
                                            key={item.id}
                                            className={`resource-card ${!item.available ? 'reserved' : ''}`}
                                        >
                                            <div className="resource-info">
                                                <h3>{item.id}</h3>
                                                <p>{item.available ? 'Available' : `Status: ${item.status}`}</p>
                                            </div>
                                            <div className="action-icon-container">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="vertical-dots-icon"
                                                    onClick={(e) => handleActionMenuToggle(e, item, 'equipment')}
                                                >
                                                    <circle cx="12" cy="5" r="2"></circle>
                                                    <circle cx="12" cy="12" r="2"></circle>
                                                    <circle cx="12" cy="19" r="2"></circle>
                                                </svg>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-resources-message">
                                        No {equipmentType.toLowerCase()} available for the selected time and date.
                                    </div>
                                )}
                            </div>

                            <button
                                className="nav-button next"
                                onClick={handleNextEquipmentPage}
                                disabled={equipmentPage >= totalEquipmentPages - 1}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Action Menu */}
            {showActionMenu && (
                <div
                    className="action-menu"
                    style={{
                        top: `${actionMenuPosition.top}px`,
                        left: `${actionMenuPosition.left}px`
                    }}
                >
                    {selectedResource?.available ? (
                        <button onClick={() => handleResourceAction('reserve')}>Reserve</button>
                    ) : (
                        <button onClick={() => handleResourceAction('release')}>Release</button>
                    )}
                    <button onClick={() => handleResourceAction('edit')}>Edit</button>
                    <button onClick={() => setShowActionMenu(false)}>Cancel</button>
                </div>
            )}

            {/* Reservation Modal */}
            {showReservationModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Reserve {selectedResource?.type === 'classroom' ? 'Classroom' : 'Equipment'}</h2>
                            <button className="close-button" onClick={handleCloseModal}>×</button>
                        </div>

                        <form onSubmit={handleReservationSubmit} className="reservation-form">
                            <div className="form-group">
                                <label htmlFor="resourceId">Resource ID</label>
                                <input
                                    type="text"
                                    id="resourceId"
                                    value={selectedResource?.id || ''}
                                    disabled
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="assignTo">Assign to (User ID)</label>
                                <input
                                    type="text"
                                    id="assignTo"
                                    placeholder="Enter user ID (e.g., S001, L001)"
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="purpose">Purpose (optional)</label>
                                <textarea
                                    id="purpose"
                                    placeholder="Enter purpose for this reservation"
                                    className="form-control"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleCloseModal}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-reserve"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Reserving...' : 'Reserve'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Reservation Modal */}
            {showEditReservationModal && currentReservation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit Reservation for {selectedResource?.type === 'classroom' ? 'Classroom' : 'Equipment'}</h2>
                            <button className="close-button" onClick={() => setShowEditReservationModal(false)}>×</button>
                        </div>

                        <form onSubmit={updateReservation} className="reservation-form">
                            <div className="form-group">
                                <label htmlFor="resourceId">Resource ID</label>
                                <input
                                    type="text"
                                    id="resourceId"
                                    value={selectedResource?.id || ''}
                                    disabled
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="assignTo">Assigned to (User ID)</label>
                                <input
                                    type="text"
                                    id="assignTo"
                                    placeholder="Enter user ID (e.g., S001, L001)"
                                    defaultValue={currentReservation.reservedBy}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="purpose">Purpose</label>
                                <textarea
                                    id="purpose"
                                    placeholder="Enter purpose for this reservation"
                                    defaultValue={currentReservation.purpose}
                                    className="form-control"
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowEditReservationModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-reserve"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Reservation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Click outside handler for action menu */}
            {showActionMenu && (
                <div
                    className="overlay"
                    onClick={() => setShowActionMenu(false)}
                ></div>
            )}
        </div>
    );
};

export default AdminResources;
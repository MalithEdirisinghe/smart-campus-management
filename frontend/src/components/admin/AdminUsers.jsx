import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminUsers.css';
import defaultProfileImage from '../../assets/default-profile.png';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [admin, setAdmin] = useState(null);
    const [userType, setUserType] = useState('Admin');
    const [permissionUserType, setPermissionUserType] = useState('Student');
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState({
        view: true,
        edit: false,
        delete: false,
        share: true,
        download: true
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: 'Computing',
        contactNumber: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editUser, setEditUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        contactNumber: ''
    });

    // No mock data - we'll fetch from the database

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

    // Fetch users based on selected role
    const fetchUsers = async (role) => {
        setIsLoadingUsers(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Determine the correct endpoint based on the selected role
            let endpoint;
            switch (role.toLowerCase()) {
                case 'admin':
                    endpoint = 'http://localhost:8080/api/admin/users/admins';
                    break;
                case 'lecturer':
                    endpoint = 'http://localhost:8080/api/admin/users/lecturers';
                    break;
                case 'student':
                    endpoint = 'http://localhost:8080/api/admin/users/students';
                    break;
                default:
                    endpoint = 'http://localhost:8080/api/admin/users';
            }

            // Make the API call to fetch users
            const response = await fetch(endpoint, {
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

            const userData = await response.json();

            // Format the data to match our component's expected structure
            const formattedUsers = userData.map(user => ({
                id: user.admin_id || user.adminId || user.lecturer_id || user.lecturerId ||
                    user.student_id || user.studentId || user.id || '',
                firstName: user.firstName,
                lastName: user.lastName,
                department: user.department,
                contactNumber: user.contactNumber,
                email: user.email
            }));

            setUsers(formattedUsers);
        } catch (error) {
            console.error(`Error fetching ${role} users:`, error);
            setUsers([]);

            // If unauthorized, redirect to login
            if (error.message.includes('401') || error.message.includes('Authentication')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/admin/login');
            }
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
    };

    // Fetch users when role changes
    useEffect(() => {
        if (!isLoading) {
            fetchUsers(userType);
        }
    }, [userType, isLoading]);

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
    };

    const handlePermissionUserTypeChange = (e) => {
        setPermissionUserType(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePermissionChange = (permission) => {
        setPermissions({
            ...permissions,
            [permission]: !permissions[permission]
        });
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user => {
        if (!user) return false;

        const searchLower = searchTerm.toLowerCase();
        return (
            (user.id?.toLowerCase() || '').includes(searchLower) ||
            (user.firstName?.toLowerCase() || '').includes(searchLower) ||
            (user.lastName?.toLowerCase() || '').includes(searchLower) ||
            (user.email?.toLowerCase() || '').includes(searchLower) ||
            (user.department?.toLowerCase() || '').includes(searchLower) ||
            ((user.contactNumber || '')?.toLowerCase() || '').includes(searchLower)
        );
    });

    // View, Add, Edit, Delete, Save handlers
    const handleView = () => {
        console.log('View clicked');
    };

    const handleAdd = () => {
        // Set the department to the current default
        setNewUser({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            department: 'Computing',
            contactNumber: ''
        });
        setFormErrors({});
        setShowAddForm(true);
    };

    // Handle input changes in the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({
            ...newUser,
            [name]: value
        });

        // Clear the error for this field when the user types
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    // Validate the form
    const validateForm = () => {
        const errors = {};

        if (!newUser.firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!newUser.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        if (!newUser.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!newUser.password) {
            errors.password = 'Password is required';
        } else if (newUser.password.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
        }

        if (!newUser.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (newUser.password !== newUser.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Function to handle form submission
    const handleSubmitUser = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSubmitting(true);

            try {
                // Get auth token from localStorage
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Authentication token not found');
                }

                // Prepare the data for the API
                const userData = {
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    password: newUser.password,
                    department: newUser.department,
                    role: userType.toLowerCase(),
                    contactNumber: newUser.contactNumber
                };

                // Make API call to create the user
                const response = await fetch('http://localhost:8080/api/admin/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'x-access-token': token
                    },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }

                const responseData = await response.json();

                // Add the new user to the users list
                setUsers([...users, {
                    id: responseData.id || responseData.userId,
                    firstName: responseData.firstName,
                    lastName: responseData.lastName,
                    department: responseData.department,
                    contactNumber: responseData.contactNumber,
                    email: responseData.email
                }]);

                // Close the form and reset
                setShowAddForm(false);
                alert('User added successfully');
            } catch (error) {
                console.error('Error adding user:', error);
                setFormErrors({
                    ...formErrors,
                    form: error.message
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleEdit = () => {
        if (!selectedUser) {
            alert('Please select a user to edit');
            return;
        }

        // Pre-populate the edit form with the selected user's data
        setEditUser({
            firstName: selectedUser.firstName || '',
            lastName: selectedUser.lastName || '',
            email: selectedUser.email || '',
            department: selectedUser.department || 'Computing',
            contactNumber: selectedUser.contactNumber || ''
        });

        setShowEditForm(true);
    };

    const handleDelete = () => {
        console.log('Delete clicked');
    };

    const handleSave = () => {
        console.log('Save clicked');
    };

    const handleDiscard = () => {
        console.log('Discard clicked');
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();

        if (!selectedUser || !selectedUser.id) {
            alert('Please select a user to edit first');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Prepare the data for the API
            const userData = {
                firstName: editUser.firstName,
                lastName: editUser.lastName,
                email: editUser.email,
                department: editUser.department,
                contactNumber: editUser.contactNumber
            };

            // Add debug log to verify the ID
            console.log(`Updating ${userType} with ID:`, selectedUser.id);

            // Determine the endpoint based on role, using the ID from selectedUser
            let endpoint;
            switch (userType.toLowerCase()) {
                case 'admin':
                    endpoint = `http://localhost:8080/api/admin/users/admin/${selectedUser.id}`;
                    break;
                case 'lecturer':
                    endpoint = `http://localhost:8080/api/admin/users/lecturer/${selectedUser.id}`;
                    break;
                case 'student':
                    endpoint = `http://localhost:8080/api/admin/users/student/${selectedUser.id}`;
                    break;
                default:
                    throw new Error('Invalid user type');
            }

            // Make API call to update the user
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            // Update the user in the local state
            const updatedUsers = users.map(user => {
                if (user.id === selectedUser.id) {
                    return {
                        ...user,
                        ...userData
                    };
                }
                return user;
            });

            setUsers(updatedUsers);
            setSelectedUser(null);
            setShowEditForm(false);
            alert('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            alert(`Failed to update user: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // If still loading, show loading spinner
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading user management data...</p>
            </div>
        );
    }
    const handleUserDelete = (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
            deleteUser(user);
        }
    };

    const deleteUser = async (user) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication token not found');
            }

            // Determine the endpoint based on user type
            let endpoint;
            switch (userType.toLowerCase()) {
                case 'admin':
                    endpoint = `http://localhost:8080/api/admin/users/admin/${user.id}`;
                    break;
                case 'lecturer':
                    endpoint = `http://localhost:8080/api/admin/users/lecturer/${user.id}`;
                    break;
                case 'student':
                    endpoint = `http://localhost:8080/api/admin/users/student/${user.id}`;
                    break;
                default:
                    throw new Error('Invalid user type');
            }

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-access-token': token
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error: ${response.status}`);
            }

            // Remove the user from the local state
            setUsers(users.filter(u => u.id !== user.id));

            // If the deleted user was selected, clear the selection
            if (selectedUser && selectedUser.id === user.id) {
                setSelectedUser(null);
            }

            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(`Failed to delete user: ${error.message}`);
        }
    };

    return (
        <div className="admin-users-container">
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
                        <li className="active" onClick={() => handleNavigate('/admin/users')}>Users</li>
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

                <div className="user-management-content">
                    <h1 className="section-title">User Management</h1>

                    <div className="user-selection-controls">
                        <div className="select-container">
                            <label>Select User:</label>
                            <select
                                value={userType}
                                onChange={handleUserTypeChange}
                                className="user-type-select"
                            >
                                <option value="Admin">Admin</option>
                                <option value="Lecturer">Lecturer</option>
                                <option value="Student">Student</option>
                            </select>
                        </div>

                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                            />
                            <span className="search-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                            </span>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="action-button active" onClick={handleView}>View</button>
                        <button className="action-button" onClick={handleAdd}>Add</button>
                        <button className="action-button" onClick={handleEdit}>Edit</button>
                        <button className="action-button" onClick={handleDelete}>Delete</button>
                        <button className="action-button" onClick={handleSave}>Save</button>
                    </div>

                    {/* User Table */}
                    <div className="user-table-container">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>First name</th>
                                    <th>Last name</th>
                                    <th>Department</th>
                                    <th>Contact No.</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingUsers ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                                                Loading {userType} users...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr
                                            key={user.id || `user-${Math.random()}`}
                                            onClick={() => handleSelectUser(user)}
                                            className={selectedUser && selectedUser.id === user.id ? 'selected-row' : ''}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>{user.id}</td>
                                            <td>{user.firstName}</td>
                                            <td>{user.lastName}</td>
                                            <td>{user.department}</td>
                                            <td>{user.contactNumber || 'N/A'}</td>
                                            <td>{user.email}</td>
                                            <td className="actions-cell">
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectUser(user);
                                                        handleEdit();
                                                    }}
                                                    title="Edit user"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUserDelete(user);
                                                    }}
                                                    title="Delete user"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                            No {userType} users found
                                            {searchTerm ? ` matching "${searchTerm}"` : ''}
                                        </td>
                                    </tr>
                                )}

                                {/* Add empty rows to maintain table size consistency */}
                                {!isLoadingUsers && filteredUsers.length > 0 && filteredUsers.length < 5 &&
                                    [...Array(5 - filteredUsers.length)].map((_, index) => (
                                        <tr key={`empty-${index}`}>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    {/* Permission Control Section */}
                    <div className="permission-control-section">
                        <h2 className="section-title">Permission Control</h2>

                        <div className="permission-selection">
                            <label>Select User:</label>
                            <select
                                value={permissionUserType}
                                onChange={handlePermissionUserTypeChange}
                                className="permission-user-select"
                            >
                                <option value="Student">Student</option>
                                <option value="Lecturer">Lecturer</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <div className="permission-checkboxes">
                            <div className="permission-row">
                                <div className="permission-option">
                                    <input
                                        type="checkbox"
                                        id="view-permission"
                                        checked={permissions.view}
                                        onChange={() => handlePermissionChange('view')}
                                    />
                                    <label htmlFor="view-permission">View</label>
                                </div>

                                <div className="permission-option">
                                    <input
                                        type="checkbox"
                                        id="edit-permission"
                                        checked={permissions.edit}
                                        onChange={() => handlePermissionChange('edit')}
                                    />
                                    <label htmlFor="edit-permission">Edit</label>
                                </div>

                                <div className="permission-option">
                                    <input
                                        type="checkbox"
                                        id="delete-permission"
                                        checked={permissions.delete}
                                        onChange={() => handlePermissionChange('delete')}
                                    />
                                    <label htmlFor="delete-permission">Delete</label>
                                </div>
                            </div>

                            <div className="permission-row">
                                <div className="permission-option">
                                    <input
                                        type="checkbox"
                                        id="share-permission"
                                        checked={permissions.share}
                                        onChange={() => handlePermissionChange('share')}
                                    />
                                    <label htmlFor="share-permission">Share</label>
                                </div>

                                <div className="permission-option">
                                    <input
                                        type="checkbox"
                                        id="download-permission"
                                        checked={permissions.download}
                                        onChange={() => handlePermissionChange('download')}
                                    />
                                    <label htmlFor="download-permission">Download</label>
                                </div>
                            </div>
                        </div>

                        <div className="permission-actions">
                            <button className="btn-discard" onClick={handleDiscard}>Discard</button>
                            <button className="btn-save" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Add User Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add New {userType}</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowAddForm(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmitUser} className="add-user-form">
                            {formErrors.form && (
                                <div className="form-error">{formErrors.form}</div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={newUser.firstName}
                                        onChange={handleInputChange}
                                        className={`form-control ${formErrors.firstName ? 'is-invalid' : ''}`}
                                    />
                                    {formErrors.firstName && (
                                        <div className="invalid-feedback">{formErrors.firstName}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={newUser.lastName}
                                        onChange={handleInputChange}
                                        className={`form-control ${formErrors.lastName ? 'is-invalid' : ''}`}
                                    />
                                    {formErrors.lastName && (
                                        <div className="invalid-feedback">{formErrors.lastName}</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                                />
                                {formErrors.email && (
                                    <div className="invalid-feedback">{formErrors.email}</div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={newUser.password}
                                        onChange={handleInputChange}
                                        className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                                    />
                                    {formErrors.password && (
                                        <div className="invalid-feedback">{formErrors.password}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={newUser.confirmPassword}
                                        onChange={handleInputChange}
                                        className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                                    />
                                    {formErrors.confirmPassword && (
                                        <div className="invalid-feedback">{formErrors.confirmPassword}</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="department">Department</label>
                                    <select
                                        id="department"
                                        name="department"
                                        value={newUser.department}
                                        onChange={handleInputChange}
                                        className="form-control"
                                    >
                                        <option value="Computing">Computing</option>
                                        <option value="Business">Business</option>
                                        <option value="Engineering">Engineering</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="contactNumber">Contact Number</label>
                                    <input
                                        type="text"
                                        id="contactNumber"
                                        name="contactNumber"
                                        value={newUser.contactNumber}
                                        onChange={handleInputChange}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowAddForm(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Adding...' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit User Modal */}
            {showEditForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Edit {userType}</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowEditForm(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmitEdit} className="add-user-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="edit-firstName">First Name</label>
                                    <input
                                        type="text"
                                        id="edit-firstName"
                                        name="firstName"
                                        value={editUser.firstName}
                                        onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                                        className="form-control"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="edit-lastName"
                                        name="lastName"
                                        value={editUser.lastName}
                                        onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-email">Email</label>
                                <input
                                    type="email"
                                    id="edit-email"
                                    name="email"
                                    value={editUser.email}
                                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                    className="form-control"
                                    readOnly
                                />
                                <small className="form-text text-muted">Email cannot be changed</small>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="edit-department">Department</label>
                                    <select
                                        id="edit-department"
                                        name="department"
                                        value={editUser.department}
                                        onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                                        className="form-control"
                                    >
                                        <option value="Computing">Computing</option>
                                        <option value="Business">Business</option>
                                        <option value="Engineering">Engineering</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit-contactNumber">Contact Number</label>
                                    <input
                                        type="text"
                                        id="edit-contactNumber"
                                        name="contactNumber"
                                        value={editUser.contactNumber}
                                        onChange={(e) => setEditUser({ ...editUser, contactNumber: e.target.value })}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowEditForm(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Updating...' : 'Update User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
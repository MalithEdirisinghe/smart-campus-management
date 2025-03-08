// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './AdminUsers.css'; // You'll need to create this CSS file
// import defaultProfileImage from '../../assets/default-profile.png';

// const AdminUsers = () => {
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(true);
//   const [admin, setAdmin] = useState(null);
//   const [userType, setUserType] = useState('Admin');
//   const [permissionUserType, setPermissionUserType] = useState('Student');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [users, setUsers] = useState([]);
//   const [permissions, setPermissions] = useState({
//     view: true,
//     edit: false,
//     delete: false,
//     share: true,
//     download: true
//   });

//   // Mock data for testing - replace with actual API calls
//   const mockUsers = [
//     {
//       id: 'A001',
//       firstName: 'Ranuga',
//       lastName: 'Wijethunga',
//       department: 'Computing',
//       contactNumber: '0718868557',
//       email: 'ranuga100@gmail.com'
//     }
//   ];

//   useEffect(() => {
//     const fetchAdminData = async () => {
//       try {
//         setIsLoading(true);

//         // Get auth token from localStorage
//         const token = localStorage.getItem('token');

//         if (!token) {
//           throw new Error('Authentication token not found');
//         }

//         // Use cached user data if available
//         const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');

//         // Fetch admin profile data
//         const response = await fetch('http://localhost:8080/api/admin/profile', {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'x-access-token': token
//           }
//         });

//         if (!response.ok) {
//           // If API request fails but we have cached data, use that temporarily
//           if (cachedUser && cachedUser.role === 'admin') {
//             setAdmin({
//               firstName: cachedUser.firstName || '',
//               lastName: cachedUser.lastName || '',
//               adminId: cachedUser.adminId || '',
//               role: 'Admin',
//               department: cachedUser.department || 'Computing',
//               profileImage: null
//             });

//             // Use mock data for testing
//             setUsers(mockUsers);
//             setIsLoading(false);
//             return;
//           }

//           // Handle HTTP errors if no cached data
//           const errorData = await response.json().catch(() => ({}));
//           throw new Error(errorData.message || `Error: ${response.status}`);
//         }

//         const adminData = await response.json();

//         // Set admin profile data
//         setAdmin({
//           firstName: adminData.firstName || '',
//           lastName: adminData.lastName || '',
//           adminId: adminData.adminId || '',
//           role: adminData.role || 'Admin',
//           department: adminData.department || '',
//           profileImage: adminData.profileImage || null
//         });

//         // Fetch users (replace with actual API call)
//         // For now using mock data
//         setUsers(mockUsers);
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error fetching admin data:', error);
//         setIsLoading(false);

//         // If unauthorized, redirect to login
//         if (error.message.includes('401') || error.message.includes('Authentication')) {
//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//           navigate('/admin/login');
//         }
//       }
//     };

//     fetchAdminData();
//   }, [navigate]);

//   const handleNavigate = (path) => {
//     navigate(path);
//   };

//   const handleUserTypeChange = (e) => {
//     setUserType(e.target.value);
//   };

//   const handlePermissionUserTypeChange = (e) => {
//     setPermissionUserType(e.target.value);
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handlePermissionChange = (permission) => {
//     setPermissions({
//       ...permissions,
//       [permission]: !permissions[permission]
//     });
//   };

//   // View, Add, Edit, Delete, Save handlers
//   const handleView = () => {
//     console.log('View clicked');
//   };

//   const handleAdd = () => {
//     console.log('Add clicked');
//   };

//   const handleEdit = () => {
//     console.log('Edit clicked');
//   };

//   const handleDelete = () => {
//     console.log('Delete clicked');
//   };

//   const handleSave = () => {
//     console.log('Save clicked');
//   };

//   const handleDiscard = () => {
//     console.log('Discard clicked');
//   };

//   // If still loading, show loading spinner
//   if (isLoading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading user management data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="admin-users-container">
//       {/* Left Sidebar */}
//       <div className="sidebar">
//         <div className="profile-summary">
//           <div className="profile-image-container">
//             {admin.profileImage ? (
//               <img
//                 src={admin.profileImage}
//                 alt="Profile"
//                 className="profile-image"
//                 onError={(e) => {
//                   console.error("Error loading profile image");
//                   e.target.onerror = null;
//                   e.target.src = defaultProfileImage;
//                 }}
//               />
//             ) : (
//               <img
//                 src={defaultProfileImage}
//                 alt="Default Profile"
//                 className="profile-image"
//               />
//             )}
//           </div>
//           <div className="profile-info">
//             <div className="role">{admin.role}</div>
//             <div className="name">{admin.firstName} {admin.lastName}</div>
//             <div className="id-display">ID: {admin.adminId}</div>
//           </div>
//         </div>

//         <nav className="sidebar-nav">
//           <ul>
//             <li onClick={() => handleNavigate('/admin/dashboard')}>Dashboard</li>
//             <li className="active" onClick={() => handleNavigate('/admin/users')}>Users</li>
//             <li onClick={() => handleNavigate('/admin/events')}>Events/Announcements</li>
//             <li onClick={() => handleNavigate('/admin/resources')}>Resources</li>
//             <li onClick={() => handleNavigate('/admin/communication')}>Communication</li>
//             <li onClick={() => handleNavigate('/admin/reports')}>Reports</li>
//           </ul>
//         </nav>
//       </div>

//       {/* Main Content */}
//       <div className="main-content">
//         <div className="top-bar">
//           <div className="notification-icons">
//             <div className="notification-icon">
//               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
//                 <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
//               </svg>
//             </div>
//             <div
//               className="profile-icon"
//               onClick={() => handleNavigate('/admin/profile')}
//               style={{ cursor: 'pointer' }}
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//                 <circle cx="12" cy="7" r="4"></circle>
//               </svg>
//             </div>
//           </div>
//         </div>

//         <div className="user-management-content">
//           <h1 className="section-title">User Management</h1>

//           <div className="user-selection-controls">
//             <div className="select-container">
//               <label>Select User:</label>
//               <select 
//                 value={userType} 
//                 onChange={handleUserTypeChange}
//                 className="user-type-select"
//               >
//                 <option value="Admin">Admin</option>
//                 <option value="Lecturer">Lecturer</option>
//                 <option value="Student">Student</option>
//               </select>
//             </div>

//             <div className="search-container">
//               <input
//                 type="text"
//                 placeholder="Search"
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//                 className="search-input"
//               />
//               <span className="search-icon">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <circle cx="11" cy="11" r="8"></circle>
//                   <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
//                 </svg>
//               </span>
//             </div>
//           </div>

//           <div className="action-buttons">
//             <button className="action-button active" onClick={handleView}>View</button>
//             <button className="action-button" onClick={handleAdd}>Add</button>
//             <button className="action-button" onClick={handleEdit}>Edit</button>
//             <button className="action-button" onClick={handleDelete}>Delete</button>
//             <button className="action-button" onClick={handleSave}>Save</button>
//           </div>

//           {/* User Table */}
//           <div className="user-table-container">
//             <table className="user-table">
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>First name</th>
//                   <th>Last name</th>
//                   <th>Department</th>
//                   <th>Contact No.</th>
//                   <th>Email</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {users.map(user => (
//                   <tr key={user.id}>
//                     <td>{user.id}</td>
//                     <td>{user.firstName}</td>
//                     <td>{user.lastName}</td>
//                     <td>{user.department}</td>
//                     <td>{user.contactNumber}</td>
//                     <td>{user.email}</td>
//                   </tr>
//                 ))}
//                 {/* Empty rows for layout */}
//                 {[...Array(5)].map((_, index) => (
//                   <tr key={`empty-${index}`}>
//                     <td></td>
//                     <td></td>
//                     <td></td>
//                     <td></td>
//                     <td></td>
//                     <td></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Permission Control Section */}
//           <div className="permission-control-section">
//             <h2 className="section-title">Permission Control</h2>

//             <div className="permission-selection">
//               <label>Select User:</label>
//               <select 
//                 value={permissionUserType} 
//                 onChange={handlePermissionUserTypeChange}
//                 className="permission-user-select"
//               >
//                 <option value="Student">Student</option>
//                 <option value="Lecturer">Lecturer</option>
//                 <option value="Admin">Admin</option>
//               </select>
//             </div>

//             <div className="permission-checkboxes">
//               <div className="permission-row">
//                 <div className="permission-option">
//                   <input 
//                     type="checkbox" 
//                     id="view-permission"
//                     checked={permissions.view}
//                     onChange={() => handlePermissionChange('view')}
//                   />
//                   <label htmlFor="view-permission">View</label>
//                 </div>

//                 <div className="permission-option">
//                   <input 
//                     type="checkbox" 
//                     id="edit-permission"
//                     checked={permissions.edit}
//                     onChange={() => handlePermissionChange('edit')}
//                   />
//                   <label htmlFor="edit-permission">Edit</label>
//                 </div>

//                 <div className="permission-option">
//                   <input 
//                     type="checkbox" 
//                     id="delete-permission"
//                     checked={permissions.delete}
//                     onChange={() => handlePermissionChange('delete')}
//                   />
//                   <label htmlFor="delete-permission">Delete</label>
//                 </div>
//               </div>

//               <div className="permission-row">
//                 <div className="permission-option">
//                   <input 
//                     type="checkbox" 
//                     id="share-permission"
//                     checked={permissions.share}
//                     onChange={() => handlePermissionChange('share')}
//                   />
//                   <label htmlFor="share-permission">Share</label>
//                 </div>

//                 <div className="permission-option">
//                   <input 
//                     type="checkbox" 
//                     id="download-permission"
//                     checked={permissions.download}
//                     onChange={() => handlePermissionChange('download')}
//                   />
//                   <label htmlFor="download-permission">Download</label>
//                 </div>
//               </div>
//             </div>

//             <div className="permission-actions">
//               <button className="btn-discard" onClick={handleDiscard}>Discard</button>
//               <button className="btn-save" onClick={handleSave}>Save</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminUsers;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminUsers.css'; // You'll need to create this CSS file
import defaultProfileImage from '../../assets/default-profile.png';

const AdminUsers = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
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
    // Mock data for testing - replace with actual API calls
    const mockUsers = [
        {
            id: 'A001',
            firstName: 'Ranuga',
            lastName: 'Wijethunga',
            department: 'Computing',
            contactNumber: '0718868557',
            email: 'ranuga100@gmail.com'
        }
    ];

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

                        // Use mock data for testing
                        setUsers(mockUsers);
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

                // Fetch users (replace with actual API call)
                // For now using mock data
                setUsers(mockUsers);
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
        console.log('Edit clicked');
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

    // If still loading, show loading spinner
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading user management data...</p>
            </div>
        );
    }

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
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.firstName}</td>
                                        <td>{user.lastName}</td>
                                        <td>{user.department}</td>
                                        <td>{user.contactNumber}</td>
                                        <td>{user.email}</td>
                                    </tr>
                                ))}
                                {/* Empty rows for layout */}
                                {[...Array(5)].map((_, index) => (
                                    <tr key={`empty-${index}`}>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                ))}
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
        </div>
    );
};

export default AdminUsers;

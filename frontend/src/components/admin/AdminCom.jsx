import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCom.css';
import defaultProfileImage from '../../assets/default-profile.png';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const AdminCom = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  
  // State for Groups section
  const [selectedGroupRole, setSelectedGroupRole] = useState('Student');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [groups, setGroups] = useState([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({
    batchNo: '',
    module: '',
    lecturerId: '',
    lecturerName: ''
  });

  // State for Direct Messages section
  const [selectedMessageRole, setSelectedMessageRole] = useState('Lecturer');
  const [userIdSearchTerm, setUserIdSearchTerm] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInbox, setShowInbox] = useState(false);
  const [inboxMessages, setInboxMessages] = useState([]);

  // Fetch admin profile data when component mounts
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);

        // Get auth token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Authentication token not found');
        }

        // Try to get cached user data first
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
            
            // Initial fetch of groups after admin data is loaded
            fetchGroups();
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
        
        // Initial fetch of groups after admin data is loaded
        fetchGroups();
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

  // Fetch all groups from the database
  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`http://localhost:8080/api/admin/communication/groups?role=${selectedGroupRole}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      // Fallback to empty array if error occurs
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Groups section handlers
  const handleGroupRoleChange = (e) => {
    setSelectedGroupRole(e.target.value);
    
    // Fetch groups for the selected role with new filter
    fetchFilteredGroups(groupSearchTerm, e.target.value);
  };

  // Function to fetch filtered groups based on search and role
  const fetchFilteredGroups = async (searchQuery, role = selectedGroupRole) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`http://localhost:8080/api/admin/communication/groups?search=${searchQuery}&role=${role}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching filtered groups:', error);
      // Don't clear existing groups on error, just keep what we have
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupSearchChange = (e) => {
    const searchTerm = e.target.value;
    setGroupSearchTerm(searchTerm);
    
    // Use debounce to prevent too many API calls
    const timeoutId = setTimeout(() => {
      fetchFilteredGroups(searchTerm);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleCreateGroup = () => {
    setNewGroup({
      batchNo: '',
      module: '',
      lecturerId: '',
      lecturerName: ''
    });
    setShowCreateGroupModal(true);
  };

  const handleEditGroup = () => {
    if (!selectedGroup) {
      alert('Please select a group to edit');
      return;
    }
    setNewGroup({ ...selectedGroup });
    setShowEditGroupModal(true);
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) {
      alert('Please select a group to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the group for ${selectedGroup.batchNo} - ${selectedGroup.module}?`)) {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch(`http://localhost:8080/api/admin/communication/groups/${selectedGroup.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-access-token': token
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete group');
        }
        
        // Remove group from state
        const updatedGroups = groups.filter(group => group.id !== selectedGroup.id);
        setGroups(updatedGroups);
        setSelectedGroup(null);
        alert('Group deleted successfully');
      } catch (error) {
        console.error('Error deleting group:', error);
        alert(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveGroup = async () => {
    // Validate form
    if (!newGroup.batchNo || !newGroup.module || !newGroup.lecturerId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const groupData = {
        batchNo: newGroup.batchNo,
        module: newGroup.module,
        lecturerId: newGroup.lecturerId,
        lecturerName: newGroup.lecturerName,
        addStudents: true
      };
      
      if (showCreateGroupModal) {
        // Create new group
        const response = await fetch('http://localhost:8080/api/admin/communication/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-access-token': token
          },
          body: JSON.stringify(groupData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create group');
        }
        
        const responseData = await response.json();
        
        // Add new group to state
        setGroups([...groups, responseData.group]);
        setShowCreateGroupModal(false);
        alert('Group created successfully');
      } else if (showEditGroupModal && selectedGroup) {
        // Update existing group
        const response = await fetch(`http://localhost:8080/api/admin/communication/groups/${selectedGroup.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-access-token': token
          },
          body: JSON.stringify(groupData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update group');
        }
        
        const responseData = await response.json();
        
        // Update group in state
        const updatedGroups = groups.map(group => 
          group.id === selectedGroup.id ? responseData.group : group
        );
        
        setGroups(updatedGroups);
        setSelectedGroup(null);
        setShowEditGroupModal(false);
        alert('Group updated successfully');
      }
    } catch (error) {
      console.error('Error saving group:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group.id === selectedGroup?.id ? null : group);
  };

  // Direct Messages section handlers
  const handleMessageRoleChange = (e) => {
    setSelectedMessageRole(e.target.value);
  };

  const handleUserIdSearchChange = (e) => {
    setUserIdSearchTerm(e.target.value);
  };

  const handleMessageContentChange = (e) => {
    setMessageContent(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      alert('Please enter a message');
      return;
    }

    if (!userIdSearchTerm) {
      alert('Please enter a user ID');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('http://localhost:8080/api/communication/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        },
        body: JSON.stringify({
          receiverId: userIdSearchTerm,
          content: messageContent
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      alert(`Message sent to ${userIdSearchTerm} successfully`);
      setMessageContent('');
      setUserIdSearchTerm('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardMessage = () => {
    setMessageContent('');
    setUserIdSearchTerm('');
  };

  const toggleInbox = async () => {
    // If opening the inbox, fetch latest messages
    if (!showInbox) {
      await fetchInboxMessages();
    }
    
    setShowInbox(!showInbox);
  };
  
  // Fetch inbox messages
  const fetchInboxMessages = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('http://localhost:8080/api/communication/messages/inbox', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-access-token': token
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch inbox messages');
      }
      
      const data = await response.json();
      setInboxMessages(data);
    } catch (error) {
      console.error('Error fetching inbox messages:', error);
      // On error, keep existing inbox messages if any
    } finally {
      setIsLoading(false);
    }
  };

  // Filter groups based on search term (client-side filtering as fallback)
  const filteredGroups = groupSearchTerm 
    ? groups.filter(group => {
        const searchTerm = groupSearchTerm.toLowerCase();
        return (
          group.batchNo.toLowerCase().includes(searchTerm) ||
          group.module.toLowerCase().includes(searchTerm) ||
          group.lecturerId.toLowerCase().includes(searchTerm) ||
          group.lecturerName.toLowerCase().includes(searchTerm)
        );
      })
    : groups;

  // If still loading, show loading spinner
  if (isLoading && !admin) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading communication data...</p>
      </div>
    );
  }

  return (
    <div className="admin-com-container">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="profile-summary">
          <div className="profile-image-container">
            {admin?.profileImage ? (
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
            <div className="role">{admin?.role}</div>
            <div className="name">{admin?.firstName} {admin?.lastName}</div>
            <div className="id-display">ID: {admin?.adminId}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li onClick={() => handleNavigate('/admin/dashboard')}>Dashboard</li>
            <li onClick={() => handleNavigate('/admin/users')}>Users</li>
            <li onClick={() => handleNavigate('/admin/events')}>Events/Announcements</li>
            <li onClick={() => handleNavigate('/admin/resources')}>Resources</li>
            <li className="active" onClick={() => handleNavigate('/admin/communication')}>Communication</li>
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Processing your request...</p>
          </div>
        )}

        <div className="communication-content">
          {/* Groups Section */}
          <section className="groups-section">
            <h2 className="section-title">Groups</h2>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search"
                value={groupSearchTerm}
                onChange={handleGroupSearchChange}
                className="search-input"
              />
              <span className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
            </div>

            <div className="role-selection">
              <label>Select User:</label>
              <select
                value={selectedGroupRole}
                onChange={handleGroupRoleChange}
                className="role-select"
              >
                <option value="Student">Student</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="action-buttons">
              <button className="action-button create-button-com" onClick={handleCreateGroup}>Create</button>
              <button className="action-button edit-button" onClick={handleEditGroup} disabled={!selectedGroup}>Edit</button>
              <button className="action-button delete-button" onClick={handleDeleteGroup} disabled={!selectedGroup}>Delete</button>
            </div>

            <div className="groups-table-container">
              <table className="groups-table">
                <thead>
                  <tr>
                    <th>Batch No.</th>
                    <th>Module</th>
                    <th>Assigned lecturer ID</th>
                    <th>Lecturer Name</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map(group => (
                      <tr 
                        key={group.id} 
                        onClick={() => handleSelectGroup(group)}
                        className={selectedGroup?.id === group.id ? 'selected-row' : ''}
                      >
                        <td>{group.batchNo}</td>
                        <td>{group.module}</td>
                        <td>{group.lecturerId}</td>
                        <td>{group.lecturerName}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data-message">
                        {groupSearchTerm ? 'No matching groups found' : 'No groups available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Direct Messages Section */}
          <section className="direct-messages-section">
            <div className="section-header">
              <h2 className="section-title">Direct Messages</h2>
              <div className="message-icon" onClick={toggleInbox}>
                <MailOutlineIcon />
              </div>
            </div>

            <div className="message-controls">
              <div className="role-selection">
                <label>Select User:</label>
                <select
                  value={selectedMessageRole}
                  onChange={handleMessageRoleChange}
                  className="role-select"
                >
                  <option value="Lecturer">Lecturer</option>
                  <option value="Student">Student</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="user-id-search">
                <label>User ID:</label>
                <input
                  type="text"
                  placeholder="Search"
                  value={userIdSearchTerm}
                  onChange={handleUserIdSearchChange}
                  className="user-id-input"
                />
              </div>
            </div>

            <div className="message-compose">
              <textarea
                placeholder="Type your message here..."
                value={messageContent}
                onChange={handleMessageContentChange}
                className="message-input"
              />
            </div>

            <div className="message-actions">
              <button className="message-button discard-button" onClick={handleDiscardMessage}>Discard</button>
              <button className="message-button send-button" onClick={handleSendMessage}>Send</button>
            </div>
          </section>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Group</h2>
              <button 
                className="close-button" 
                onClick={() => setShowCreateGroupModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Batch No:</label>
                <input
                  type="text"
                  value={newGroup.batchNo}
                  onChange={(e) => setNewGroup({...newGroup, batchNo: e.target.value})}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Module:</label>
                <input
                  type="text"
                  value={newGroup.module}
                  onChange={(e) => setNewGroup({...newGroup, module: e.target.value})}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Lecturer ID:</label>
                <input
                  type="text"
                  value={newGroup.lecturerId}
                  onChange={(e) => setNewGroup({...newGroup, lecturerId: e.target.value})}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Lecturer Name:</label>
                <input
                  type="text"
                  value={newGroup.lecturerName}
                  onChange={(e) => setNewGroup({...newGroup, lecturerName: e.target.value})}
                  className="form-control"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-button" 
                onClick={() => setShowCreateGroupModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-button" 
                onClick={handleSaveGroup}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Group</h2>
              <button 
                className="close-button" 
                onClick={() => setShowEditGroupModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Batch No:</label>
                <input
                  type="text"
                  value={newGroup.batchNo}
                  onChange={(e) => setNewGroup({...newGroup, batchNo: e.target.value})}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Module:</label>
                <input
                  type="text"
                  value={newGroup.module}
                  onChange={(e) => setNewGroup({...newGroup, module: e.target.value})}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Lecturer ID:</label>
                <input
                  type="text"
                  value={newGroup.lecturerId}
                  onChange={(e) => setNewGroup({...newGroup, lecturerId: e.target.value})}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Lecturer Name:</label>
                <input
                  type="text"
                  value={newGroup.lecturerName}
                  onChange={(e) => setNewGroup({...newGroup, lecturerName: e.target.value})}
                  className="form-control"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-button" 
                onClick={() => setShowEditGroupModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-button" 
                onClick={handleSaveGroup}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inbox Modal */}
      {showInbox && (
        <div className="modal-overlay">
          <div className="modal-content inbox-modal">
            <div className="modal-header">
              <h2>Inbox</h2>
              <button 
                className="close-button" 
                onClick={() => setShowInbox(false)}
              >
                &times;
              </button>
            </div>

            <div className="inbox-container">
              {inboxMessages.length > 0 ? (
                <ul className="message-list">
                  {inboxMessages.map(message => (
                    <li key={message.id} className={`message-item ${!message.read ? 'unread' : ''}`}>
                      <div className="message-header">
                        <span className="message-sender">{message.sender}</span>
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="message-body">{message.content}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-inbox">No messages in your inbox</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCom;
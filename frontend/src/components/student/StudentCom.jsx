import React, { useState, useEffect } from "react";
import Sidebar from "../common/sidebar";
import axios from "axios";
import "./StudentCom.css"; // Ensure this CSS file styles the UI like in the image

const StudentCom = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState("Lecturer");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [studentId, setStudentId] = useState(localStorage.getItem("studentId") || "");

  const [modules, setModules] = useState([
    { module_id: "Networking", module_name: "Networking" },
    { module_id: "Programming", module_name: "Programming" },
    { module_id: "Marketing", module_name: "Marketing" },
    { module_id: "Finance", module_name: "Finance" },
    { module_id: "Mechanics", module_name: "Mechanics" },
    { module_id: "Electronics", module_name: "Electronics" },
  ]);

  const [selectedModule, setSelectedModule] = useState("Networking"); // Default to Networking
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch files for the default selected module on initial load
    fetchFiles(selectedModule);
  }, []);

  const fetchFiles = async (moduleId) => {
    console.log("Fetching files for module:", moduleId);

    try {
      const response = await axios.get(`http://localhost:8080/api/communication/files/${moduleId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-access-token": token
        },
      });

      console.log("Response:", response);

      const data = response.data.sharedFiles || [];

      console.log("Files data to set:", data);

      setFiles(data);

      if (data.length > 0) {
        setSelectedFile(data[0].file_name);
      } else {
        setSelectedFile(""); // Ensure dropdown shows "No files available"
      }
    } catch (error) {
      console.error("Error fetching files:", error.response ? error.response.data : error.message);

      if (error.response && error.response.status === 404) {
        console.log("No files found for this module.");
        setFiles([]); // Clear file list
        setSelectedFile(""); // Ensure dropdown shows "No files available"
      }
    }
  };

  // Handle file download
  const handleDownload = async () => {
    if (!selectedFile) {
        alert("Please select a file to download.");
        return;
    }

    try {
        // Find the selected file object to get its file path
        const fileObject = files.find(file => file.file_name === selectedFile);
        if (!fileObject) {
            alert("Selected file not found.");
            return;
        }

        const filePath = fileObject.file_path;

        // Make API request to download the file
        const response = await axios.get(`http://localhost:8080/api/communication/download/${encodeURIComponent(filePath)}`, {
            responseType: "blob", // Ensure binary data is received
            headers: {
                "Authorization": `Bearer ${token}`,
                "x-access-token": token
            }
        });

        // Create a blob from the response data
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", selectedFile); // Set filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up after download

    } catch (error) {
        console.error("Error downloading file:", error);
        alert("Failed to download file. Please try again.");
    }
};


  // Fetch inbox messages
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/student/messages/${studentId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!userId || !message) {
      alert("Please enter recipient ID and message.");
      return;
    }

    try {
      await axios.post("/api/student/send-message", {
        senderId: studentId,
        receiverId: userId,
        senderRole: "student",
        receiverRole: selectedUser.toLowerCase(),
        message: message,
      });
      alert("Message sent successfully!");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="student-com-container">
      <Sidebar role="student" />
      <div className="student-content">
        <h2>Communication</h2>

        {/* Groups Section */}
        <div className="groups">
          <h3>Groups</h3>
          <label>Module:</label>
          <select
            value={selectedModule}
            onChange={(e) => {
              const newModuleId = e.target.value;
              setSelectedModule(newModuleId);
              fetchFiles(newModuleId); // Fetch files for the newly selected module
            }}
          >
            {modules.map((mod) => (
              <option key={mod.module_id} value={mod.module_id}>
                {mod.module_name}
              </option>
            ))}
          </select>

          <label>Select File:</label>
          <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
            {files.length > 0 ? (
              files.map((file) => (
                <option key={file.file_name} value={file.file_name}>
                  {file.file_name}
                </option>
              ))
            ) : (
              <option value="">No files available</option> // ✅ Display when no files are found
            )}
          </select>

          <button onClick={handleDownload}>Download</button>
        </div>

        {/* Direct Messages Section */}
        <div className="direct-messages">
          <h3>Direct Messages</h3>
          <label>Select User:</label>
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="Lecturer">Lecturer</option>
            <option value="Student">Student</option>
            <option value="Admin">Admin</option>
          </select>

          <label>User ID:</label>
          <input
            type="text"
            placeholder="Search"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="message-buttons">
            <button className="discard-button" onClick={() => setMessage("")}>
              Discard
            </button>
            <button className="send-button" onClick={handleSendMessage}>
              Send
            </button>
          </div>

          {/* Inbox Messages */}
          <h3>Inbox</h3>
          <button onClick={fetchMessages} className="view-inbox">
            📩 View Messages
          </button>
          <ul className="message-list">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <li key={index}>
                  <strong>
                    {msg.senderRole}: {msg.senderId}
                  </strong>{" "}
                  - {msg.message}
                </li>
              ))
            ) : (
              <li>No messages found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentCom;

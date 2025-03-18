import React, { useState, useEffect } from "react";
import Sidebar from "../common/sidebar";
import "./LectureCom.css";

const LectureCom = () => {
  const [lecturerId, setLecturerId] = useState(null);
  const [selectedModule, setSelectedModule] = useState("Networking");
  const [selectedBatch, setSelectedBatch] = useState("COM12");
  const [selectedFile, setSelectedFile] = useState(null);
  const [note, setNote] = useState("");
  const [selectedUser, setSelectedUser] = useState("Lecturer");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  // Batch and module mapping
  const batchModules = {
    COM12: ["Networking", "Programming"],
    COM13: ["Networking", "Programming"],
    BUS12: ["Finance", "Marketing"],
    BUS13: ["Finance", "Marketing"],
    ENG12: ["Mechanics", "Electronics"],
    ENG13: ["Mechanics", "Electronics"],
  };

  // Fetch lecturer ID from localStorage or API
  useEffect(() => {
    let storedLecturerId = localStorage.getItem("lecturerId");
    console.log("Stored LID:", storedLecturerId);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Authentication token not found");
      return;
    }

    if (!storedLecturerId || storedLecturerId === "null" || storedLecturerId === "undefined") {
      console.log("Fetching Lecturer ID from API...");

      fetch("http://localhost:8080/api/lecturer/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("API Response:", data);

          if (data.lecturerId) {
            localStorage.setItem("lecturerId", data.lecturerId);
            setLecturerId(data.lecturerId);
            console.log("Lecturer ID fetched and set:", data.lecturerId);
          } else {
            console.error("Lecturer ID not found in API response:", data);
          }
        })
        .catch((error) => console.error("Error fetching lecturer ID:", error));
    } else {
      setLecturerId(storedLecturerId);
      console.log("Lecturer ID retrieved from storage:", storedLecturerId);
    }
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0] || null);
  };

  const handleShare = async (event) => {
    event.preventDefault();
    if (!lecturerId) {
      alert("Lecturer ID is missing. Please log in again.");
      return;
    }

    if (!token) {
      alert("Authentication token missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("lecturer_id", lecturerId);
    formData.append("module", selectedModule);
    formData.append("batch", selectedBatch);
    formData.append("note", note);

    try {
      const response = await fetch("http://localhost:8080/api/communication/share-file", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 403) {
        throw new Error("You are not authorized to perform this action.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("File upload error:", error);
      alert(`File upload failed: ${error.message}`);
    }
  };

  const handleSendMessage = async () => {
    if (!lecturerId) {
      alert("Lecturer ID is missing. Please log in again.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing. Please log in again.");
      return;
    }

    const messageData = {
      sender_id: lecturerId,
      receiverId: userId,
      content: message,
    };

    console.log("Details being sent:", messageData);

    try {
      const response = await fetch("http://localhost:8080/api/communication/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Messaging error:", error);
    }
  };

  return (
    <div className="lecture-com-container">
      <Sidebar role="lecturer" />
      <div className="lecture-content">
        <h2 className="page-title">Communication</h2>

        <div className="section groups">
          <h3>Groups</h3>
          <div className="group-controls">
            <label>Batch:</label>
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setSelectedModule(batchModules[e.target.value][0]); // Update module based on batch
              }}
            >
              {Object.keys(batchModules).map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>

            <label>Module:</label>
            <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
              {batchModules[selectedBatch].map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>

            <label>Select File:</label>
            <input type="file" onChange={handleFileChange} />

            <label>Add a Note:</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />

            <button className="share-button" onClick={handleShare}>
              Share
            </button>
          </div>
        </div>

        <div className="section direct-messages">
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
        </div>
      </div>
    </div>
  );
};

export default LectureCom;

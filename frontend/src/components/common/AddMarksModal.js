import React, { useState } from "react";
import "./AddMarksModal.css";

const AddMarksModal = ({ isOpen, onClose, onSave, studentId, assignmentId }) => {
    const [marks, setMarks] = useState("");
    const [grade, setGrade] = useState("");

    const handleSave = () => {
        onSave(marks, grade, assignmentId);
        onClose(); // Close modal after saving
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add Marks</h2>
                <label>Marks:</label>
                <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    placeholder="Enter marks"
                />
                <label>Grade:</label>
                <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Enter grade"
                />
                <div className="modal-buttons">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default AddMarksModal;

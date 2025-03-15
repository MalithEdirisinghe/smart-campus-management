import React, { useState } from "react";
import "./AddMarksModal.css";

const AddMarksModal = ({ isOpen, onClose, onSave, studentId, assignmentId }) => {
    const [marks, setMarks] = useState("");
    const [grade, setGrade] = useState("");

    const handleSave = () => {
        onSave({ studentId, assignmentId, marks, grade });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add Marks</h2>
                <div className="modal-form">
                    <label>Marks (%):</label>
                    <input
                        type="number"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        min="0"
                        max="100"
                    />
                    <label>Grade:</label>
                    <input
                        type="text"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                    />
                </div>
                <div className="modal-buttons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default AddMarksModal;

import React, { useState, useEffect } from "react";
import Sidebar from "../common/sidebar";
import "./LectureResource.css";

const LectureResource = () => {
    const [date, setDate] = useState("2025-02-22");
    const [time, setTime] = useState("09:00");
    const [equipmentType, setEquipmentType] = useState("All");
    const [equipmentList, setEquipmentList] = useState([]);
    const [filteredEquipment, setFilteredEquipment] = useState([]);
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    const equipmentTypeMapping = {
        "All": "All",
        "Computers": "computer",
        "Projectors": "projector",
        "Lab Equipment": "tablet"
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    useEffect(() => {
        filterEquipment();
    }, [equipmentType, equipmentList]);

    const fetchEquipment = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Please log in.");
                return;
            }

            const mappedType = equipmentTypeMapping[equipmentType] || "All";
            const response = await fetch(`http://localhost:8080/api/resources/equipment?type=${mappedType}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch equipment: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setEquipmentList(data.equipment);
        } catch (error) {
            console.error("Error fetching equipment:", error);
            setEquipmentList([]);
        }
    };

    const filterEquipment = () => {
        const mappedType = equipmentTypeMapping[equipmentType];

        if (mappedType === "All") {
            setFilteredEquipment(equipmentList);
        } else {
            setFilteredEquipment(equipmentList.filter(item => item.type.toLowerCase() === mappedType));
        }
    };

    const toggleMenu = (id) => {
        setSelectedEquipment(selectedEquipment === id ? null : id);
    };

    const handleReserve = async (id, isReserved) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Please log in.");
                return;
            }

            const endpoint = isReserved
                ? "http://localhost:8080/api/resources/release"
                : "http://localhost:8080/api/resources/reserve";

            console.log("Request Endpoint:", endpoint);
            console.log("Request Token:", token);

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    'x-access-token': token
                },
                body: JSON.stringify({ equipment_id: id })
            });

            console.log("Response Status:", response.status);

            if (response.status === 403) {
                throw new Error("Forbidden: You do not have permission to perform this action.");
            }

            if (!response.ok) {
                throw new Error(`Failed to update reservation: ${response.status} ${response.statusText}`);
            }

            fetchEquipment(); // Refresh the equipment list
            setSelectedEquipment(null);
        } catch (error) {
            console.error("Error updating reservation:", error);
        }
    };

    return (
        <div className="lecture-resource-container">
            <Sidebar role="lecturer" />
            <div className="resource-content">
                <h2>Equipments</h2>
                <div className="resource-filters">
                    <label>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    <label>Time</label>
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                    <label>Equipment Type</label>
                    <select value={equipmentType} onChange={(e) => setEquipmentType(e.target.value)}>
                        <option value="All">All</option>
                        <option value="Computers">Computers</option>
                        <option value="Projectors">Projectors</option>
                        <option value="Lab Equipment">Tablets</option>
                    </select>
                </div>
                <div className="equipment-list">
                    {Array.isArray(filteredEquipment) && filteredEquipment.length > 0 ? (
                        filteredEquipment.map((item) => (
                            <div key={item.id} className={`equipment-card ${item.available ? "available" : "reserved"}`}>
                                <span>{item.id}</span>
                                <span>{item.available ? "Available" : `Reserved by: ${item.reserved_by || "N/A"}`}</span>

                                {/* Three Dots Button */}
                                <button className="menu-button" onClick={() => toggleMenu(item.id)}>⋮</button>

                                {/* Dropdown Menu */}
                                {selectedEquipment === item.id && (
                                    <div className="dropdown-menu">
                                        {item.available ? (
                                            <button onClick={() => handleReserve(item.id, false)}>Reserve</button>
                                        ) : (
                                            <button onClick={() => handleReserve(item.id, true)}>Cancel Reservation</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No equipment found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LectureResource;

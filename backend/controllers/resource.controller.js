// controllers/resource.controller.js
const Classroom = require('../models/classroom.model');
const Equipment = require('../models/equipment.model');
const Reservation = require('../models/reservation.model');
const User = require('../models/user.model');
const db = require('../models/db');

// Get classrooms with pagination and availability
exports.getClassrooms = async (req, res) => {
  try {
    const { page = 0, date, time, ampm, includeReserved = 'false' } = req.query;
    
    let classroomList = [];
    let totalPages = 0;
    
    // Convert page to number
    const pageNumber = parseInt(page);
    
    if (date && time) {
      // Format time to 24-hour format for database query
      const timePart = time.replace(/\./g, ':');
      const timeFormat = ampm === 'PM' && !timePart.startsWith('12') ? 
        `${parseInt(timePart.split(':')[0]) + 12}:${timePart.split(':')[1]}:00` :
        `${timePart}:00`;
      
      // Calculate an end time (assuming 1-hour slots)
      const endTime = calculateEndTime(timeFormat);
      
      // Format date for database query (from MM/DD/YYYY to YYYY-MM-DD)
      const formattedDate = formatDate(date);
      
      if (includeReserved === 'true') {
        // Get ALL classrooms (both available and reserved)
        classroomList = await Classroom.getPaginated(pageNumber, 4);
        
        // For each classroom, check if it's reserved at the specified time
        for (let classroom of classroomList) {
          const reservations = await Reservation.getByResource('classroom', classroom.classroom_id);
          
          // Check if there's an active reservation for this time slot
          const activeReservation = reservations.find(r => 
            r.status === 'active' && 
            r.reservation_date === formattedDate &&
            ((r.start_time <= timeFormat && r.end_time > timeFormat) || 
             (r.start_time < endTime && r.end_time >= endTime) ||
             (r.start_time >= timeFormat && r.start_time < endTime))
          );
          
          if (activeReservation) {
            classroom.status = 'reserved';
            classroom.batch = activeReservation.reserved_by;
          }
        }
      } else {
        // Get only available classrooms (original behavior)
        classroomList = await Classroom.getAvailable(formattedDate, timeFormat, endTime, pageNumber, 4);
      }
      
      // Get total classrooms for pagination
      const totalClassrooms = await Classroom.getCount();
      totalPages = Math.ceil(totalClassrooms / 4);
    } else {
      // Get all classrooms paginated
      classroomList = await Classroom.getPaginated(pageNumber, 4);
      
      // For each classroom, check for active reservations
      for (let classroom of classroomList) {
        if (classroom.status === 'reserved') {
          // Get the current reservation details
          const reservations = await Reservation.getByResource('classroom', classroom.classroom_id);
          const activeReservation = reservations.find(r => r.status === 'active');
          
          if (activeReservation) {
            classroom.batch = activeReservation.reserved_by;
          }
        }
      }
      
      // Get total classrooms for pagination
      const totalClassrooms = await Classroom.getCount();
      totalPages = Math.ceil(totalClassrooms / 4);
    }

    // Convert to format expected by frontend
    classroomList.forEach(classroom => {
      classroom.id = classroom.classroom_id;
      classroom.available = classroom.status === 'available';
    });
    
    res.status(200).json({
      classrooms: classroomList,
      pagination: {
        page: pageNumber,
        totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    res.status(500).json({
      message: "Failed to retrieve classrooms",
      error: error.message
    });
  }
};

exports.getEquipment = async (req, res) => {
  try {
    const { type = "All", page = 0, date, time, ampm, includeReserved = "false" } = req.query;

    console.log(`🔍 Fetching equipment: type=${type}, page=${page}`);

    const pageNumber = parseInt(page) || 0;
    const pageSize = 4; // Set default page size

    let equipmentList = [];

    if (type === "All") {
      // Fetch all equipment
      equipmentList = await Equipment.getAll(pageNumber, pageSize);
      console.log("✅ Retrieved all equipment from database.");
    } else {
      // Map frontend types to database types
      const equipmentType = mapEquipmentType(type);
      console.log(`🔍 Filtering by type: ${equipmentType}`);

      // Fetch only the selected type
      equipmentList = await Equipment.getByType(equipmentType, pageNumber, pageSize);
    }

    console.log("✅ Equipment fetched from DB:", equipmentList.length, "items");

    // Format response
    equipmentList.forEach((item) => {
      item.id = item.equipment_id;
      item.available = item.status === "available";
    });

    // Get total count for pagination
    const totalEquipment = type === "All" 
      ? await Equipment.getTotalCount() 
      : await Equipment.getCountByType(mapEquipmentType(type));

    const totalPages = Math.ceil(totalEquipment / pageSize);

    res.status(200).json({
      equipment: equipmentList,
      pagination: {
        page: pageNumber,
        totalPages,
      },
    });
  } catch (error) {
    console.error("🚨 Error fetching equipment:", error);
    res.status(500).json({
      message: "Failed to retrieve equipment",
      error: error.message,
    });
  }
};

// Reserve a resource (classroom or equipment)
exports.reserveResource = async (req, res) => {
  try {
    const { resourceType, resourceId, reservedBy, date, time, ampm, purpose } = req.body;
    
    // Validate required fields
    if (!resourceType || !resourceId || !reservedBy || !date || !time) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }
    
    // Check if resource exists and is available
    let resourceExists = false;
    if (resourceType === 'classroom') {
      const classroom = await Classroom.getById(resourceId);
      resourceExists = classroom && classroom.status === 'available';
    } else if (resourceType === 'equipment') {
      const equipment = await Equipment.getById(resourceId);
      resourceExists = equipment && equipment.status === 'available';
    }
    
    if (!resourceExists) {
      return res.status(404).json({
        message: "Resource not found or not available"
      });
    }
    
    // Format time and date for reservation
    const timePart = time.replace(/\./g, ':');
    const startTime = ampm === 'PM' && !timePart.startsWith('12') ? 
      `${parseInt(timePart.split(':')[0]) + 12}:${timePart.split(':')[1]}:00` :
      `${timePart}:00`;
    const endTime = calculateEndTime(startTime);
    const formattedDate = formatDate(date);
    
    // Create reservation
    const reservationData = {
      resourceType,
      resourceId,
      userId: req.userId, // From JWT middleware
      reservedBy,
      date: formattedDate,
      startTime,
      endTime,
      purpose
    };
    
    const reservation = await Reservation.create(reservationData);
    
    res.status(201).json({
      message: "Resource reserved successfully",
      reservation
    });
  } catch (error) {
    console.error("Error reserving resource:", error);
    res.status(500).json({
      message: "Failed to reserve resource",
      error: error.message
    });
  }
};

// Release (cancel) a reservation
exports.releaseResource = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.body;
    
    // Find active reservation for this resource
    const reservations = await Reservation.getByResource(resourceType, resourceId);
    const activeReservation = reservations.find(r => r.status === 'active');
    
    if (!activeReservation) {
      return res.status(404).json({
        message: "No active reservation found for this resource"
      });
    }
    
    // Cancel the reservation
    await Reservation.cancel(activeReservation.reservation_id);
    
    res.status(200).json({
      message: "Resource released successfully"
    });
  } catch (error) {
    console.error("Error releasing resource:", error);
    res.status(500).json({
      message: "Failed to release resource",
      error: error.message
    });
  }
};

exports.getReservationDetails = async (req, res) => {
  try {
      const { resourceType, resourceId } = req.query;
      
      if (!resourceType || !resourceId) {
          return res.status(400).json({
              message: "Resource type and ID are required"
          });
      }
      
      // Find active reservation for this resource
      const reservations = await Reservation.getByResource(resourceType, resourceId);
      const activeReservation = reservations.find(r => r.status === 'active');
      
      if (!activeReservation) {
          return res.status(404).json({
              message: "No active reservation found for this resource"
          });
      }
      
      res.status(200).json({
          reservation: {
              reservationId: activeReservation.reservation_id,
              resourceType,
              resourceId,
              reservedBy: activeReservation.reserved_by,
              date: activeReservation.reservation_date,
              startTime: activeReservation.start_time,
              endTime: activeReservation.end_time,
              purpose: activeReservation.purpose
          }
      });
  } catch (error) {
      console.error("Error fetching reservation details:", error);
      res.status(500).json({
          message: "Failed to retrieve reservation details",
          error: error.message
      });
  }
};

exports.updateReservation = async (req, res) => {
  try {
      const { reservationId, resourceType, resourceId, reservedBy, purpose } = req.body;
      
      if (!reservationId || !resourceType || !resourceId || !reservedBy) {
          return res.status(400).json({
              message: "Missing required fields"
          });
      }
      
      // Update the reservation
      const updated = await Reservation.update(reservationId, {
          reserved_by: reservedBy,
          purpose
      });
      
      if (!updated) {
          return res.status(404).json({
              message: "Reservation not found or could not be updated"
          });
      }
      
      res.status(200).json({
          message: "Reservation updated successfully",
          reservation: {
              reservationId,
              resourceType,
              resourceId,
              reservedBy,
              purpose
          }
      });
  } catch (error) {
      console.error("Error updating reservation:", error);
      res.status(500).json({
          message: "Failed to update reservation",
          error: error.message
      });
  }
};
exports.getAllEquipment = async (req, res) => {
  try {
      const [rows] = await db.promise().query("SELECT id, type, status, reserved_by FROM equipment");
      res.json(rows);
  } catch (error) {
      console.error("Error fetching equipment:", error);
      res.status(500).json({ message: "Server error" });
  }
};

exports.releaseEquipment = async (req, res) => {
  try {
      const { equipment_id } = req.body;
      const lecturer_id = req.userId;

      if (!equipment_id) {
          return res.status(400).json({ message: "Equipment ID is required." });
      }

      // Check if the equipment is actually reserved by this lecturer
      const checkQuery = "SELECT * FROM equipment WHERE equipment_id = ? AND reserved_by = ?";
      const [equipment] = await db.query(checkQuery, [equipment_id, lecturer_id]);

      if (equipment.length === 0) {
          return res.status(400).json({ message: "Equipment is not reserved by you or does not exist." });
      }

      // Release the equipment
      const releaseQuery = "UPDATE equipment SET status = 'available', reserved_by = NULL WHERE equipment_id = ?";
      await db.query(releaseQuery, [equipment_id]);

      res.status(200).json({ message: "Reservation canceled successfully." });
  } catch (error) {
      console.error("Error releasing equipment:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.reserveEquipment = async (req, res) => {
  try {
      const { equipment_id } = req.body;
      const lecturer_id = req.userId;  // Extract the lecturer's ID from JWT token
      console.log('ID:', lecturer_id);

      if (!equipment_id) {
          return res.status(400).json({ message: "Equipment ID is required." });
      }

      // Check if the equipment is available
      const checkQuery = "SELECT * FROM equipment WHERE equipment_id = ? AND status = 'available'";
      const [equipment] = await db.query(checkQuery, [equipment_id]);

      if (equipment.length === 0) {
          return res.status(400).json({ message: "Equipment is already reserved or does not exist." });
      }

      // Reserve the equipment
      const reserveQuery = "UPDATE equipment SET status = 'reserved', reserved_by = ? WHERE equipment_id = ?";
      await db.query(reserveQuery, [lecturer_id, equipment_id]);

      res.status(200).json({ message: "Equipment reserved successfully." });
  } catch (error) {
      console.error("Error reserving equipment:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};

// exports.releaseEquipment = async (req, res) => {
//   try {
//       const { equipment_id } = req.body;

//       if (!equipment_id) {
//           return res.status(400).json({ message: "Equipment ID is required." });
//       }

//       const query = "UPDATE equipment SET status = 'available', reserved_by = NULL WHERE equipment_id = ?";
//       const [result] = await db.execute(query, [equipment_id]);

//       if (result.affectedRows === 0) {
//           return res.status(400).json({ message: "Equipment is not reserved or does not exist." });
//       }

//       res.status(200).json({ message: "Reservation canceled successfully." });
//   } catch (error) {
//       console.error("Error releasing equipment:", error);
//       res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Helper functions
function formatDate(dateString) {
  // Convert MM/DD/YYYY to YYYY-MM-DD
  const parts = dateString.split('/');
  return `${parts[2]}-${parts[0]}-${parts[1]}`;
}

function calculateEndTime(startTime) {
  // Calculate end time (1 hour after start time)
  const [hours, minutes, seconds] = startTime.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(hours, minutes, seconds);
  endDate.setHours(endDate.getHours() + 1);
  
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:${endDate.getSeconds().toString().padStart(2, '0')}`;
}

function mapEquipmentType(frontendType) {
  // Map frontend equipment type to database type
  const typeMap = {
    'Computers': 'computer',
    'Projectors': 'projector',
    'Tablets': 'tablet'
  };
  
  return typeMap[frontendType] || 'computer';
}
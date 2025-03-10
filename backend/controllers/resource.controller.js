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

// Get equipment with pagination and availability
exports.getEquipment = async (req, res) => {
  try {
    const { type = 'computer', page = 0, date, time, ampm, includeReserved = 'false' } = req.query;
    
    // Convert type to database format
    const equipmentType = mapEquipmentType(type);
    
    // Convert page to number
    const pageNumber = parseInt(page);
    
    let equipmentList = [];
    let totalPages = 0;
    
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
        // Get ALL equipment of this type (both available and reserved)
        equipmentList = await Equipment.getByType(equipmentType, pageNumber, 4);
        
        // For each equipment, check if it's reserved at the specified time
        for (let item of equipmentList) {
          const reservations = await Reservation.getByResource('equipment', item.equipment_id);
          
          // Check if there's an active reservation for this time slot
          const activeReservation = reservations.find(r => 
            r.status === 'active' && 
            r.reservation_date === formattedDate &&
            ((r.start_time <= timeFormat && r.end_time > timeFormat) || 
             (r.start_time < endTime && r.end_time >= endTime) ||
             (r.start_time >= timeFormat && r.start_time < endTime))
          );
          
          if (activeReservation) {
            item.status = 'reserved';
            item.assignedTo = activeReservation.reserved_by;
          }
        }
      } else {
        // Get only available equipment (original behavior)
        equipmentList = await Equipment.getAvailableByType(
          equipmentType, formattedDate, timeFormat, endTime, pageNumber, 4
        );
      }
      
      // Get total equipment of this type for pagination
      const totalEquipment = await Equipment.getCountByType(equipmentType);
      totalPages = Math.ceil(totalEquipment / 4);
    } else {
      // Get all equipment by type paginated
      equipmentList = await Equipment.getByType(equipmentType, pageNumber, 4);
      
      // For each equipment, check for active reservations
      for (let item of equipmentList) {
        if (item.status === 'reserved') {
          // Get the current reservation details
          const reservations = await Reservation.getByResource('equipment', item.equipment_id);
          const activeReservation = reservations.find(r => r.status === 'active');
          
          if (activeReservation) {
            item.assignedTo = activeReservation.reserved_by;
          }
        }
      }
      
      // Get total equipment of this type for pagination
      const totalEquipment = await Equipment.getCountByType(equipmentType);
      totalPages = Math.ceil(totalEquipment / 4);
    }

    // Convert to format expected by frontend
    equipmentList.forEach(item => {
      item.id = item.equipment_id;
      item.available = item.status === 'available';
    });
    
    res.status(200).json({
      equipment: equipmentList,
      pagination: {
        page: pageNumber,
        totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({
      message: "Failed to retrieve equipment",
      error: error.message
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
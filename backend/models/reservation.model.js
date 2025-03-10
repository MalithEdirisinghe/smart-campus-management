const db = require('./db');

const Reservation = {
  // Create a new reservation
  create: async (reservationData) => {
    try {
      return await db.transaction(async (connection) => {
        // Insert reservation
        const [result] = await connection.execute(
          `INSERT INTO resource_reservations 
           (resource_type, resource_id, user_id, reserved_by, 
            reservation_date, start_time, end_time, purpose, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reservationData.resourceType,
            reservationData.resourceId,
            reservationData.userId,
            reservationData.reservedBy,
            reservationData.date,
            reservationData.startTime,
            reservationData.endTime,
            reservationData.purpose || null,
            'active'
          ]
        );
        
        const reservationId = result.insertId;
        
        // Update resource status
        const table = reservationData.resourceType === 'classroom' ? 'classrooms' : 'equipment';
        const idField = reservationData.resourceType === 'classroom' ? 'classroom_id' : 'equipment_id';
        
        await connection.execute(
          `UPDATE ${table} SET status = 'reserved' WHERE ${idField} = ?`,
          [reservationData.resourceId]
        );
        
        return { 
          reservationId,
          ...reservationData
        };
      });
    } catch (error) {
      throw error;
    }
  },

  // Get reservation by ID
  getById: async (id) => {
    try {
      const query = `
        SELECT r.*, u.first_name, u.last_name, u.role
        FROM resource_reservations r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.reservation_id = ?
      `;
      
      const results = await db.query(query, [id]);
      return results.length ? results[0] : null;
    } catch (error) {
      throw error;
    }
  },

  // Get reservations for a resource
  getByResource: async (resourceType, resourceId) => {
    try {
      const query = `
        SELECT r.*, u.first_name, u.last_name, u.role
        FROM resource_reservations r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.resource_type = ? AND r.resource_id = ?
        ORDER BY r.reservation_date, r.start_time
      `;
      
      return await db.query(query, [resourceType, resourceId]);
    } catch (error) {
      throw error;
    }
  },

  // Get reservations by user
  getByUser: async (userId) => {
    try {
      const query = `
        SELECT r.*, 
          CASE 
            WHEN r.resource_type = 'classroom' THEN c.name
            WHEN r.resource_type = 'equipment' THEN e.name
          END as resource_name
        FROM resource_reservations r
        LEFT JOIN classrooms c ON r.resource_type = 'classroom' AND r.resource_id = c.classroom_id
        LEFT JOIN equipment e ON r.resource_type = 'equipment' AND r.resource_id = e.equipment_id
        WHERE r.user_id = ?
        ORDER BY r.reservation_date, r.start_time
      `;
      
      return await db.query(query, [userId]);
    } catch (error) {
      throw error;
    }
  },

  // Cancel a reservation
  cancel: async (id) => {
    try {
      return await db.transaction(async (connection) => {
        // Get reservation details
        const [reservationResult] = await connection.execute(
          'SELECT * FROM resource_reservations WHERE reservation_id = ?',
          [id]
        );
        
        if (!reservationResult.length) {
          throw new Error('Reservation not found');
        }
        
        const reservation = reservationResult[0];
        
        // Update reservation status
        await connection.execute(
          'UPDATE resource_reservations SET status = ? WHERE reservation_id = ?',
          ['cancelled', id]
        );
        
        // Update resource status
        const table = reservation.resource_type === 'classroom' ? 'classrooms' : 'equipment';
        const idField = reservation.resource_type === 'classroom' ? 'classroom_id' : 'equipment_id';
        
        await connection.execute(
          `UPDATE ${table} SET status = 'available' WHERE ${idField} = ?`,
          [reservation.resource_id]
        );
        
        return true;
      });
    } catch (error) {
      throw error;
    }
  },
// In reservation.model.js
update: async (id, updateData) => {
  try {
      // Build the update query dynamically based on provided data
      const updateFields = [];
      const queryParams = [];
      
      if (updateData.reserved_by !== undefined) {
          updateFields.push('reserved_by = ?');
          queryParams.push(updateData.reserved_by);
      }
      
      if (updateData.purpose !== undefined) {
          updateFields.push('purpose = ?');
          queryParams.push(updateData.purpose);
      }
      
      if (updateFields.length === 0) {
          return false; // Nothing to update
      }
      
      // Add the reservation ID as the last parameter
      queryParams.push(id);
      
      const query = `
          UPDATE resource_reservations
          SET ${updateFields.join(', ')}
          WHERE reservation_id = ?
      `;
      
      const result = await db.query(query, queryParams);
      return result.affectedRows > 0;
  } catch (error) {
      throw error;
  }
},
  // Complete a reservation
  complete: async (id) => {
    try {
      return await db.transaction(async (connection) => {
        // Get reservation details
        const [reservationResult] = await connection.execute(
          'SELECT * FROM resource_reservations WHERE reservation_id = ?',
          [id]
        );
        
        if (!reservationResult.length) {
          throw new Error('Reservation not found');
        }
        
        const reservation = reservationResult[0];
        
        // Update reservation status
        await connection.execute(
          'UPDATE resource_reservations SET status = ? WHERE reservation_id = ?',
          ['completed', id]
        );
        
        // Update resource status
        const table = reservation.resource_type === 'classroom' ? 'classrooms' : 'equipment';
        const idField = reservation.resource_type === 'classroom' ? 'classroom_id' : 'equipment_id';
        
        await connection.execute(
          `UPDATE ${table} SET status = 'available' WHERE ${idField} = ?`,
          [reservation.resource_id]
        );
        
        return true;
      });
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Reservation;
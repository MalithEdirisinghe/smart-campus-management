const db = require('./db');

const Equipment = {
  // Get all equipment
  getAll: async () => {
    try {
      const query = 'SELECT * FROM equipment ORDER BY equipment_id';
      return await db.query(query);
    } catch (error) {
      throw error;
    }
  },

  // Get equipment by type with pagination
  getByType: async (type, page = 0, limit = 4) => {
    try {
      const offset = page * limit;
      const query = 'SELECT * FROM equipment WHERE type = ? ORDER BY equipment_id LIMIT ? OFFSET ?';
      return await db.query(query, [type, limit, offset]);
    } catch (error) {
      throw error;
    }
  },

  // Get available equipment by type for a specific date and time
  getAvailableByType: async (type, date, startTime, endTime, page = 0, limit = 4) => {
    try {
      const offset = page * limit;
      
      // Query to get equipment that are not reserved during the specified time
      const query = `
        SELECT e.* FROM equipment e
        WHERE e.type = ? AND e.status = 'available'
        AND NOT EXISTS (
          SELECT 1 FROM resource_reservations r
          WHERE r.resource_type = 'equipment'
          AND r.resource_id = e.equipment_id
          AND r.reservation_date = ?
          AND r.status = 'active'
          AND (
            (r.start_time <= ? AND r.end_time > ?) OR
            (r.start_time < ? AND r.end_time >= ?) OR
            (r.start_time >= ? AND r.start_time < ?)
          )
        )
        ORDER BY e.equipment_id
        LIMIT ? OFFSET ?
      `;
      
      return await db.query(query, [
        type, date, endTime, startTime, startTime, endTime, startTime, endTime,
        limit, offset
      ]);
    } catch (error) {
      throw error;
    }
  },

  // Get equipment by ID
  getById: async (id) => {
    try {
      const query = 'SELECT * FROM equipment WHERE equipment_id = ?';
      const results = await db.query(query, [id]);
      return results.length ? results[0] : null;
    } catch (error) {
      throw error;
    }
  },

  // Update equipment status
  updateStatus: async (id, status) => {
    try {
      const query = 'UPDATE equipment SET status = ? WHERE equipment_id = ?';
      const result = await db.query(query, [status, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Get count by type
  getCountByType: async (type) => {
    try {
      const query = 'SELECT COUNT(*) as total FROM equipment WHERE type = ?';
      const result = await db.query(query, [type]);
      return result[0].total;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Equipment;
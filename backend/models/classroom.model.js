const db = require('./db');

const Classroom = {
  // Get all classrooms
  getAll: async () => {
    try {
      const query = 'SELECT * FROM classrooms ORDER BY classroom_id';
      return await db.query(query);
    } catch (error) {
      throw error;
    }
  },

  // Get classrooms with pagination
  getPaginated: async (page = 0, limit = 4) => {
    try {
      const offset = page * limit;
      const query = 'SELECT * FROM classrooms ORDER BY classroom_id LIMIT ? OFFSET ?';
      return await db.query(query, [limit, offset]);
    } catch (error) {
      throw error;
    }
  },

  // Get available classrooms for a specific date and time
  getAvailable: async (date, startTime, endTime, page = 0, limit = 4) => {
    try {
      const offset = page * limit;
      
      // Query to get classrooms that are not reserved during the specified time
      const query = `
        SELECT c.* FROM classrooms c
        WHERE c.status = 'available'
        AND NOT EXISTS (
          SELECT 1 FROM resource_reservations r
          WHERE r.resource_type = 'classroom'
          AND r.resource_id = c.classroom_id
          AND r.reservation_date = ?
          AND r.status = 'active'
          AND (
            (r.start_time <= ? AND r.end_time > ?) OR
            (r.start_time < ? AND r.end_time >= ?) OR
            (r.start_time >= ? AND r.start_time < ?)
          )
        )
        ORDER BY c.classroom_id
        LIMIT ? OFFSET ?
      `;
      
      return await db.query(query, [
        date, endTime, startTime, startTime, endTime, startTime, endTime,
        limit, offset
      ]);
    } catch (error) {
      throw error;
    }
  },

  // Get a classroom by ID
  getById: async (id) => {
    try {
      const query = 'SELECT * FROM classrooms WHERE classroom_id = ?';
      const results = await db.query(query, [id]);
      return results.length ? results[0] : null;
    } catch (error) {
      throw error;
    }
  },

  // Update classroom status
  updateStatus: async (id, status) => {
    try {
      const query = 'UPDATE classrooms SET status = ? WHERE classroom_id = ?';
      const result = await db.query(query, [status, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Get total count
  getCount: async () => {
    try {
      const query = 'SELECT COUNT(*) as total FROM classrooms';
      const result = await db.query(query);
      return result[0].total;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Classroom;
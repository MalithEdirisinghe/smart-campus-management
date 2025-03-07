// models/admin.model.js
const db = require('./db');

const Admin = {
  findByUserId: async (userId) => {
    const query = 'SELECT * FROM admin_users WHERE user_id = ?';
    try {
      const results = await db.query(query, [userId]);
      return results.length ? results[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  findByAdminId: async (adminId) => {
    const query = 'SELECT * FROM admin_users WHERE admin_id = ?';
    try {
      const results = await db.query(query, [adminId]);
      return results.length ? results[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  findByUserIdAndAdminId: async (userId, adminId) => {
    const query = 'SELECT * FROM admin_users WHERE user_id = ? AND admin_id = ?';
    try {
      const results = await db.query(query, [userId, adminId]);
      return results.length ? results[0] : null;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Admin;
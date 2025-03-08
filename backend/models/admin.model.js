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
  
  update: async (adminId, adminData) => {
    // Create query parts dynamically based on provided data
    const updateFields = [];
    const queryParams = [];
    
    // Add fields that are present in adminData
    if (adminData.department !== undefined) {
      updateFields.push('department = ?');
      queryParams.push(adminData.department);
    }
    
    // Add other admin fields as needed
    
    // Make sure we have fields to update
    if (updateFields.length === 0) {
      return false; // Nothing to update
    }
    
    // Add adminId as the last parameter
    queryParams.push(adminId);
    
    const query = `UPDATE admin_users SET ${updateFields.join(', ')} WHERE admin_id = ?`;
    
    try {
      const result = await db.query(query, queryParams);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating admin:", error);
      throw error;
    }
  }
};

module.exports = Admin;
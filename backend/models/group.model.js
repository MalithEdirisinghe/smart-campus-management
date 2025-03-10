// models/group.model.js
const db = require('./db');

const Group = {
  // Create a new communication group
  create: async (groupData, userId) => {
    try {
      return await db.transaction(async (connection) => {
        // Insert group
        const [result] = await connection.execute(
          `INSERT INTO communication_groups 
           (batch_no, module, lecturer_id, created_by) 
           VALUES (?, ?, ?, ?)`,
          [
            groupData.batchNo,
            groupData.module,
            groupData.lecturerId,
            userId
          ]
        );
        
        const groupId = result.insertId;
        
        // Add the lecturer as a group member
        await connection.execute(
          `INSERT INTO group_members (group_id, user_id, role)
           SELECT ?, user_id, 'lecturer'
           FROM lecturer_users
           WHERE lecturer_id = ?`,
          [groupId, groupData.lecturerId]
        );
        
        // Add students from this batch as group members
        if (groupData.addStudents) {
          await connection.execute(
            `INSERT INTO group_members (group_id, user_id, role)
             SELECT ?, user_id, 'student'
             FROM students
             WHERE batch = ?`,
            [groupId, groupData.batchNo]
          );
        }
        
        // Get lecturer name
        const [lecturerResults] = await connection.execute(
          `SELECT u.first_name, u.last_name 
           FROM users u
           JOIN lecturer_users l ON u.user_id = l.user_id
           WHERE l.lecturer_id = ?`,
          [groupData.lecturerId]
        );
        
        let lecturerName = 'Unknown';
        if (lecturerResults.length > 0) {
          lecturerName = `${lecturerResults[0].first_name} ${lecturerResults[0].last_name}`;
        }
        
        // Return created group data
        return {
          id: groupId,
          batchNo: groupData.batchNo,
          module: groupData.module,
          lecturerId: groupData.lecturerId,
          lecturerName: lecturerName,
          createdBy: userId
        };
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Get all groups with lecturer names
  getAll: async (filters = {}) => {
    try {
      let query = `
        SELECT g.group_id as id, g.batch_no as batchNo, g.module, 
               g.lecturer_id as lecturerId, 
               CONCAT(u.first_name, ' ', u.last_name) as lecturerName
        FROM communication_groups g
        JOIN lecturer_users l ON g.lecturer_id = l.lecturer_id
        JOIN users u ON l.user_id = u.user_id
      `;
      
      const queryParams = [];
      
      // Apply filters if provided
      if (filters.role) {
        query += ` WHERE EXISTS (
          SELECT 1 FROM group_members gm
          WHERE gm.group_id = g.group_id AND gm.role = ?
        )`;
        queryParams.push(filters.role.toLowerCase());
      }
      
      // Add search term filter if provided
      if (filters.search) {
        const searchCondition = filters.role ? ' AND (' : ' WHERE (';
        query += `${searchCondition}
          g.batch_no LIKE ? OR 
          g.module LIKE ? OR 
          g.lecturer_id LIKE ? OR 
          CONCAT(u.first_name, ' ', u.last_name) LIKE ?
        )`;
        const searchParam = `%${filters.search}%`;
        queryParams.push(searchParam, searchParam, searchParam, searchParam);
      }
      
      // Add order by clause
      query += ` ORDER BY g.created_at DESC`;
      
      return await db.query(query, queryParams);
    } catch (error) {
      throw error;
    }
  },
  
  // Get a group by ID
  getById: async (groupId) => {
    try {
      const query = `
        SELECT g.group_id as id, g.batch_no as batchNo, g.module, 
               g.lecturer_id as lecturerId, 
               CONCAT(u.first_name, ' ', u.last_name) as lecturerName,
               g.created_by as createdBy, g.created_at as createdAt
        FROM communication_groups g
        JOIN lecturer_users l ON g.lecturer_id = l.lecturer_id
        JOIN users u ON l.user_id = u.user_id
        WHERE g.group_id = ?
      `;
      
      const results = await db.query(query, [groupId]);
      return results.length ? results[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Update a group
  update: async (groupId, groupData) => {
    try {
      return await db.transaction(async (connection) => {
        // Get current group data
        const [currentGroupResults] = await connection.execute(
          `SELECT lecturer_id, batch_no FROM communication_groups WHERE group_id = ?`,
          [groupId]
        );
        
        if (!currentGroupResults.length) {
          throw new Error('Group not found');
        }
        
        const currentGroup = currentGroupResults[0];
        
        // Update group
        await connection.execute(
          `UPDATE communication_groups 
           SET batch_no = ?, module = ?, lecturer_id = ?
           WHERE group_id = ?`,
          [
            groupData.batchNo,
            groupData.module,
            groupData.lecturerId,
            groupId
          ]
        );
        
        // If lecturer changed, update group membership
        if (currentGroup.lecturer_id !== groupData.lecturerId) {
          // Remove old lecturer from members
          await connection.execute(
            `DELETE FROM group_members 
             WHERE group_id = ? AND user_id IN (
               SELECT user_id FROM lecturer_users WHERE lecturer_id = ?
             )`,
            [groupId, currentGroup.lecturer_id]
          );
          
          // Add new lecturer to members
          await connection.execute(
            `INSERT INTO group_members (group_id, user_id, role)
             SELECT ?, user_id, 'lecturer'
             FROM lecturer_users
             WHERE lecturer_id = ?`,
            [groupId, groupData.lecturerId]
          );
        }
        
        // If batch changed and addStudents is true, update student members
        if (currentGroup.batch_no !== groupData.batchNo && groupData.addStudents) {
          // Remove old batch students
          await connection.execute(
            `DELETE FROM group_members 
             WHERE group_id = ? AND role = 'student'`,
            [groupId]
          );
          
          // Add new batch students
          await connection.execute(
            `INSERT INTO group_members (group_id, user_id, role)
             SELECT ?, user_id, 'student'
             FROM students
             WHERE batch = ?`,
            [groupId, groupData.batchNo]
          );
        }
        
        // Get lecturer name
        const [lecturerResults] = await connection.execute(
          `SELECT u.first_name, u.last_name 
           FROM users u
           JOIN lecturer_users l ON u.user_id = l.user_id
           WHERE l.lecturer_id = ?`,
          [groupData.lecturerId]
        );
        
        let lecturerName = 'Unknown';
        if (lecturerResults.length > 0) {
          lecturerName = `${lecturerResults[0].first_name} ${lecturerResults[0].last_name}`;
        }
        
        // Return updated group data
        return {
          id: groupId,
          batchNo: groupData.batchNo,
          module: groupData.module,
          lecturerId: groupData.lecturerId,
          lecturerName: lecturerName
        };
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Delete a group
  delete: async (groupId) => {
    try {
      const query = `DELETE FROM communication_groups WHERE group_id = ?`;
      const result = await db.query(query, [groupId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Get group members
  getMembers: async (groupId) => {
    try {
      const query = `
        SELECT gm.user_id as userId, gm.role,
               u.first_name as firstName, u.last_name as lastName,
               CASE 
                 WHEN gm.role = 'student' THEN s.student_id
                 WHEN gm.role = 'lecturer' THEN l.lecturer_id
                 WHEN gm.role = 'admin' THEN a.admin_id
                 ELSE NULL
               END as userTypeId
        FROM group_members gm
        JOIN users u ON gm.user_id = u.user_id
        LEFT JOIN students s ON u.user_id = s.user_id AND gm.role = 'student'
        LEFT JOIN lecturer_users l ON u.user_id = l.user_id AND gm.role = 'lecturer'
        LEFT JOIN admin_users a ON u.user_id = a.user_id AND gm.role = 'admin'
        WHERE gm.group_id = ?
        ORDER BY gm.role, u.last_name, u.first_name
      `;
      
      return await db.query(query, [groupId]);
    } catch (error) {
      throw error;
    }
  },
  
  // Add member to group
  addMember: async (groupId, userId, role) => {
    try {
      const query = `
        INSERT INTO group_members (group_id, user_id, role)
        VALUES (?, ?, ?)
      `;
      
      const result = await db.query(query, [groupId, userId, role.toLowerCase()]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Remove member from group
  removeMember: async (groupId, userId) => {
    try {
      const query = `
        DELETE FROM group_members
        WHERE group_id = ? AND user_id = ?
      `;
      
      const result = await db.query(query, [groupId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Group;
// models/message.model.js
const db = require('./db');

const Message = {
  // Send a direct message
  sendDirectMessage: async (senderUserId, receiverUserId, content) => {
    try {
      const query = `
        INSERT INTO direct_messages (sender_id, receiver_id, content)
        VALUES (?, ?, ?)
      `;
      
      const result = await db.query(query, [senderUserId, receiverUserId, content]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },
  
  // Send a group message
  sendGroupMessage: async (groupId, senderUserId, content) => {
    try {
      return await db.transaction(async (connection) => {
        // Insert message
        const [result] = await connection.execute(
          `INSERT INTO group_messages (group_id, sender_id, content)
           VALUES (?, ?, ?)`,
          [groupId, senderUserId, content]
        );
        
        const messageId = result.insertId;
        
        // Mark as unread for all group members except sender
        await connection.execute(
          `INSERT INTO message_read_status (message_id, user_id, is_read)
           SELECT ?, gm.user_id, gm.user_id = ?
           FROM group_members gm
           WHERE gm.group_id = ?`,
          [messageId, senderUserId, groupId]
        );
        
        return messageId;
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Get inbox messages (direct messages received)
  getInboxMessages: async (userId, limit = 20, offset = 0) => {
    try {
      const query = `
        SELECT 
          dm.message_id as id, 
          dm.sender_id as senderId, 
          CASE 
            WHEN u.role = 'student' THEN s.student_id
            WHEN u.role = 'lecturer' THEN l.lecturer_id
            WHEN u.role = 'admin' THEN a.admin_id
            ELSE NULL
          END as senderTypeId,
          CONCAT(
            CASE 
              WHEN u.role = 'student' THEN s.student_id
              WHEN u.role = 'lecturer' THEN l.lecturer_id
              WHEN u.role = 'admin' THEN a.admin_id
              ELSE NULL
            END,
            ' - ',
            u.first_name, ' ', u.last_name
          ) as sender,
          u.role as senderRole,
          dm.content,
          dm.is_read as read,
          dm.created_at as timestamp
        FROM direct_messages dm
        JOIN users u ON dm.sender_id = u.user_id
        LEFT JOIN students s ON u.user_id = s.user_id AND u.role = 'student'
        LEFT JOIN lecturer_users l ON u.user_id = l.user_id AND u.role = 'lecturer'
        LEFT JOIN admin_users a ON u.user_id = a.user_id AND u.role = 'admin'
        WHERE dm.receiver_id = ?
        ORDER BY dm.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      return await db.query(query, [userId, limit, offset]);
    } catch (error) {
      throw error;
    }
  },
  
  // Get sent messages (direct messages sent)
  getSentMessages: async (userId, limit = 20, offset = 0) => {
    try {
      const query = `
        SELECT 
          dm.message_id as id, 
          dm.receiver_id as receiverId, 
          CASE 
            WHEN u.role = 'student' THEN s.student_id
            WHEN u.role = 'lecturer' THEN l.lecturer_id
            WHEN u.role = 'admin' THEN a.admin_id
            ELSE NULL
          END as receiverTypeId,
          CONCAT(
            CASE 
              WHEN u.role = 'student' THEN s.student_id
              WHEN u.role = 'lecturer' THEN l.lecturer_id
              WHEN u.role = 'admin' THEN a.admin_id
              ELSE NULL
            END,
            ' - ',
            u.first_name, ' ', u.last_name
          ) as receiver,
          dm.content,
          dm.is_read as read,
          dm.created_at as timestamp
        FROM direct_messages dm
        JOIN users u ON dm.receiver_id = u.user_id
        LEFT JOIN students s ON u.user_id = s.user_id AND u.role = 'student'
        LEFT JOIN lecturer_users l ON u.user_id = l.user_id AND u.role = 'lecturer'
        LEFT JOIN admin_users a ON u.user_id = a.user_id AND u.role = 'admin'
        WHERE dm.sender_id = ?
        ORDER BY dm.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      return await db.query(query, [userId, limit, offset]);
    } catch (error) {
      throw error;
    }
  },
  
  // Get group messages
  getGroupMessages: async (groupId, limit = 20, offset = 0) => {
    try {
      const query = `
        SELECT 
          gm.message_id as id, 
          gm.sender_id as senderId, 
          CASE 
            WHEN u.role = 'student' THEN s.student_id
            WHEN u.role = 'lecturer' THEN l.lecturer_id
            WHEN u.role = 'admin' THEN a.admin_id
            ELSE NULL
          END as senderTypeId,
          CONCAT(u.first_name, ' ', u.last_name) as senderName,
          u.role as senderRole,
          gm.content,
          gm.created_at as timestamp
        FROM group_messages gm
        JOIN users u ON gm.sender_id = u.user_id
        LEFT JOIN students s ON u.user_id = s.user_id AND u.role = 'student'
        LEFT JOIN lecturer_users l ON u.user_id = l.user_id AND u.role = 'lecturer'
        LEFT JOIN admin_users a ON u.user_id = a.user_id AND u.role = 'admin'
        WHERE gm.group_id = ?
        ORDER BY gm.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      return await db.query(query, [groupId, limit, offset]);
    } catch (error) {
      throw error;
    }
  },
  
  // Mark direct message as read
  markDirectMessageAsRead: async (messageId) => {
    try {
      const query = `
        UPDATE direct_messages
        SET is_read = TRUE
        WHERE message_id = ?
      `;
      
      const result = await db.query(query, [messageId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Mark group message as read for a user
  markGroupMessageAsRead: async (messageId, userId) => {
    try {
      const query = `
        UPDATE message_read_status
        SET is_read = TRUE, read_at = NOW()
        WHERE message_id = ? AND user_id = ?
      `;
      
      const result = await db.query(query, [messageId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Get unread messages count
  getUnreadCount: async (userId) => {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM direct_messages
        WHERE receiver_id = ? AND is_read = FALSE
      `;
      
      const result = await db.query(query, [userId]);
      return result[0].count;
    } catch (error) {
      throw error;
    }
  },
  
  // Find user by ID (student, lecturer, or admin ID)
  findUserByTypeId: async (typeId) => {
    try {
      // Try to find as student
      let query = `
        SELECT u.user_id
        FROM users u
        JOIN students s ON u.user_id = s.user_id
        WHERE s.student_id = ?
      `;
      
      let results = await db.query(query, [typeId]);
      if (results.length > 0) {
        return results[0].user_id;
      }
      
      // Try to find as lecturer
      query = `
        SELECT u.user_id
        FROM users u
        JOIN lecturer_users l ON u.user_id = l.user_id
        WHERE l.lecturer_id = ?
      `;
      
      results = await db.query(query, [typeId]);
      if (results.length > 0) {
        return results[0].user_id;
      }
      
      // Try to find as admin
      query = `
        SELECT u.user_id
        FROM users u
        JOIN admin_users a ON u.user_id = a.user_id
        WHERE a.admin_id = ?
      `;
      
      results = await db.query(query, [typeId]);
      if (results.length > 0) {
        return results[0].user_id;
      }
      
      // User not found
      return null;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Message;
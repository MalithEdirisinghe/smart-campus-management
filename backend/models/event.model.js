// models/event.model.js
const db = require('./db');

const Event = {
  // Create a new event
  create: async (eventData, createdBy) => {
    return db.transaction(async (connection) => {
      // Insert into events table
      const [result] = await connection.execute(
        `INSERT INTO events 
         (name, date, time, location, venue, description, is_announcement, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventData.name,
          eventData.date || null,
          eventData.time || null,
          eventData.location || null,
          eventData.venue || null,
          eventData.description || null,
          eventData.isAnnouncement || false,
          createdBy
        ]
      );
      
      const eventId = result.insertId;
      
      // Insert target audience
      if (eventData.targetAudience && eventData.targetAudience.length > 0) {
        for (const role of eventData.targetAudience) {
          await connection.execute(
            `INSERT INTO event_audience (event_id, role) VALUES (?, ?)`,
            [eventId, role]
          );
        }
      }
      
      // Insert notification settings
      if (eventData.sendNotifications && eventData.sendNotifications.length > 0) {
        for (const role of eventData.sendNotifications) {
          await connection.execute(
            `INSERT INTO event_notifications (event_id, role) VALUES (?, ?)`,
            [eventId, role]
          );
        }
      }
      
      // Return the created event with its ID
      return {
        eventId,
        ...eventData
      };
    });
  },
  
  // Get all events with optional filtering
  getAll: async (filters = {}) => {
    let query = `
      SELECT e.*, u.first_name, u.last_name
      FROM events e
      JOIN users u ON e.created_by = u.user_id
    `;
    
    const queryParams = [];
    
    // Add filters if provided
    if (filters.role) {
      query += `
        JOIN event_audience ea ON e.event_id = ea.event_id
        WHERE ea.role = ?
      `;
      queryParams.push(filters.role);
    }
    
    // Add order by clause
    query += ` ORDER BY e.created_at DESC`;
    
    // Add pagination if provided
    if (filters.limit) {
      query += ` LIMIT ?`;
      queryParams.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ` OFFSET ?`;
        queryParams.push(parseInt(filters.offset));
      }
    }
    
    const events = await db.query(query, queryParams);
    
    // For each event, get its target audience and notification settings
    for (const event of events) {
      event.targetAudience = await Event.getTargetAudience(event.event_id);
      event.notifications = await Event.getNotificationSettings(event.event_id);
    }
    
    return events;
  },
  
  // Get a single event by ID
  getById: async (eventId) => {
    const query = `
      SELECT e.*, u.first_name, u.last_name
      FROM events e
      JOIN users u ON e.created_by = u.user_id
      WHERE e.event_id = ?
    `;
    
    const events = await db.query(query, [eventId]);
    
    if (events.length === 0) {
      return null;
    }
    
    const event = events[0];
    
    // Get target audience and notification settings
    event.targetAudience = await Event.getTargetAudience(eventId);
    event.notifications = await Event.getNotificationSettings(eventId);
    
    return event;
  },
  
  // Get target audience for an event
  getTargetAudience: async (eventId) => {
    const query = `
      SELECT role FROM event_audience
      WHERE event_id = ?
    `;
    
    const roles = await db.query(query, [eventId]);
    return roles.map(r => r.role);
  },
  
  // Get notification settings for an event
  getNotificationSettings: async (eventId) => {
    const query = `
      SELECT role, is_sent, sent_at
      FROM event_notifications
      WHERE event_id = ?
    `;
    
    return await db.query(query, [eventId]);
  },
  
  // Update an event
  update: async (eventId, eventData) => {
    return db.transaction(async (connection) => {
      // Update events table
      await connection.execute(
        `UPDATE events
         SET name = ?, date = ?, time = ?, location = ?, venue = ?, 
             description = ?, is_announcement = ?
         WHERE event_id = ?`,
        [
          eventData.name,
          eventData.date || null,
          eventData.time || null,
          eventData.location || null,
          eventData.venue || null,
          eventData.description || null,
          eventData.isAnnouncement || false,
          eventId
        ]
      );
      
      // Update target audience: first delete existing entries
      await connection.execute(
        `DELETE FROM event_audience WHERE event_id = ?`,
        [eventId]
      );
      
      // Then insert new target audience
      if (eventData.targetAudience && eventData.targetAudience.length > 0) {
        for (const role of eventData.targetAudience) {
          await connection.execute(
            `INSERT INTO event_audience (event_id, role) VALUES (?, ?)`,
            [eventId, role]
          );
        }
      }
      
      // Update notification settings: delete existing entries that haven't been sent
      await connection.execute(
        `DELETE FROM event_notifications WHERE event_id = ? AND is_sent = 0`,
        [eventId]
      );
      
      // Insert new notification settings
      if (eventData.sendNotifications && eventData.sendNotifications.length > 0) {
        for (const role of eventData.sendNotifications) {
          // Check if notification already exists and was sent
          const [existingNotifications] = await connection.execute(
            `SELECT * FROM event_notifications 
             WHERE event_id = ? AND role = ? AND is_sent = 1`,
            [eventId, role]
          );
          
          // Only insert if no sent notification exists
          if (existingNotifications.length === 0) {
            await connection.execute(
              `INSERT INTO event_notifications (event_id, role) VALUES (?, ?)`,
              [eventId, role]
            );
          }
        }
      }
      
      return { eventId, ...eventData };
    });
  },
  
  // Delete an event
  delete: async (eventId) => {
    const query = `DELETE FROM events WHERE event_id = ?`;
    const result = await db.query(query, [eventId]);
    return result.affectedRows > 0;
  },
  
  // Mark notifications as sent
  markNotificationSent: async (eventId, role) => {
    const query = `
      UPDATE event_notifications
      SET is_sent = 1, sent_at = NOW()
      WHERE event_id = ? AND role = ?
    `;
    
    const result = await db.query(query, [eventId, role]);
    return result.affectedRows > 0;
  }
};

module.exports = Event;
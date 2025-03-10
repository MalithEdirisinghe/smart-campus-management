// controllers/event.controller.js
const Event = require('../models/event.model');
const User = require('../models/user.model');

// Create a new event or announcement
exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      date,
      time,
      location,
      venue,
      description,
      targetAudience,
      sendNotifications,
      isAnnouncement
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        message: "Event/Announcement name is required"
      });
    }
    
    // Create event data object
    const eventData = {
      name,
      date,
      time,
      location,
      venue,
      description,
      targetAudience,
      sendNotifications,
      isAnnouncement: isAnnouncement || (!date && !time && !location && !venue)
    };
    
    // Create the event in the database
    const event = await Event.create(eventData, req.userId);
    
    // Send notifications (in a real system, this might be a background job)
    // This is a placeholder for actual notification logic
    if (sendNotifications && sendNotifications.length > 0) {
      for (const role of sendNotifications) {
        // Mark notification as sent
        await Event.markNotificationSent(event.eventId, role);
      }
    }
    
    res.status(201).json({
      message: "Event/Announcement created successfully",
      event
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      message: "Failed to create event/announcement",
      error: error.message
    });
  }
};

// Get all events/announcements
exports.getAllEvents = async (req, res) => {
  try {
    const { role, limit, offset, isAnnouncement } = req.query;
    
    // Create filter object based on query parameters
    const filters = {};
    if (role) filters.role = role;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);
    
    // Get events from database
    const events = await Event.getAll(filters);
    
    // Filter by announcement status if specified
    let filteredEvents = events;
    if (isAnnouncement !== undefined) {
      const isAnnouncementBool = isAnnouncement === 'true';
      filteredEvents = events.filter(event => event.is_announcement === isAnnouncementBool);
    }
    
    // Format dates and times for response
    const formattedEvents = filteredEvents.map(event => ({
      id: event.event_id,
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      venue: event.venue,
      description: event.description,
      isAnnouncement: event.is_announcement,
      createdBy: {
        id: event.created_by,
        name: `${event.first_name} ${event.last_name}`
      },
      targetAudience: event.targetAudience,
      notifications: event.notifications,
      createdAt: event.created_at
    }));
    
    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      message: "Failed to retrieve events/announcements",
      error: error.message
    });
  }
};

// Get a single event/announcement by ID
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Get event from database
    const event = await Event.getById(eventId);
    
    if (!event) {
      return res.status(404).json({
        message: "Event/Announcement not found"
      });
    }
    
    // Format response
    const formattedEvent = {
      id: event.event_id,
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      venue: event.venue,
      description: event.description,
      isAnnouncement: event.is_announcement,
      createdBy: {
        id: event.created_by,
        name: `${event.first_name} ${event.last_name}`
      },
      targetAudience: event.targetAudience,
      notifications: event.notifications,
      createdAt: event.created_at
    };
    
    res.status(200).json(formattedEvent);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      message: "Failed to retrieve event/announcement",
      error: error.message
    });
  }
};

// Update an event/announcement
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const {
      name,
      date,
      time,
      location,
      venue,
      description,
      targetAudience,
      sendNotifications,
      isAnnouncement
    } = req.body;
    
    // Check if event exists
    const existingEvent = await Event.getById(eventId);
    
    if (!existingEvent) {
      return res.status(404).json({
        message: "Event/Announcement not found"
      });
    }
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        message: "Event/Announcement name is required"
      });
    }
    
    // Create event data object
    const eventData = {
      name,
      date,
      time,
      location,
      venue,
      description,
      targetAudience,
      sendNotifications,
      isAnnouncement: isAnnouncement || (!date && !time && !location && !venue)
    };
    
    // Update the event in the database
    await Event.update(eventId, eventData);
    
    // Send notifications for any new notification settings
    if (sendNotifications && sendNotifications.length > 0) {
      for (const role of sendNotifications) {
        // Check if notification was already sent
        const wasAlreadySent = existingEvent.notifications.some(
          n => n.role === role && n.is_sent
        );
        
        // Only send if not already sent
        if (!wasAlreadySent) {
          // Mark notification as sent
          await Event.markNotificationSent(eventId, role);
        }
      }
    }
    
    res.status(200).json({
      message: "Event/Announcement updated successfully",
      event: { id: eventId, ...eventData }
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      message: "Failed to update event/announcement",
      error: error.message
    });
  }
};

// Delete an event/announcement
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Check if event exists
    const existingEvent = await Event.getById(eventId);
    
    if (!existingEvent) {
      return res.status(404).json({
        message: "Event/Announcement not found"
      });
    }
    
    // Delete the event
    await Event.delete(eventId);
    
    res.status(200).json({
      message: "Event/Announcement deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      message: "Failed to delete event/announcement",
      error: error.message
    });
  }
};

// Get all events or ongoing events
exports.getEvents = async (req, res) => {
  try {
    const { ongoing } = req.query;
    
    let query = 'SELECT * FROM events';
    
    // If 'ongoing' parameter is set to true, filter for current events
    if (ongoing === 'true') {
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      query += ` WHERE date >= '${currentDate}' ORDER BY date ASC, time ASC`;
    } else {
      query += ' ORDER BY created_at DESC';
    }
    
    const events = await db.query(query);
    
    // Format events for frontend
    const formattedEvents = events.map(event => ({
      id: event.event_id,
      name: event.name,
      date: formatDate(event.date), // Convert YYYY-MM-DD to MM/DD/YYYY
      time: event.time,
      location: event.location,
      venue: event.venue,
      description: event.description,
      createdAt: event.created_at
    }));
    
    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      message: "Failed to retrieve events",
      error: error.message
    });
  }
};

// Helper function to format date from YYYY-MM-DD to MM/DD/YYYY
function formatDate(dateStr) {
  if (!dateStr) return '';
  
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    // Return as MM/DD/YYYY
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr;
  }
}
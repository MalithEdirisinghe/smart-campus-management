// controllers/message.controller.js
const Message = require('../models/message.model');

// Send a direct message
exports.sendDirectMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    // Validate required fields
    if (!receiverId || !content) {
      return res.status(400).json({
        message: "Receiver ID and message content are required"
      });
    }
    
    // Find receiver's user ID based on their role-specific ID (student_id, lecturer_id, etc.)
    const receiverUserId = await Message.findUserByTypeId(receiverId);
    
    if (!receiverUserId) {
      return res.status(404).json({
        message: "Receiver not found"
      });
    }
    
    // Send the message
    const messageId = await Message.sendDirectMessage(req.userId, receiverUserId, content);
    
    res.status(201).json({
      message: "Message sent successfully",
      messageId
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      message: "Failed to send message",
      error: error.message
    });
  }
};

// Send a group message
exports.sendGroupMessage = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { content } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({
        message: "Message content is required"
      });
    }
    
    // Send the message
    const messageId = await Message.sendGroupMessage(groupId, req.userId, content);
    
    res.status(201).json({
      message: "Group message sent successfully",
      messageId
    });
  } catch (error) {
    console.error("Error sending group message:", error);
    res.status(500).json({
      message: "Failed to send group message",
      error: error.message
    });
  }
};

// Get inbox messages (direct messages received)
exports.getInboxMessages = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    // Get messages
    const messages = await Message.getInboxMessages(
      req.userId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching inbox messages:", error);
    res.status(500).json({
      message: "Failed to retrieve inbox messages",
      error: error.message
    });
  }
};

// Get sent messages (direct messages sent)
exports.getSentMessages = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    // Get messages
    const messages = await Message.getSentMessages(
      req.userId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    res.status(500).json({
      message: "Failed to retrieve sent messages",
      error: error.message
    });
  }
};

// Get group messages
exports.getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { limit = 20, offset = 0 } = req.query;
    
    // Get messages
    const messages = await Message.getGroupMessages(
      groupId, 
      parseInt(limit), 
      parseInt(offset)
    );
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({
      message: "Failed to retrieve group messages",
      error: error.message
    });
  }
};

// Mark direct message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    
    // Mark message as read
    const result = await Message.markDirectMessageAsRead(messageId);
    
    if (!result) {
      return res.status(404).json({
        message: "Message not found"
      });
    }
    
    res.status(200).json({
      message: "Message marked as read"
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({
      message: "Failed to mark message as read",
      error: error.message
    });
  }
};

// Mark group message as read
exports.markGroupMessageAsRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    
    // Mark message as read
    const result = await Message.markGroupMessageAsRead(messageId, req.userId);
    
    if (!result) {
      return res.status(404).json({
        message: "Message not found or already read"
      });
    }
    
    res.status(200).json({
      message: "Group message marked as read"
    });
  } catch (error) {
    console.error("Error marking group message as read:", error);
    res.status(500).json({
      message: "Failed to mark group message as read",
      error: error.message
    });
  }
};

// Get unread messages count
exports.getUnreadCount = async (req, res) => {
  try {
    // Get unread count
    const count = await Message.getUnreadCount(req.userId);
    
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      message: "Failed to retrieve unread messages count",
      error: error.message
    });
  }
};
// controllers/group.controller.js
const Group = require('../models/group.model');
const User = require('../models/user.model');

// Create a new communication group
exports.createGroup = async (req, res) => {
  try {
    const { batchNo, module, lecturerId, addStudents } = req.body;
    
    // Validate required fields
    if (!batchNo || !module || !lecturerId) {
      return res.status(400).json({
        message: "Batch no, module, and lecturer ID are required"
      });
    }
    
    // Create the group
    const group = await Group.create({
      batchNo,
      module,
      lecturerId,
      addStudents: addStudents !== false // Default to true if not provided
    }, req.userId);
    
    res.status(201).json({
      message: "Group created successfully",
      group
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      message: "Failed to create group",
      error: error.message
    });
  }
};

// Get all groups with filters
exports.getGroups = async (req, res) => {
  try {
    const { role, search } = req.query;
    
    // Create filter object based on query parameters
    const filters = {};
    if (role) filters.role = role;
    if (search) filters.search = search;
    
    // Get groups from database
    const groups = await Group.getAll(filters);
    
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({
      message: "Failed to retrieve groups",
      error: error.message
    });
  }
};

// Get a group by ID
exports.getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // Get group from database
    const group = await Group.getById(groupId);
    
    if (!group) {
      return res.status(404).json({
        message: "Group not found"
      });
    }
    
    // Get group members
    const members = await Group.getMembers(groupId);
    
    res.status(200).json({
      ...group,
      members
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({
      message: "Failed to retrieve group",
      error: error.message
    });
  }
};

// Update a group
exports.updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { batchNo, module, lecturerId, addStudents } = req.body;
    
    // Validate required fields
    if (!batchNo || !module || !lecturerId) {
      return res.status(400).json({
        message: "Batch no, module, and lecturer ID are required"
      });
    }
    
    // Check if group exists
    const existingGroup = await Group.getById(groupId);
    
    if (!existingGroup) {
      return res.status(404).json({
        message: "Group not found"
      });
    }
    
    // Update the group
    const updatedGroup = await Group.update(groupId, {
      batchNo,
      module,
      lecturerId,
      addStudents: addStudents !== false // Default to true if not provided
    });
    
    res.status(200).json({
      message: "Group updated successfully",
      group: updatedGroup
    });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({
      message: "Failed to update group",
      error: error.message
    });
  }
};

// Delete a group
exports.deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // Check if group exists
    const existingGroup = await Group.getById(groupId);
    
    if (!existingGroup) {
      return res.status(404).json({
        message: "Group not found"
      });
    }
    
    // Delete the group
    await Group.delete(groupId);
    
    res.status(200).json({
      message: "Group deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({
      message: "Failed to delete group",
      error: error.message
    });
  }
};

// Get group members
exports.getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // Check if group exists
    const existingGroup = await Group.getById(groupId);
    
    if (!existingGroup) {
      return res.status(404).json({
        message: "Group not found"
      });
    }
    
    // Get group members
    const members = await Group.getMembers(groupId);
    
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching group members:", error);
    res.status(500).json({
      message: "Failed to retrieve group members",
      error: error.message
    });
  }
};

// Add member to group
exports.addGroupMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { userId, role } = req.body;
    
    // Validate required fields
    if (!userId || !role) {
      return res.status(400).json({
        message: "User ID and role are required"
      });
    }
    
    // Check if group exists
    const existingGroup = await Group.getById(groupId);
    
    if (!existingGroup) {
      return res.status(404).json({
        message: "Group not found"
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    // Add member to group
    await Group.addMember(groupId, userId, role);
    
    res.status(200).json({
      message: "Member added to group successfully"
    });
  } catch (error) {
    console.error("Error adding group member:", error);
    res.status(500).json({
      message: "Failed to add member to group",
      error: error.message
    });
  }
};

// Remove member from group
exports.removeGroupMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.params.userId;
    
    // Check if group exists
    const existingGroup = await Group.getById(groupId);
    
    if (!existingGroup) {
      return res.status(404).json({
        message: "Group not found"
      });
    }
    
    // Remove member from group
    const result = await Group.removeMember(groupId, userId);
    
    if (!result) {
      return res.status(404).json({
        message: "Member not found in group"
      });
    }
    
    res.status(200).json({
      message: "Member removed from group successfully"
    });
  } catch (error) {
    console.error("Error removing group member:", error);
    res.status(500).json({
      message: "Failed to remove member from group",
      error: error.message
    });
  }
};
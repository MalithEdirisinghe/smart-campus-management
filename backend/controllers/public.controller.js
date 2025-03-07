// controllers/public.controller.js
const Student = require('../models/student.model');

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Student.getAvailableDepartments();
    
    // Transform to expected format
    const formattedDepartments = departments.map(dept => ({
      id: dept.department_id,
      name: dept.department_name
    }));
    
    res.status(200).json(formattedDepartments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve departments",
      error: error.message
    });
  }
};

// Get all batches
exports.getBatches = async (req, res) => {
  try {
    const batches = await Student.getAvailableBatches();
    
    // Transform to expected format
    const formattedBatches = batches.map(batch => ({
      id: batch.batch_id,
      name: batch.batch_id,
      departmentId: batch.department_id,
      startDate: batch.start_date,
      expectedGraduationDate: batch.expected_graduation_date
    }));
    
    res.status(200).json(formattedBatches);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve batches",
      error: error.message
    });
  }
};

// Get batches by department
exports.getBatchesByDepartment = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const batches = await Student.getAvailableBatches();
    
    // Filter batches by department
    const departmentBatches = batches
      .filter(batch => batch.department_id === departmentId)
      .map(batch => ({
        id: batch.batch_id,
        name: batch.batch_id,
        startDate: batch.start_date,
        expectedGraduationDate: batch.expected_graduation_date
      }));
    
    res.status(200).json(departmentBatches);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve batches for department",
      error: error.message
    });
  }
};
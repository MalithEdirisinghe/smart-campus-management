const controller = require('../controllers/public.controller');

module.exports = function(app) {
  // Get all departments
  app.get("/api/departments", controller.getDepartments);
  
  // Get all batches
  app.get("/api/batches", controller.getBatches);
  
  // Get batches by department
  app.get("/api/departments/:departmentId/batches", controller.getBatchesByDepartment);
};
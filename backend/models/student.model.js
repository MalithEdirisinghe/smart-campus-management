const db = require('./db');

// Student model with methods for CRUD operations
const Student = {
  // Create a new student
  create: async (studentData, connection = null) => {
    const query = `
      INSERT INTO students 
      (student_id, user_id, department, batch, enrollment_date, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      studentData.studentId,
      studentData.userId,
      studentData.department,
      studentData.batch,
      studentData.enrollmentDate || new Date(),
      studentData.status || 'active'
    ];
    
    try {
      // If a connection is provided, use it (for transactions)
      if (connection) {
        const [result] = await connection.execute(query, params);
        return {
          studentId: studentData.studentId,
          ...studentData
        };
      } else {
        const result = await db.query(query, params);
        return {
          studentId: studentData.studentId,
          ...studentData
        };
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Find a student by ID
  findById: async (studentId) => {
    const query = `
      SELECT s.*, u.email, u.first_name, u.last_name, u.profile_image,
             u.date_of_birth, u.gender, u.address, u.contact_number
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.student_id = ?
    `;
    
    try {
      const results = await db.query(query, [studentId]);
      return results.length ? formatStudentData(results[0]) : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Find a student by user ID
  findByUserId: async (userId) => {
    const query = `
      SELECT s.*, u.email, u.first_name, u.last_name, u.profile_image,
             u.date_of_birth, u.gender, u.address, u.contact_number
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.user_id = ?
    `;
    
    try {
      const results = await db.query(query, [userId]);
      return results.length ? formatStudentData(results[0]) : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Get all students (with pagination)
  findAll: async (limit = 10, offset = 0) => {
    const query = `
      SELECT s.*, u.email, u.first_name, u.last_name, u.profile_image
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      ORDER BY s.student_id
      LIMIT ? OFFSET ?
    `;
    
    try {
      const results = await db.query(query, [limit, offset]);
      return results.map(student => formatStudentData(student));
    } catch (error) {
      throw error;
    }
  },
  
  // Get students by department
  findByDepartment: async (department, limit = 10, offset = 0) => {
    const query = `
      SELECT s.*, u.email, u.first_name, u.last_name, u.profile_image
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.department = ?
      ORDER BY s.student_id
      LIMIT ? OFFSET ?
    `;
    
    try {
      const results = await db.query(query, [department, limit, offset]);
      return results.map(student => formatStudentData(student));
    } catch (error) {
      throw error;
    }
  },
  
  // Get students by batch
  findByBatch: async (batch, limit = 10, offset = 0) => {
    const query = `
      SELECT s.*, u.email, u.first_name, u.last_name, u.profile_image
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.batch = ?
      ORDER BY s.student_id
      LIMIT ? OFFSET ?
    `;
    
    try {
      const results = await db.query(query, [batch, limit, offset]);
      return results.map(student => formatStudentData(student));
    } catch (error) {
      throw error;
    }
  },
  
  // Update student information
  update: async (studentId, studentData) => {
    const query = `
      UPDATE students 
      SET department = ?, 
          batch = ?, 
          status = ?
      WHERE student_id = ?
    `;
    
    const params = [
      studentData.department,
      studentData.batch,
      studentData.status,
      studentId
    ];
    
    try {
      const result = await db.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete a student (this should be used with caution)
  delete: async (studentId) => {
    // This should be a transaction that also deletes the user
    return await db.transaction(async (connection) => {
      // First get the user_id
      const [userResult] = await connection.execute(
        'SELECT user_id FROM students WHERE student_id = ?', 
        [studentId]
      );
      
      if (!userResult.length) {
        throw new Error('Student not found');
      }
      
      const userId = userResult[0].user_id;
      
      // Delete from students table
      await connection.execute('DELETE FROM students WHERE student_id = ?', [studentId]);
      
      // Delete from users table
      await connection.execute('DELETE FROM users WHERE user_id = ?', [userId]);
      
      return true;
    });
  },
  
  // Generate a unique student ID
  generateStudentId: async (department = 'COM') => {
    // Get the latest student ID for this department
    const query = `
      SELECT student_id 
      FROM students 
      WHERE student_id LIKE ?
      ORDER BY student_id DESC 
      LIMIT 1
    `;
    
    try {
      const results = await db.query(query, [`${department}%`]);
      
      // Extract number and increment
      if (results.length) {
        const currentId = results[0].student_id;
        const numPart = currentId.match(/\d+$/)[0];
        const nextNum = parseInt(numPart, 10) + 1;
        return `${department}${nextNum.toString().padStart(3, '0')}`;
      } else {
        // First student in this department
        return `${department}001`;
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Get available batches
  getAvailableBatches: async () => {
    const query = `
      SELECT batch_id, department_id, start_date, expected_graduation_date, description
      FROM batches
      ORDER BY batch_id
    `;
    
    try {
      return await db.query(query);
    } catch (error) {
      throw error;
    }
  },
  
  // Get available departments
  getAvailableDepartments: async () => {
    const query = `
      SELECT department_id, department_name, description
      FROM departments
      ORDER BY department_name
    `;
    
    try {
      return await db.query(query);
    } catch (error) {
      throw error;
    }
  },

  // Fetch student reports
  getStudentReports: async () => {
    const query = `
      SELECT s.student_id, u.first_name AS studentName, s.batch, m.module_name AS module, r.grade AS results
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      JOIN results r ON s.student_id = r.student_id
      JOIN modules m ON r.module_id = m.module_id
    `;
    
    try {
      const results = await db.query(query);
      return results;
    } catch (error) {
      throw error;
    }
  },
};

// Helper function to convert snake_case to camelCase for student data
const formatStudentData = (student) => {
  return {
    studentId: student.student_id,
    userId: student.user_id,
    email: student.email,
    firstName: student.first_name,
    lastName: student.last_name,
    department: student.department,
    batch: student.batch,
    enrollmentDate: student.enrollment_date,
    status: student.status,
    profileImage: student.profile_image,
    dateOfBirth: student.date_of_birth,
    gender: student.gender,
    address: student.address,
    contactNumber: student.contact_number
  };
};

module.exports = Student;

const db = require('./db');

// User model with methods for CRUD operations
const User = {
  // Create a new user
  create: async (userData) => {
    const query = `
      INSERT INTO users 
      (email, password, role, first_name, last_name, date_of_birth, gender, address, contact_number) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      userData.email,
      userData.password, // Should be pre-hashed
      userData.role,
      userData.firstName,
      userData.lastName,
      userData.dateOfBirth || null,
      userData.gender || null,
      userData.address || null,
      userData.contactNumber || null
    ];
    
    try {
      const result = await db.query(query, params);
      return {
        userId: result.insertId,
        ...userData
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Find a user by ID
  findById: async (userId) => {
    const query = `
      SELECT user_id, email, role, first_name, last_name, profile_image, profile_image_type,
             date_of_birth, gender, address, contact_number, 
             created_at, updated_at, last_login
      FROM users WHERE user_id = ?
    `;
    
    try {
      const results = await db.query(query, [userId]);
      if (!results.length) return null;
      
      const userData = formatUserData(results[0]);
      
      // Convert BLOB to base64 string if present
      if (userData.profileImage && Buffer.isBuffer(userData.profileImage)) {
        const imageType = userData.profileImageType || 'image/jpeg';
        userData.profileImage = `data:${imageType};base64,${userData.profileImage.toString('base64')}`;
      }
      
      return userData;
    } catch (error) {
      throw error;
    }
  },
  
  // Find a user by email
  findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    
    try {
      const results = await db.query(query, [email]);
      return results.length ? results[0] : null;
    } catch (error) {
      throw error;
    }
  },
  
  // Update user profile with dynamic field handling
  update: async (userId, userData) => {
    // Create query parts dynamically based on provided data
    const updateFields = [];
    const queryParams = [];
    
    // Add fields that are present in userData
    if (userData.firstName !== undefined) {
      updateFields.push('first_name = ?');
      queryParams.push(userData.firstName);
    }
    
    if (userData.lastName !== undefined) {
      updateFields.push('last_name = ?');
      queryParams.push(userData.lastName);
    }
    
    if (userData.dateOfBirth !== undefined) {
      updateFields.push('date_of_birth = ?');
      queryParams.push(userData.dateOfBirth);
    }
    
    if (userData.gender !== undefined) {
      updateFields.push('gender = ?');
      queryParams.push(userData.gender);
    }
    
    if (userData.address !== undefined) {
      updateFields.push('address = ?');
      queryParams.push(userData.address);
    }
    
    if (userData.contactNumber !== undefined) {
      updateFields.push('contact_number = ?');
      queryParams.push(userData.contactNumber);
    }
    
    // Handle profile image as BLOB
    if (userData.profileImage !== undefined) {
      updateFields.push('profile_image = ?');
      queryParams.push(userData.profileImage);
      
      // If image type is provided
      if (userData.profileImageType !== undefined) {
        updateFields.push('profile_image_type = ?');
        queryParams.push(userData.profileImageType);
      }
    }
    
    // Make sure we have fields to update
    if (updateFields.length === 0) {
      return false; // Nothing to update
    }
    
    // Add userId as the last parameter
    queryParams.push(userId);
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
    
    try {
      console.log("Executing update query:", query);
      console.log("Parameters:", queryParams.map(p => 
        Buffer.isBuffer(p) ? `[Buffer of ${p.length} bytes]` : p
      ));
      
      const result = await db.query(query, queryParams);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
  
  // Update user's password
  updatePassword: async (userId, hashedPassword) => {
    const query = 'UPDATE users SET password = ? WHERE user_id = ?';
    
    try {
      const result = await db.query(query, [hashedPassword, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Update last login timestamp
  updateLastLogin: async (userId) => {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?';
    
    try {
      return await db.query(query, [userId]);
    } catch (error) {
      throw error;
    }
  },
  
  // Delete a user
  delete: async (userId) => {
    const query = 'DELETE FROM users WHERE user_id = ?';
    
    try {
      const result = await db.query(query, [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

// Helper function to convert snake_case to camelCase for user data
const formatUserData = (user) => {
  return {
    userId: user.user_id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImage: user.profile_image,
    profileImageType: user.profile_image_type,
    dateOfBirth: user.date_of_birth,
    gender: user.gender,
    address: user.address,
    contactNumber: user.contact_number,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLogin: user.last_login
  };
};

module.exports = User;
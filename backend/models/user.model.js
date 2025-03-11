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
    
    console.log("Executing findById query for user:", userId);
    
    try {
      const results = await db.query(query, [userId]);
      console.log("Query results obtained");
      
      if (!results.length) return null;
      
      if (results[0].profile_image) {
        console.log("Raw profile image from DB:", 
                    typeof results[0].profile_image,
                    "Length:", results[0].profile_image.length);
      }
      
      return results[0];
    } catch (error) {
      console.error("Error in findById:", error);
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
    const updateFields = [];
    const queryParams = [];
    
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
    
    // Handle profile image updates.
    // Support both camelCase (profileImage/profileImageType) and snake_case (profile_image/profile_image_type).
    let imageProvided = false;
    if (userData.profileImage !== undefined) {
      imageProvided = true;
      updateFields.push('profile_image = ?');
      queryParams.push(userData.profileImage);
      if (userData.profileImageType !== undefined) {
        updateFields.push('profile_image_type = ?');
        queryParams.push(userData.profileImageType);
      }
    } else if (userData.profile_image !== undefined) {
      imageProvided = true;
      updateFields.push('profile_image = ?');
      queryParams.push(userData.profile_image);
      if (userData.profile_image_type !== undefined) {
        updateFields.push('profile_image_type = ?');
        queryParams.push(userData.profile_image_type);
      }
    }
    
    if (updateFields.length === 0) {
      return false; // Nothing to update
    }
    
    // Add userId as the last parameter
    queryParams.push(userId);
    
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
    
    try {
      console.log("Executing update query:", sql);
      console.log("Parameters:", queryParams.map(p =>
        Buffer.isBuffer(p) ? `[Buffer of ${p.length} bytes]` : p
      ));
      
      const result = await db.query(sql, queryParams);
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
  console.log("Formatting user data with these fields:", Object.keys(user));
  console.log("Profile image exists in raw data:", !!user.profile_image);
  
  return {
    userId: user.user_id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImage: user.profile_image, // Raw BLOB data
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

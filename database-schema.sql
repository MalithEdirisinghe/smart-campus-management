-- Database schema for Smart Campus Management System
-- Student signup and profile related tables

-- Create database
CREATE DATABASE IF NOT EXISTS campus_management;
USE campus_management;

-- Users table (base table for all user types)
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'lecturer', 'student') NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  profile_image VARCHAR(255),
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other'),
  address TEXT,
  contact_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

-- Students table (extends users)
CREATE TABLE students (
  student_id VARCHAR(20) PRIMARY KEY,
  user_id INT NOT NULL,
  department VARCHAR(50) NOT NULL,
  batch VARCHAR(20) NOT NULL,
  enrollment_date DATE NOT NULL,
  status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Departments table
CREATE TABLE departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batches table
CREATE TABLE batches (
  batch_id VARCHAR(20) PRIMARY KEY,
  department_id INT NOT NULL,
  start_date DATE NOT NULL,
  expected_graduation_date DATE,
  description TEXT,
  FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- Courses/Modules table
CREATE TABLE courses (
  course_id VARCHAR(20) PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL,
  department_id INT NOT NULL,
  description TEXT,
  credits INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- Student_Courses (enrollment) table
CREATE TABLE student_courses (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  course_id VARCHAR(20) NOT NULL,
  enrollment_date DATE NOT NULL,
  status ENUM('enrolled', 'completed', 'dropped') DEFAULT 'enrolled',
  grade VARCHAR(5) DEFAULT NULL,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id),
  UNIQUE KEY (student_id, course_id)
);

-- Reset password tokens table
CREATE TABLE password_reset_tokens (
  token_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Verification tokens for email verification
CREATE TABLE verification_tokens (
  token_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Notification preferences table
CREATE TABLE notification_preferences (
  preference_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  app_notifications BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Admin users table (extends users)
CREATE TABLE admin_users (
  admin_id VARCHAR(20) PRIMARY KEY,
  user_id INT NOT NULL,
  department VARCHAR(50) NOT NULL,
  access_level ENUM('admin', 'super_admin') DEFAULT 'admin',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Lecturer users table (extends users)
CREATE TABLE lecturer_users (
  lecturer_id VARCHAR(20) PRIMARY KEY,
  user_id INT NOT NULL,
  department VARCHAR(50) NOT NULL,
  specialization VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Insert some initial data for departments
INSERT INTO departments (department_name, description) VALUES 
('Computing', 'Department of Computing and Information Technology'),
('Business', 'Department of Business Administration'),
('Engineering', 'Department of Engineering');

-- Insert sample batches
INSERT INTO batches (batch_id, department_id, start_date, expected_graduation_date, description) VALUES 
('COM12', 1, '2022-09-01', '2026-06-30', 'Computing batch 2022'),
('BUS10', 2, '2022-09-01', '2026-06-30', 'Business batch 2022'),
('ENG15', 3, '2022-09-01', '2026-06-30', 'Engineering batch 2022');

-- Insert default admin user
INSERT INTO users (email, password, role, first_name, last_name)
VALUES (
    'admin@imperial.edu',
    '$2a$10$XKBWKOYJLk1Oe4MN4tk3WORX7TCVfkrFdwQSzJwliZ9LVQ5FRijRa', -- hashed password for 'admin123'
    'admin',
    'System',
    'Administrator'
);

-- Get the inserted user ID
SET @admin_user_id = LAST_INSERT_ID();

-- Insert admin record
INSERT INTO admin_users (admin_id, user_id, department, access_level)
VALUES (
    'ADMIN001',
    @admin_user_id,
    'IT',
    'super_admin'
);
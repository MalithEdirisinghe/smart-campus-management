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

-- Events/Announcements table
CREATE TABLE events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATE,
  time VARCHAR(50),
  location VARCHAR(255),
  venue VARCHAR(255),
  description TEXT,
  is_announcement BOOLEAN DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Target audience for events
CREATE TABLE event_audience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  role ENUM('admin', 'lecturer', 'student') NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_role (event_id, role)
);

-- Event notifications
CREATE TABLE event_notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  role ENUM('admin', 'lecturer', 'student') NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP NULL,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_notification (event_id, role)
);

-- Resources: Classrooms table
CREATE TABLE classrooms (
  classroom_id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity INT,
  location VARCHAR(100),
  description TEXT,
  status ENUM('available', 'reserved', 'maintenance') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resources: Equipment table
CREATE TABLE equipment (
  equipment_id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('computer', 'projector', 'tablet') NOT NULL,
  model VARCHAR(100),
  description TEXT,
  status ENUM('available', 'reserved', 'maintenance') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resource reservations
CREATE TABLE resource_reservations (
  reservation_id INT AUTO_INCREMENT PRIMARY KEY,
  resource_type ENUM('classroom', 'equipment') NOT NULL,
  resource_id VARCHAR(10) NOT NULL,
  user_id INT NOT NULL,
  reserved_by VARCHAR(10) NOT NULL,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose TEXT,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Insert initial classroom data (15 classrooms)
INSERT INTO classrooms (classroom_id, name, capacity, location, description, status) VALUES
('C01', 'Classroom 01', 30, 'Building A, Floor 1', 'Standard classroom with projector', 'available'),
('C02', 'Classroom 02', 40, 'Building A, Floor 1', 'Large classroom with smart board', 'available'),
('C03', 'Classroom 03', 25, 'Building A, Floor 2', 'Standard classroom with projector', 'available'),
('C04', 'Classroom 04', 35, 'Building A, Floor 2', 'Medium classroom with computers', 'available'),
('C05', 'Classroom 05', 20, 'Building B, Floor 1', 'Small classroom for tutorials', 'available'),
('C06', 'Computer Lab 01', 30, 'Building B, Floor 1', 'Computer lab with 30 workstations', 'available'),
('C07', 'Computer Lab 02', 30, 'Building B, Floor 2', 'Computer lab with 30 workstations', 'available'),
('C08', 'Lecture Hall 01', 100, 'Building C, Floor 1', 'Large lecture hall with AV equipment', 'available'),
('C09', 'Lecture Hall 02', 80, 'Building C, Floor 1', 'Medium lecture hall with AV equipment', 'available'),
('C10', 'Conference Room', 20, 'Building D, Floor 1', 'Meeting room with presentation equipment', 'available'),
('C11', 'Studio 01', 15, 'Building D, Floor 2', 'Recording studio with sound equipment', 'available'),
('C12', 'Lab 01', 25, 'Building E, Floor 1', 'Science lab with equipment', 'available'),
('C13', 'Lab 02', 25, 'Building E, Floor 1', 'Science lab with equipment', 'available'),
('C14', 'Seminar Room 01', 30, 'Building E, Floor 2', 'Seminar room with round table setup', 'available'),
('C15', 'Classroom 15', 30, 'Building A, Floor 3', 'Standard classroom with projector', 'available');

-- Insert initial equipment data (10 computers)
INSERT INTO equipment (equipment_id, name, type, model, description, status) VALUES
('PC01', 'Computer 01', 'computer', 'Dell XPS 8940', 'Desktop computer with i7 processor', 'available'),
('PC02', 'Computer 02', 'computer', 'Dell XPS 8940', 'Desktop computer with i7 processor', 'available'),
('PC03', 'Computer 03', 'computer', 'HP EliteDesk 800', 'Desktop computer with i5 processor', 'available'),
('PC04', 'Computer 04', 'computer', 'HP EliteDesk 800', 'Desktop computer with i5 processor', 'available'),
('PC05', 'Computer 05', 'computer', 'Lenovo ThinkCentre', 'Desktop computer with i7 processor', 'available'),
('PC06', 'Computer 06', 'computer', 'Lenovo ThinkCentre', 'Desktop computer with i7 processor', 'available'),
('PC07', 'Laptop 01', 'computer', 'Dell XPS 15', 'Laptop with i7 processor', 'available'),
('PC08', 'Laptop 02', 'computer', 'Dell XPS 15', 'Laptop with i7 processor', 'available'),
('PC09', 'Laptop 03', 'computer', 'MacBook Pro 16', 'MacBook with M1 Pro chip', 'available'),
('PC10', 'Laptop 04', 'computer', 'MacBook Pro 16', 'MacBook with M1 Pro chip', 'available');

-- Insert initial equipment data (5 projectors)
INSERT INTO equipment (equipment_id, name, type, model, description, status) VALUES
('PR01', 'Projector 01', 'projector', 'Epson PowerLite', 'HD projector with 4000 lumens', 'available'),
('PR02', 'Projector 02', 'projector', 'Epson PowerLite', 'HD projector with 4000 lumens', 'available'),
('PR03', 'Projector 03', 'projector', 'BenQ TH685', '4K projector with 3500 lumens', 'available'),
('PR04', 'Projector 04', 'projector', 'BenQ TH685', '4K projector with 3500 lumens', 'available'),
('PR05', 'Projector 05', 'projector', 'Sony VPL-PHZ12', 'Laser projector with 5000 lumens', 'available');

-- Insert initial equipment data (10 tablets)
INSERT INTO equipment (equipment_id, name, type, model, description, status) VALUES
('TB01', 'Tablet 01', 'tablet', 'iPad Pro 12.9', 'iPad Pro with M1 chip, 256GB', 'available'),
('TB02', 'Tablet 02', 'tablet', 'iPad Pro 12.9', 'iPad Pro with M1 chip, 256GB', 'available'),
('TB03', 'Tablet 03', 'tablet', 'iPad Pro 11', 'iPad Pro with M1 chip, 128GB', 'available'),
('TB04', 'Tablet 04', 'tablet', 'iPad Pro 11', 'iPad Pro with M1 chip, 128GB', 'available'),
('TB05', 'Tablet 05', 'tablet', 'Samsung Galaxy Tab S8', 'Android tablet with Snapdragon processor', 'available'),
('TB06', 'Tablet 06', 'tablet', 'Samsung Galaxy Tab S8', 'Android tablet with Snapdragon processor', 'available'),
('TB07', 'Tablet 07', 'tablet', 'Microsoft Surface Pro 8', 'Windows tablet with i5 processor', 'available'),
('TB08', 'Tablet 08', 'tablet', 'Microsoft Surface Pro 8', 'Windows tablet with i5 processor', 'available'),
('TB09', 'Tablet 09', 'tablet', 'Lenovo Tab P11 Pro', 'Android tablet with OLED display', 'available'),
('TB10', 'Tablet 10', 'tablet', 'Lenovo Tab P11 Pro', 'Android tablet with OLED display', 'available');

-- Communication tables for Smart Campus Management System

-- Communication groups table
CREATE TABLE communication_groups (
  group_id INT AUTO_INCREMENT PRIMARY KEY,
  batch_no VARCHAR(20) NOT NULL,
  module VARCHAR(100) NOT NULL,
  lecturer_id VARCHAR(20) NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_batch_module (batch_no, module)
);

-- Group members table
CREATE TABLE group_members (
  member_id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('admin', 'lecturer', 'student') NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES communication_groups(group_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_group_user (group_id, user_id)
);

-- Direct messages table
CREATE TABLE direct_messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Group messages table
CREATE TABLE group_messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES communication_groups(group_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Message read status table (for group messages)
CREATE TABLE message_read_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_id INT NOT NULL,
  user_id INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (message_id) REFERENCES group_messages(message_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_message_user (message_id, user_id)
);

-- Insert some initial data
INSERT INTO communication_groups (batch_no, module, lecturer_id, created_by) VALUES
('COM12', 'Networking', 'L001', 1),
('COM07', 'Database Management', 'L002', 1),
('COM13', 'Programming', 'L003', 1);
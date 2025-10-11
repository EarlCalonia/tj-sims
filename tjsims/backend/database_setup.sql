-- TJ Sims Database Schema
-- Run this file to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS tjsims_db;
USE tjsims_db;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  description TEXT,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_product_id (product_id),
  INDEX idx_name (name),
  INDEX idx_brand (brand),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Insert sample data (matching frontend data)
INSERT INTO products (product_id, name, brand, category, price, status, description) VALUES
('PRD-001', 'Engine Oil Filter', 'Bosch', 'Engine & Cooling', 450.00, 'Active', 'High-quality engine oil filter for various vehicle models'),
('PRD-002', 'Brake Pad Set', 'Akebono', 'Brake Parts', 1200.00, 'Active', 'Front brake pad set for sedans and SUVs'),
('PRD-003', 'Shock Absorber', 'KYB', 'Suspension & Steering', 3500.00, 'Inactive', 'Rear shock absorber for pickup trucks'),
('PRD-004', 'Radiator Hose', 'Gates', 'Engine & Cooling', 680.00, 'Active', 'Upper radiator hose for diesel engines'),
('PRD-005', 'CV Joint Boot', 'Moog', 'Transmission', 320.00, 'Active', 'CV joint boot kit with clamps and grease')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  brand = VALUES(brand),
  category = VALUES(category),
  price = VALUES(price),
  status = VALUES(status),
  description = VALUES(description);

-- Create users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- Create categories table for dynamic category management
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_name (name)
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Engine & Cooling', 'Engine parts and cooling system components'),
('Transmission', 'Transmission and drivetrain parts'),
('Suspension & Steering', 'Suspension and steering system components'),
('Brake Parts', 'Braking system components'),
('Body & Exterior', 'Body panels and exterior accessories')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Create brands table for dynamic brand management
CREATE TABLE IF NOT EXISTS brands (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_name (name)
);

-- Insert default brands
INSERT INTO brands (name, description) VALUES
('Bosch', 'German automotive parts manufacturer'),
('Akebono', 'Japanese brake system specialist'),
('KYB', 'Shock absorber and suspension specialist'),
('Gates', 'Belt and hose manufacturer'),
('Moog', 'Steering and suspension parts')
ON DUPLICATE KEY UPDATE name = VALUES(name);

SELECT 'Database setup completed successfully!' as message;

-- Add vehicle compatibility column to products table
-- This allows storing compatible vehicles/models for each product

USE tjsims_db;

-- Add vehicle_compatibility column after category
ALTER TABLE products 
ADD COLUMN vehicle_compatibility TEXT DEFAULT NULL
COMMENT 'Compatible vehicles/models - comma-separated list'
AFTER category;

-- Example data format: "Toyota Hilux 2015-2020, Ford Ranger 2018-2022, Mitsubishi Strada 2019-2023"

-- Verify the changes
DESCRIBE products;

-- Optional: Add some sample data to existing products (update as needed)
-- UPDATE products 
-- SET vehicle_compatibility = 'Toyota Hilux 2015-2020, Ford Ranger 2018-2022'
-- WHERE product_id = 'PRD-001';

SELECT product_id, name, category, vehicle_compatibility 
FROM products 
LIMIT 10;

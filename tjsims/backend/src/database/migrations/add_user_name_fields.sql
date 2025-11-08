-- Add separate name fields to users table
-- This migration adds first_name, middle_name, last_name columns

USE tjsims_db;

-- Add new columns for first, middle, and last name
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(100) DEFAULT NULL AFTER username,
ADD COLUMN middle_name VARCHAR(100) DEFAULT NULL AFTER first_name,
ADD COLUMN last_name VARCHAR(100) DEFAULT NULL AFTER middle_name;

-- Optional: Attempt to parse existing username data into new fields
-- This assumes usernames are in format "Last Name, First Name Middle Name"
-- You may need to manually update some records after running this

-- Example update for parsing (run manually with caution):
-- UPDATE users 
-- SET 
--   last_name = TRIM(SUBSTRING_INDEX(username, ',', 1)),
--   first_name = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(username, ',', -1), ' ', 1)),
--   middle_name = CASE 
--     WHEN LENGTH(TRIM(SUBSTRING_INDEX(username, ',', -1))) - LENGTH(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(username, ',', -1), ' ', 1))) > 1
--     THEN TRIM(SUBSTRING(SUBSTRING_INDEX(username, ',', -1), LENGTH(SUBSTRING_INDEX(SUBSTRING_INDEX(username, ',', -1), ' ', 1)) + 1))
--     ELSE NULL
--   END
-- WHERE username LIKE '%,%';

-- Verify the changes
SELECT id, username, first_name, middle_name, last_name, email, role 
FROM users 
LIMIT 10;

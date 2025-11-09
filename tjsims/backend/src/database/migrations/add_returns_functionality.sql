-- Add new order statuses
ALTER TABLE `sales` 
MODIFY COLUMN `status` ENUM('Pending', 'Processing', 'Completed', 'Cancelled', 'Returned', 'Partially Returned') DEFAULT 'Pending';

-- Add new payment statuses
ALTER TABLE `sales` 
MODIFY COLUMN `payment_status` ENUM('Paid', 'Unpaid', 'Refunded', 'Partially Refunded') NOT NULL DEFAULT 'Unpaid';

-- Add refund tracking columns to sales table
ALTER TABLE `sales` 
ADD COLUMN `refund_amount` DECIMAL(10,2) DEFAULT 0.00 AFTER `total`,
ADD COLUMN `return_date` TIMESTAMP NULL DEFAULT NULL AFTER `created_at`,
ADD COLUMN `return_reason` TEXT NULL DEFAULT NULL AFTER `return_date`;

-- Create returns table for tracking all return transactions
CREATE TABLE IF NOT EXISTS `returns` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `return_id` VARCHAR(50) NOT NULL UNIQUE,
  `order_id` INT(11) NOT NULL,
  `sale_number` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(100) DEFAULT NULL,
  `return_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `return_reason` ENUM('Defective/Damaged', 'Wrong Item', 'Not as Described', 'Customer Changed Mind', 'Compatibility Issue', 'Other') NOT NULL,
  `refund_method` ENUM('Cash', 'GCash') NOT NULL,
  `reference_number` VARCHAR(100) DEFAULT NULL,
  `refund_amount` DECIMAL(10,2) NOT NULL,
  `restocked` BOOLEAN NOT NULL DEFAULT TRUE,
  `photo_proof` VARCHAR(255) DEFAULT NULL,
  `additional_notes` TEXT DEFAULT NULL,
  `processed_by` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `return_date` (`return_date`),
  FOREIGN KEY (`order_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create return items table for tracking individual returned items
CREATE TABLE IF NOT EXISTS `return_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `return_id` VARCHAR(50) NOT NULL,
  `sale_item_id` INT(11) NOT NULL,
  `product_id` VARCHAR(20) NOT NULL,
  `product_name` VARCHAR(100) NOT NULL,
  `sku` VARCHAR(50) DEFAULT NULL,
  `quantity` INT(11) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  KEY `return_id` (`return_id`),
  KEY `sale_item_id` (`sale_item_id`),
  KEY `product_id` (`product_id`),
  FOREIGN KEY (`return_id`) REFERENCES `returns`(`return_id`) ON DELETE CASCADE,
  FOREIGN KEY (`sale_item_id`) REFERENCES `sale_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add returned quantity tracking to sale_items
ALTER TABLE `sale_items`
ADD COLUMN `returned_quantity` INT(11) DEFAULT 0 AFTER `quantity`;

-- Create refund transactions table for financial tracking
CREATE TABLE IF NOT EXISTS `refund_transactions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` VARCHAR(50) NOT NULL UNIQUE,
  `return_id` VARCHAR(50) NOT NULL,
  `order_id` INT(11) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `refund_method` VARCHAR(50) NOT NULL,
  `transaction_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `notes` TEXT DEFAULT NULL,
  `processed_by` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  KEY `return_id` (`return_id`),
  KEY `order_id` (`order_id`),
  FOREIGN KEY (`return_id`) REFERENCES `returns`(`return_id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

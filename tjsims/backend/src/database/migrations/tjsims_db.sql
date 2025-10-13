-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 13, 2025 at 04:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tjsims_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Bosch', 'German automotive parts manufacturer', '2025-10-11 11:11:18'),
(2, 'Akebono', 'Japanese brake system specialist', '2025-10-11 11:11:18'),
(3, 'KYB', 'Shock absorber and suspension specialist', '2025-10-11 11:11:18'),
(4, 'Gates', 'Belt and hose manufacturer', '2025-10-11 11:11:18'),
(5, 'Moog', 'Steering and suspension parts', '2025-10-11 11:11:18');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'Engine & Cooling', 'Engine parts and cooling system components', '2025-10-11 11:11:18'),
(2, 'Transmission', 'Transmission and drivetrain parts', '2025-10-11 11:11:18'),
(3, 'Suspension & Steering', 'Suspension and steering system components', '2025-10-11 11:11:18'),
(4, 'Brake Parts', 'Braking system components', '2025-10-11 11:11:18'),
(5, 'Body & Exterior', 'Body panels and exterior accessories', '2025-10-11 11:11:18');

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` int(11) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `reorder_point` int(11) DEFAULT 10,
  `supplier_id` int(11) DEFAULT NULL,
  `last_restock_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `product_id`, `stock`, `reorder_point`, `supplier_id`, `last_restock_date`, `created_at`, `updated_at`) VALUES
(4, 'PRD-006', 60, 10, NULL, '2025-10-11 13:58:28', '2025-10-11 13:58:28', '2025-10-11 13:58:37'),
(5, 'PRD-001', 20, 10, NULL, '2025-10-11 14:02:07', '2025-10-11 14:02:07', '2025-10-11 14:02:07'),
(6, 'PRD-002', 50, 12, NULL, '2025-10-11 14:02:12', '2025-10-11 14:02:12', '2025-10-11 14:02:12'),
(7, 'PRD-003', 7, 10, NULL, '2025-10-11 14:02:17', '2025-10-11 14:02:17', '2025-10-11 14:02:17'),
(8, 'PRD-004', 8, 6, NULL, '2025-10-11 14:02:24', '2025-10-11 14:02:24', '2025-10-11 14:02:24'),
(9, 'PRD-005', 50, 10, NULL, '2025-10-11 14:02:30', '2025-10-11 14:02:30', '2025-10-11 14:02:30');

-- --------------------------------------------------------

--
-- Table structure for table `inventory_transactions`
--

CREATE TABLE `inventory_transactions` (
  `id` int(11) NOT NULL,
  `transaction_id` varchar(20) NOT NULL,
  `inventory_id` int(11) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `transaction_type` enum('in','out') NOT NULL,
  `quantity` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_transactions`
--

INSERT INTO `inventory_transactions` (`id`, `transaction_id`, `inventory_id`, `product_id`, `transaction_type`, `quantity`, `notes`, `transaction_date`, `created_by`, `created_at`, `updated_at`) VALUES
(2, 'TRX-1760191108980-26', 4, 'PRD-006', 'in', 20, 'Stock update through admin interface', '2025-10-11 13:58:28', NULL, '2025-10-11 13:58:28', '2025-10-11 13:58:28'),
(3, 'TRX-1760191113392-50', 4, 'PRD-006', 'in', 20, 'Stock update through admin interface', '2025-10-11 13:58:33', NULL, '2025-10-11 13:58:33', '2025-10-11 13:58:33'),
(4, 'TRX-1760191117733-91', 4, 'PRD-006', 'in', 20, 'Stock update through admin interface', '2025-10-11 13:58:37', NULL, '2025-10-11 13:58:37', '2025-10-11 13:58:37'),
(5, 'TRX-1760191327021-61', 5, 'PRD-001', 'in', 20, 'Stock update through admin interface', '2025-10-11 14:02:07', NULL, '2025-10-11 14:02:07', '2025-10-11 14:02:07'),
(6, 'TRX-1760191332680-36', 6, 'PRD-002', 'in', 50, 'Stock update through admin interface', '2025-10-11 14:02:12', NULL, '2025-10-11 14:02:12', '2025-10-11 14:02:12'),
(7, 'TRX-1760191337996-89', 7, 'PRD-003', 'in', 7, 'Stock update through admin interface', '2025-10-11 14:02:17', NULL, '2025-10-11 14:02:17', '2025-10-11 14:02:17'),
(8, 'TRX-1760191344980-90', 8, 'PRD-004', 'in', 8, 'Stock update through admin interface', '2025-10-11 14:02:24', NULL, '2025-10-11 14:02:24', '2025-10-11 14:02:24'),
(9, 'TRX-1760191350347-19', 9, 'PRD-005', 'in', 50, 'Stock update through admin interface', '2025-10-11 14:02:30', NULL, '2025-10-11 14:02:30', '2025-10-11 14:02:30'),
(10, 'TRX-1760365637255-52', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:27:17', NULL, '2025-10-13 14:27:17', '2025-10-13 14:27:17'),
(11, 'TRX-1760365639003-78', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:27:19', NULL, '2025-10-13 14:27:19', '2025-10-13 14:27:19'),
(12, 'TRX-1760365640674-46', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:27:20', NULL, '2025-10-13 14:27:20', '2025-10-13 14:27:20');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_id`, `name`, `brand`, `category`, `price`, `status`, `description`, `image`, `created_at`, `updated_at`) VALUES
(1, 'PRD-001', 'Engine Oil Filter', 'Akebono', 'Engine & Cooling', 4500.00, 'Active', 'High-quality engine oil filter for various vehicle models', NULL, '2025-10-11 11:11:17', '2025-10-11 12:02:19'),
(2, 'PRD-002', 'Brake Pad Set', 'Akebono', 'Brake Parts', 1200.00, 'Active', 'Front brake pad set for sedans and SUVs', NULL, '2025-10-11 11:11:17', '2025-10-11 11:11:17'),
(3, 'PRD-003', 'Shock Absorber', 'KYB', 'Suspension & Steering', 3500.00, 'Active', 'Rear shock absorber for pickup trucks', NULL, '2025-10-11 11:11:17', '2025-10-11 13:22:36'),
(4, 'PRD-004', 'Radiator Hose', 'Gates', 'Engine & Cooling', 680.00, 'Active', 'Upper radiator hose for diesel engines', '/uploads/image-1760189191563-350730914.jpg', '2025-10-11 11:11:17', '2025-10-11 13:26:31'),
(5, 'PRD-005', 'CV Joint Boot', 'Moog', 'Transmission', 320.00, 'Active', 'CV joint boot kit with clamps and grease', '/uploads/image-1760189149859-123979443.jpg', '2025-10-11 11:11:17', '2025-10-11 13:25:49'),
(6, 'PRD-006', 'GHAHAHAHA', 'Akebono', 'Brake Parts', 1600.00, 'Active', 'hahaha', '/uploads/image-1760188766987-48191294.png', '2025-10-11 12:10:49', '2025-10-13 13:47:41');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `sale_number` varchar(50) NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `contact` varchar(50) DEFAULT NULL,
  `payment` varchar(50) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL,
  `product_id` varchar(20) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `supplier_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','manager','staff') DEFAULT 'staff',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_transaction_id` (`transaction_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_id` (`product_id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_brand` (`brand`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sale_number` (`sale_number`),
  ADD KEY `idx_sale_number` (`sale_number`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sale_items_sale_id` (`sale_id`),
  ADD KEY `idx_sale_items_product_id` (`product_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_supplier_id` (`supplier_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_transactions_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

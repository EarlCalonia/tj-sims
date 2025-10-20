-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 20, 2025 at 06:38 PM
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
(5, 'Moog', 'Steering and suspension parts', '2025-10-11 11:11:18'),
(6, 'Honda', 'Automotive manufacturer', '2025-10-20 16:11:25'),
(7, 'Hyundai', 'Automotive manufacturer', '2025-10-20 16:11:25'),
(8, 'Isuzu', 'Automotive manufacturer', '2025-10-20 16:11:25'),
(9, 'Kia', 'Automotive manufacturer', '2025-10-20 16:11:25'),
(10, 'Mitsubishi', 'Automotive manufacturer', '2025-10-20 16:11:25'),
(11, 'Daewoo', 'Automotive manufacturer', '2025-10-20 16:11:25');

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
(4, 'PRD-006', 51, 10, NULL, '2025-10-11 13:58:28', '2025-10-11 13:58:28', '2025-10-14 20:32:53'),
(5, 'PRD-001', 16, 10, NULL, '2025-10-11 14:02:07', '2025-10-11 14:02:07', '2025-10-14 19:50:07'),
(6, 'PRD-002', 48, 12, NULL, '2025-10-11 14:02:12', '2025-10-11 14:02:12', '2025-10-14 19:24:58'),
(7, 'PRD-003', 3, 10, NULL, '2025-10-11 14:02:17', '2025-10-11 14:02:17', '2025-10-14 19:24:58'),
(8, 'PRD-004', 7, 6, NULL, '2025-10-11 14:02:24', '2025-10-11 14:02:24', '2025-10-13 14:33:23'),
(9, 'PRD-005', 50, 10, NULL, '2025-10-11 14:02:30', '2025-10-11 14:02:30', '2025-10-11 14:02:30'),
(10, 'P007', 12, 10, NULL, '2025-10-14 19:49:40', '2025-10-14 19:49:40', '2025-10-14 19:50:07'),
(11, 'P008', 1, 3, NULL, '2025-10-14 20:22:59', '2025-10-14 20:22:59', '2025-10-20 16:11:48');

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
(12, 'TRX-1760365640674-46', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:27:20', NULL, '2025-10-13 14:27:20', '2025-10-13 14:27:20'),
(13, 'TXN1760365968777', 4, 'PRD-006', 'out', 3, 'Sale deduction', '2025-10-13 14:32:48', 'System', '2025-10-13 14:32:48', '2025-10-13 14:32:48'),
(14, 'TRX-1760365971070-56', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:32:51', NULL, '2025-10-13 14:32:51', '2025-10-13 14:32:51'),
(15, 'TRX-1760365988969-73', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:33:08', NULL, '2025-10-13 14:33:08', '2025-10-13 14:33:08'),
(16, 'TRX-1760365989272-72', 5, 'PRD-001', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:33:09', NULL, '2025-10-13 14:33:09', '2025-10-13 14:33:09'),
(17, 'TRX-1760365990152-53', 6, 'PRD-002', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:33:10', NULL, '2025-10-13 14:33:10', '2025-10-13 14:33:10'),
(18, 'TRX-1760365991289-22', 7, 'PRD-003', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:33:11', NULL, '2025-10-13 14:33:11', '2025-10-13 14:33:11'),
(19, 'TRX-1760365991777-31', 8, 'PRD-004', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:33:11', NULL, '2025-10-13 14:33:11', '2025-10-13 14:33:11'),
(20, 'TXN1760366003469', 4, 'PRD-006', 'out', 1, 'Sale deduction', '2025-10-13 14:33:23', 'System', '2025-10-13 14:33:23', '2025-10-13 14:33:23'),
(21, 'TXN1760366003470', 5, 'PRD-001', 'out', 1, 'Sale deduction', '2025-10-13 14:33:23', 'System', '2025-10-13 14:33:23', '2025-10-13 14:33:23'),
(22, 'TXN1760366003471', 6, 'PRD-002', 'out', 1, 'Sale deduction', '2025-10-13 14:33:23', 'System', '2025-10-13 14:33:23', '2025-10-13 14:33:23'),
(23, 'TXN1760366003472', 7, 'PRD-003', 'out', 1, 'Sale deduction', '2025-10-13 14:33:23', 'System', '2025-10-13 14:33:23', '2025-10-13 14:33:23'),
(24, 'TXN1760366003474', 8, 'PRD-004', 'out', 1, 'Sale deduction', '2025-10-13 14:33:23', 'System', '2025-10-13 14:33:23', '2025-10-13 14:33:23'),
(25, 'TRX-1760366005406-33', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:33:25', NULL, '2025-10-13 14:33:25', '2025-10-13 14:33:25'),
(26, 'TRX-1760366005504-39', 5, 'PRD-001', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:33:25', NULL, '2025-10-13 14:33:25', '2025-10-13 14:33:25'),
(27, 'TRX-1760366005561-32', 6, 'PRD-002', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:33:25', NULL, '2025-10-13 14:33:25', '2025-10-13 14:33:25'),
(28, 'TRX-1760366005616-13', 7, 'PRD-003', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:33:25', NULL, '2025-10-13 14:33:25', '2025-10-13 14:33:25'),
(29, 'TRX-1760366005668-18', 8, 'PRD-004', 'out', 0, 'Stock update through admin interface', '2025-10-13 14:33:25', NULL, '2025-10-13 14:33:25', '2025-10-13 14:33:25'),
(30, 'TRX-1760463945175-78', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 17:45:45', NULL, '2025-10-14 17:45:45', '2025-10-14 17:45:45'),
(31, 'TRX-1760463946843-30', 5, 'PRD-001', 'out', 0, 'Stock update through admin interface', '2025-10-14 17:45:46', NULL, '2025-10-14 17:45:46', '2025-10-14 17:45:46'),
(32, 'TXN1760463967164', 4, 'PRD-006', 'out', 1, 'Sale deduction', '2025-10-14 17:46:07', 'System', '2025-10-14 17:46:07', '2025-10-14 17:46:07'),
(33, 'TXN1760463967166', 5, 'PRD-001', 'out', 1, 'Sale deduction', '2025-10-14 17:46:07', 'System', '2025-10-14 17:46:07', '2025-10-14 17:46:07'),
(34, 'TRX-1760463968613-21', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 17:46:08', NULL, '2025-10-14 17:46:08', '2025-10-14 17:46:08'),
(35, 'TRX-1760463968864-12', 5, 'PRD-001', 'out', 0, 'Stock update through admin interface', '2025-10-14 17:46:08', NULL, '2025-10-14 17:46:08', '2025-10-14 17:46:08'),
(36, 'TRX-1760469872806-88', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:24:32', NULL, '2025-10-14 19:24:32', '2025-10-14 19:24:32'),
(37, 'TRX-1760469873682-13', 5, 'PRD-001', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:24:33', NULL, '2025-10-14 19:24:33', '2025-10-14 19:24:33'),
(38, 'TRX-1760469874218-78', 6, 'PRD-002', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:24:34', NULL, '2025-10-14 19:24:34', '2025-10-14 19:24:34'),
(39, 'TRX-1760469874833-22', 7, 'PRD-003', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:24:34', NULL, '2025-10-14 19:24:34', '2025-10-14 19:24:34'),
(40, 'TRX-1760469877360-43', 7, 'PRD-003', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:24:37', NULL, '2025-10-14 19:24:37', '2025-10-14 19:24:37'),
(41, 'TRX-1760469877528-73', 7, 'PRD-003', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:24:37', NULL, '2025-10-14 19:24:37', '2025-10-14 19:24:37'),
(42, 'TXN1760469898982', 4, 'PRD-006', 'out', 1, 'Sale deduction', '2025-10-14 19:24:58', 'System', '2025-10-14 19:24:58', '2025-10-14 19:24:58'),
(43, 'TXN1760469898984', 5, 'PRD-001', 'out', 1, 'Sale deduction', '2025-10-14 19:24:58', 'System', '2025-10-14 19:24:58', '2025-10-14 19:24:58'),
(44, 'TXN1760469898985', 6, 'PRD-002', 'out', 1, 'Sale deduction', '2025-10-14 19:24:58', 'System', '2025-10-14 19:24:58', '2025-10-14 19:24:58'),
(45, 'TXN1760469898986', 7, 'PRD-003', 'out', 3, 'Sale deduction', '2025-10-14 19:24:58', 'System', '2025-10-14 19:24:58', '2025-10-14 19:24:58'),
(46, 'TRX-1760469900939-68', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:25:00', NULL, '2025-10-14 19:25:00', '2025-10-14 19:25:00'),
(47, 'TRX-1760469900984-34', 5, 'PRD-001', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:25:00', NULL, '2025-10-14 19:25:00', '2025-10-14 19:25:00'),
(48, 'TRX-1760469901033-39', 6, 'PRD-002', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:25:01', NULL, '2025-10-14 19:25:01', '2025-10-14 19:25:01'),
(49, 'TRX-1760469901066-31', 7, 'PRD-003', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:25:01', NULL, '2025-10-14 19:25:01', '2025-10-14 19:25:01'),
(50, 'TRX-1760471226186-39', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:47:06', NULL, '2025-10-14 19:47:06', '2025-10-14 19:47:06'),
(51, 'TRX-1760471226316-13', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:47:06', NULL, '2025-10-14 19:47:06', '2025-10-14 19:47:06'),
(52, 'TXN1760471241220', 4, 'PRD-006', 'out', 1, 'Sale deduction', '2025-10-14 19:47:21', 'System', '2025-10-14 19:47:21', '2025-10-14 19:47:21'),
(53, 'TRX-1760471242032-66', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:47:22', NULL, '2025-10-14 19:47:22', '2025-10-14 19:47:22'),
(54, 'TRX-1760471380113-46', 10, 'P007', 'in', 15, 'Stock update through admin interface', '2025-10-14 19:49:40', NULL, '2025-10-14 19:49:40', '2025-10-14 19:49:40'),
(55, 'TRX-1760471386703-73', 10, 'P007', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:49:46', NULL, '2025-10-14 19:49:46', '2025-10-14 19:49:46'),
(56, 'TRX-1760471387240-25', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:49:47', NULL, '2025-10-14 19:49:47', '2025-10-14 19:49:47'),
(57, 'TRX-1760471388127-26', 5, 'PRD-001', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:49:48', NULL, '2025-10-14 19:49:48', '2025-10-14 19:49:48'),
(58, 'TXN1760471407001', 10, 'P007', 'out', 3, 'Sale deduction', '2025-10-14 19:50:07', 'System', '2025-10-14 19:50:07', '2025-10-14 19:50:07'),
(59, 'TXN1760471407066', 4, 'PRD-006', 'out', 1, 'Sale deduction', '2025-10-14 19:50:07', 'System', '2025-10-14 19:50:07', '2025-10-14 19:50:07'),
(60, 'TXN1760471407068', 5, 'PRD-001', 'out', 1, 'Sale deduction', '2025-10-14 19:50:07', 'System', '2025-10-14 19:50:07', '2025-10-14 19:50:07'),
(61, 'TRX-1760471408390-33', 10, 'P007', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:50:08', NULL, '2025-10-14 19:50:08', '2025-10-14 19:50:08'),
(62, 'TRX-1760471408643-18', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:50:08', NULL, '2025-10-14 19:50:08', '2025-10-14 19:50:08'),
(63, 'TRX-1760471408717-19', 5, 'PRD-001', 'out', 0, 'Stock update through admin interface', '2025-10-14 19:50:08', NULL, '2025-10-14 19:50:08', '2025-10-14 19:50:08'),
(64, 'TRX-1760473379838-69', 11, 'P008', 'in', 5, 'Stock update through admin interface', '2025-10-14 20:22:59', NULL, '2025-10-14 20:22:59', '2025-10-14 20:22:59'),
(65, 'TRX-1760473387651-83', 11, 'P008', 'out', 0, 'Stock update through admin interface', '2025-10-14 20:23:07', NULL, '2025-10-14 20:23:07', '2025-10-14 20:23:07'),
(66, 'TXN1760473403347', 11, 'P008', 'out', 1, 'Sale deduction', '2025-10-14 20:23:23', 'System', '2025-10-14 20:23:23', '2025-10-14 20:23:23'),
(67, 'TRX-1760473405304-81', 11, 'P008', 'out', 0, 'Stock update through admin interface', '2025-10-14 20:23:25', NULL, '2025-10-14 20:23:25', '2025-10-14 20:23:25'),
(68, 'TRX-1760473961187-83', 11, 'P008', 'out', 0, 'Stock update through admin interface', '2025-10-14 20:32:41', NULL, '2025-10-14 20:32:41', '2025-10-14 20:32:41'),
(69, 'TRX-1760473962011-21', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 20:32:42', NULL, '2025-10-14 20:32:42', '2025-10-14 20:32:42'),
(70, 'TRX-1760473962164-14', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 20:32:42', NULL, '2025-10-14 20:32:42', '2025-10-14 20:32:42'),
(71, 'TXN1760473973533', 11, 'P008', 'out', 1, 'Sale deduction', '2025-10-14 20:32:53', 'System', '2025-10-14 20:32:53', '2025-10-14 20:32:53'),
(72, 'TXN1760473973551', 4, 'PRD-006', 'out', 1, 'Sale deduction', '2025-10-14 20:32:53', 'System', '2025-10-14 20:32:53', '2025-10-14 20:32:53'),
(73, 'TRX-1760473974505-17', 11, 'P008', 'out', 0, 'Stock update through admin interface', '2025-10-14 20:32:54', NULL, '2025-10-14 20:32:54', '2025-10-14 20:32:54'),
(74, 'TRX-1760473974611-53', 4, 'PRD-006', 'out', 0, 'Stock update through admin interface', '2025-10-14 20:32:54', NULL, '2025-10-14 20:32:54', '2025-10-14 20:32:54'),
(75, 'TRX-1760930016003-15', 11, 'P008', 'out', 0, 'Stock update through admin interface', '2025-10-20 03:13:36', NULL, '2025-10-20 03:13:36', '2025-10-20 03:13:36'),
(76, 'TRX-1760930019902-14', 11, 'P008', 'out', 0, 'Stock update through admin interface', '2025-10-20 03:13:39', NULL, '2025-10-20 03:13:39', '2025-10-20 03:13:39'),
(77, 'TRX-1760976698198-53', 11, 'P008', 'out', 0, 'Stock update through admin interface', '2025-10-20 16:11:38', NULL, '2025-10-20 16:11:38', '2025-10-20 16:11:38'),
(78, 'TXN1760976708332', 11, 'P008', 'out', 2, 'Sale deduction', '2025-10-20 16:11:48', 'System', '2025-10-20 16:11:48', '2025-10-20 16:11:48'),
(79, 'TRX-1760976709605-71', 11, 'P008', 'out', 0, 'Stock update through admin interface', '2025-10-20 16:11:49', NULL, '2025-10-20 16:11:49', '2025-10-20 16:11:49');

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
(6, 'PRD-006', 'GHAHAHAHA', 'Akebono', 'Brake Parts', 1600.00, 'Active', 'hahaha', '/uploads/image-1760188766987-48191294.png', '2025-10-11 12:10:49', '2025-10-13 13:47:41'),
(7, 'P007', 'GAGO', 'Akebono', 'Brake Parts', 5000.00, 'Inactive', 'GAGOGAGAOGAOGAO', '/uploads/image-1760471370435-377723803.jpg', '2025-10-14 19:49:30', '2025-10-14 20:20:25'),
(8, 'P008', 'Turbocharger', 'Akebono', 'Transmission', 50000.00, 'Active', 'this turbo is shit\r\n', '/uploads/image-1760473363109-453700899.jpg', '2025-10-14 20:22:43', '2025-10-14 20:22:43');

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
  `payment_status` enum('Paid','Unpaid') NOT NULL DEFAULT 'Unpaid',
  `total` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('Pending','Processing','Completed','Cancelled') DEFAULT 'Pending',
  `address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `sale_number`, `customer_name`, `contact`, `payment`, `payment_status`, `total`, `created_at`, `status`, `address`) VALUES
(1, 'SL251013001', 'doggy', '09090909009', 'GCash', 'Paid', 4800.00, '2025-10-13 14:32:48', 'Completed', NULL),
(2, 'SL251013002', 'gagsti', '121313113213223', 'Cash', 'Paid', 11480.00, '2025-10-13 14:33:23', 'Cancelled', NULL),
(3, 'SL251015001', 'clarence', '09174205498', 'Cash', 'Paid', 6100.00, '2025-10-14 17:46:06', 'Completed', NULL),
(4, 'SL251015002', 'testing_oct15', '09090909090', 'Cash', 'Paid', 17800.00, '2025-10-14 19:24:58', 'Completed', NULL),
(5, 'SL251015003', 'asd', 'asd', 'GCash', 'Paid', 1600.00, '2025-10-14 19:47:21', 'Completed', NULL),
(6, 'SL251015004', 'Renz', '09521784542', 'Cash', 'Paid', 21100.00, '2025-10-14 19:50:06', 'Completed', NULL),
(7, 'SL251015005', 'Renztesting', '1231231321', 'Cash', 'Paid', 50000.00, '2025-10-14 20:23:22', 'Completed', NULL),
(8, 'SL251015006', 'renz_test2', '12221231321', 'Cash', 'Paid', 51600.00, '2025-10-14 20:32:53', 'Completed', NULL),
(9, 'SL251021001', 'asd', 'asd', 'Cash', 'Paid', 100000.00, '2025-10-20 16:11:48', 'Processing', 'asdas, Pampanga');

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

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `product_name`, `brand`, `price`, `quantity`, `subtotal`) VALUES
(1, 1, 'PRD-006', 'GHAHAHAHA', 'Akebono', 1600.00, 3, 4800.00),
(2, 2, 'PRD-006', 'GHAHAHAHA', 'Akebono', 1600.00, 1, 1600.00),
(3, 2, 'PRD-001', 'Engine Oil Filter', 'Akebono', 4500.00, 1, 4500.00),
(4, 2, 'PRD-002', 'Brake Pad Set', 'Akebono', 1200.00, 1, 1200.00),
(5, 2, 'PRD-003', 'Shock Absorber', 'KYB', 3500.00, 1, 3500.00),
(6, 2, 'PRD-004', 'Radiator Hose', 'Gates', 680.00, 1, 680.00),
(7, 3, 'PRD-006', 'GHAHAHAHA', 'Akebono', 1600.00, 1, 1600.00),
(8, 3, 'PRD-001', 'Engine Oil Filter', 'Akebono', 4500.00, 1, 4500.00),
(9, 4, 'PRD-006', 'GHAHAHAHA', 'Akebono', 1600.00, 1, 1600.00),
(10, 4, 'PRD-001', 'Engine Oil Filter', 'Akebono', 4500.00, 1, 4500.00),
(11, 4, 'PRD-002', 'Brake Pad Set', 'Akebono', 1200.00, 1, 1200.00),
(12, 4, 'PRD-003', 'Shock Absorber', 'KYB', 3500.00, 3, 10500.00),
(13, 5, 'PRD-006', 'GHAHAHAHA', 'Akebono', 1600.00, 1, 1600.00),
(14, 6, 'P007', 'GAGO', 'Akebono', 5000.00, 3, 15000.00),
(15, 6, 'PRD-006', 'GHAHAHAHA', 'Akebono', 1600.00, 1, 1600.00),
(16, 6, 'PRD-001', 'Engine Oil Filter', 'Akebono', 4500.00, 1, 4500.00),
(17, 7, 'P008', 'Turbocharger', 'Akebono', 50000.00, 1, 50000.00),
(18, 8, 'P008', 'Turbocharger', 'Akebono', 50000.00, 1, 50000.00),
(19, 8, 'PRD-006', 'GHAHAHAHA', 'Akebono', 1600.00, 1, 1600.00),
(20, 9, 'P008', 'Turbocharger', 'Akebono', 50000.00, 2, 100000.00);

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
  ADD KEY `idx_sale_number` (`sale_number`),
  ADD KEY `idx_sales_status` (`status`),
  ADD KEY `idx_sales_created_at` (`created_at`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

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

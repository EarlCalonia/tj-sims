import express from 'express';
import { DashboardController } from '../../controllers/DashboardController.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', DashboardController.getDashboardStats);

// Get recent sales transactions
router.get('/recent-sales', DashboardController.getRecentSales);

// Get low stock items
router.get('/low-stock', DashboardController.getLowStockItems);

// Get daily sales data
router.get('/daily-sales', DashboardController.getDailySales);

export default router;

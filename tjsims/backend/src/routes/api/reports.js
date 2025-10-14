import express from 'express';
import { ReportsController } from '../../controllers/ReportsController.js';

const router = express.Router();

// Get sales report data with pagination and filtering
router.get('/sales', ReportsController.getSalesReport);

// Get inventory report data with pagination and filtering
router.get('/inventory', ReportsController.getInventoryReport);

// Export sales report as CSV
router.get('/sales/export/csv', ReportsController.exportSalesReportCSV);

// Export inventory report as CSV
router.get('/inventory/export/csv', ReportsController.exportInventoryReportCSV);

export default router;

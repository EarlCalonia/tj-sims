import express from 'express';
import { InventoryController } from '../../controllers/InventoryController.js';

const router = express.Router();

// GET /api/inventory/stats - Get inventory statistics
router.get('/stats', InventoryController.getInventoryStats);

// GET /api/inventory/products - Get products with inventory information
router.get('/products', InventoryController.getProductsWithInventory);

// PUT /api/inventory/:id/stock - Update product stock
router.put('/:id/stock', InventoryController.updateStock);

export default router;
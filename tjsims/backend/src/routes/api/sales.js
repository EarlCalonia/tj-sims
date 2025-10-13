import express from 'express';
import { SalesController } from '../../controllers/SalesController.js';

const router = express.Router();

// Create a new sale
router.post('/', SalesController.createSale);

// Get all sales with optional filters and pagination
router.get('/', SalesController.getAllSales);

// Get sales statistics
router.get('/stats', SalesController.getSalesStats);

// Get a specific sale with its items
router.get('/:id', SalesController.getSaleById);

// Get items for a specific sale
router.get('/:sale_id/items', SalesController.getSaleItems);

// Update a sale
router.put('/:id', SalesController.updateSale);

// Delete a sale (restores inventory)
router.delete('/:id', SalesController.deleteSale);

export default router;

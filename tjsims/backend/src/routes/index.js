import express from 'express';
import productRoutes from './api/products.js';
import inventoryRoutes from './api/inventory.js';
import salesRoutes from './api/sales.js';

const router = express.Router();

// API routes
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;

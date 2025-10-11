import express from 'express';
import productRoutes from './api/products.js';
import inventoryRoutes from './api/inventory.js';

const router = express.Router();

// API routes
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;

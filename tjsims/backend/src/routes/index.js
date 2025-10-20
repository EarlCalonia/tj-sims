import express from 'express';
import productRoutes from './api/products.js';
import inventoryRoutes from './api/inventory.js';
import salesRoutes from './api/sales.js';
import reportsRoutes from './api/reports.js';
import dashboardRoutes from './api/dashboard.js';
import authRoutes from './api/auth.js';
import usersRoutes from './api/users.js';
import settingsRoutes from './api/settings.js';

const router = express.Router();

// API routes
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/reports', reportsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/settings', settingsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;

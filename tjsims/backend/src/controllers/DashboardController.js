import { Sales } from '../models/Sales.js';
import { Product } from '../models/Product.js';
import { getPool } from '../config/database.js';

export class DashboardController {
  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const pool = getPool();

      // Today's sales (exclude cancelled)
      const [todaySales] = await pool.execute(
        `SELECT COALESCE(SUM(total), 0) as total FROM sales WHERE DATE(created_at) = CURDATE() AND (status IS NULL OR status <> 'Cancelled')`
      );

      // This week's sales (exclude cancelled)
      const [weekSales] = await pool.execute(
        `SELECT COALESCE(SUM(total), 0) as total FROM sales WHERE YEARWEEK(created_at) = YEARWEEK(NOW()) AND (status IS NULL OR status <> 'Cancelled')`
      );

      // Low stock items count - join products and inventory tables
      const [lowStock] = await pool.execute(
        `SELECT COUNT(*) as count
         FROM products p
         JOIN inventory i ON p.product_id = i.product_id
         WHERE i.stock <= i.reorder_point AND i.stock > 0`
      );

      // Pending orders count (exclude completed/cancelled)
      const [pendingOrders] = await pool.execute(
        `SELECT COUNT(*) as count FROM sales WHERE (status IS NULL OR status NOT IN ('Completed', 'Cancelled'))`
      );

      res.json({
        success: true,
        data: {
          todaySales: todaySales[0].total,
          weekSales: weekSales[0].total,
          lowStockItems: lowStock[0].count,
          pendingOrders: pendingOrders[0].count
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  // Get recent sales transactions
  static async getRecentSales(req, res) {
    try {
      const pool = getPool();

      const [sales] = await pool.execute(
        `SELECT s.id, s.sale_number, s.customer_name, s.created_at as date,
                s.total, s.payment,
                GROUP_CONCAT(CONCAT(si.product_name, ' (', si.quantity, ')') SEPARATOR ', ') as products
         FROM sales s
         LEFT JOIN sale_items si ON s.id = si.sale_id
         WHERE (s.status IS NULL OR s.status <> 'Cancelled')
         GROUP BY s.id
         ORDER BY s.created_at DESC
         LIMIT 5`
      );

      res.json({
        success: true,
        data: sales
      });
    } catch (error) {
      console.error('Error fetching recent sales:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent sales'
      });
    }
  }

  // Get low stock items
  static async getLowStockItems(req, res) {
    try {
      const pool = getPool();

      const [items] = await pool.execute(
        `SELECT p.product_id, p.name, i.stock as remaining, i.reorder_point as threshold
         FROM products p
         JOIN inventory i ON p.product_id = i.product_id
         WHERE i.stock <= i.reorder_point AND i.stock > 0
         ORDER BY i.stock ASC
         LIMIT 5`
      );

      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch low stock items'
      });
    }
  }

  // Get daily sales for the last 7 days
  static async getDailySales(req, res) {
    try {
      const pool = getPool();

      const { period = 'week' } = req.query;

      let query = '';
      if (period === 'year') {
        // Aggregate by month for the last 12 months
        query = `
          SELECT DATE(DATE_FORMAT(created_at, '%Y-%m-01')) as date,
                 COALESCE(SUM(total), 0) as total,
                 COUNT(*) as orders
          FROM sales
          WHERE created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH)
            AND (status IS NULL OR status <> 'Cancelled')
          GROUP BY YEAR(created_at), MONTH(created_at)
          ORDER BY date ASC
        `;
      } else if (period === 'month') {
        // Aggregate by day for last 30 days
        query = `
          SELECT DATE(created_at) as date,
                 COALESCE(SUM(total), 0) as total,
                 COUNT(*) as orders
          FROM sales
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            AND (status IS NULL OR status <> 'Cancelled')
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;
      } else {
        // Default week: last 7 days by day
        query = `
          SELECT DATE(created_at) as date,
                 COALESCE(SUM(total), 0) as total,
                 COUNT(*) as orders
          FROM sales
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            AND (status IS NULL OR status <> 'Cancelled')
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;
      }

      const [dailySales] = await pool.execute(query);

      res.json({
        success: true,
        data: dailySales
      });
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch daily sales'
      });
    }
  }
}

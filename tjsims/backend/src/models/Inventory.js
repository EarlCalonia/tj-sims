import { getPool } from '../config/database.js';

export class Inventory {
  static async findByProductId(productId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT i.*, s.name as supplier_name 
       FROM inventory i 
       LEFT JOIN suppliers s ON i.supplier_id = s.id 
       WHERE i.product_id = ?`,
      [productId]
    );
    return rows[0];
  }

  static async updateStock(productId, quantity, reorderPoint = null) {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // First verify that the product exists
      const [productExists] = await connection.execute(
        'SELECT product_id FROM products WHERE product_id = ?',
        [productId]
      );

      if (!productExists[0]) {
        throw new Error(`Product ${productId} not found`);
      }

      // Get current inventory
      const [inventory] = await connection.execute(
        'SELECT * FROM inventory WHERE product_id = ?',
        [productId]
      );

      let inventoryId;
      
      if (!inventory[0]) {
        // Create new inventory record if it doesn't exist
        const [result] = await connection.execute(
          `INSERT INTO inventory (product_id, stock, reorder_point)
           VALUES (?, ?, ?)`,
          [productId, Math.max(0, quantity), reorderPoint || 10]
        );
        inventoryId = result.insertId;
      } else {
        // Update existing inventory
        const newStock = Math.max(0, inventory[0].stock + quantity); // Ensure stock never goes below 0
        await connection.execute(
          `UPDATE inventory 
           SET stock = ?, 
               reorder_point = COALESCE(?, reorder_point)
           WHERE product_id = ?`,
          [newStock, reorderPoint, productId]
        );
        inventoryId = inventory[0].id;
      }

      // Generate transaction ID
      const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Record the transaction
      await connection.execute(
        `INSERT INTO inventory_transactions (
           transaction_id,
           inventory_id,
           product_id,
           transaction_type,
           quantity,
           notes
         ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          inventoryId,
          productId,
          quantity > 0 ? 'in' : 'out',
          Math.abs(quantity),
          'Stock update through admin interface'
        ]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getStats() {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT i.product_id) as totalProducts,
        SUM(CASE WHEN i.stock > i.reorder_point THEN 1 ELSE 0 END) as inStock,
        SUM(CASE 
          WHEN i.stock <= i.reorder_point AND i.stock > 0 THEN 1 
          ELSE 0 
        END) as lowStock,
        SUM(CASE WHEN i.stock = 0 THEN 1 ELSE 0 END) as outOfStock
      FROM inventory i
    `);
    return rows[0];
  }

  static async getProductsWithInventory(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT 
        p.*,
        i.stock,
        i.reorder_point,
        s.name as supplier_name
      FROM products p
      LEFT JOIN inventory i ON p.product_id = i.product_id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE 1=1
      AND p.status = 'Active'
    `;
    
    const params = [];

    if (filters.search) {
      query += ' AND (p.name LIKE ? OR p.product_id LIKE ? OR p.brand LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.category) {
      query += ' AND p.category = ?';
      params.push(filters.category);
    }

    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'In Stock':
          query += ' AND i.stock > i.reorder_point';
          break;
        case 'Low on Stock':
          query += ' AND i.stock <= i.reorder_point AND i.stock > 0';
          break;
        case 'Out of Stock':
          query += ' AND i.stock = 0';
          break;
      }
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}
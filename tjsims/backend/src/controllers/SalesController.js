import { Sales } from '../models/Sales.js';
import { SaleItem } from '../models/SaleItem.js';
import { Product } from '../models/Product.js';

export class SalesController {
  // Create a new sale
  static async createSale(req, res) {
    try {
      const { customer_name, contact, payment, items } = req.body;

      // Validate required fields
      if (!customer_name || !payment || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Customer name, payment method, and items are required'
        });
      }

      // Validate and enrich items with product data
      let total = 0;
      const enrichedItems = [];

      for (const item of items) {
        const { product_id, quantity } = item;

        if (!product_id || !quantity || quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid product_id or quantity for item`
          });
        }

        // Get product details
        const product = await Product.findById(product_id);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${product_id}`
          });
        }

        const subtotal = product.price * quantity;
        total += subtotal;

        enrichedItems.push({
          product_id: product.product_id,
          product_name: product.name,
          brand: product.brand,
          price: product.price,
          quantity: quantity
        });
      }

      // Create the sale
      const saleData = {
        customer_name,
        contact,
        payment,
        total,
        items: enrichedItems
      };

      const { saleId, saleNumber } = await Sales.create(saleData);

      res.status(201).json({
        success: true,
        message: 'Sale created successfully',
        data: {
          id: saleId,
          sale_number: saleNumber,
          total: total
        }
      });
    } catch (error) {
      console.error('Error creating sale:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create sale'
      });
    }
  }

  // Get all sales with optional filters
  static async getAllSales(req, res) {
    try {
      const { search, date_from, date_to, page = 1, limit = 10 } = req.query;

      const filters = { search, date_from, date_to };
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const totalResult = await Sales.findAll(filters);
      const total = totalResult.length;
      const totalPages = Math.ceil(total / limit);

      // Get paginated results
      let query = 'SELECT * FROM sales WHERE 1=1';
      let params = [];

      if (search) {
        query += ' AND (sale_number LIKE ? OR customer_name LIKE ? OR contact LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (date_from) {
        query += ' AND DATE(created_at) >= ?';
        params.push(date_from);
      }

      if (date_to) {
        query += ' AND DATE(created_at) <= ?';
        params.push(date_to);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const { getPool } = await import('../config/database.js');
      const pool = getPool();
      const [sales] = await pool.execute(query, params);

      res.json({
        success: true,
        data: {
          sales,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total,
            total_pages: totalPages,
            from: offset + 1,
            to: Math.min(offset + parseInt(limit), total)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching sales:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales'
      });
    }
  }

  // Get a specific sale with its items
  static async getSaleById(req, res) {
    try {
      const { id } = req.params;

      const sale = await Sales.findById(id);
      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }

      const saleItems = await Sales.getSaleItems(id);

      res.json({
        success: true,
        data: {
          ...sale,
          items: saleItems
        }
      });
    } catch (error) {
      console.error('Error fetching sale:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sale'
      });
    }
  }

  // Update a sale
  static async updateSale(req, res) {
    try {
      const { id } = req.params;
      const { customer_name, contact, payment, total, status } = req.body;

      // First, check if the sale exists and get current status
      const currentSale = await Sales.findById(id);
      if (!currentSale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }

      // Check if the order is in a final state (Completed or Cancelled)
      if (currentSale.status === 'Completed' || currentSale.status === 'Cancelled') {
        return res.status(400).json({
          success: false,
          message: `Cannot update order - order is already ${currentSale.status} and cannot be modified`
        });
      }

      const updateData = {};
      if (customer_name !== undefined) updateData.customer_name = customer_name;
      if (contact !== undefined) updateData.contact = contact;
      if (payment !== undefined) updateData.payment = payment;
      if (total !== undefined) updateData.total = total;
      if (status !== undefined) updateData.status = status; // ADD THIS LINE

      const updated = await Sales.update(id, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found or no changes made'
        });
      }

      res.json({
        success: true,
        message: 'Sale updated successfully'
      });
    } catch (error) {
      console.error('Error updating sale:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update sale'
      });
    }
  }

  // Delete a sale (with inventory restoration)
  static async deleteSale(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Sales.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }

      res.json({
        success: true,
        message: 'Sale deleted successfully and inventory restored'
      });
    } catch (error) {
      console.error('Error deleting sale:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete sale'
      });
    }
  }

  // Get sales statistics
  static async getSalesStats(req, res) {
    try {
      const { date_from, date_to } = req.query;

      const stats = await Sales.getSalesStats(date_from, date_to);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales statistics'
      });
    }
  }

  // Get sale items for a specific sale
  static async getSaleItems(req, res) {
    try {
      const { sale_id } = req.params;

      // Verify sale exists
      const sale = await Sales.findById(sale_id);
      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }

      const items = await Sales.getSaleItems(sale_id);

      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      console.error('Error fetching sale items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sale items'
      });
    }
  }
}
